export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body || {};
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing url' });
    }

    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const hits = [];
    const keywords = ['ausschütt', 'distribution', 'dividend', 'thesaur', 'ertrag'];
    for (const k of keywords) {
      if (text.toLowerCase().includes(k)) hits.push(k);
    }

    return res.status(200).json({
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      title,
      keywords: hits,
      preview: text.slice(0, 1000),
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Fetch failed',
      message: String(error?.message || error),
    });
  }
}
