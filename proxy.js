const fetch = require('node-fetch');

(async () => {
  const res = await fetch('https://kirka.io/');
  let html = await res.text();
  console.log('HTML length:', html.length);

  html = html.replace(/<div[^>]+id=["']?crazygames-wrapper["']?[^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(
    /<script[^>]+src=["'][^"']*(crazygames|crazygames-sdk|cdn.embedly)[^"']*["'][^>]*><\/script>/gi,
    ''
  );

  console.log('Modified HTML length:', html.length);
})();
