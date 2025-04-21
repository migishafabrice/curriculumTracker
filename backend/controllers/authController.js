const express=require('express');
const jwt=require('jsonwebtoken');
const{db}=require('../config/config');
const argon=require('argon2');
require('dotenv').config();
const validateUser = async (username, password) => {
    try {
      const queries = [
        {
          table: 'staff',
          sql: 'SELECT code,firstname,lastname, email, password, role FROM staff WHERE email = ?',
          firstName:'firstname',
          lastName:'lastname',
          roleField: 'role',
          defaultRole: null 
        },
        {
          table: 'schools',
          sql: 'SELECT code,name, email, password FROM schools WHERE email = ?',
          firstName:'name',
          lastName:'',
          roleField: null,
          defaultRole: 'School'
        },
        {
          table: 'teachers',
          sql: 'SELECT code,firstname,lastname, email, password, role FROM teachers WHERE email = ?',
          firstName:'firstname',
          lastName:'lastname',
          roleField: 'role',
          defaultRole: null
        }
      ];
      for (const query of queries) {
        const [result] = await db.query(query.sql, [username]);
        
        if (result.length === 1) {
          const user = result[0];
          if (query.table === 'staff' && user.role === 'Administrator') {
            return {
              userid: user.id,
              email: user.email,
              firstName:'Administrator',
              lastName:'',
              role: user.role
            };
          }
          const passwordMatch = await argon.verify(user.password, password);
          if (!passwordMatch) {
            console.log(`Invalid password for ${username} in ${query.table}`);
            return null;
          }
          return {
            userid: user.code,
            firstname:query.firstName ? user[query.firstName]:'',
            lastname:query.lastName ? user[query.lastName]:'',
            email: user.email,
            role: query.roleField ? user[query.roleField] : query.defaultRole
          };
        }
      }
      return null;
      
    } catch (error) {
      console.error("Database error:", error);
      throw error;
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
                    firstname:isValidUser.firstname,
                    lastname:isValidUser.lastname,
                    role: isValidUser.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            
            res.cookie('token', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production'
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