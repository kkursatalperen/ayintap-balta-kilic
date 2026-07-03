import { Resend } from 'resend';

// ============================================================================
// Resend client (lazy singleton)
// ============================================================================
let _resend = null;
function getResend() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

// Default From: brand-aligned, kendi domain'inden
const DEFAULT_FROM =
  process.env.EMAIL_FROM ||
  'Ayıntap Balta Kılıç <siparis@ayintapbaltakilic.com>';

const BRAND = {
  name: 'Ayıntap Balta Kılıç',
  bg: '#0b0b0b',        // mat siyah
  panel: '#141414',     // kart arkası
  border: '#2a2a2a',
  text: '#f5f1e6',      // krem-beyaz
  muted: '#a8a39a',
  gold: '#d4af37',      // eskitme altın
  goldDim: '#8a7126',
};

// ============================================================================
// Ortak helper: sendEmail
//   - RESEND_API_KEY yoksa → console.log fallback (mock mode)
//   - Hata yakalanır, throw etmez (sipariş akışını bozmaz)
// ============================================================================
export async function sendEmail({ to, subject, html, text, from, replyTo }) {
  if (!to) {
    console.warn('[EMAIL] Skipped: missing "to" address');
    return { ok: false, mocked: false, error: 'missing_to' };
  }

  const client = getResend();

  // Fallback: development / key yok → mock mode
  if (!client) {
    console.log('[EMAIL MOCK]', { to, subject });
    return { ok: true, mocked: true };
  }

  try {
    const { data, error } = await client.emails.send({
      from: from || DEFAULT_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo,
    });
    if (error) {
      console.error('[EMAIL] Resend error:', error);
      return { ok: false, mocked: false, error };
    }
    return { ok: true, mocked: false, id: data?.id };
  } catch (err) {
    console.error('[EMAIL] Exception while sending:', err?.message || err);
    return { ok: false, mocked: false, error: err?.message || String(err) };
  }
}

// ============================================================================
// HTML şablon yardımcıları
// ============================================================================
const ORDER_STATUS_TR = {
  pending_payment: 'Ödeme Bekleniyor',
  paid: 'Ödeme Alındı',
  processing: 'Hazırlanıyor',
  shipped: 'Kargoya Verildi',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
  refunded: 'İade Edildi',
};

function trStatus(s) {
  return ORDER_STATUS_TR[s] || s || '-';
}

function fmtTL(n) {
  const num = Number(n || 0);
  return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function baseLayout({ title, preheader = '', bodyHtml, ctaText, ctaUrl }) {
  const year = new Date().getFullYear();
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:Georgia,'Times New Roman',serif;color:${BRAND.text};">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:${BRAND.panel};border:1px solid ${BRAND.border};border-radius:6px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="padding:28px 32px;border-bottom:1px solid ${BRAND.border};text-align:center;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:3px;color:${BRAND.gold};text-transform:uppercase;font-weight:700;">${BRAND.name}</div>
          <div style="height:2px;width:48px;background:${BRAND.gold};margin:10px auto 0;"></div>
        </td></tr>

        <!-- Title -->
        <tr><td style="padding:32px 32px 8px 32px;">
          <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${BRAND.text};font-weight:600;">${escapeHtml(title)}</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:8px 32px 24px 32px;font-size:15px;line-height:1.7;color:${BRAND.text};">
          ${bodyHtml}
        </td></tr>

        ${ctaText && ctaUrl ? `
        <tr><td style="padding:8px 32px 32px 32px;text-align:center;">
          <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:${BRAND.gold};color:#111;text-decoration:none;padding:14px 28px;font-family:Georgia,'Times New Roman',serif;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;font-size:13px;border-radius:2px;">${escapeHtml(ctaText)}</a>
        </td></tr>` : ''}

        <!-- Footer -->
        <tr><td style="padding:24px 32px;border-top:1px solid ${BRAND.border};background:#0e0e0e;">
          <div style="font-size:12px;color:${BRAND.muted};text-align:center;line-height:1.6;">
            <div style="color:${BRAND.gold};letter-spacing:2px;text-transform:uppercase;font-weight:600;margin-bottom:6px;">${BRAND.name}</div>
            Gaziantep'in geleneksel ustalığı, modern dokunuşlarla.<br/>
            ${base ? `<a href="${escapeHtml(base)}" style="color:${BRAND.gold};text-decoration:none;">${escapeHtml(base.replace(/^https?:\/\//, ''))}</a> &nbsp;·&nbsp;` : ''}
            <span>© ${year} ${BRAND.name}. Tüm hakları saklıdır.</span>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function itemsTable(items = []) {
  if (!items.length) return '';
  const rows = items.map((it) => {
    const name = escapeHtml(it.name || it.title || 'Ürün');
    const qty = Number(it.quantity || it.qty || 1);
    const price = Number(it.price || it.unitPrice || 0);
    const line = price * qty;
    return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};color:${BRAND.text};">${name}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};color:${BRAND.muted};text-align:center;">${qty}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};color:${BRAND.text};text-align:right;">${fmtTL(line)}</td>
      </tr>`;
  }).join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;border-top:1px solid ${BRAND.border};">
      <thead>
        <tr>
          <th align="left"  style="padding:10px 0;font-size:12px;color:${BRAND.gold};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Ürün</th>
          <th align="center" style="padding:10px 0;font-size:12px;color:${BRAND.gold};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Adet</th>
          <th align="right" style="padding:10px 0;font-size:12px;color:${BRAND.gold};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Tutar</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function totalsBlock(order = {}) {
  const subtotal = Number(order.subtotal || 0);
  const shipping = Number(order.shipping || 0);
  const extra = Number(order.extraFee || 0);
  const total = Number(order.total || subtotal + shipping + extra);
  const row = (label, val, bold = false) => `
    <tr>
      <td style="padding:6px 0;color:${bold ? BRAND.gold : BRAND.muted};font-weight:${bold ? '700' : '400'};letter-spacing:${bold ? '1px' : '0'};text-transform:${bold ? 'uppercase' : 'none'};font-size:${bold ? '13px' : '14px'};">${label}</td>
      <td style="padding:6px 0;color:${bold ? BRAND.gold : BRAND.text};text-align:right;font-weight:${bold ? '700' : '500'};font-size:${bold ? '16px' : '14px'};">${fmtTL(val)}</td>
    </tr>`;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
      ${row('Ara Toplam', subtotal)}
      ${shipping ? row('Kargo', shipping) : ''}
      ${extra ? row('Ek Ücret', extra) : ''}
      <tr><td colspan="2" style="border-top:1px solid ${BRAND.border};padding:0;height:1px;"></td></tr>
      ${row('Toplam', total, true)}
    </table>`;
}

// ============================================================================
// Template fonksiyonları
// ============================================================================

// 1) Sipariş onayı
export async function sendOrderConfirmationEmail({ to, orderNumber, order = {} }) {
  if (!to) return { ok: false, error: 'missing_to' };
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const url = base ? `${base}/siparis-takip/${encodeURIComponent(orderNumber)}` : '';
  const customerName = order?.customer?.name || order?.shippingAddress?.name || 'Değerli Müşterimiz';

  // Google Review link — env override-able, with a sensible placeholder fallback.
  // TODO: When the Google Business Profile is live, set GOOGLE_REVIEW_URL in Vercel.
  const reviewUrl =
    process.env.GOOGLE_REVIEW_URL ||
    'https://www.google.com/search?q=Ay%C4%B1ntap+Balta+K%C4%B1l%C4%B1%C3%A7';

  // Premium "share your experience" block — antique gold accent on matte black.
  const reviewBlock = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:36px;border-top:1px solid ${BRAND.border};">
      <tr><td style="padding:28px 0 8px 0;text-align:center;">
        <div style="font-size:11px;color:${BRAND.gold};letter-spacing:2.5px;text-transform:uppercase;font-weight:700;margin-bottom:10px;">— Sosyal Kanıt —</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:${BRAND.text};font-weight:600;margin-bottom:8px;">Deneyiminiz Bizim İçin Değerli</div>
        <p style="margin:0 auto 22px auto;max-width:440px;font-size:14px;line-height:1.7;color:${BRAND.muted};">
          Siparişinize gösterdiğiniz güven için teşekkür ederiz. Eğer ustalığımızdan memnun kaldıysanız,
          birkaç saniyenizi ayırarak deneyiminizi paylaşmanız bizim için en büyük takdir olacaktır.
        </p>
        <a href="${escapeHtml(reviewUrl)}" target="_blank" rel="noopener"
           style="display:inline-block;background:#0b0b0b;color:${BRAND.gold};text-decoration:none;padding:14px 32px;font-family:Georgia,'Times New Roman',serif;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-size:12px;border:1px solid ${BRAND.gold};border-radius:2px;">
          ★ Deneyimini Paylaş
        </a>
        <div style="margin-top:14px;font-size:11px;color:${BRAND.muted};letter-spacing:1px;">Google Yorumlar</div>
      </td></tr>
    </table>
  `;

  const body = `
    <p style="margin:0 0 12px 0;">Merhaba <strong style="color:${BRAND.gold};">${escapeHtml(customerName)}</strong>,</p>
    <p style="margin:0 0 16px 0;">Siparişiniz başarıyla alınmıştır. Ustalarımız siparişinizi en kısa sürede hazırlamaya başlayacaktır.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0;background:#0e0e0e;border:1px solid ${BRAND.border};border-radius:4px;">
      <tr><td style="padding:14px 18px;">
        <div style="font-size:11px;color:${BRAND.muted};letter-spacing:1.5px;text-transform:uppercase;">Sipariş Numarası</div>
        <div style="font-size:18px;color:${BRAND.gold};font-weight:700;letter-spacing:1px;margin-top:4px;">${escapeHtml(orderNumber)}</div>
      </td></tr>
    </table>
    ${itemsTable(order.items)}
    ${totalsBlock(order)}
    <p style="margin:20px 0 0 0;color:${BRAND.muted};font-size:13px;">Sipariş durumunuz değiştiğinde size ayrıca e-posta gönderilecektir.</p>
    ${reviewBlock}
  `;
  return sendEmail({
    to,
    subject: `Siparişiniz Alındı · ${orderNumber} · ${BRAND.name}`,
    html: baseLayout({
      title: 'Siparişiniz Alındı',
      preheader: `Sipariş No: ${orderNumber} — Teşekkürler!`,
      bodyHtml: body,
      ctaText: url ? 'Siparişi Takip Et' : null,
      ctaUrl: url || null,
    }),
    text: `Sipariş No: ${orderNumber}\nTeşekkürler, ${customerName}. Siparişiniz alındı.\n${url}\n\nDeneyiminizi paylaşın: ${reviewUrl}`,
  });
}

// 2) Sipariş durum güncellemesi
export async function sendOrderStatusUpdateEmail({ to, orderNumber, status, note }) {
  if (!to) return { ok: false, error: 'missing_to' };
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const url = base ? `${base}/siparis-takip/${encodeURIComponent(orderNumber)}` : '';
  const body = `
    <p style="margin:0 0 12px 0;">Merhaba,</p>
    <p style="margin:0 0 16px 0;"><strong>${escapeHtml(orderNumber)}</strong> numaralı siparişinizin durumu güncellendi.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0;background:#0e0e0e;border:1px solid ${BRAND.border};border-radius:4px;">
      <tr><td style="padding:18px;text-align:center;">
        <div style="font-size:11px;color:${BRAND.muted};letter-spacing:1.5px;text-transform:uppercase;">Yeni Durum</div>
        <div style="font-size:22px;color:${BRAND.gold};font-weight:700;letter-spacing:1px;margin-top:6px;">${escapeHtml(trStatus(status))}</div>
      </td></tr>
    </table>
    ${note ? `<p style="margin:16px 0 0 0;padding:12px 16px;background:#0e0e0e;border-left:3px solid ${BRAND.gold};color:${BRAND.text};font-size:14px;"><em>${escapeHtml(note)}</em></p>` : ''}
  `;
  return sendEmail({
    to,
    subject: `Sipariş Durumu: ${trStatus(status)} · ${orderNumber}`,
    html: baseLayout({
      title: 'Sipariş Durumunuz Güncellendi',
      preheader: `${orderNumber} → ${trStatus(status)}`,
      bodyHtml: body,
      ctaText: url ? 'Siparişi Görüntüle' : null,
      ctaUrl: url || null,
    }),
    text: `Sipariş ${orderNumber} durumu: ${trStatus(status)}\n${note || ''}\n${url}`,
  });
}

// 3) Şifre sıfırlama
export async function sendPasswordResetEmail({ to, link }) {
  if (!to || !link) return { ok: false, error: 'missing_params' };
  const body = `
    <p style="margin:0 0 12px 0;">Merhaba,</p>
    <p style="margin:0 0 16px 0;">Hesabınız için bir şifre sıfırlama talebi aldık. Yeni şifrenizi belirlemek için aşağıdaki bağlantıya tıklayın.</p>
    <p style="margin:0 0 16px 0;color:${BRAND.muted};font-size:13px;">Bu bağlantı <strong style="color:${BRAND.gold};">1 saat</strong> içinde geçerliliğini yitirecektir. Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
    <p style="margin:18px 0 0 0;font-size:12px;color:${BRAND.muted};word-break:break-all;">Bağlantı çalışmazsa: <br/><span style="color:${BRAND.text};">${escapeHtml(link)}</span></p>
  `;
  return sendEmail({
    to,
    subject: `Şifre Sıfırlama · ${BRAND.name}`,
    html: baseLayout({
      title: 'Şifre Sıfırlama Talebi',
      preheader: 'Hesabınız için şifre sıfırlama bağlantısı',
      bodyHtml: body,
      ctaText: 'Şifremi Sıfırla',
      ctaUrl: link,
    }),
    text: `Şifre sıfırlama bağlantınız: ${link} (1 saat geçerli)`,
  });
}

// 4) E-posta doğrulama
export async function sendVerifyEmail({ to, link }) {
  if (!to || !link) return { ok: false, error: 'missing_params' };
  const body = `
    <p style="margin:0 0 12px 0;">Merhaba,</p>
    <p style="margin:0 0 16px 0;">Hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın. Doğrulama sonrası tüm özelliklerden eksiksiz yararlanabilirsiniz.</p>
    <p style="margin:18px 0 0 0;font-size:12px;color:${BRAND.muted};word-break:break-all;">Bağlantı çalışmazsa: <br/><span style="color:${BRAND.text};">${escapeHtml(link)}</span></p>
  `;
  return sendEmail({
    to,
    subject: `E-posta Doğrulama · ${BRAND.name}`,
    html: baseLayout({
      title: 'E-posta Adresinizi Doğrulayın',
      preheader: 'Hesabınızı doğrulamak için tek tıkla',
      bodyHtml: body,
      ctaText: 'E-postayı Doğrula',
      ctaUrl: link,
    }),
    text: `E-posta doğrulama bağlantınız: ${link}`,
  });
}
// test