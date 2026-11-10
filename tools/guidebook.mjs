// Gabungkan SOP.md + DOKUMENTASI.md menjadi Guidebook PDF bergaya ITS.
// Butuh (hanya di laptop pembuat dokumen): pandoc, Google Chrome, playwright (npm i -g @playwright/test).
// Pakai: node tools/guidebook.mjs
import { execFileSync } from 'child_process';
import fs from 'fs'; import path from 'path'; import { pathToFileURL, fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'Guidebook-Timer-MAV-KSTI-2026.pdf');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// rujukan antar-file jadi rujukan ke bagian di dalam buku
const fixLinks = md => md.replace(/\[([^\]]+)\]\((SOP|DOKUMENTASI)\.md\)/g, (_, t, f) => {
  const [id, nm] = f === 'SOP' ? ['bagian-1', 'Bagian 1 (SOP)'] : ['bagian-2', 'Bagian 2 (Panduan Teknis)'];
  return `[${/\.md$/.test(t) ? nm : t}](#${id})`; });
const sop = fixLinks(read('SOP.md')).replace(/^# .*\n/, '# Bagian 1 · SOP Penggunaan {#bagian-1}\n');
const doc = fixLinks(read('DOKUMENTASI.md')).replace(/^# .*\n/, '# Bagian 2 · Panduan Teknis {#bagian-2}\n')
  .replace(/^> Prosedur langkah demi langkah.*\n/m, '');
const md = sop + '\n\n' + doc;

// template pandoc: daftar isi + isi
const tpl = path.join(ROOT, 'tools', '.guidebook-tpl.html');
fs.writeFileSync(tpl, '<nav class="toc"><h1 class="toc-h">Daftar Isi</h1>$toc$</nav>\n<main>$body$</main>');
const html = execFileSync('pandoc', ['-f', 'gfm+attributes', '-t', 'html5', '--toc', '--toc-depth=2', '-s', '--template', tpl], { input: md, encoding: 'utf8' });
fs.unlinkSync(tpl);

const tanggal = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
const page = `<!doctype html><html lang="id"><head><meta charset="utf-8"><base href="${pathToFileURL(path.join(ROOT, 'public'))}/">
<style>
@font-face { font-family: 'Friz'; src: url(fonts/its.woff) format('woff'); }
@font-face { font-family: 'Work Sans'; src: url(fonts/worksans.woff2) format('woff2'); font-weight: 400 700; }
@page { size: A4; margin: 18mm 16mm 20mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font: 10.5pt/1.55 'Work Sans', sans-serif; color: #2b3445; }
.g, h1, h2 { font-family: 'Friz', Georgia, serif; font-weight: 500; letter-spacing: -.01em; color: #0b5fa5; } /* solid: teks bergradien meninggalkan garis kotak saat dicetak */
/* sampul */
.cover { height: 252mm; border-radius: 6px; display: flex; flex-direction: column; justify-content: space-between; padding: 26mm 22mm 20mm; color: #fff;
  background: radial-gradient(344% 189% at 50% 0%, #007bc0 0%, #243e80 100%); break-after: page; }
.cover .logos { display: inline-flex; gap: 14px; align-items: center; background: #fff; padding: 10px 18px; border-radius: 4px; align-self: flex-start; }
.cover .logos img { height: 52px; } .cover .logos img.its { height: 66px; } .cover .lsep { width: 1px; align-self: stretch; background: #d3e0ea; }
.cover .eyebrow { display: inline-block; background: rgba(255,255,255,.14); padding: 5px 12px; border-radius: 4px; font-weight: 600; letter-spacing: .04em; }
.cover h1 { break-before: auto; margin: 14px 0 10px; font-size: 44pt; line-height: 1.05; color: #fff; }
.cover .sub { font-size: 14pt; color: #d6e7f5; max-width: 140mm; }
.cover .meta { font-size: 10pt; color: #cfe3f3; border-top: 1px solid rgba(255,255,255,.3); padding-top: 10px; display: flex; justify-content: space-between; }
/* daftar isi */
.toc { break-after: page; }
.toc-h { font-size: 26pt; margin: 0 0 8mm; break-before: auto; }
.toc ul { list-style: none; padding-left: 0; margin: 0; }
.toc > ul > li { margin: 0 0 4mm; } .toc > ul > li > a { font: 500 14pt 'Friz', serif; color: #243e80; }
.toc ul ul { padding-left: 6mm; margin-top: 1.5mm; } .toc ul ul li { margin: 1mm 0; }
.toc a { text-decoration: none; color: #2b3445; }
/* isi */
h1 { font-size: 26pt; margin: 0 0 6mm; padding-bottom: 4mm; border-bottom: 1px solid #e1e9ee; break-before: page; }
h1 + * { margin-top: 0; }
h2 { font-size: 16pt; margin: 9mm 0 3mm; break-after: avoid; }
h3 { font: 700 11.5pt 'Work Sans', sans-serif; color: #132757; margin: 6mm 0 2mm; break-after: avoid; }
p, li { orphans: 3; widows: 3; }
a { color: #0c64c2; }
strong { color: #132757; }
code { font: 9.5pt ui-monospace, Menlo, Consolas, monospace; background: #ebf2f6; padding: 1px 5px; border-radius: 3px; color: #132757; }
pre { background: #ebf2f6; padding: 3mm 4mm; border-radius: 4px; break-inside: avoid; } pre code { padding: 0; }
blockquote { margin: 4mm 0; padding: 3mm 5mm; border-left: 4px solid #0c64c2; background: #f5fafd; border-radius: 0 4px 4px 0; color: #132757; }
blockquote p { margin: 0; }
hr { border: 0; border-top: 1px solid #e1e9ee; margin: 7mm 0; }
table { width: 100%; border-collapse: collapse; margin: 3mm 0 5mm; font-size: 9.5pt; }
th { text-align: left; background: #ebf2f6; color: #132757; font-weight: 700; }
th, td { padding: 2mm 2.5mm; border: 1px solid #e1e9ee; vertical-align: top; }
tr { break-inside: avoid; } thead { display: table-header-group; }
ul.task-list { list-style: none; padding-left: 2mm; } .task-list input { margin-right: 2mm; }
</style></head><body>
<section class="cover">
  <div class="logos"><img src="img/ksti.png" alt="KSTI 26"><span class="lsep"></span><img src="img/its.png" class="its" alt="ITS"></div>
  <div><span class="eyebrow">Guidebook Panitia</span><h1>Timer Mini Autonomous Vehicle</h1>
    <div class="sub">SOP penggunaan dan panduan teknis timer lomba MAV, KSTI 2026, Institut Teknologi Sepuluh Nopember.</div></div>
  <div class="meta"><span>Bagian 1 · SOP Penggunaan &nbsp;·&nbsp; Bagian 2 · Panduan Teknis</span><span>Versi ${tanggal}</span></div>
</section>
${html}
</body></html>`;

const tmp = path.join(ROOT, 'public', '.guidebook.html');
fs.writeFileSync(tmp, page);
const G = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
const { chromium } = await import(pathToFileURL(path.join(G, '@playwright/test/node_modules/playwright-core/index.mjs')));
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage();
await p.goto(pathToFileURL(tmp).href); await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: `<div style="width:100%;font:8pt Helvetica,Arial,sans-serif;color:#7d899b;padding:0 16mm;display:flex;justify-content:space-between">
    <span>Guidebook Timer MAV · KSTI 2026</span><span class="pageNumber"></span></div>` });
await b.close(); fs.unlinkSync(tmp);
console.log('PDF ditulis:', OUT);
