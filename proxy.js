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
      html = html.replace(/<div[^>]*id=["']?crazygames-wrapper["']?[^>]*>[\s\S]*?<\/div>/gi, '');

      // Remove CrazyGames script tags
      html = html.replace(/<script[^>]*src=["'][^"']*crazygames[^"']*["'][^>]*><\/script>/gi, '');

      res.set('Content-Type', 'text/html');
      res.send(html);
    } else {
      // For other content types (js, css, images), stream them directly
      res.set('Content-Type', contentType);
      kirkaRes.body.pipe(res);
    }
  } catch (err) {
    res.status(500).send('Error fetching Kirka.io: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
