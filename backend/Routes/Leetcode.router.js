import express from 'express';
const leetcoderouter = express.Router();
leetcoderouter.get('/getUserProfile/:username', (req, res) => {
    const { username } = req.params;
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