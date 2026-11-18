const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const client = parsed.protocol === 'http:' ? http : https;
    const req = client.request({
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'http:' ? 80 : 443),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, targetUrl).href;
        }
        return resolve(fetchUrl(redirectUrl));
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

function cleanHtml(str = '') {
  return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
}

function guessCategory(title = '', desc = '') {
  const text = (title + ' ' + desc).toLowerCase();
  if (text.includes('soup') || text.includes('stew') || text.includes('broth') || text.includes('chowder')) return 'Soups & Stews';
  if (text.includes('salad') || text.includes('tofu') || text.includes('vegan') || text.includes('spinach') || text.includes('veggie')) return 'Healthy & Veggie';
  if (text.includes('bite') || text.includes('dip') || text.includes('snack') || text.includes('wing') || text.includes('marinade')) return 'Appetizers & Bites';
  if (text.includes('quick') || text.includes('15 min') || text.includes('air fryer') || text.includes('salmon') || text.includes('10 min')) return 'Quick & Easy';
  return 'Comfort Food';
}

function guessTag(title = '', desc = '') {
  const text = (title + ' ' + desc).toLowerCase();
  if (text.includes('protein')) return 'High Protein';
  if (text.includes('air fryer')) return 'Air Fryer';
  if (text.includes('one pot') || text.includes('one-pot')) return 'One-Pot';
  if (text.includes('comfort') || text.includes('creamy')) return 'Comfort Food';
  if (text.includes('budget') || text.includes('cheap')) return 'Budget Friendly';
  return 'Crowd Favorite';
}

function extractIngredientsFromText(text = '', title = '') {
  const keywords = [
    { word: 'chicken', name: 'Chicken Breast Fillets', qty: '500g', aisle: 'Meat & Poultry', search: 'chicken breast fillets' },
    { word: 'beef', name: 'Lean Beef Steak Mince', qty: '500g', aisle: 'Meat & Poultry', search: 'beef mince' },
    { word: 'salmon', name: 'Fresh Salmon Fillets', qty: '2 fillets', aisle: 'Meat & Poultry', search: 'salmon fillets' },
    { word: 'shrimp', name: 'Raw King Prawns', qty: '180g pack', aisle: 'Meat & Poultry', search: 'king prawns' },
    { word: 'prawn', name: 'Raw King Prawns', qty: '180g pack', aisle: 'Meat & Poultry', search: 'king prawns' },
    { word: 'tuna', name: 'Tinned Tuna in Brine', qty: '2 tins', aisle: 'Food Cupboard', search: 'tinned tuna steak' },
    { word: 'egg', name: 'Free Range Eggs', qty: '6 pack', aisle: 'Dairy & Chilled', search: 'free range eggs' },
    { word: 'cheese', name: 'Mature Cheddar Cheese', qty: '200g', aisle: 'Dairy & Chilled', search: 'cheddar cheese' },
    { word: 'parmesan', name: 'Grated Parmesan', qty: '60g', aisle: 'Dairy & Chilled', search: 'parmesan cheese' },
    { word: 'cream', name: 'Double Cream', qty: '300ml pot', aisle: 'Dairy & Chilled', search: 'double cream' },
    { word: 'butter', name: 'Unsalted Butter', qty: '250g', aisle: 'Dairy & Chilled', search: 'unsalted butter' },
    { word: 'garlic', name: 'Fresh Garlic', qty: '1 bulb', aisle: 'Fresh Produce', pantry: true, search: 'fresh garlic' },
    { word: 'onion', name: 'Brown Onions', qty: '3 pack', aisle: 'Fresh Produce', pantry: true, search: 'brown onions' },
    { word: 'rice', name: 'Jasmine Fragrant Rice', qty: '1kg bag', aisle: 'Food Cupboard', search: 'jasmine rice' },
    { word: 'pasta', name: 'Penne or Rigatoni Pasta', qty: '500g pack', aisle: 'Food Cupboard', search: 'pasta 500g' },
    { word: 'potato', name: 'Baking Potatoes', qty: '4 pack', aisle: 'Fresh Produce', search: 'baking potatoes' },
    { word: 'spinach', name: 'Baby Spinach Bag', qty: '150g', aisle: 'Fresh Produce', search: 'baby spinach' },
    { word: 'pepper', name: 'Mixed Bell Peppers', qty: '3 pack', aisle: 'Fresh Produce', search: 'mixed bell peppers' },
    { word: 'tomato', name: 'Chopped Tomatoes Can', qty: '1 can', aisle: 'Food Cupboard', pantry: true, search: 'chopped tomatoes' },
    { word: 'oil', name: 'Extra Virgin Olive Oil', qty: '500ml', aisle: 'Food Cupboard', pantry: true, search: 'olive oil' },
    { word: 'honey', name: 'Clear Runny Honey', qty: '340g jar', aisle: 'Food Cupboard', pantry: true, search: 'runny honey' },
    { word: 'bread', name: 'Crusty Sourdough or Buns', qty: '1 pack', aisle: 'Bakery', search: 'sourdough loaf' }
  ];

  const fullText = (title + ' ' + text).toLowerCase();
  const found = [];
  const seen = new Set();

  for (const k of keywords) {
    if (fullText.includes(k.word) && !seen.has(k.name)) {
      found.push({
        name: k.name,
        qty: k.qty,
        aisle: k.aisle,
        pantry: !!k.pantry,
        search: k.search
      });
      seen.add(k.name);
    }
  }

  if (found.length === 0) {
    found.push(
      { name: 'Fresh Produce & Seasonings', qty: 'As needed', aisle: 'Fresh Produce', pantry: false, search: title.slice(0, 30) },
      { name: 'Pantry Essentials (Salt, Oil, Spices)', qty: 'To taste', aisle: 'Food Cupboard', pantry: true, search: 'olive oil' }
    );
  }

  return found;
}

function parseBoardRss(xml) {
  const items = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

  for (const itemXml of itemMatches) {
    const rawTitle = (itemXml.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    const link = (itemXml.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
    const rawDesc = (itemXml.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '';

    const cleanDesc = cleanHtml(rawDesc);
    const imgMatch = cleanDesc.match(/<img[^>]+src="([^">]+)"/i);
    let imageUrl = imgMatch ? imgMatch[1] : '';
    if (imageUrl.includes('/236x/')) {
      imageUrl = imageUrl.replace('/236x/', '/736x/');
    }

    const textDesc = cleanDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    let title = rawTitle.trim();
    if (!title || title.length < 3) {
      title = textDesc.split('#')[0].trim();
      if (!title) title = 'Saved Recipe Pin';
    }

    const id = 'pin_' + Math.abs(link.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));

    items.push({
      id,
      title: title.length > 70 ? title.slice(0, 67) + '...' : title,
      creator: 'Pinterest Saved',
      category: guessCategory(title, textDesc),
      tag: guessTag(title, textDesc),
      prepTime: '25 mins',
      servings: 4,
      imageUrl: imageUrl || 'https://i.pinimg.com/736x/ec/1a/44/ec1a442062e322cd3ce7765206ee147a.jpg',
      ingredients: extractIngredientsFromText(textDesc, title),
      instructions: textDesc ? [textDesc] : ['Tap source link for step-by-step cooking instructions.']
    });
  }

  return items;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body || '{}');
    }
    const inputUrl = (body?.url || 'https://uk.pinterest.com/shalom_x/food').trim();

    let rssUrl = inputUrl;
    if (!rssUrl.endsWith('.rss')) {
      // Clean up URL
      let clean = inputUrl.replace(/\/+$/, '');
      if (clean.includes('pinterest.')) {
        rssUrl = clean + '.rss';
      } else {
        // e.g. shalom_x/food
        rssUrl = `https://uk.pinterest.com/${clean}.rss`;
      }
    }

    const response = await fetchUrl(rssUrl);
    if (response.status !== 200) {
      return res.status(response.status).json({
        error: `Failed to fetch board feed (HTTP ${response.status}). Ensure the Pinterest board is set to public.`,
        urlAttempted: rssUrl
      });
    }

    const recipes = parseBoardRss(response.body);

    return res.status(200).json({
      success: true,
      count: recipes.length,
      recipes: recipes
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
