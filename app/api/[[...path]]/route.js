import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { getCollection } from '@/lib/mongodb';
import { ensureSeed } from '@/lib/seed';
import { hashPassword, comparePassword, signToken, getCurrentUser, requireAdmin } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendPasswordResetEmail,
  sendVerifyEmail,
} from '@/lib/email';

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

  try {

  // ---- HEALTH ----
  if (path === '/' || path === '') return json({ ok: true, name: 'Ayintap Balta Kilic API', time: new Date().toISOString() });

  // ============ AUTH ============
  if (path === '/auth/register' && method === 'POST') {
    const { email, password, name, phone } = await readBody(request);
    if (!email || !password) return err('Email ve ÅŸifre zorunlu', 400);
    const users = await getCollection('users');
    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) return err('Bu e-posta zaten kayÄ±tlÄ±', 409);
    const hash = await hashPassword(password);
    const user = { id: uuid(), email: email.toLowerCase(), name: name || '', phone: phone || '', passwordHash: hash, role: 'customer', isActive: true, createdAt: new Date() };
    await users.insertOne(user);
    const token = signToken({ id: user.id, role: user.role });
    const safe = { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role };
    const res = json({ user: safe, token });
    res.cookies.set('auth_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
    return res;
  }
  if (path === '/auth/login' && method === 'POST') {
    const { email, password } = await readBody(request);
    const users = await getCollection('users');
    const user = await users.findOne({ email: (email || '').toLowerCase() });
    if (!user) return err('KullanÄ±cÄ± bulunamadÄ±', 404);
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return err('Åifre hatalÄ±', 401);
    const token = signToken({ id: user.id, role: user.role });
    const safe = { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role };
    const res = json({ user: safe, token });
    res.cookies.set('auth_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
    return res;
  }
  if (path === '/auth/me' && method === 'GET') {
    const user = await getCurrentUser(request);
    if (!user) return json({ user: null });
    return json({ user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role } });
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
    const all = await col.find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(200).toArray();
    return json({ products: all });
  }
  if (path.startsWith('/products/') && method === 'GET') {
    const slug = path.split('/').pop();
    const col = await getCollection('products');
    const p = await col.findOne({ slug }, { projection: { _id: 0 } });
    if (!p) return err('ÃœrÃ¼n bulunamadÄ±', 404);
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
    const all = await col.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(1000).toArray();
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
    const orderNumber = 'ABK-' + Date.now();
    const doc = {
      id: uuid(),
      orderNumber,
      userId: user?.id || null,
      customer: body.customer || {},
      items: body.items || [],
      subtotal: body.subtotal || 0,
      shipping: body.shipping || 0,
      extraFee: body.extraFee || 0,
      total: body.total || 0,
      status: 'pending_payment',
      paymentMethod: body.paymentMethod || 'iyzico',
      paymentStatus: 'pending',
      shippingMethod: body.shippingMethod || 'standard',
      shippingAddress: body.shippingAddress || {},
      trackingCode: '',
      trackingCarrier: '',
      statusHistory: [{ status: 'pending_payment', at: new Date(), note: 'Siparis olusturuldu' }],
      createdAt: new Date()
    };
    // Stok otomatik dÃ¼ÅŸ
    const productsCol = await getCollection('products');
    for (const item of doc.items) {
      await productsCol.updateOne(
        { id: item.productId, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } }
      );
    }
    await col.insertOne(doc);
    // Send order confirmation email (best-effort, never blocks order)
    try {
      const toEmail = body.customer?.email || user?.email;
      if (toEmail) {
        await sendOrderConfirmationEmail({ to: toEmail, orderNumber, order: doc });
      }
    } catch (e) { console.error('[EMAIL] order confirmation failed:', e?.message || e); }
    return json({ order: doc });
  }
  if (path.startsWith('/admin/orders/') && method === 'PUT') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const id = path.split('/').pop();
    const body = await readBody(request);
    const col = await getCollection('orders');
    const existing = await col.findOne({ id });
    if (!existing) return err('Siparis bulunamadi', 404);
    const update = {};
    if (body.trackingCode !== undefined) update.trackingCode = body.trackingCode;
    if (body.trackingCarrier !== undefined) update.trackingCarrier = body.trackingCarrier;
    if (body.paymentStatus !== undefined) update.paymentStatus = body.paymentStatus;
    if (body.status && body.status !== existing.status) {
      update.status = body.status;
      const history = existing.statusHistory || [];
      history.push({ status: body.status, at: new Date(), note: body.note || '' });
      update.statusHistory = history;
      // Send status update email (best-effort)
      try {
        const toEmail = existing.customer?.email;
        if (toEmail) {
          await sendOrderStatusUpdateEmail({
            to: toEmail,
            orderNumber: existing.orderNumber,
            status: body.status,
            note: body.note,
          });
        }
      } catch (e) { console.error('[EMAIL] order status update failed:', e?.message || e); }
    }
    update.updatedAt = new Date();
    await col.updateOne({ id }, { $set: update });
    const o = await col.findOne({ id }, { projection: { _id: 0 } });
    return json({ order: o });
  }
  if (path.startsWith('/orders/') && method === 'GET') {
    // public order detail by orderNumber (for guest tracking) or by id for logged user
    const key = path.split('/').pop();
    const col = await getCollection('orders');
    const o = await col.findOne({ $or: [{ id: key }, { orderNumber: key }] }, { projection: { _id: 0 } });
    if (!o) return err('Siparis bulunamadi', 404);
    return json({ order: o });
  }

  // ============ ME (USER ENDPOINTS) ============
  if (path === '/me/orders' && method === 'GET') {
    const user = await getCurrentUser(request); if (!user) return err('Giris yapmalisiniz', 401);
    const col = await getCollection('orders');
    const all = await col.find({ userId: user.id }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    return json({ orders: all });
  }
  if (path === '/me/profile' && method === 'PUT') {
    const user = await getCurrentUser(request); if (!user) return err('Giris yapmalisiniz', 401);
    const body = await readBody(request);
    const allow = {};
    if (body.name !== undefined) allow.name = body.name;
    if (body.phone !== undefined) allow.phone = body.phone;
    const users = await getCollection('users');
    await users.updateOne({ id: user.id }, { $set: { ...allow, updatedAt: new Date() } });
    const u = await users.findOne({ id: user.id });
    return json({ user: { id: u.id, email: u.email, name: u.name, phone: u.phone, role: u.role } });
  }
  if (path === '/me/change-password' && method === 'POST') {
    const user = await getCurrentUser(request); if (!user) return err('Giris yapmalisiniz', 401);
    const { oldPassword, newPassword } = await readBody(request);
    if (!newPassword || newPassword.length < 6) return err('Yeni sifre en az 6 karakter olmali', 400);
    const ok = await comparePassword(oldPassword || '', user.passwordHash);
    if (!ok) return err('Mevcut sifre hatali', 401);
    const hash = await hashPassword(newPassword);
    const users = await getCollection('users');
    await users.updateOne({ id: user.id }, { $set: { passwordHash: hash, updatedAt: new Date() } });
    return json({ ok: true });
  }

  // ============ FAVORITES ============
  if (path === '/me/favorites' && method === 'GET') {
    const user = await getCurrentUser(request); if (!user) return err('Giris yapmalisiniz', 401);
    const col = await getCollection('favorites');
    const favs = await col.find({ userId: user.id }, { projection: { _id: 0 } }).toArray();
    const productIds = favs.map(f => f.productId);
    const products = await getCollection('products');
    const list = productIds.length ? await products.find({ id: { $in: productIds } }, { projection: { _id: 0 } }).toArray() : [];
    return json({ favorites: list });
  }
  if (path === '/me/favorites' && method === 'POST') {
    const user = await getCurrentUser(request); if (!user) return err('Giris yapmalisiniz', 401);
    const { productId } = await readBody(request);
    const col = await getCollection('favorites');
    const existing = await col.findOne({ userId: user.id, productId });
    if (existing) { await col.deleteOne({ userId: user.id, productId }); return json({ added: false }); }
    await col.insertOne({ id: uuid(), userId: user.id, productId, createdAt: new Date() });
    return json({ added: true });
  }

  // ============ ADDRESSES ============
  if (path === '/me/addresses' && method === 'GET') {
    const user = await getCurrentUser(request); if (!user) return err('Giris yapmalisiniz', 401);
    const col = await getCollection('addresses');
    const all = await col.find({ userId: user.id }, { projection: { _id: 0 } }).sort({ isDefault: -1, createdAt: -1 }).toArray();
    return json({ addresses: all });
  }
  if (path === '/me/addresses' && method === 'POST') {
    const user = await getCurrentUser(request); if (!user) return err('Giris yapmalisiniz', 401);
    const body = await readBody(request);
    const col = await getCollection('addresses');
    if (body.isDefault) await col.updateMany({ userId: user.id }, { $set: { isDefault: false } });
    const doc = {
      id: uuid(), userId: user.id,
      title: body.title || 'Adres',
      fullName: body.fullName || '', phone: body.phone || '',
      city: body.city || '', district: body.district || '',
      zipCode: body.zipCode || '', addressLine: body.addressLine || '',
      isDefault: !!body.isDefault,
      createdAt: new Date(),
    };
    await col.insertOne(doc);
    return json({ address: doc });
  }
  if (path.startsWith('/me/addresses/') && method === 'PUT') {
    const user = await getCurrentUser(request); if (!user) return err('Giris yapmalisiniz', 401);
    const id = path.split('/').pop();
    const body = await readBody(request);
    delete body._id; delete body.id; delete body.userId;
    const col = await getCollection('addresses');
    if (body.isDefault) await col.updateMany({ userId: user.id }, { $set: { isDefault: false } });
    await col.updateOne({ id, userId: user.id }, { $set: { ...body, updatedAt: new Date() } });
    const a = await col.findOne({ id }, { projection: { _id: 0 } });
    return json({ address: a });
  }
  if (path.startsWith('/me/addresses/') && method === 'DELETE') {
    const user = await getCurrentUser(request); if (!user) return err('Giris yapmalisiniz', 401);
    const id = path.split('/').pop();
    const col = await getCollection('addresses');
    await col.deleteOne({ id, userId: user.id });
    return json({ ok: true });
  }

  // ============ PASSWORD RESET / EMAIL VERIFY ============
  if (path === '/auth/forgot-password' && method === 'POST') {
    const { email } = await readBody(request);
    const users = await getCollection('users');
    const user = await users.findOne({ email: (email || '').toLowerCase() });
    if (user) {
      const token = uuid();
      const expires = new Date(Date.now() + 60 * 60 * 1000);
      await users.updateOne({ id: user.id }, { $set: { resetToken: token, resetExpires: expires } });
      const link = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/sifre-sifirla/${token}`;
      // Send password reset email (best-effort)
      try {
        await sendPasswordResetEmail({ to: user.email, link });
      } catch (e) { console.error('[EMAIL] password reset failed:', e?.message || e); }
    }
    // always return ok to prevent email enumeration
    return json({ ok: true, message: 'Eger bu email kayitliysa sifre sifirlama baglantisi gonderildi.' });
  }
  if (path === '/auth/reset-password' && method === 'POST') {
    const { token, password } = await readBody(request);
    if (!token || !password) return err('Eksik veri', 400);
    if (password.length < 6) return err('Sifre en az 6 karakter olmali', 400);
    const users = await getCollection('users');
    const user = await users.findOne({ resetToken: token });
    if (!user) return err('Gecersiz veya kullanilmis token', 400);
    if (user.resetExpires && new Date(user.resetExpires) < new Date()) return err('Token suresi dolmus', 400);
    const hash = await hashPassword(password);
    await users.updateOne({ id: user.id }, { $set: { passwordHash: hash }, $unset: { resetToken: '', resetExpires: '' } });
    return json({ ok: true });
  }
  if (path === '/auth/send-verification' && method === 'POST') {
    const user = await getCurrentUser(request); if (!user) return err('Giris yapmalisiniz', 401);
    const token = uuid();
    const users = await getCollection('users');
    await users.updateOne({ id: user.id }, { $set: { verifyToken: token } });
    const link = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/email-dogrula/${token}`;
    // Send verification email (best-effort)
    try {
      await sendVerifyEmail({ to: user.email, link });
    } catch (e) { console.error('[EMAIL] verify email failed:', e?.message || e); }
    return json({ ok: true });
  }
  if (path === '/auth/verify-email' && method === 'POST') {
    const { token } = await readBody(request);
    const users = await getCollection('users');
    const user = await users.findOne({ verifyToken: token });
    if (!user) return err('Gecersiz token', 400);
    await users.updateOne({ id: user.id }, { $set: { emailVerified: true }, $unset: { verifyToken: '' } });
    return json({ ok: true });
  }

  // ============ BLOG ============
  if (path === '/blog' && method === 'GET') {
    const col = await getCollection('blogs');
    const all = await col.find({ isPublished: true }, { projection: { _id: 0 } }).sort({ publishedAt: -1, createdAt: -1 }).limit(50).toArray();
    return json({ posts: all });
  }
  if (path.startsWith('/blog/') && method === 'GET') {
    const slug = path.split('/').pop();
    const col = await getCollection('blogs');
    const post = await col.findOne({ slug, isPublished: true }, { projection: { _id: 0 } });
    if (!post) return err('Yazi bulunamadi', 404);
    return json({ post });
  }
  if (path === '/admin/blog' && method === 'GET') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const col = await getCollection('blogs');
    const all = await col.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    return json({ posts: all });
  }
  if (path === '/admin/blog' && method === 'POST') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const body = await readBody(request);
    const slug = body.slug || (body.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const doc = {
      id: uuid(),
      title: body.title || '',
      slug,
      excerpt: body.excerpt || '',
      content: body.content || '',
      coverImage: body.coverImage || '',
      tags: body.tags || [],
      category: body.category || '',
      author: user.name || user.email,
      isPublished: !!body.isPublished,
      publishedAt: body.isPublished ? new Date() : null,
      seo: body.seo || {},
      createdAt: new Date(),
    };
    const col = await getCollection('blogs');
    await col.insertOne(doc);
    return json({ post: doc });
  }
  if (path.startsWith('/admin/blog/') && method === 'PUT') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const id = path.split('/').pop();
    const body = await readBody(request);
    delete body._id; delete body.id;
    const col = await getCollection('blogs');
    const existing = await col.findOne({ id });
    if (!existing) return err('Yazi bulunamadi', 404);
    if (body.isPublished && !existing.isPublished) body.publishedAt = new Date();
    await col.updateOne({ id }, { $set: { ...body, updatedAt: new Date() } });
    const p = await col.findOne({ id }, { projection: { _id: 0 } });
    return json({ post: p });
  }
  if (path.startsWith('/admin/blog/') && method === 'DELETE') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const id = path.split('/').pop();
    const col = await getCollection('blogs');
    await col.deleteOne({ id });
    return json({ ok: true });
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

  if (path === '/contact' && method === 'POST') {
    const body = await readBody(request);
    const { name, email, subject, message } = body;
    if (!name || !email || !message) return err('Ad, e-posta ve mesaj zorunludur', 400);
    const col = await getCollection('contact_messages');
    const doc = { id: uuid(), name, email, subject: subject || '', message, createdAt: new Date(), isRead: false };
    await col.insertOne(doc);
    return json({ ok: true });
  }


  // ============ ADMIN CATEGORIES ============
  if (path === '/admin/categories' && method === 'GET') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const col = await getCollection('categories');
    const all = await col.find({}, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();
    return json({ categories: all });
  }
  if (path === '/admin/categories' && method === 'POST') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const body = await readBody(request);
    const col = await getCollection('categories');
    const last = await col.find({}).sort({ order: -1 }).limit(1).toArray();
    const order = (last[0]?.order || 0) + 1;
    const doc = { id: uuid(), name: body.name || '', slug: body.slug || (body.name||'').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''), description: body.description || '', image: body.image || '', order, isActive: body.isActive !== false, createdAt: new Date() };
    await col.insertOne(doc);
    return json({ category: doc });
  }
  if (path.startsWith('/admin/categories/') && method === 'PUT') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const id = path.split('/').pop();
    const body = await readBody(request);
    delete body._id; delete body.id;
    const col = await getCollection('categories');
    await col.updateOne({ id }, { $set: { ...body, updatedAt: new Date() } });
    const c = await col.findOne({ id }, { projection: { _id: 0 } });
    return json({ category: c });
  }
  if (path.startsWith('/admin/categories/') && method === 'DELETE') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const id = path.split('/').pop();
    const col = await getCollection('categories');
    await col.deleteOne({ id });
    return json({ ok: true });
  }
  return err('Endpoint bulunamadÄ±: ' + path, 404);
  } catch (e) {
    console.error('[API ERROR]', path, method, e);
    return err('Sunucu hatasi olustu, lutfen tekrar deneyin', 500);
  }
}

export const GET = route;
export const POST = route;
export const PUT = route;
export const DELETE = route;
export const PATCH = route;
