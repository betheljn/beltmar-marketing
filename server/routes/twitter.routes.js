import express from 'express';
import oauth from 'oauth';
import dotenv from 'dotenv';
import prisma from '../lib/prismaClient.js';

dotenv.config();

const router = express.Router();

const consumer = new oauth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  process.env.TWITTER_CONSUMER_KEY,
  process.env.TWITTER_CONSUMER_SECRET,
  '1.0A',
  process.env.TWITTER_CALLBACK_URL,
  'HMAC-SHA1'
);

// Step 1: Redirect to Twitter
router.get('/connect', (req, res) => {
  consumer.getOAuthRequestToken((error, oauthToken, oauthTokenSecret) => {
    if (error) return res.status(500).json({ error });

    req.session.oauthToken = oauthToken;
    req.session.oauthTokenSecret = oauthTokenSecret;

    res.redirect('http://localhost:5173/dashboard'); // (or your prod frontend URL)

  });
});

// Step 2: Handle callback
router.get('/callback', async (req, res) => {
    const { oauth_token, oauth_verifier } = req.query;
    const { oauthToken, oauthTokenSecret, userId } = req.session;
  
    consumer.getOAuthAccessToken(
      oauthToken,
      oauthTokenSecret,
      oauth_verifier,
      async (error, accessToken, accessTokenSecret) => {
        if (error) return res.status(500).json({ error });
  
        try {
          const userId = req.session.userId; // You must have stored this earlier during login
          await prisma.user.update({
            where: { id: userId },
            data: {
              twitterAccessToken: accessToken,
              twitterAccessSecret: accessTokenSecret,
              twitterConnected: true,
            },
          });

          delete req.session.oauthToken; // Clean up session
          delete req.session.oauthTokenSecret;
  
          res.redirect('/dashboard');
        } catch (err) {
          console.error('Error saving Twitter tokens:', err);
          res.status(500).json({ error: 'Failed to save Twitter connection' });
        }
      }
    );
  });

export default router;
