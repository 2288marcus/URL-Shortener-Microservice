require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const validUrl = require('valid-url');

// Basic Configuration
const port = process.env.PORT || 3000;

// In-memory database for URLs
const urlDatabase = {};
let urlIdCounter = 1;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

// Middleware to parse POST data
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// POST to create short URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Validate the URL
  if (!validUrl.isWebUri(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Store the URL in the database with an incremented id
  const shortUrl = urlIdCounter++;
  urlDatabase[shortUrl] = originalUrl;

  // Return the JSON response with original and short URL
  res.json({ original_url: originalUrl, short_url: shortUrl });
});

// GET to redirect to the original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url, 10);

  // Look up the original URL in the database
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    // Redirect to the original URL
    res.redirect(originalUrl);
  } else {
    // If the short URL doesn't exist
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
