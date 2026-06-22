import express from 'express';
import { user } from './model.js';
import bcrypt from 'bcrypt';

const Authrouter = express.Router();

Authrouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const person = await user.findOne({
        email: email
    })
    if (person) {
        const isMatch = await bcrypt.compare(password, person.password);
        if (isMatch) {
            res.status(200).json({
                message: "Login successful"
            })
        } else {
            res.status(400).json({
                message: "Invalid credentials"
            })
        }
    }
})

Authrouter.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 2);
    const newUser = new user({
        name,
        email,
        password: hashedPassword
    });
    await newUser.save();
    res.status(201).json({
        message: "User created successfully"
    })
})

export default Authrouter;