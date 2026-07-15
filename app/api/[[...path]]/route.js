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
  sendWelcomeEmail,
} from '@/lib/email';
import { getPaytrToken, verifyPaytrCallback, isPaytrConfigured } from '@/lib/paytr';

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
    if (!email || !password) return err('Email ve Ãƒâ€¦Ã…Â¸ifre zorunlu', 400);
    const users = await getCollection('users');
    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) return err('Bu e-posta zaten kayÃƒâ€Ã‚Â±tlÃƒâ€Ã‚Â±', 409);
    const hash = await hashPassword(password);
    const user = { id: uuid(), email: email.toLowerCase(), name: name || '', phone: phone || '', passwordHash: hash, role: 'customer', isActive: true, createdAt: new Date() };
    await users.insertOne(user);
    const token = signToken({ id: user.id, role: user.role });
    const safe = { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role };
    const res = json({ user: safe, token });
    res.cookies.set('auth_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
    try { await sendWelcomeEmail({ to: user.email, name: user.name }); } catch (e) { console.error('[EMAIL] welcome failed:', e?.message || e); }
    return res;
  }
  if (path === '/auth/login' && method === 'POST') {
    const { email, password } = await readBody(request);
    const users = await getCollection('users');
    const user = await users.findOne({ email: (email || '').toLowerCase() });
    if (!user) return err('KullanÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â± bulunamadÃƒâ€Ã‚Â±', 404);
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return err('Ãƒâ€¦Ã‚Âifre hatalÃƒâ€Ã‚Â±', 401);
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
    if (!p) return err('ÃƒÆ’Ã…â€œrÃƒÆ’Ã‚Â¼n bulunamadÃƒâ€Ã‚Â±', 404);
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
    // Stok otomatik dÃƒÆ’Ã‚Â¼Ãƒâ€¦Ã…Â¸
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

  // ============ PAYMENT (PAYTR) ============
  if (path === '/payment/paytr-init' && method === 'POST') {
    const body = await readBody(request);
    const { orderNumber } = body;
    if (!orderNumber) return err('orderNumber zorunlu', 400);
    if (!isPaytrConfigured()) return err('PayTR henuz yapilandirilmadi (merchant onayi bekleniyor)', 503);

    const ordersCol = await getCollection('orders');
    const order = await ordersCol.findOne({ orderNumber }, { projection: { _id: 0 } });
    if (!order) return err('Siparis bulunamadi', 404);
    if (order.paymentStatus === 'paid') return err('Bu siparis zaten odenmis', 400);

    const userIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '127.0.0.1';

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
    const basketItems = (order.items || []).map(i => [
      i.name.slice(0, 100),
      ((i.price + (i.personalizationPrice || 0))).toFixed(2),
      i.qty,
    ]);

    try {
      const { token } = await getPaytrToken({
        order,
        basketItems,
        userIp,
        okUrl: `${baseUrl}/odeme/basarili?no=${order.orderNumber}`,
        failUrl: `${baseUrl}/odeme?hata=1&no=${order.orderNumber}`,
      });
      return json({ token, iframeUrl: `https://www.paytr.com/odeme/guvenli/${token}` });
    } catch (e) {
      console.error('[PAYTR] init failed:', e?.message || e);
      return err(e?.message || 'PayTR odeme baslatilamadi', 500);
    }
  }

  // PayTR callback -- PUBLIC endpoint, PayTR sunuculari cagirir. Auth YOK.
  // Content-Type: application/x-www-form-urlencoded
  // Basarili isleme her zaman duz metin "OK" donmek ZORUNLU, aksi halde PayTR tekrar dener.
  if (path === '/payment/paytr-callback' && method === 'POST') {
    try {
      const formData = await request.formData();
      const fields = Object.fromEntries(formData.entries());
      const { merchant_oid, status, total_amount } = fields;

      if (!verifyPaytrCallback(fields)) {
        console.error('[PAYTR] callback hash mismatch', merchant_oid);
        return new NextResponse('PAYTR notification failed: bad hash', { status: 400 });
      }

      const ordersCol = await getCollection('orders');
      const order = await ordersCol.findOne({ orderNumber: merchant_oid });
      if (order && order.paymentStatus !== 'paid') {
        if (status === 'success') {
          const history = order.statusHistory || [];
          history.push({ status: 'paid', at: new Date(), note: 'PayTR odeme onaylandi' });
          await ordersCol.updateOne({ orderNumber: merchant_oid }, {
            $set: { paymentStatus: 'paid', status: 'paid', statusHistory: history, updatedAt: new Date() }
          });
          try {
            const toEmail = order.customer?.email;
            if (toEmail) await sendOrderStatusUpdateEmail({ to: toEmail, orderNumber: merchant_oid, status: 'paid', note: 'Odemeniz alindi' });
          } catch (e) { console.error('[EMAIL] paid notify failed:', e?.message || e); }
        } else {
          const history = order.statusHistory || [];
          history.push({ status: 'payment_failed', at: new Date(), note: 'PayTR odeme basarisiz' });
          await ordersCol.updateOne({ orderNumber: merchant_oid }, {
            $set: { paymentStatus: 'failed', statusHistory: history, updatedAt: new Date() }
          });
        }
      }
      // PayTR bu tam cevabi bekliyor, degistirilmemeli
      return new NextResponse('OK', { status: 200 });
    } catch (e) {
      console.error('[PAYTR] callback error:', e?.message || e);
      return new NextResponse('PAYTR notification failed', { status: 500 });
    }
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
  // ============ ADMIN KULLANICI YÃƒâ€“NETÃ„Â°MÃ„Â° ============
  if (path === '/admin/users' && method === 'GET') {
    const user = await getCurrentUser(request);
    const auth = requireAdmin(user);
    if (!auth.ok) return err(auth.msg, auth.status);
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const col = await getCollection('users');
    const ordersCol = await getCollection('orders');
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (status === 'blocked') filter.isBlocked = true;
    else if (status === 'active') filter.isBlocked = { $ne: true };
    const users = await col.find(filter, {
      projection: { passwordHash: 0, _id: 0 }
    }).sort({ createdAt: -1 }).limit(200).toArray();
    // Her kullanÃ„Â±cÃ„Â± iÃƒÂ§in toplam harcama ve sipariÃ…Å¸ sayÃ„Â±sÃ„Â±nÃ„Â± hesapla
    const enriched = await Promise.all(users.map(async (u) => {
      const orders = await ordersCol.aggregate([
        { $match: { userId: u.id } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]).toArray();
      return {
        ...u,
        totalSpent: orders[0]?.total || 0,
        orderCount: orders[0]?.count || 0,
      };
    }));
    return json({ users: enriched });
  }

  if (path.startsWith('/admin/users/') && method === 'GET') {
    const user = await getCurrentUser(request);
    const auth = requireAdmin(user);
    if (!auth.ok) return err(auth.msg, auth.status);
    const id = path.split('/').pop();
    const col = await getCollection('users');
    const ordersCol = await getCollection('orders');
    const addressesCol = await getCollection('addresses');
    const favoritesCol = await getCollection('favorites');
    const productsCol = await getCollection('products');
    const u = await col.findOne({ id }, { projection: { passwordHash: 0, _id: 0 } });
    if (!u) return err('KullanÃ„Â±cÃ„Â± bulunamadÃ„Â±', 404);
    const [orders, addresses, favorites] = await Promise.all([
      ordersCol.find({ userId: id }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray(),
      addressesCol.find({ userId: id }, { projection: { _id: 0 } }).toArray(),
      favoritesCol.find({ userId: id }, { projection: { _id: 0 } }).toArray(),
    ]);
    const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
    const avgOrder = orders.length ? totalSpent / orders.length : 0;
    const favProducts = favorites.length ? await productsCol.find(
      { id: { $in: favorites.map(f => f.productId) } },
      { projection: { _id: 0, id: 1, name: 1, price: 1, images: 1, slug: 1 } }
    ).toArray() : [];
    return json({ user: u, orders, addresses, favorites: favProducts, stats: { totalSpent, orderCount: orders.length, avgOrder } });
  }

  if (path.startsWith('/admin/users/') && method === 'PUT') {
    const user = await getCurrentUser(request);
    const auth = requireAdmin(user);
    if (!auth.ok) return err(auth.msg, auth.status);
    const id = path.split('/').pop();
    const body = await readBody(request);
    const col = await getCollection('users');
    const allowed = {};
    if (body.isBlocked !== undefined) allowed.isBlocked = body.isBlocked;
    if (body.role !== undefined) allowed.role = body.role;
    if (body.adminNote !== undefined) allowed.adminNote = body.adminNote;
    if (body.email !== undefined) allowed.email = body.email.toLowerCase();
    if (body.name !== undefined) allowed.name = body.name;
    allowed.updatedAt = new Date();
    await col.updateOne({ id }, { $set: allowed });
    const u = await col.findOne({ id }, { projection: { passwordHash: 0, _id: 0 } });
    return json({ user: u });
  }
  // ============ KUPON SÃ„Â°STEMÃ„Â° ============
  if (path === '/admin/coupons' && method === 'GET') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const col = await getCollection('coupons');
    const all = await col.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    return json({ coupons: all });
  }
  if (path === '/admin/coupons' && method === 'POST') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const body = await readBody(request);
    if (!body.code || !body.discount) return err('Kod ve indirim zorunlu', 400);
    const col = await getCollection('coupons');
    const existing = await col.findOne({ code: body.code.toUpperCase() });
    if (existing) return err('Bu kupon kodu zaten mevcut', 409);
    const doc = {
      id: uuid(),
      code: body.code.toUpperCase(),
      discount: Number(body.discount),
      type: body.type || 'percent',
      minOrder: Number(body.minOrder) || 0,
      maxUses: Number(body.maxUses) || 0,
      usedCount: 0,
      userId: body.userId || null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      isActive: true,
      createdAt: new Date(),
    };
    await col.insertOne(doc);
    return json({ coupon: doc });
  }
  if (path.startsWith('/admin/coupons/') && method === 'DELETE') {
    const user = await getCurrentUser(request); const auth = requireAdmin(user); if (!auth.ok) return err(auth.msg, auth.status);
    const id = path.split('/').pop();
    const col = await getCollection('coupons');
    await col.deleteOne({ id });
    return json({ ok: true });
  }
  if (path === '/validate-coupon' && method === 'POST') {
    const { code, total } = await readBody(request);
    const col = await getCollection('coupons');
    const coupon = await col.findOne({ code: (code || '').toUpperCase(), isActive: true });
    if (!coupon) return err('GeÃƒÂ§ersiz kupon kodu', 404);
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return err('Kupon sÃƒÂ¼resi dolmuÃ…Å¸', 400);
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return err('Kupon kullanÃ„Â±m limiti doldu', 400);
    if (coupon.minOrder > 0 && total < coupon.minOrder) return err(`Bu kupon iÃƒÂ§in minimum sipariÃ…Å¸ tutarÃ„Â± ${coupon.minOrder.toLocaleString('tr-TR')}Ã¢â€šÂº`, 400);
    const discountAmount = coupon.type === 'percent' ? Math.round(total * coupon.discount / 100) : coupon.discount;
    return json({ coupon, discountAmount });
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
  return err('Endpoint bulunamadÃƒâ€Ã‚Â±: ' + path, 404);
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
