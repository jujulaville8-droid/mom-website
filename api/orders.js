const fs = require('fs');
const ORDERS_PATH = '/tmp/td-orders.json';
const TOKEN = 'td-admin-' + Buffer.from('tailorsdaughter2026').toString('base64');

function getOrders() {
  try {
    return JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
}

function isAdmin(req) {
  const auth = req.headers.authorization || req.headers.Authorization || '';
  return auth.replace('Bearer ', '') === TOKEN;
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  if (!body) body = {};

  // POST — create new order (public)
  if (req.method === 'POST') {
    if (!body.company || !body.contact || !body.email || !body.items?.length) {
      return res.status(400).json({ error: 'Missing required fields: company, contact, email, items' });
    }

    const orders = getOrders();
    const order = {
      id: 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(),
      company: body.company,
      contact: body.contact,
      email: body.email,
      phone: body.phone || '',
      notes: body.notes || '',
      items: body.items,
      total: body.items.reduce((sum, item) => sum + item.price * item.qty, 0),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    orders.unshift(order);
    saveOrders(orders);

    return res.status(201).json({ success: true, orderId: order.id });
  }

  // GET — list orders (admin only)
  if (req.method === 'GET') {
    if (!isAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(200).json(getOrders());
  }

  // PATCH — update order status (admin only)
  if (req.method === 'PATCH') {
    if (!isAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id, status } = body;
    const validStatuses = ['pending', 'processing', 'fulfilled', 'cancelled'];

    if (!id || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid id or status' });
    }

    const orders = getOrders();
    const order = orders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();
    saveOrders(orders);

    return res.status(200).json({ success: true, order });
  }

  // DELETE — delete order (admin only)
  if (req.method === 'DELETE') {
    if (!isAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = body;
    let orders = getOrders();
    const before = orders.length;
    orders = orders.filter(o => o.id !== id);

    if (orders.length === before) {
      return res.status(404).json({ error: 'Order not found' });
    }

    saveOrders(orders);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
