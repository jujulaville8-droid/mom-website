const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin';
const TOKEN = 'td-admin-' + Buffer.from('tailorsdaughter2026').toString('base64');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;

  // Parse body if it's a string
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const username = body?.username || '';
  const password = body?.password || '';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.status(200).json({ token: TOKEN, message: 'Login successful' });
  }

  return res.status(401).json({ error: 'Invalid username or password' });
};
