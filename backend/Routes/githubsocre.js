import express from 'express';
import { DevScoring} from './model.js';

const githubrouter = express.Router();

const generateScore = (data)=>{
    let max_repos = 50 ;
    let max_contributions = 1000 ;
    let repos_score = Math.min(data.user.repositories.totalCount/max_repos, 1) / max_repos * 40;
    let contributions_score = Math.min(data.user.contributionsCollection.contributionCalendar.totalContributions/max_contributions, 1) / max_contributions * 50;
    // should not let the socre execeed 100 
    return Math.min(10 + repos_score + contributions_score, 100);
}

githubrouter.get('/GithubUserProfile/:username', (req, res) => {
    const { systemdesign_score } = req.body.systemdesign_score;
    const { internship_score } = req.body.internship_score;


    const { username } = req.params;
    const currentuser = req.user; // it will be given by verfy jwt middleware
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
            if (data.errors) {
                return res.status(404).json({ message: 'User not found' });
            }
            const score = generateScore(data.data);
            // Save the score to the database
            const devScoring = new DevScoring({
                github_score: score,
                user_id: currentuser._id,
                system_design_score: systemdesign_score,
                internship_score: internship_score,
                total_score: score + systemdesign_score + internship_score
            });
            devScoring.save()
                .then(() => {
                    res.status(200).json({ message: 'GitHub profile updated successfully', score });
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
