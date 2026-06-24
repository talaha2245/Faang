import express from 'express';
import { User, DevScoring, Leetcode } from './model.js';
import { verifyToken } from './Auth.router.js';
import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelRouter = express.Router();

// Define execution paths
const isWin = process.platform === 'win32';
const pythonPath = path.join(__dirname, '..', 'Model', 'model_env', isWin ? 'Scripts/python.exe' : 'bin/python');
const scriptPath = path.join(__dirname, '..', 'Model', 'predict.py');

modelRouter.get('/prediction', verifyToken, async (req, res) => {
    try {
        let loggedinUser = req.user;
        let user;

        console.log("Prediction route hit for user:", loggedinUser.username);

        if (loggedinUser && loggedinUser.username) {
            user = await User.findOne({ username: loggedinUser.username });
        } else if (req.user) {
            user = await User.findOne({ username: req.user.username });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Retrieve Leetcode and DevScoring details
        const leetcode = await Leetcode.findOne({ user_id: user._id });
        const scoring = await DevScoring.findOne({ user_id: user._id });

        // Build feature vector
        // Features expected: LeetCode_Rating, LC_Easy, LC_Medium, LC_Hard, System_Design_Score, Github_Dev_Score, Internship_Score
        const features = [
            leetcode?.leetcode_rating ?? 1500,
            leetcode?.leetcode_easy ?? 0,
            leetcode?.leetcode_medium ?? 0,
            leetcode?.leetcode_hard ?? 0,
            scoring?.system_design_score ?? 1,
            scoring?.github_score ?? 10,
            scoring?.internship_score ?? 1
        ];

        // Execute Python prediction script
        execFile(pythonPath, [scriptPath, ...features.map(String)], (error, stdout, stderr) => {
            if (error) {
                console.error("Error executing Python script:", stderr || error.message);
                return res.status(500).json({ error: "Failed to compute prediction", details: stderr || error.message });
            }

            const predictionScore = parseFloat(stdout.trim());
            return res.status(200).json({
                message: "Prediction computed successfully",
                username: user.username,
                features: {
                    leetcodeRating: features[0],
                    lcEasy: features[1],
                    lcMedium: features[2],
                    lcHard: features[3],
                    systemDesignScore: features[4],
                    githubDevScore: features[5],
                    internshipScore: features[6]
                },
                prediction: predictionScore
            });
        });
    } catch (err) {
        console.error("Prediction route error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default modelRouter;