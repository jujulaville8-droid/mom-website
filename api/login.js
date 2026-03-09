const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin';
const TOKEN = 'td-admin-' + Buffer.from('tailorsdaughter2026').toString('base64');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.status(200).json({ token: TOKEN, message: 'Login successful' });
  }

  return res.status(401).json({ error: 'Invalid username or password' });
};
