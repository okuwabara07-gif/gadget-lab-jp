const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const AMAZON_ID = process.env.AMAZON_TRACKING_ID || '';
const RAKUTEN_ID = process.env.RAKUTEN_AFFILIATE_ID || '';

const KEYWORDS = [
  {kw:"\u30ef\u30a4\u30e4\u30ec\u30b9\u30a4\u30e4\u30db\u30f3 \u304a\u3059\u3059\u3081 2025",genre:"audio"},
  {kw:"\u30b9\u30de\u30db \u5145\u96fb\u5668 \u6025\u901f \u304a\u3059\u3059\u3081",genre:"accessory"},
  {kw:"\u30ce\u30fc\u30c8PC \u8efd\u91cf \u304a\u3059\u3059\u3081",genre:"pc"},
  {kw:"\u30b9\u30de\u30fc\u30c8\u30a6\u30a9\u30c3\u30c1 \u304a\u3059\u3059\u3081",genre:"smartphone"},
  {kw:"\u30e2\u30d0\u30a4\u30eb\u30d0\u30c3\u30c6\u30ea\u30fc \u5927\u5bb9\u91cf \u304a\u3059\u3059\u3081",genre:"accessory"},
  {kw:"Web\u30ab\u30e1\u30e9 \u30c6\u30ec\u30ef\u30fc\u30af \u304a\u3059\u3059\u3081",genre:"pc"},
  {kw:"\u30ad\u30fc\u30dc\u30fc\u30c9 \u9759\u97f3 \u304a\u3059\u3059\u3081",genre:"pc"},
  {kw:"\u30df\u30e9\u30fc\u30ec\u30b9 \u30ab\u30e1\u30e9 \u521d\u5fc3\u8005",genre:"camera"},
  {kw:"\u30bf\u30d6\u30ec\u30c3\u30c8 \u304a\u3059\u3059\u3081 \u7528\u9014\u5225",genre:"smartphone"},
  {kw:"USB\u30cf\u30d6 \u304a\u3059\u3059\u3081 \u9078\u3073\u65b9",genre:"accessory"}
];

const SYS = `あなたはテック・ガジェット専門ライターです。読者目線で分かりやすく、SEOに強い記事を書きます。見出しはH2/H3を使ってください。文字数2000字以上。Markdown形式で出力。記事内でおすすめ商品を紹介する箇所には[AMAZON:商品名]と[RAKUTEN:商品名]を合計5箇所挿入してください。`;

function insertLinks(text) {
  text = text.replace(/\[AMAZON:([^\]]+)\]/g, (_, p) => {
    return `[🛒 ${p}をAmazonでチェック](https://www.amazon.co.jp/s?k=${encodeURIComponent(p)}&tag=${AMAZON_ID})`;
  });
  text = text.replace(/\[RAKUTEN:([^\]]+)\]/g, (_, p) => {
    return `[🛍 ${p}を楽天でチェック](https://search.rakuten.co.jp/search/mall/${encodeURIComponent(p)}/?rafcid=${RAKUTEN_ID})`;
  });
  return text;
}

function toSlug(kw) {
  return kw.replace(/[\s\u3000]+/g, '-').replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF-]/g, '') + '-' + Date.now();
}

async function generateArticle(kw, genre) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: SYS,
      messages: [{ role: 'user', content: `ジャンル：${genre}\nキーワード：「${kw}」\n\nSEO記事をMarkdownで書いてください。` }],
    }),
  });
  const data = await res.json();
  return data.content?.map(c => c.text || '').join('') || '';
}

async function main() {
  const contentDir = path.join(process.cwd(), 'content/blog');
  if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });

  const targets = KEYWORDS.sort(() => Math.random() - 0.5).slice(0, 5);

  for (const { kw, genre } of targets) {
    console.log(`生成中: ${kw}`);
    try {
      let text = await generateArticle(kw, genre);
      text = insertLinks(text);
      const slug = toSlug(kw);
      const content = `---\ntitle: "${kw}"\ndate: "${new Date().toISOString().split('T')[0]}"\ngenre: "${genre}"\ntags: [${genre}]\n---\n\n${text}\n`;
      fs.writeFileSync(path.join(contentDir, `${slug}.mdx`), content);
      console.log(`完了: ${slug}.mdx`);
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`エラー: ${kw}`, e.message);
    }
  }
  console.log('全記事生成完了！');
}

main();
