import express from 'express';
import { DevScoring } from './model.js';
import { verifyToken } from './Auth.router.js';

const githubrouter = express.Router();

const generateScore = (data) => {
    let max_repos = 50;
    let max_contributions = 1000;
    let repos_score = Math.min(data.user.repositories.totalCount / max_repos, 1) / max_repos * 40;
    let contributions_score = Math.min(data.user.contributionsCollection.contributionCalendar.totalContributions / max_contributions, 1) / max_contributions * 50;
    // should not let the score exceed 100 
    return Math.min(10 + repos_score + contributions_score, 100);
}

githubrouter.get('/GithubUserProfile/:username', verifyToken, (req, res) => {
    const systemdesign_score = Number(req.body?.systemdesign_score ?? req.query?.systemdesign_score ?? 0);
    const internship_score = Number(req.body?.internship_score ?? req.query?.internship_score ?? 0);

    const { username } = req.params;
    const currentuser = req.user; // it will be given by verify jwt middleware

    const GITHUB_QUERY = `query GetGitHubUser($username: String!) {
  user(login: $username) {
    repositories {
      totalCount
    }
    contributionsCollection {
      contributionCalendar {
        totalContributions
      }
    }
  }
}`;

    fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        },
        body: JSON.stringify({
            query: GITHUB_QUERY,
            variables: { username },
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.errors || !data.data || !data.data.user) {
                return res.status(404).json({ message: 'User not found on GitHub' });
            }
            const score = generateScore(data.data);
            
            // Find if DevScoring already exists for the user, update it, otherwise create new
            DevScoring.findOne({ user_id: currentuser._id })
                .then((existingScoring) => {
                    if (existingScoring) {
                        existingScoring.github_score = score;
                        existingScoring.system_design_score = systemdesign_score;
                        existingScoring.internship_score = internship_score;
                        existingScoring.total_score = score + systemdesign_score + internship_score;
                        return existingScoring.save();
                    } else {
                        const devScoring = new DevScoring({
                            github_score: score,
                            user_id: currentuser._id,
                            system_design_score: systemdesign_score,
                            internship_score: internship_score,
                            total_score: score + systemdesign_score + internship_score
                        });
                        return devScoring.save();
                    }
                })
                .then((savedScoring) => {
                    res.status(200).json({ message: 'GitHub profile updated successfully', score, scoring: savedScoring });
                })
                .catch((error) => {
                    console.error('Error saving GitHub score:', error);
                    res.status(500).json({ message: 'Internal server error' });
                });
        })
        .catch((error) => {
            console.error('Error fetching GitHub data:', error);
            res.status(500).json({ message: 'Internal server error' });
        });
});

export default githubrouter;
