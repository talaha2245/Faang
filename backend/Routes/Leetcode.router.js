import express from 'express'
// storing the db
import { Leetcode, User } from './model.js';
const leetcoderouter = express.Router();

leetcoderouter.get('/getUserProfile/:username', (req, res) => {
    const { username } = req.params;
    const currentuser = req.user; // it will be given by verfy jwt middleware 
    const userdata = user.findOne({ username: username });
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
            .then((data) => {
                if(data.data.matchedUser === null){
                    throw new Error('User not found');
                }
                else{
                    return res.status(200).json(data);
                    // check aldrey exist 
                    const existingLeetcodeProfile = await Leetcode.findOne({ leetcode_username: username });
                    if (existingLeetcodeProfile) {
                        // Update the existing profile
                        existingLeetcodeProfile.leetcode_rating = data.data.userContestRanking.rating;
                        existingLeetcodeProfile.leetcode_easy = data.data.matchedUser.submitStatsGlobal.acSubmissionNum[0].count;
                        existingLeetcodeProfile.leetcode_medium = data.data.matchedUser.submitStatsGlobal.acSubmissionNum[1].count;
                        existingLeetcodeProfile.leetcode_hard = data.data.matchedUser.submitStatsGlobal.acSubmissionNum[2].count;
                        await existingLeetcodeProfile.save();
                    } else {
                        // Create a new profile
                        const newLeetcodeProfile = new Leetcode({
                            leetcode_username: username,
                            leetcode_rating: data.data.userContestRanking.rating,
                            leetcode_easy: data.data.matchedUser.submitStatsGlobal.acSubmissionNum[0].count,
                            leetcode_medium: data.data.matchedUser.submitStatsGlobal.acSubmissionNum[1].count,
                            leetcode_hard: data.data.matchedUser.submitStatsGlobal.acSubmissionNum[2].count,
                            user_id: currentuser._id, // Assuming you have the user ID available
                        });
                        await newLeetcodeProfile.save();
                    }

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
})

export default leetcoderouter;