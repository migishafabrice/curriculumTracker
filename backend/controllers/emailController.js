const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

// Create OAuth2 client
const OAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set credentials including refresh token
OAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

// Configure transporter with automatic token refresh
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GOOGLE_SENDER_EMAIL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    accessToken: async () => {
      try {
        const { token } = await OAuth2Client.getAccessToken();
        return token;
      } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
      }
    }
  }
});

async function sendEmail(to, subject, text) {
  try {
    const mailOptions = {
      from: process.env.GOOGLE_SENDER_EMAIL,
      to,
      subject,
      text,
    };
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = {
  sendEmail,
};