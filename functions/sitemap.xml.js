// Cloudflare Pages Function
// /sitemap.xml → GAS ?sitemap=1 を叩いて XML を返す（edge cache 1h）
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzCwssVa2K2OyC44ZAUkkMBhKZr7XJ3c3c4Y-qx_Cc1AsICTSn-YsX7hF1AcTcTGB1tOQ/exec';

export async function onRequest(context) {
  try {
    const res = await fetch(GAS_URL + '?sitemap=1', { redirect: 'follow' });
    const xml = await res.text();
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (err) {
    // フォールバック: 最低限のトップURLだけ返す
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://churamp.search-mania.net/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    return new Response(fallback, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}
