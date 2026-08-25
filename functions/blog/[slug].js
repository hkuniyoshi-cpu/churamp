// Cloudflare Pages Function
// /blog/{slug}/ → GAS ?blog_all=1 から記事取得し SSR で HTML を返す
// Googlebot が JS 待ちなしで本文＋JSON-LD をクロール可

const GAS_URL    = 'https://script.google.com/macros/s/AKfycbzCwssVa2K2OyC44ZAUkkMBhKZr7XJ3c3c4Y-qx_Cc1AsICTSn-YsX7hF1AcTcTGB1tOQ/exec';
const SITE_URL   = 'https://churamp.search-mania.net';
const STORE_NAME = 'Camp & Bar ちゅらんぷ';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function fmtDate(s) {
  if (!s) return '';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[1] + '.' + m[2] + '.' + m[3] : String(s);
}
function driveImg(url) {
  if (!url) return '';
  const s = String(url).trim();
  const m1 = s.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return 'https://lh3.googleusercontent.com/d/' + m1[1] + '=w1200';
  return s;
}
function findBySlug(items, slug) {
  if (!Array.isArray(items) || !slug) return null;
  return items.find(b => {
    if (!b || !b.url) return false;
    return b.url.indexOf('/blog/' + slug + '/') !== -1
        || b.url.indexOf('/blog/' + slug) !== -1;
  }) || items.find(b => b && b.date === slug) || null;
}

function renderHTML(item, slug) {
  const canonical = SITE_URL + '/blog/' + slug + '/';
  if (!item) {
    return `<!DOCTYPE html>
<html lang="ja"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>記事が見つかりません | ${esc(STORE_NAME)}</title>
<meta name="robots" content="noindex">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<style>body{background:#FAF0DC;color:#1E2418;font-family:'Noto Sans JP',sans-serif;text-align:center;padding:120px 24px;line-height:1.9}a{color:#E87833}</style>
</head><body>
<h1>記事が見つかりません</h1>
<p>指定された記事は削除されたか、URLが正しくない可能性があります。</p>
<p style="margin-top:40px"><a href="${SITE_URL}/">← トップへ戻る</a></p>
</body></html>`;
  }
  const imgUrl = driveImg(item.image);
  let title = (item.title || '').trim();
  if (!title && item.body) title = String(item.body).split(/[。\n]/)[0].trim();
  if (!title && item.date) title = fmtDate(item.date) + ' の投稿';
  const desc = String(item.body || title).slice(0, 120).replace(/\s+/g, ' ');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': title,
    'description': desc,
    'datePublished': item.date || '',
    'inLanguage': 'ja',
    'image': imgUrl || SITE_URL + '/ogp.png',
    'url': canonical,
    'mainEntityOfPage': canonical,
    'publisher': {
      '@type': 'Organization',
      'name': STORE_NAME,
      'url': SITE_URL,
      'logo': { '@type': 'ImageObject', 'url': SITE_URL + '/favicon.svg' }
    }
  };
  return `<!DOCTYPE html>
<html lang="ja"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="content-language" content="ja">
<meta name="theme-color" content="#161E1A">
<title>${esc(title)} | ${esc(STORE_NAME)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${esc(imgUrl || SITE_URL + '/ogp.png')}">
<meta property="og:site_name" content="${esc(STORE_NAME)}">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(imgUrl || SITE_URL + '/ogp.png')}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#FAF0DC;color:#1E2418;font-family:'Noto Sans JP','Hiragino Sans',sans-serif;line-height:1.85;-webkit-font-smoothing:antialiased}
header{background:#161E1A;padding:16px 20px;text-align:center;border-bottom:1px solid rgba(232,120,51,.3);position:sticky;top:0;z-index:10}
header a{color:#F5ECD8;text-decoration:none;font-size:17px;letter-spacing:.28em;font-weight:500}
.wrap{max-width:720px;margin:60px auto;padding:0 24px 80px}
.card{background:#fff;border-radius:2px;overflow:hidden;box-shadow:0 6px 28px rgba(0,0,0,.08)}
.card img{width:100%;display:block;max-height:480px;object-fit:cover}
.card-body{padding:36px 38px 44px}
.card .date{font-size:11px;color:#7A8A72;letter-spacing:.24em;display:block}
.card h1{margin:14px 0 28px;font-size:22px;line-height:1.7;font-weight:600;color:#1E2418;letter-spacing:.04em}
.card .text{font-size:15px;line-height:2.05;white-space:pre-wrap;color:#2E3828;word-break:break-word}
.back-wrap{margin-top:52px;text-align:center}
.back-btn{display:inline-block;padding:14px 36px;border:1.5px solid #1E2418;color:#1E2418;text-decoration:none;font-size:13px;letter-spacing:.24em;transition:all .35s ease}
.back-btn:hover{background:#1E2418;color:#FAF0DC}
.produced-by{text-align:center;margin-top:64px;font-size:10px;letter-spacing:.28em;color:rgba(30,36,24,.4);text-transform:uppercase}
.produced-by a{color:rgba(232,120,51,.6);text-decoration:none}
@media(max-width:600px){.wrap{margin:30px auto;padding:0 16px 60px}.card-body{padding:26px 22px 32px}.card h1{font-size:19px;margin:12px 0 22px}.card .text{font-size:14.5px;line-height:1.95}header a{font-size:14px;letter-spacing:.2em}.back-btn{padding:13px 28px;font-size:12px}}
</style>
</head><body>
<header><a href="${SITE_URL}/">Camp &amp; Bar ちゅらんぷ</a></header>
<div class="wrap">
  <article class="card">
    ${imgUrl ? `<img src="${esc(imgUrl)}" alt="${esc(title)}" loading="eager">` : ''}
    <div class="card-body">
      ${item.date ? `<span class="date">${esc(fmtDate(item.date))}</span>` : ''}
      ${item.title && item.title.trim() ? `<h1>${esc(item.title)}</h1>` : ''}
      <p class="text">${esc(item.body || '')}</p>
    </div>
  </article>
  <div class="back-wrap">
    <a class="back-btn" href="${SITE_URL}/">← トップへ戻る</a>
  </div>
  <div class="produced-by">Produced by <a href="https://search-mania.net/" target="_blank" rel="noopener noreferrer">SearchMania Inc.</a></div>
</div>
</body></html>`;
}

export async function onRequest(context) {
  const slug = context.params.slug;
  try {
    const res = await fetch(GAS_URL + '?blog_all=1', { redirect: 'follow' });
    const data = await res.json();
    const item = findBySlug(data && data.blog, slug);
    const html = renderHTML(item, slug);
    return new Response(html, {
      status: item ? 200 : 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=900, s-maxage=900',
      },
    });
  } catch (err) {
    return new Response(renderHTML(null, slug), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}
