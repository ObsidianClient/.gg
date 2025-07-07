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

      // ✅ Remove just the CrazyGames wrapper (non-Kirka content)
      html = html.replace(/<div[^>]+id=["']?crazygames-wrapper["']?[^>]*>[\s\S]*?<\/div>/gi, '');

      // ✅ Remove external scripts that obviously belong to CrazyGames
      html = html.replace(
        /<script[^>]+src=["'][^"']*(crazygames)[^"']*["'][^>]*><\/script>/gi,
        ''
      );

      // ❗ Do NOT remove iframes or inline scripts — some may be required by Kirka

      res.set('Content-Type', 'text/html');
      res.send(html);
    } else {
      // Non-HTML (e.g. .js, .css, .wasm, .png): stream as-is
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
