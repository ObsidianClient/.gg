const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(async (req, res) => {
  try {
    // Fetch Kirka.io main page
    const kirkaRes = await fetch('https://kirka.io/');
    let html = await kirkaRes.text();

    html = html.replace(/<div[^>]*id=["']?crazygames-wrapper["']?[^>]*>[\s\S]*?<\/div>/gi, '');

    html = html.replace(/<script[^>]*src=["'][^"']*crazygames[^"']*["'][^>]*><\/script>/gi, '');
    
    // Send cleaned HTML
    res.set('Content-Type', 'text/html');
    res.send(html);

  } catch (err) {
    res.status(500).send('Error fetching Kirka.io: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening at http://localhost:${PORT}`);
});
