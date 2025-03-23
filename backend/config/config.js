const mysql = require('mysql2/promise');
const argon = require("argon2"); 
require("dotenv").config();
async function generateRandomPassword(length = 8) {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+{}[]";
    const allChars = uppercase + lowercase + numbers + symbols;
  
    let password = "";
    password += uppercase[Math.floor(Math.random() * uppercase.length)]; // Ensure at least one uppercase
    password += lowercase[Math.floor(Math.random() * lowercase.length)]; // Ensure at least one lowercase
    password += numbers[Math.floor(Math.random() * numbers.length)]; // Ensure at least one number
    password += symbols[Math.floor(Math.random() * symbols.length)]; // Ensure at least one symbol
  
    // Fill the rest of the password with random characters
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    const _password=password.split('').sort(() => Math.random() - 0.5).join('');
    const hashedPassword = await argon.hash(_password);
    // Shuffle the password to randomize the order of the required characters
    return hashedPassword;
  }
const db = mysql.createPool({
    user: process.env.DBUSERNAME,
    host: process.env.DBHOST,
    database: process.env.DBNAME,
    password: process.env.DBPASSWORD,
    port: process.env.DBPORT,
    waitForConnections: true,
    connectionLimit: 100,
   queueLimit: 0,
});

  module.exports = {
    db,
    generateRandomPassword,
  };