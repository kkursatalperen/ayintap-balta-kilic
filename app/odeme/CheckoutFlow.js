'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCart } from '@/lib/store';
import {
  MapPin, Truck, CreditCard, ClipboardCheck, Check, ChevronRight, ChevronLeft,
  Plus, Lock, Smartphone, Wallet, Building2, Shield, Star, Edit
} from 'lucide-react';

const STEPS = [
  { id: 1, key: 'address', label: 'Adres', icon: MapPin },
  { id: 2, key: 'shipping', label: 'Teslimat', icon: Truck },
  { id: 3, key: 'payment', label: 'Ödeme', icon: CreditCard },
  { id: 4, key: 'review', label: 'Onay', icon: ClipboardCheck },
];

const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standart Kargo', desc: '3-5 iş günü · Yurtiçi Kargo', price: 89, freeOver: 5000 },
  { id: 'express', label: 'Express Kargo', desc: '1-2 iş günü · Aras Kargo', price: 149, freeOver: 10000 },
  { id: 'pickup', label: 'Atölyeden Teslim', desc: 'Gaziantep / Şahinbey adresimizden', price: 0 },
];

const PAYMENT_METHODS = [
  { id: 'iyzico', label: 'Kredi / Banka Kartı (iyzico)', desc: '3D Secure ile güvenli ödeme', icon: CreditCard, recommended: true, mock: true },
  { id: 'paytr', label: 'Kredi Kartı (PayTR)', desc: 'Alternatif ödeme sağlayıcı', icon: Smartphone, mock: true },
  { id: 'transfer', label: 'Havale / EFT', desc: 'Banka hesabımıza havale (3 iş günü onay)', icon: Building2 },
  { id: 'cod', label: 'Kapıda Ödeme', desc: 'Teşlimat sırasında nakit/kart', icon: Wallet, extraFee: 25 },
];

export default function CheckoutFlow() {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const [step, setStep] = useState(1);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [guest, setGuest] = useState({ fullName: '', email: '', phone: '', city: '', district: '', zipCode: '', addressLine: '' });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('iyzico');
  const [agreeContract, setAgreeContract] = useState(false);
  const [agreeKvkk, setAgreeKvkk] = useState(false);
  const [placing, setPlacing] = useState(false);

  const subtotal = total();
  const shippingObj = SHIPPING_METHODS.find(s => s.id === shippingMethod);
  const shippingCost = shippingObj?.freeOver && subtotal >= shippingObj.freeOver ? 0 : (shippingObj?.price || 0);
  const paymentObj = PAYMENT_METHODS.find(p => p.id === paymentMethod);
  const extraFee = paymentObj?.extraFee || 0;
  const grandTotal = subtotal + shippingCost + extraFee;

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setUser(d.user); setAuthChecked(true);
      if (d.user) {
        fetch('/api/me/addresses').then(r => r.json()).then(d => {
          const list = d.addresses || [];
          setAddresses(list);
          const def = list.find(a => a.isDefault) || list[0];
          if (def) setSelectedAddrId(def.id);
          else setShowNewAddr(true);
        });
      } else {
        setShowNewAddr(true);
      }
    });
  }, []);

  if (!authChecked) return null;
  if (items.length === 0) {
    return (
      <main className="pt-32 pb-20 min-h-screen">
        <div className="max-w-md mx-auto text-center px-6">
          <p className="font-serif text-2xl text-amber-100/60">Sepetiniz boş</p>
          <Link href="/urunler" className="inline-block mt-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-8 py-3 rounded font-serif tracking-widest">ALIŞVERİŞE BAŞLA</Link>
        </div>
      </main>
    );
  }

  const getCustomer = () => {
    if (user && selectedAddrId) {
      const a = addresses.find(x => x.id === selectedAddrId);
      return { name: a?.fullName || user.name || '', email: user.email, phone: a?.phone || user.phone || '' };
    }
    return { name: guest.fullName, email: guest.email, phone: guest.phone };
  };
  const getShippingAddress = () => {
    if (user && selectedAddrId) {
      const a = addresses.find(x => x.id === selectedAddrId);
      return a ? { fullName: a.fullName, phone: a.phone, city: a.city, district: a.district, zipCode: a.zipCode, addressLine: a.addressLine } : {};
    }
    return { fullName: guest.fullName, phone: guest.phone, city: guest.city, district: guest.district, zipCode: guest.zipCode, addressLine: guest.addressLine };
  };

  const canProceed = () => {
    if (step === 1) {
      if (user && selectedAddrId && !showNewAddr) return true;
      return guest.fullName && guest.email && guest.phone && guest.city && guest.district && guest.addressLine;
    }
    if (step === 2) return !!shippingMethod;
    if (step === 3) return !!paymentMethod;
    if (step === 4) return agreeContract && agreeKvkk;
    return true;
  };

  const next = async () => {
    if (!canProceed()) { toast.error('Lütfen gerekli alanları doldurun'); return; }
    if (step === 1 && user && showNewAddr && guest.addressLine) {
      // Save new address for logged user
      const res = await fetch('/api/me/addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...guest, title: 'Yeni Adres', isDefault: addresses.length === 0 }) });
      const d = await res.json();
      if (d.address) {
        setAddresses([...addresses, d.address]); setSelectedAddrId(d.address.id); setShowNewAddr(false);
      }
    }
    if (step < 4) setStep(step + 1);
    else placeOrder();
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const orderItems = items.map(i => ({
        id: i.id, name: i.name, slug: i.slug, image: i.image,
        price: i.price, personalizationPrice: i.personalizationPrice || 0,
        personalization: i.personalization, qty: i.qty,
      }));
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: getCustomer(),
          items: orderItems,
          subtotal,
          shipping: shippingCost,
          extraFee,
          total: grandTotal,
          shippingMethod,
          shippingAddress: getShippingAddress(),
          paymentMethod,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sipariş oluşturulamadı');
      // Payment routing
      if (paymentMethod === 'iyzico' || paymentMethod === 'paytr') {
        toast.success('Sipariş oluşturuldu! Ödeme sayfasına yönlendiriliyorsunuz... (test modu)');
      } else {
        toast.success('Siparişiniz alındı! Sipariş no: ' + data.order.orderNumber);
      }
      clear();
      setTimeout(() => router.push('/odeme/basarili?no=' + data.order.orderNumber), 800);
    } catch (e) { toast.error(e.message); setPlacing(false); }
  };

  return (
    <main className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Stepper */}
        <div className="mb-10">
          <div className="hidden md:flex items-center justify-between relative">
            <div className="absolute top-6 left-0 right-0 h-px bg-amber-500/20"/>
            <div className="absolute top-6 left-0 h-px bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500" style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}/>
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isDone = step > s.id;
              const isActive = step === s.id;
              return (
                <div key={s.id} className="relative z-10 flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isDone ? 'bg-amber-500 text-black' : isActive ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black ring-4 ring-amber-500/30' : 'bg-[#161616] border border-amber-500/30 text-amber-100/40'}`}>
                    {isDone ? <Check size={20}/> : <Icon size={18}/>}
                  </div>
                  <span className={`mt-3 text-xs font-serif tracking-widest ${isActive ? 'text-amber-400' : isDone ? 'text-amber-100/80' : 'text-amber-100/40'}`}>{s.id}. {s.label.toUpperCase()}</span>
                </div>
              );
            })}
          </div>
          {/* Mobile stepper */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-amber-100/60">Adım {step}/{STEPS.length}</span>
              <span className="text-amber-400 font-serif">{STEPS[step-1].label}</span>
            </div>
            <div className="h-1 bg-amber-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all" style={{ width: `${(step / STEPS.length) * 100}%` }}/>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Step content */}
          <div className="lg:col-span-2">
            <div className="bg-[#161616] border border-amber-500/20 rounded-lg p-6 md:p-8">
              {step === 1 && <AddressStep user={user} addresses={addresses} selectedAddrId={selectedAddrId} setSelectedAddrId={setSelectedAddrId} showNewAddr={showNewAddr} setShowNewAddr={setShowNewAddr} guest={guest} setGuest={setGuest}/>}
              {step === 2 && <ShippingStep value={shippingMethod} onChange={setShippingMethod} subtotal={subtotal}/>}
              {step === 3 && <PaymentStep value={paymentMethod} onChange={setPaymentMethod}/>}
              {step === 4 && <ReviewStep items={items} customer={getCustomer()} address={getShippingAddress()} shippingMethod={shippingObj} paymentMethod={paymentObj} agreeContract={agreeContract} setAgreeContract={setAgreeContract} agreeKvkk={agreeKvkk} setAgreeKvkk={setAgreeKvkk}/>}
            </div>
            <div className="mt-6 flex justify-between gap-3">
              <button onClick={() => step > 1 ? setStep(step - 1) : router.push('/sepet')} className="border border-amber-500/30 text-amber-100 px-5 py-3 rounded font-serif tracking-widest hover:bg-amber-500/5 transition flex items-center gap-2">
                <ChevronLeft size={18}/> {step > 1 ? 'GERİ' : 'SEPETE DÖN'}
              </button>
              <button onClick={next} disabled={!canProceed() || placing} className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded font-serif tracking-widest hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50 flex items-center gap-2">
                {placing ? 'İşLENİYOR...' : step < 4 ? (<>DEVAM ET <ChevronRight size={18}/></>) : (<>SİPARİŞİ TAMAMLA <Lock size={16}/></>)}
              </button>
            </div>
          </div>

          {/* Order summary */}
          <aside className="lg:col-span-1">
            <div className="bg-[#161616] border border-amber-500/20 rounded-lg p-6 sticky top-28">
              <h3 className="font-serif text-xl text-amber-50 mb-5">Sipariş Özeti</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {items.map((i) => (
                  <div key={i.key} className="flex gap-3">
                    <img src={i.image} className="w-14 h-14 rounded object-cover"/>
                    <div className="flex-1">
                      <p className="text-sm text-amber-100 line-clamp-2">{i.name}</p>
                      {i.personalization && <p className="text-xs text-amber-400">Lazer: "{i.personalization}"</p>}
                      <p className="text-xs text-amber-100/60">{i.qty} adet</p>
                    </div>
                    <span className="text-sm text-amber-400 font-medium whitespace-nowrap">{((i.price + i.personalizationPrice) * i.qty).toLocaleString('tr-TR')}₺</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-amber-500/10 space-y-2 text-sm">
                <div className="flex justify-between text-amber-100/80"><span>Ara Toplam</span><span>{subtotal.toLocaleString('tr-TR')}₺</span></div>
                <div className="flex justify-between text-amber-100/80"><span>Kargo</span><span>{shippingCost === 0 ? <span className="text-emerald-400">Bedava</span> : shippingCost.toLocaleString('tr-TR') + '₺'}</span></div>
                {extraFee > 0 && <div className="flex justify-between text-amber-100/80"><span>Kapıda Öd. Ücreti</span><span>{extraFee}₺</span></div>}
                <div className="flex justify-between font-serif text-xl pt-3 border-t border-amber-500/10">
                  <span className="text-amber-100">Toplam</span>
                  <span className="text-amber-400">{grandTotal.toLocaleString('tr-TR')}₺</span>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs text-amber-100/50">
                <Shield size={14} className="text-amber-500"/> 256-bit SSL ile güvenli ödeme
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

const inp = "w-full bg-black/40 border border-amber-500/30 rounded px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500 text-sm";
const label = "text-xs text-amber-400 font-serif tracking-widest block mb-1";

function AddressStep({ user, addresses, selectedAddrId, setSelectedAddrId, showNewAddr, setShowNewAddr, guest, setGuest }) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-amber-50 mb-2 flex items-center gap-2"><MapPin className="text-amber-500"/> Teslimat Adresi</h2>
      <p className="text-amber-100/50 text-sm mb-6">Siparisinizin gönderileceği adresi seçin.</p>
      {user && addresses.length > 0 && !showNewAddr && (
        <div className="space-y-3">
          {addresses.map((a) => (
            <label key={a.id} className={`block cursor-pointer border rounded-lg p-4 transition ${selectedAddrId === a.id ? 'border-amber-500 bg-amber-500/5' : 'border-amber-500/20 hover:border-amber-500/40'}`}>
              <div className="flex items-start gap-3">
                <input type="radio" name="addr" checked={selectedAddrId === a.id} onChange={() => setSelectedAddrId(a.id)} className="mt-1 accent-amber-500"/>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-amber-100">{a.title}</h3>
                    {a.isDefault && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">VARSAYILAN</span>}
                  </div>
                  <p className="text-sm text-amber-100/70 mt-1">{a.fullName} · {a.phone}</p>
                  <p className="text-xs text-amber-100/60 mt-1">{a.addressLine}, {a.district} / {a.city} {a.zipCode}</p>
                </div>
              </div>
            </label>
          ))}
          <button onClick={() => setShowNewAddr(true)} className="w-full border-2 border-dashed border-amber-500/30 rounded-lg py-4 text-amber-400 hover:bg-amber-500/5 flex items-center justify-center gap-2 font-serif"><Plus size={18}/> YENI ADRES EKLE</button>
        </div>
      )}
      {(showNewAddr || !user || addresses.length === 0) && (
        <div>
          {!user && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded p-4 mb-4 text-sm text-amber-100/80">
              👋 Misafir olarak devam ediyorsunuz. <Link href="/giris" className="text-amber-400 underline">Giriş yap</Link> veya satın alımdın sonra hesabınız otomatik oluşturulabilir.
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className={label}>AD SOYAD</label><input value={guest.fullName} onChange={(e) => setGuest({ ...guest, fullName: e.target.value })} className={inp}/></div>
            {!user && <div><label className={label}>E-POSTA</label><input type="email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} className={inp}/></div>}
            <div><label className={label}>TELEFON</label><input value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value.replace(/[^0-9]/g, '') })} className={inp} type="tel" inputMode="numeric"/></div>
            <div><label className={label}>İL</label><input value={guest.city} onChange={(e) => setGuest({ ...guest, city: e.target.value })} className={inp}/></div>
            <div><label className={label}>İLÇE</label><input value={guest.district} onChange={(e) => setGuest({ ...guest, district: e.target.value })} className={inp}/></div>
            <div><label className={label}>POSTA KODU</label><input value={guest.zipCode} onChange={(e) => setGuest({ ...guest, zipCode: e.target.value })} className={inp}/></div>
            <div className="col-span-2"><label className={label}>ADRES</label><textarea rows={3} value={guest.addressLine} onChange={(e) => setGuest({ ...guest, addressLine: e.target.value })} className={inp}/></div>
          </div>
          {user && addresses.length > 0 && (
            <button onClick={() => setShowNewAddr(false)} className="mt-4 text-sm text-amber-400 hover:underline">← Kayıtlı adreslere dön</button>
          )}
        </div>
      )}
    </div>
  );
}

function ShippingStep({ value, onChange, subtotal }) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-amber-50 mb-2 flex items-center gap-2"><Truck className="text-amber-500"/> Teslimat Yöntemi</h2>
      <p className="text-amber-100/50 text-sm mb-6">Kargo seçeneğini seçin.</p>
      <div className="space-y-3">
        {SHIPPING_METHODS.map((m) => {
          const isFree = m.freeOver && subtotal >= m.freeOver;
          return (
            <label key={m.id} className={`block cursor-pointer border rounded-lg p-4 transition ${value === m.id ? 'border-amber-500 bg-amber-500/5' : 'border-amber-500/20 hover:border-amber-500/40'}`}>
              <div className="flex items-start gap-3">
                <input type="radio" name="ship" checked={value === m.id} onChange={() => onChange(m.id)} className="mt-1 accent-amber-500"/>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-amber-100">{m.label}</h3>
                    <span className="font-serif text-amber-400">{isFree || m.price === 0 ? <span className="text-emerald-400 text-sm">{m.price === 0 ? 'Ücretsiz' : 'Bedava'}</span> : m.price.toLocaleString('tr-TR') + '₺'}</span>
                  </div>
                  <p className="text-sm text-amber-100/60 mt-1">{m.desc}</p>
                  {m.freeOver && !isFree && <p className="text-xs text-amber-400/70 mt-1">{m.freeOver.toLocaleString('tr-TR')}₺ ve üzeri alışverişlerde bedava!</p>}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function PaymentStep({ value, onChange }) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-amber-50 mb-2 flex items-center gap-2"><CreditCard className="text-amber-500"/> Ödeme Yöntemi</h2>
      <p className="text-amber-100/50 text-sm mb-6">Güvenli ödeme seçeneğinizi seçin.</p>
      <div className="space-y-3">
        {PAYMENT_METHODS.map((m) => {
          const Icon = m.icon;
          return (
            <label key={m.id} className={`block cursor-pointer border rounded-lg p-4 transition relative ${value === m.id ? 'border-amber-500 bg-amber-500/5' : 'border-amber-500/20 hover:border-amber-500/40'}`}>
              {m.recommended && <span className="absolute -top-2 right-3 bg-amber-500 text-black text-[10px] font-bold tracking-widest px-2 py-0.5 rounded">ONERİLEN</span>}
              <div className="flex items-start gap-3">
                <input type="radio" name="pay" checked={value === m.id} onChange={() => onChange(m.id)} className="mt-1 accent-amber-500"/>
                <Icon className="text-amber-500 mt-0.5" size={22}/>
                <div className="flex-1">
                  <h3 className="font-serif text-amber-100 flex items-center gap-2">
                    {m.label}
                    {m.mock && <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">TEST MODU</span>}
                  </h3>
                  <p className="text-sm text-amber-100/60 mt-1">{m.desc}</p>
                  {m.extraFee && <p className="text-xs text-amber-400 mt-1">+{m.extraFee}₺ ek hizmet bedeli</p>}
                </div>
              </div>
            </label>
          );
        })}
      </div>
      <div className="mt-5 flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded text-sm text-amber-100/80">
        <Shield className="text-emerald-400 shrink-0" size={20}/>
        Tüm ödemeleriniz 3D Secure ile korunur. Kart bilgileriniz sunucularımızda saklanmaz.
      </div>
    </div>
  );
}

function ReviewStep({ items, customer, address, shippingMethod, paymentMethod, agreeContract, setAgreeContract, agreeKvkk, setAgreeKvkk }) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-amber-50 mb-2 flex items-center gap-2"><ClipboardCheck className="text-amber-500"/> Onay</h2>
      <p className="text-amber-100/50 text-sm mb-6">Bilgilerinizi son kez kontrol edin.</p>

      <div className="space-y-4">
        <SummaryCard icon={MapPin} title="Teslimat Adresi">
          <p className="text-amber-100">{address.fullName} · {address.phone}</p>
          <p className="text-amber-100/70 text-sm mt-1">{address.addressLine}</p>
          <p className="text-amber-100/70 text-sm">{address.district} / {address.city} {address.zipCode}</p>
        </SummaryCard>
        <SummaryCard icon={Truck} title="Teslimat">
          <p className="text-amber-100">{shippingMethod?.label}</p>
          <p className="text-amber-100/60 text-sm">{shippingMethod?.desc}</p>
        </SummaryCard>
        <SummaryCard icon={CreditCard} title="Ödeme">
          <p className="text-amber-100">{paymentMethod?.label}</p>
          {paymentMethod?.mock && <p className="text-orange-300 text-xs mt-1">⚠️ Test modu - gerçek ödeme yapılmaz</p>}
        </SummaryCard>
      </div>

      <div className="mt-6 space-y-3 p-5 bg-black/30 border border-amber-500/10 rounded-lg">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={agreeContract} onChange={(e) => setAgreeContract(e.target.checked)} className="mt-1 w-4 h-4 accent-amber-500"/>
          <span className="text-sm text-amber-100/80"><Link href="/mesafeli-satis" className="text-amber-400 underline">Mesafeli Satış Sözleşmesi</Link>’ni okudum ve kabul ediyorum.</span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={agreeKvkk} onChange={(e) => setAgreeKvkk(e.target.checked)} className="mt-1 w-4 h-4 accent-amber-500"/>
          <span className="text-sm text-amber-100/80"><Link href="/kvkk" className="text-amber-400 underline">KVKK Aydınlatma Metni</Link>’ni okudum.</span>
        </label>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, title, children }) {
  return (
    <div className="border border-amber-500/20 rounded-lg p-4">
      <div className="flex items-center gap-2 text-amber-400 text-xs font-serif tracking-widest mb-2">
        <Icon size={14}/> {title.toUpperCase()}
      </div>
      {children}
    </div>
  );
}
