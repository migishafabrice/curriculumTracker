const express = require('express');
const app = express();

app.get('/callback', (req, res) => {
  const code = req.query.code;
  console.log('Authorization code:', code);
  res.send(`Code: ${code} - Paste this into your script.`);
});

app.listen(3000, () => console.log('Open http://localhost:3000/callback in your OAuth config'));