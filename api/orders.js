const fs = require('fs');
const ORDERS_PATH = '/tmp/td-orders.json';
const TOKEN = 'td-admin-' + Buffer.from('tailorsdaughter2026').toString('base64');

const NOTIFY_EMAILS = ['jujulaville8@gmail.com', 'michellecgeorge@icloud.com'];

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

async function sendOrderEmail(order) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('RESEND_API_KEY not set — skipping email notification');
    return;
  }

  const itemRows = order.items.map(i =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:center">${i.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:right">$${i.price.toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:right">$${(i.price * i.qty).toFixed(2)}</td>
    </tr>`
  ).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
      <div style="background:#0c0b09;padding:32px;text-align:center">
        <h1 style="color:#c9a84c;font-size:24px;margin:0;font-weight:300">New Wholesale Order</h1>
      </div>
      <div style="padding:32px">
        <p style="font-size:16px;color:#333;margin:0 0 24px">A new order has been placed on The Tailor's Daughter wholesale portal.</p>

        <div style="background:#f8f6f3;padding:20px;margin-bottom:24px">
          <h3 style="margin:0 0 4px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px">Order ID</h3>
          <p style="margin:0;font-size:18px;font-weight:600;color:#8b6914">${order.id}</p>
        </div>

        <h3 style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Customer Details</h3>
        <table style="width:100%;margin-bottom:24px;font-size:14px">
          <tr><td style="padding:4px 0;color:#666;width:100px">Company</td><td style="padding:4px 0;font-weight:600">${order.company}</td></tr>
          <tr><td style="padding:4px 0;color:#666">Contact</td><td style="padding:4px 0">${order.contact}</td></tr>
          <tr><td style="padding:4px 0;color:#666">Email</td><td style="padding:4px 0"><a href="mailto:${order.email}" style="color:#8b6914">${order.email}</a></td></tr>
          ${order.phone ? `<tr><td style="padding:4px 0;color:#666">Phone</td><td style="padding:4px 0">${order.phone}</td></tr>` : ''}
          ${order.notes ? `<tr><td style="padding:4px 0;color:#666">Notes</td><td style="padding:4px 0;font-style:italic">${order.notes}</td></tr>` : ''}
        </table>

        <h3 style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Order Items</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <thead>
            <tr style="background:#f8f6f3">
              <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888">Product</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888">Unit</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:12px;font-weight:600;font-size:15px;border-top:2px solid #0c0b09">Total</td>
              <td style="padding:12px;font-weight:600;font-size:15px;text-align:right;border-top:2px solid #0c0b09">$${order.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align:center;margin-top:32px">
          <a href="https://mom-website-psi.vercel.app/admin.html" style="display:inline-block;padding:14px 32px;background:#0c0b09;color:#fff;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase">View in Dashboard</a>
        </div>
      </div>
      <div style="background:#f8f6f3;padding:20px;text-align:center">
        <p style="margin:0;font-size:12px;color:#999">The Tailor's Daughter — V.C. Bird International Airport, Antigua</p>
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        from: 'The Tailor\'s Daughter <onboarding@resend.dev>',
        to: NOTIFY_EMAILS,
        subject: 'New Wholesale Order ' + order.id + ' — $' + order.total.toFixed(2),
        html: html
      })
    });
    const result = await response.json();
    console.log('Email sent:', result);
  } catch (err) {
    console.error('Email send failed:', err);
  }
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

    // Send email notification (don't block the response)
    sendOrderEmail(order).catch(err => console.error('Email error:', err));

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
