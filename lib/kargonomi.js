import crypto from 'crypto';

const BASE_URL = 'https://app.kargonomi.com.tr/api/v1';

function getConfig() {
  return {
    token: process.env.KARGONOMI_API_TOKEN || '',
    appKey: process.env.KARGONOMI_APP_KEY || '', // partner API kullanıyorsanız gerekir, aksi halde boş bırakılabilir
    warehouseId: process.env.KARGONOMI_WAREHOUSE_ID || '',
    webhookSecret: process.env.KARGONOMI_WEBHOOK_SECRET || '',
  };
}

export function isKargonomiConfigured() {
  return !!getConfig().token;
}

async function kargonomiFetch(path, options = {}) {
  const { token, appKey } = getConfig();
  if (!token) throw new Error('Kargonomi API token .env dosyasına henüz girilmedi (KARGONOMI_API_TOKEN)');

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(appKey ? { 'X-App-Key': appKey } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) {
    const msg = data?.message || data?.errors ? JSON.stringify(data.errors || data.message) : `Kargonomi API hatası (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ---- Şehir / İlçe eşleştirme (Kargonomi kendi state_id / city_id sistemini kullanıyor) ----
let statesCache = null;
const citiesCache = new Map();

export async function getStates() {
  if (statesCache) return statesCache;
  const data = await kargonomiFetch('/states/1');
  statesCache = data.data || data;
  return statesCache;
}

export async function getCities(stateId) {
  if (citiesCache.has(stateId)) return citiesCache.get(stateId);
  const data = await kargonomiFetch(`/cities/${stateId}`);
  const cities = data.data || data;
  citiesCache.set(stateId, cities);
  return cities;
}

function normalizeTr(s) {
  return (s || '')
    .toLocaleUpperCase('tr-TR')
    .replace(/İ/g, 'I').replace(/Ğ/g, 'G').replace(/Ü/g, 'U')
    .replace(/Ş/g, 'S').replace(/Ö/g, 'O').replace(/Ç/g, 'C')
    .trim();
}

/** İl (state) adından Kargonomi state_id bulur — örn. "Gaziantep" */
export async function findStateId(stateName) {
  const states = await getStates();
  const target = normalizeTr(stateName);
  const found = states.find(s => normalizeTr(s.name) === target) || states.find(s => normalizeTr(s.name).includes(target));
  if (!found) throw new Error(`Kargonomi'de "${stateName}" ili bulunamadı`);
  return found.id;
}

/** İlçe (city) adından Kargonomi city_id bulur — stateId zorunlu */
export async function findCityId(stateId, cityName) {
  const cities = await getCities(stateId);
  const target = normalizeTr(cityName);
  const found = cities.find(c => normalizeTr(c.name) === target) || cities.find(c => normalizeTr(c.name).includes(target));
  if (!found) throw new Error(`Kargonomi'de "${cityName}" ilçesi bulunamadı`);
  return found.id;
}

// ---- Gönderi işlemleri ----

/**
 * order.shippingAddress: { name, phone, addressLine, city (il), district (ilçe) }
 * order.items: kalem listesi (paket içeriği metni için)
 */
export async function createShipment(order) {
  const { warehouseId } = getConfig();
  const addr = order.shippingAddress || {};
  const stateId = await findStateId(addr.city);
  const cityId = await findCityId(stateId, addr.district);

  const totalDesi = (order.items || []).reduce((sum, i) => sum + (i.qty || 1) * (i.desi || 3), 0) || 3;
  const contentSummary = (order.items || []).map(i => i.name).join(', ').slice(0, 250);

  const payload = {
    shipment: {
      ...(warehouseId ? { warehouse_id: warehouseId } : {}),
      buyer_name: addr.fullName || order.customer?.name || 'Müşteri',
      buyer_email: order.customer?.email || undefined,
      buyer_phone: (addr.phone || order.customer?.phone || '').replace(/\D/g, '').slice(-10),
      buyer_address: addr.addressLine || '-',
      buyer_state_id: String(stateId),
      buyer_city_id: String(cityId),
      packages: [
        { content: contentSummary || 'Ürün', barcode: order.orderNumber, desi: String(totalDesi) },
      ],
    },
  };

  const data = await kargonomiFetch('/shipments', { method: 'POST', body: JSON.stringify(payload) });
  return data;
}

/** Gönderi için kargo firmalarının fiyat tekliflerini listeler */
export async function getPriceComparison(shipmentId) {
  return kargonomiFetch(`/shipment-price-comparison/${shipmentId}`);
}

/**
 * Bir kargo firmasını seçip gönderiyi işleme hazır hale getirir.
 * shippingProviderId: -1 gönderilirse en ucuz teklif otomatik seçilir.
 */
export async function confirmShippingPrice(shipmentId, shippingProviderId = -1) {
  const form = new URLSearchParams();
  form.append('shipment_id', String(shipmentId));
  form.append('shipping_provider_id', String(shippingProviderId));
  const { token, appKey } = getConfig();
  const res = await fetch(`${BASE_URL}/confirm-shipping-price`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(appKey ? { 'X-App-Key': appKey } : {}),
    },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Kargonomi onay hatası');
  return data;
}

/** Barkod/etiket çıktısını (base64) alır — format: pdf */
export async function getShipmentBarcode(shipmentId, format = 'pdf') {
  return kargonomiFetch(`/shipments/${shipmentId}/barcode?format=${format}`);
}

export async function getShipment(shipmentId) {
  return kargonomiFetch(`/shipments/${shipmentId}`);
}

export async function cancelShipment(shipmentId) {
  return kargonomiFetch('/shipments/cancel', { method: 'POST', body: JSON.stringify({ shipment_id: shipmentId }) });
}

/** Webhook imza doğrulama — X-Webhook-Signature header'ı ile HMAC-SHA256 karşılaştırması */
export function verifyKargonomiSignature(rawBody, signatureHeader) {
  const { webhookSecret } = getConfig();
  if (!webhookSecret) return false;
  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader || ''));
  } catch {
    return false;
  }
}

/** Kargonomi shipment status kodunu bizim sipariş durumumuza çevirir */
export function mapKargonomiStatus(status) {
  const map = {
    webservice_order_created: 'shipped_processing',
    webservice_shipment_started: 'shipped',
    webservice_shipment_delivered: 'delivered',
    webservice_shipment_not_delivered: 'delivery_failed',
    webservice_shipment_returning: 'returning',
    webservice_shipment_missing: 'missing',
    cancelled: 'cancelled',
  };
  return map[status] || null;
}