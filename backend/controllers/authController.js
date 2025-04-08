const express=require('express');
const jwt=require('jsonwebtoken');
const{db}=require('../config/config');
const argon=require('argon2');
require('dotenv').config();
const validateUser = async (username, password) => {
    try {
        const sql = 'SELECT id, firstname, lastname, email, password, role FROM staff WHERE email = ?';
        const [result] = await db.query(sql, [username]);

        if (result.length === 0) {
            console.log("User not found");
            return null; // Return null instead of res.json()
        }

        const user = result[0];
        
        if (user.role !== "Administrator") {
        const passwordMatch = await argon.verify(user.password, password);
        if (!passwordMatch) {
            console.log("Invalid password");
            return null; // Return null for invalid credentials
        }
        }
        return {
            userid: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role
        };

    } catch (error) {
        console.error("Database error:", error);
        throw error; // Throw the error to be handled by authLogin
    }
};
const authLogin = async (req, res) => {
    const { username, password } = req.body;
   
    if (!username || !password) {
        return res.status(400).json({ message: "Please provide username and password" });
    }

    try {
        const isValidUser = await validateUser(username, password);
        if (isValidUser) {
            // Generate JWT token
            const token = jwt.sign(
                { 
                    userid: isValidUser.userid,
                    username: isValidUser.email,
                    firstname: isValidUser.firstname,
                    lastname: isValidUser.lastname,
                    role: isValidUser.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            
            res.cookie('token', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production' // Should be 'production'
            });
            
            return res.status(200).json({ type: 'success', token });
        } else {
            return res.status(401).json({ 
                message: 'Invalid username or password', 
                type: 'error' 
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            type: 'error' 
        });
    }
};
   
module.exports={authLogin};