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

      // ✅ Remove just CrazyGames wrapper div
      html = html.replace(/<div[^>]*id=["']?crazygames-wrapper["']?[^>]*>[\s\S]*?<\/div>/gi, '');

      // ✅ Remove script tags that point to known ad or embed sources
      html = html.replace(
        /<script[^>]+src=["'][^"']*(crazygames|embed|sdk|ads)[^"']*["'][^>]*><\/script>/gi,
        ''
      );

      // ✅ Remove inline scripts that reference window.parent or crazygames
      html = html.replace(
        /<script[^>]*>[\s\S]*?(crazygames|window\.parent|iframe)[\s\S]*?<\/script>/gi,
        ''
      );

      // ✅ Remove iframes completely
      html = html.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');

      // ❗ DO NOT remove all <script> tags — or you break Kirka’s core logic

      res.set('Content-Type', 'text/html');
      res.send(html);
    } else {
      // Pass through all other content (JS, CSS, fonts, etc.)
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
