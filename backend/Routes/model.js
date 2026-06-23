import mongodb from 'mongodb';
import mongoose from 'mongoose';

mongoose.connect(process.env.Connection_string || "mongodb://localhost:27017/").then(() => {
    console.log(" connected sucessful to db ")
}).catch((err) => {
    console.log(" and error has been occures")
})

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})
const scoringModel = new mongoose.Schema({
    leetcode_score: Number,
    github_score: Number,
    internship_score: Number,
    system_design_score: Number,
    total_score: Number,
    user_id: mongoose.Schema.Types.ObjectId
})

const user = mongoose.model('User', userSchema);
const scoring = mongoose.model('ScoringModel', scoringModel);

export { user, scoring };