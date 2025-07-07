const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(async (req, res) => {
  try {
    const targetUrl = `https://kirka.io${req.originalUrl}`;
    const kirkaRes = await fetch(targetUrl);

    const contentType = kirkaRes.headers.get('content-type') || '';

    if (contentType.includes('text/html')) {
      let html = await kirkaRes.text();

      // Remove CrazyGames wrapper div
      html = html.replace(/<div[^>]+id=["']?crazygames-wrapper["']?[^>]*>[\s\S]*?<\/div>/gi, '');

      // Remove external scripts that obviously belong to CrazyGames
      html = html.replace(
        /<script[^>]+src=["'][^"']*(crazygames|crazygames-sdk|cdn.embedly)[^"']*["'][^>]*><\/script>/gi,
        ''
      );

      res.set('Content-Type', 'text/html');
      res.send(html);

    } else {
      // Stream non-HTML content with all headers from Kirka.io response
      kirkaRes.headers.forEach((value, name) => {
        res.setHeader(name, value);
      });

      kirkaRes.body.pipe(res);

      kirkaRes.body.on('error', err => {
        console.error('Error streaming response:', err);
        if (!res.headersSent) {
          res.status(500).send('Error streaming response');
        } else {
          res.end();
        }
      });
    }
  } catch (err) {
    res.status(500).send('Error fetching Kirka.io: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
