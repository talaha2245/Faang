import express from 'express';
// storing the db
import { Leetcode, User } from './model.js';
import { verifyToken } from './Auth.router.js';

const leetcoderouter = express.Router();

leetcoderouter.get('/getUserProfile/:username', verifyToken, async (req, res) => {
    const { username } = req.params;
    const currentuser = req.user; // it will be given by verify jwt middleware 
    const LEETCODE_QUERY = `
        query userdata($username: String!) {
        matchedUser(username: $username) {
            submitStats {
                acSubmissionNum {
                difficulty
                count
                }
            }
        }
        userContestRanking(username: $username) {
         rating
        }
    }`;
    try {
        fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: LEETCODE_QUERY,
                variables: { username },
            }),
        })
            .then((response) => response.json())
            .then(async (data) => {
                if (!data || !data.data || data.data.matchedUser === null) {
                    return res.status(404).json({ error: 'User not found on LeetCode' });
                }
                else {
                    const rating = data.data.userContestRanking ? data.data.userContestRanking.rating : 0;
                    const acSubmissions = data.data.matchedUser.submitStats.acSubmissionNum || [];
                    const easyCount = (acSubmissions.find(x => x.difficulty === 'Easy') || { count: 0 }).count;
                    const mediumCount = (acSubmissions.find(x => x.difficulty === 'Medium') || { count: 0 }).count;
                    const hardCount = (acSubmissions.find(x => x.difficulty === 'Hard') || { count: 0 }).count;

                    // check already exists 
                    const existingLeetcodeProfile = await Leetcode.findOne({ user_id: currentuser._id });
                    let savedProfile;
                    if (existingLeetcodeProfile) {
                        // Update the existing profile
                        existingLeetcodeProfile.leetcode_username = username;
                        existingLeetcodeProfile.leetcode_rating = rating;
                        existingLeetcodeProfile.leetcode_easy = easyCount;
                        existingLeetcodeProfile.leetcode_medium = mediumCount;
                        existingLeetcodeProfile.leetcode_hard = hardCount;
                        savedProfile = await existingLeetcodeProfile.save();
                    } else {
                        // Create a new profile
                        const newLeetcodeProfile = new Leetcode({
                            leetcode_username: username,
                            leetcode_rating: rating,
                            leetcode_easy: easyCount,
                            leetcode_medium: mediumCount,
                            leetcode_hard: hardCount,
                            user_id: currentuser._id,
                        });
                        savedProfile = await newLeetcodeProfile.save();
                    }

                    return res.status(200).json({
                        message: "LeetCode profile processed successfully",
                        profile: savedProfile
                    });
                }
            })
            .catch((error) => {
                console.error('Error fetching data from LeetCode API:', error);
                return res.status(500).json({ error: 'Failed to fetch data from LeetCode API' });
            });
    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'An error occurred while processing the request' });
    }
});

export default leetcoderouter;