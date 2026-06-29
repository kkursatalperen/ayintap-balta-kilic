import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { getCollection } from '@/lib/mongodb';
import { ensureSeed } from '@/lib/seed';
import { hashPassword, comparePassword, signToken, getCurrentUser, requireAdmin } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

const json = (data, status = 200) => NextResponse.json(data, { status });
const err = (msg, status = 400) => NextResponse.json({ error: msg }, { status });

async function readBody(request) {
  try { return await request.json(); } catch { return {}; }
}

async function route(request, { params }) {
  const segs = (await params)?.path || [];
  const path = '/' + segs.join('/');
  const method = request.method;

  // Always ensure data is seeded
  try { await ensureSeed(); } catch (e) { /* ignore */ }

  // ---- HEALTH ----
  if (path === '/' || path === '') return json({ ok: true, name: 'Ayintap Balta Kilic API', time: new Date().toISOString() });

  // ============ AUTH ============
  if (path === '/auth/register' && method === 'POST') {
    const { email, password, name, phone } = await readBody(request);
    if (!email || !password) return err('Email ve şifre zorunlu', 400);
    const users = await getCollection('users');
    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) return err('Bu e-posta zaten kayıtlı', 409);
    const hash = await hashPassword(password);
    const user = { id: uuid(), email: email.toLowerCase(), name: name || '', phone: phone || '', passwordHash: hash, role: 'customer', isActive: true, createdAt: new Date() };
    await users.insertOne(user);
    const token = signToken({ id: user.id, role: user.role });
    const safe = { id: user.id, email: user.email, name: user.name, role: user.role };
    const res = json({ user: safe, token });
    res.cookies.set('auth_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
    return res;
  }
  if (path === '/auth/login' && method === 'POST') {
    const { email, password } = await readBody(request);
    const users = await getCollection('users');
    const user = await users.findOne({ email: (email || '').toLowerCase() });
    if (!user) return err('Kullanıcı bulunamadı', 404);
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return err('Şifre hatalı', 401);
    const token = signToken({ id: user.id, role: user.role });
    const safe = { id: user.id, email: user.email, name: user.name, role: user.role };
    const res = json({ user: safe, token });
    res.cookies.set('auth_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
    return res;
  }
  if (path === '/auth/me' && method === 'GET') {
    const user = await getCurrentUser(request);
    if (!user) return json({ user: null });
    return json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  }
  if (path === '/auth/logout' && method === 'POST') {
    const res = json({ ok: true });
    res.cookies.set('auth_token', '', { httpOnly: true, maxAge: 0, path: '/' });
    return res;
  }

  // ============ SITE SETTINGS ============
  if (path === '/settings' && method === 'GET') {
    const settings = await getCollection('site_settings');
    const s = await settings.findOne({ key: 'main' }, { projection: { _id: 0 } });
    return json({ settings: s });
  }
  if (path === '/settings' && method === 'PUT') {
    const user = await getCurrentUser(request);
    const auth = requireAdmin(user);
    if (!auth.ok) return err(auth.msg, auth.status);
    const body = await readBody(request);
    delete body._id; delete body.id; delete body.key;
    const settings = await getCollection('site_settings');
    await settings.updateOne({ key: 'main' }, { $set: { ...body, updatedAt: new Date() } });
    const s = await settings.findOne({ key: 'main' }, { projection: { _id: 0 } });
    return json({ settings: s });
  }

  // ============ HOMEPAGE SECTIONS ============
  if (path === '/homepage' && method === 'GET') {
    const col = await getCollection('homepage_sections');
    const all = await col.find({ isActive: true }, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();

    // For featured_products section enrich with products
    const products = await getCollection('products');
    for (const s of all) {
      if (s.type === 'featured_products') {
        const list = await products.find({ isActive: true, isFeatured: true }, { projection: { _id: 0 } }).limit(8).toArray();
        s.data.products = list;
      }
    }
    return json({ sections: all });
  }
  if (path === '/admin/homepage' && method === 'GET') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const col = await getCollection('homepage_sections');
    const all = await col.find({}, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();
    return json({ sections: all });
  }
  if (path === '/admin/homepage' && method === 'POST') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const body = await readBody(request);
    const col = await getCollection('homepage_sections');
    const last = await col.find({}).sort({ order: -1 }).limit(1).toArray();
    const order = (last[0]?.order || 0) + 1;
    const doc = { id: uuid(), type: body.type, order, isActive: true, data: body.data || {}, createdAt: new Date() };
    await col.insertOne(doc);
    return json({ section: doc });
  }
  if (path.startsWith('/admin/homepage/') && method === 'PUT') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const id = path.split('/').pop();
    const body = await readBody(request);
    delete body._id;
    const col = await getCollection('homepage_sections');
    await col.updateOne({ id }, { $set: { ...body, updatedAt: new Date() } });
    const s = await col.findOne({ id }, { projection: { _id: 0 } });
    return json({ section: s });
  }
  if (path.startsWith('/admin/homepage/') && method === 'DELETE') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const id = path.split('/').pop();
    const col = await getCollection('homepage_sections');
    await col.deleteOne({ id });
    return json({ ok: true });
  }
  if (path === '/admin/homepage/reorder' && method === 'POST') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const { order } = await readBody(request); // [{id, order}]
    const col = await getCollection('homepage_sections');
    for (const o of order) await col.updateOne({ id: o.id }, { $set: { order: o.order } });
    return json({ ok: true });
  }

  // ============ CATEGORIES ============
  if (path === '/categories' && method === 'GET') {
    const col = await getCollection('categories');
    const all = await col.find({ isActive: true }, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();
    return json({ categories: all });
  }

  // ============ PRODUCTS ============
  if (path === '/products' && method === 'GET') {
    const url = new URL(request.url);
    const kategori = url.searchParams.get('kategori');
    const q = url.searchParams.get('q');
    const filter = { isActive: true };
    if (kategori) {
      const cats = await getCollection('categories');
      const cat = await cats.findOne({ slug: kategori });
      if (cat) filter.categoryId = cat.id;
    }
    if (q) filter.name = { $regex: q, $options: 'i' };
    const col = await getCollection('products');
    const all = await col.find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    return json({ products: all });
  }
  if (path.startsWith('/products/') && method === 'GET') {
    const slug = path.split('/').pop();
    const col = await getCollection('products');
    const p = await col.findOne({ slug }, { projection: { _id: 0 } });
    if (!p) return err('Ürün bulunamadı', 404);
    return json({ product: p });
  }
  if (path === '/admin/products' && method === 'POST') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const body = await readBody(request);
    const doc = {
      id: uuid(),
      name: body.name,
      slug: body.slug || (body.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, ''),
      categoryId: body.categoryId || null,
      price: Number(body.price) || 0,
      oldPrice: Number(body.oldPrice) || 0,
      images: body.images || [],
      description: body.description || '',
      sku: body.sku || ('ABK-' + Date.now()),
      stock: Number(body.stock) || 0,
      specs: body.specs || {},
      isFeatured: !!body.isFeatured,
      isBestseller: !!body.isBestseller,
      isNew: !!body.isNew,
      isActive: body.isActive !== false,
      personalizable: body.personalizable !== false,
      personalizationPrice: Number(body.personalizationPrice) || 250,
      rating: 5,
      reviewCount: 0,
      discount: body.oldPrice > 0 ? Math.round((1 - body.price / body.oldPrice) * 100) : 0,
      createdAt: new Date()
    };
    const col = await getCollection('products');
    await col.insertOne(doc);
    return json({ product: doc });
  }
  if (path.startsWith('/admin/products/') && method === 'PUT') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const id = path.split('/').pop();
    const body = await readBody(request);
    delete body._id; delete body.id;
    const col = await getCollection('products');
    await col.updateOne({ id }, { $set: { ...body, updatedAt: new Date() } });
    const p = await col.findOne({ id }, { projection: { _id: 0 } });
    return json({ product: p });
  }
  if (path.startsWith('/admin/products/') && method === 'DELETE') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const id = path.split('/').pop();
    const col = await getCollection('products');
    await col.deleteOne({ id });
    return json({ ok: true });
  }
  if (path === '/admin/products' && method === 'GET') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const col = await getCollection('products');
    const all = await col.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    return json({ products: all });
  }

  // ============ UPLOAD ============
  if (path === '/upload' && method === 'POST') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const { dataUrl, folder } = await readBody(request);
    if (!dataUrl) return err('Dosya gerekli', 400);
    const result = await uploadImage(dataUrl, folder || 'ayintap');
    return json(result);
  }

  // ============ ORDERS ============
  if (path === '/orders' && method === 'POST') {
    const body = await readBody(request);
    const user = await getCurrentUser(request);
    const col = await getCollection('orders');
    const doc = {
      id: uuid(),
      orderNumber: 'ABK-' + Date.now(),
      userId: user?.id || null,
      customer: body.customer || {},
      items: body.items || [],
      subtotal: body.subtotal || 0,
      shipping: body.shipping || 0,
      total: body.total || 0,
      status: 'pending_payment',
      paymentMethod: body.paymentMethod || 'iyzico',
      paymentStatus: 'pending',
      shippingAddress: body.shippingAddress || {},
      trackingCode: '',
      createdAt: new Date()
    };
    await col.insertOne(doc);
    return json({ order: doc });
  }
  if (path === '/admin/orders' && method === 'GET') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const col = await getCollection('orders');
    const all = await col.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    return json({ orders: all });
  }
  if (path === '/admin/stats' && method === 'GET') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const orders = await getCollection('orders');
    const products = await getCollection('products');
    const users = await getCollection('users');
    const [orderCount, productCount, userCount, totalSales] = await Promise.all([
      orders.countDocuments({}),
      products.countDocuments({}),
      users.countDocuments({}),
      orders.aggregate([{ $group: { _id: null, sum: { $sum: '$total' } } }]).toArray()
    ]);
    return json({ orderCount, productCount, userCount, totalSales: totalSales[0]?.sum || 0 });
  }

  return err('Endpoint bulunamadı: ' + path, 404);
}

export const GET = route;
export const POST = route;
export const PUT = route;
export const DELETE = route;
export const PATCH = route;
