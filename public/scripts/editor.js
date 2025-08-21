// In-page visual editor (GrapesJS), saves to localStorage, exports HTML/CSS
const STORAGE_HTML_KEY = 'ktl-site-html';
const STORAGE_CSS_KEY  = 'ktl-site-css';

async function loadCurrentSite() {
  const res = await fetch('/index.html', { cache: 'no-store' });
  const htmlText = await res.text();
  const appMatch = htmlText.match(/<main[^>]*id="app"[^>]*>([\s\S]*?)<\/main>/i);
  const seedHtml = appMatch ? appMatch[1].trim() : '<section class="hero"><h1>KTL</h1><p>Start editing…</p></section>';
  return { html: seedHtml, css: '' };
}

(async function init() {
  const { html: seedHtml, css: seedCss } = await loadCurrentSite();

  const editor = grapesjs.init({
    container: '#gjs',
    height: '100%',
    fromElement: false,
    storageManager: false,
    canvas: { styles: ['/styles/main.css'] },
    plugins: [],
    blockManager: { appendTo: null }
  });

  const savedHtml = localStorage.getItem(STORAGE_HTML_KEY);
  const savedCss  = localStorage.getItem(STORAGE_CSS_KEY);
  editor.setComponents(savedHtml || seedHtml);
  editor.setStyle(savedCss || seedCss);

  const bm = editor.BlockManager;
  bm.add('hero', { label:'Hero', category:'KTL', content:`
    <section class="hero container" style="padding:8svh 0;">
      <h1 style="font-size:clamp(28px,6vw,56px);margin:0 0 12px;">Kattali Textile Ltd.</h1>
      <p style="max-width:700px;margin:0 auto 20px;opacity:.9;">Export-Ready Apparel Manufacturer in Bangladesh</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="#/rfq" class="btn btn-rfq">Request Quote</a>
        <a href="#/about" class="btn" style="background:#ffffff22;border:1px solid #ffffff33;">Learn More</a>
      </div>
    </section>` });

  bm.add('two-col', { label:'Two Columns', category:'KTL', content:`
    <section class="container" style="display:grid;gap:24px;grid-template-columns:1fr; padding:40px 0;">
      <div>
        <h2>About KTL</h2>
        <p>KTL is a Bangladesh-based apparel manufacturer serving global brands with quality and speed.</p>
      </div>
      <div>
        <img src="/img/fabric-waves.jpg" alt="Textile" style="width:100%;border-radius:12px;"/>
      </div>
    </section>` });

  bm.add('cards-3', { label:'3 Feature Cards', category:'KTL', content:`
    <section class="container" style="padding:40px 0;">
      <h2 style="text-align:center;margin-bottom:12px;">What We Do</h2>
      <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
        <article style="background:#ffffff12;padding:16px;border-radius:12px;">
          <h3>Knits</h3><p>Tees, polos, nightwear, loungewear</p>
        </article>
        <article style="background:#ffffff12;padding:16px;border-radius:12px;">
          <h3>Woven</h3><p>Shirts, bottoms, uniforms</p>
        </article>
        <article style="background:#ffffff12;padding:16px;border-radius:12px;">
          <h3>Quality & Compliance</h3><p>ISO, OEKO‑TEX, and customer audits</p>
        </article>
      </div>
    </section>` });

  bm.add('cta', { label:'CTA', category:'KTL', content:`
    <section class="container" style="padding:56px 0;text-align:center;">
      <h2>Ready to work with KTL?</h2>
      <a href="#/rfq" class="btn btn-rfq" style="margin-top:12px;display:inline-block;">Request a Quote</a>
    </section>` });

  document.getElementById('btnSave').onclick = () => {
    const html = editor.getHtml();
    const css  = editor.getCss();
    localStorage.setItem(STORAGE_HTML_KEY, html);
    localStorage.setItem(STORAGE_CSS_KEY, css);
    alert('Saved! Refresh the main site to preview.');
  };

  document.getElementById('btnExport').onclick = () => {
    const html = editor.getHtml();
    const css  = editor.getCss();
    const files = [
      { name: 'export.html', content: html },
      { name: 'export.css',  content: css }
    ];
    files.forEach(file => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([file.content], { type: 'text/plain' }));
      a.download = file.name;
      a.click();
    });
  };

  document.getElementById('btnClear').onclick = () => {
    localStorage.removeItem(STORAGE_HTML_KEY);
    localStorage.removeItem(STORAGE_CSS_KEY);
    alert('Cleared overrides. Reload the editor.');
  };

  document.getElementById('btnLoadSite').onclick = async () => {
    const site = await loadCurrentSite();
    editor.setComponents(site.html);
    editor.setStyle(site.css);
  };
})();