import crypto from 'crypto';

const PAYTR_TOKEN_URL = 'https://www.paytr.com/odeme/api/get-token';

function getConfig() {
  return {
    merchantId: process.env.PAYTR_MERCHANT_ID || '',
    merchantKey: process.env.PAYTR_MERCHANT_KEY || '',
    merchantSalt: process.env.PAYTR_MERCHANT_SALT || '',
  };
}

export function isPaytrConfigured() {
  const { merchantId, merchantKey, merchantSalt } = getConfig();
  return !!(merchantId && merchantKey && merchantSalt);
}

// PayTR test_mode: '1' iken gercek karttan para cekilmez, entegrasyonu ucdan uca test etmeye yarar.
// Merchant onaylanip .env'e gercek key'ler girildiginde PAYTR_TEST_MODE=0 yapilmali.
function getTestMode() {
  return process.env.PAYTR_TEST_MODE === '0' ? '0' : '1';
}

/**
 * PayTR iFrame API icin token ister.
 * order: { orderNumber, total, customer:{name,email,phone}, shippingAddress:{...} }
 * basketItems: [[name, price(TL, string), qty], ...]
 */
export async function getPaytrToken({ order, basketItems, userIp, okUrl, failUrl }) {
  const { merchantId, merchantKey, merchantSalt } = getConfig();
  if (!merchantId || !merchantKey || !merchantSalt) {
    throw new Error('PayTR merchant bilgileri henuz .env dosyasina girilmedi (PAYTR_MERCHANT_ID / KEY / SALT)');
  }

  const merchantOid = order.orderNumber.replace(/[^a-zA-Z0-9]/g, '');
  const email = order.customer?.email || '';
  const paymentAmount = Math.round(order.total * 100); // kurus cinsinden, tam sayi
  const userBasket = Buffer.from(JSON.stringify(basketItems)).toString('base64');
  const noInstallment = '0';
  const maxInstallment = '0';
  const currency = 'TL';
  const testMode = getTestMode();

  const userName = order.customer?.name || '';
  const userAddress = [order.shippingAddress?.addressLine, order.shippingAddress?.district, order.shippingAddress?.city]
    .filter(Boolean).join(', ') || '-';
  const userPhone = order.customer?.phone || '-';

  const hashStr =
    merchantId +
    userIp +
    merchantOid +
    email +
    paymentAmount +
    userBasket +
    noInstallment +
    maxInstallment +
    currency +
    testMode;

  const paytrToken = crypto
    .createHmac('sha256', merchantKey)
    .update(hashStr + merchantSalt)
    .digest('base64');

  const form = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: userIp,
    merchant_oid: merchantOid,
    email,
    payment_amount: String(paymentAmount),
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: '1',
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: userName,
    user_address: userAddress,
    user_phone: userPhone,
    merchant_ok_url: okUrl,
    merchant_fail_url: failUrl,
    timeout_limit: '30',
    currency,
    test_mode: testMode,
  });

  const res = await fetch(PAYTR_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  const data = await res.json();
  if (data.status !== 'success') {
    throw new Error('PayTR token alinamadi: ' + (data.reason || 'bilinmeyen hata'));
  }
  return { token: data.token, merchantOid };
}

/**
 * PayTR callback (webhook) icin hash dogrulama.
 * fields: callback POST body (form-encoded olarak gelir)
 */
export function verifyPaytrCallback(fields) {
  const { merchantKey, merchantSalt } = getConfig();
  const { merchant_oid, status, total_amount, hash } = fields;
  const hashStr = merchant_oid + merchantSalt + status + total_amount;
  const calculated = crypto.createHmac('sha256', merchantKey).update(hashStr).digest('base64');
  return calculated === hash;
}
