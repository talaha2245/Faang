import express from 'express';
import { User } from './model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const Authrouter = express.Router();
Authrouter.post('/login', async (req, res) => {
    console.log("login route hit");
    const { username, password } = req.body;
    console.log(username, password);
    const person = await User.findOne({
        username: username
    })
    if (person) {
        const isMatch = await bcrypt.compare(password, person.password);
        // this is made for testing purpose only, in production we should not have any default password
        if (isMatch || password === 'admin@123') {
            const token = jwt.sign({
                _id: person._id,
                username: person.username
            }, process.env.jwt_secret);
            res.status(200).json({
                message: "Login successful",
                token: token
            })
        } else {
            res.status(400).json({
                message: "Invalid credentials"
            })
        }
    }
    else {
        res.status(400).json({
            message: "User not found"
        })
    }
})

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'you are not authorized' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decode = jwt.verify(token, process.env.jwt_secret);
        req.user = decode;
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "you are not authorized",
        });
    }
}

Authrouter.get('/verify', verifyToken, (req, res) => {
    res.status(200).json({
        message: 'Token is valid',
        user: req.user
    });
});



Authrouter.post('/logout', (req, res) => {
    // Invalidate the token on the client side (e.g., remove it from local storage)
    res.status(200).json({
        message: "Logout successful"
    })
})

Authrouter.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await User.findOne({
        username: username
    })
    if (existingUser) {
        return res.status(400).json({
            message: "User already exists"
        })
    }
    const hashedPassword = await bcrypt.hash(password, 2);
    const newUser = new User({
        username,
        password: hashedPassword
    });
    await newUser.save();
    res.status(201).json({
        message: "User created successfully",
        user: newUser
    })
})


export default Authrouter;