import mongodb from 'mongodb';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URL || process.env.Connection_string || "mongodb://localhost:27017/faang").then(() => {
    console.log(" connected sucessful to db ")
}).catch((err) => {
    console.log(" and error has been occures", err)
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

const leetcodeSchema = new mongoose.Schema({
    leetcode_rating : Number,
    leetcode_username : String,
    leetcode_easy : Number,
    leetcode_medium : Number,
    leetcode_hard : Number,
    user_id: mongoose.Schema.Types.ObjectId
})

const scoringModel = new mongoose.Schema({
    github_score: Number,
    internship_score: Number,
    system_design_score: Number,
    total_score: Number,
    user_id: mongoose.Schema.Types.ObjectId
})

const User = mongoose.model('User', userSchema);
const DevScoring = mongoose.model('DevScoring', scoringModel);
const Leetcode = mongoose.model('Leetcode', leetcodeSchema);

export { User, DevScoring, Leetcode };