const SUPPLIER_USER = 'supplier';
const SUPPLIER_PASS = 'supplier';
const TOKEN = 'td-supplier-' + Buffer.from('tailorsdaughter-supplier-2026').toString('base64');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  if (username === SUPPLIER_USER && password === SUPPLIER_PASS) {
    return res.status(200).json({ token: TOKEN, message: 'Login successful' });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
};
