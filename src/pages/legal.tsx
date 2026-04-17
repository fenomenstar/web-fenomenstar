import { useState } from "react";
import { Layout } from "@/components/ui/Layout";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Shield, Cookie, RefreshCw, Scale, ChevronDown, ChevronUp } from "lucide-react";
import { useSearch as useWouterSearch } from "wouter";

type LegalTab = "terms" | "privacy" | "cookies" | "refund" | "distance";

const TABS: { id: LegalTab; label: string; icon: any }[] = [
  { id: "terms",    label: "Kullanım Koşulları", icon: FileText },
  { id: "privacy",  label: "Gizlilik Politikası", icon: Shield   },
  { id: "cookies",  label: "Çerez Politikası",    icon: Cookie   },
  { id: "refund",   label: "İade Politikası",     icon: RefreshCw },
  { id: "distance", label: "Mesafeli Satış",      icon: Scale    },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden mb-3">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors">
        <h3 className="font-bold text-sm">{title}</h3>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden">
            <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed space-y-2 border-t border-white/5 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Legal() {
  const qs = useWouterSearch();
  const params = new URLSearchParams(qs || "");
  const defaultTab = (params.get("tab") || "terms") as LegalTab;
  const [tab, setTab] = useState<LegalTab>(defaultTab);
  const updatedAt = "30 Mart 2026";

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 md:px-8 pb-20">

        {/* Başlık */}
        <div className="pt-8 pb-6 text-center">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-black mb-2">Hukuki Belgeler</h1>
          <p className="text-muted-foreground text-sm">FenomenStar platformunu kullanmadan önce lütfen bu belgeleri okuyun.</p>
          <p className="text-xs text-muted-foreground mt-1">Son güncelleme: {updatedAt}</p>
        </div>

        {/* Sekmeler */}
        <div className="flex flex-wrap gap-1.5 mb-8 justify-center">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                tab === t.id ? "bg-primary text-white" : "bg-white/5 border border-white/10 text-muted-foreground hover:text-white")}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Kullanım Koşulları ── */}
          {tab === "terms" && (
            <motion.div key="terms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Section title="1. Kabul ve Kapsam">
                <p>FenomenStar platformunu ("Platform") kullanmaya başladığınızda, bu Kullanım Koşulları'nı ("Koşullar") kabul etmiş olursunuz. Bu Koşullar, FenomenStar A.Ş. ("Şirket") ile siz ("Kullanıcı") arasındaki hukuki ilişkiyi düzenler.</p>
                <p>Platform; video yükleme, yarışma, karaoke, cüzdan ve sosyal özellikler içeren bir yetenek keşif platformudur.</p>
              </Section>

              <Section title="2. Hesap Oluşturma">
                <p>Platform'a erişmek için bir hesap oluşturmanız gerekmektedir. Kayıt sırasında doğru ve güncel bilgiler sağlamakla yükümlüsünüz.</p>
                <p>Hesabınızı yalnızca siz kullanabilirsiniz. Hesap güvenliğinizden tamamen siz sorumlusunuz.</p>
                <p>18 yaşından küçükler Platform'u yalnızca ebeveyn/vasi izniyle kullanabilir.</p>
              </Section>

              <Section title="3. İçerik Kuralları">
                <p>Platformda paylaşılan içerik şu kriterleri karşılamalıdır:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Orijinal veya lisanslı içerik olmalıdır</li>
                  <li>Başkalarının telif haklarını ihlal etmemelidir</li>
                  <li>Nefret söylemi, şiddet içermemelidir</li>
                  <li>Yanıltıcı veya sahte bilgi içermemelidir</li>
                  <li>Türk mevzuatına uygun olmalıdır</li>
                </ul>
              </Section>

              <Section title="4. Coin ve Ödeme Sistemi">
                <p>Platform, FenomenCoin (FC) ve StarCoin (SC) adlı sanal para birimlerini kullanmaktadır.</p>
                <p>Sanal paralar gerçek paraya dönüştürülemez. Satın alınan coinler iade edilemez.</p>
                <p>Coin değerleri: FenomenCoin ≈ 0.75 TL, StarCoin ≈ 2.5 TL.</p>
              </Section>

              <Section title="5. Hesap Feshi">
                <p>Şirket, bu Koşulları ihlal eden hesapları uyarı yapmaksızın askıya alabilir veya feshedebilir.</p>
                <p>Hesabınızı istediğiniz zaman kapatabilirsiniz. Kapatma sırasındaki kalan coinler iade edilmez.</p>
              </Section>

              <Section title="6. Sorumluluk Sınırlaması">
                <p>Şirket, Platform'un kesintisiz çalışmasını garanti etmez. Teknik arızalar nedeniyle oluşabilecek veri kayıplarından sorumlu tutulamaz.</p>
                <p>Kullanıcılar arası anlaşmazlıklarda Şirket arabulucu değil, teknik platform sağlayıcısı konumundadır.</p>
              </Section>
            </motion.div>
          )}

          {/* ── Gizlilik Politikası ── */}
          {tab === "privacy" && (
            <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Section title="1. Toplanan Veriler">
                <p>Platform şu verileri toplamaktadır:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li><strong className="text-white">Kimlik verileri:</strong> Ad, soyad, kullanıcı adı, e-posta, telefon numarası</li>
                  <li><strong className="text-white">İçerik verileri:</strong> Yüklediğiniz videolar, karaoke kayıtları, yorumlar</li>
                  <li><strong className="text-white">İşlem verileri:</strong> Coin satın alma, doping ve hediye geçmişi</li>
                  <li><strong className="text-white">Kullanım verileri:</strong> IP adresi, cihaz bilgisi, oturum bilgileri</li>
                  <li><strong className="text-white">Ses/görüntü:</strong> Karaoke kaydı ve profil fotoğrafı (yalnızca paylaşımınızla)</li>
                </ul>
              </Section>

              <Section title="2. Verilerin Kullanımı">
                <p>Topladığımız veriler şu amaçlarla kullanılır:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Hesap doğrulama ve güvenlik</li>
                  <li>Platform özelliklerinin sunulması</li>
                  <li>AI tabanlı kişiselleştirilmiş içerik önerisi</li>
                  <li>Yarışma ve oy sisteminin yönetimi</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                </ul>
              </Section>

              <Section title="3. Veri Paylaşımı">
                <p>Verileriniz üçüncü taraflarla yalnızca şu durumlarda paylaşılır:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Yasal zorunluluk (mahkeme kararı, savcılık talebi)</li>
                  <li>Ödeme işlemi için Stripe altyapısı</li>
                  <li>Arama için Elasticsearch altyapısı</li>
                  <li>Açık rızanız ile marka sponsorlarına</li>
                </ul>
              </Section>

              <Section title="4. KVKK Haklarınız">
                <p>6698 sayılı KVKK kapsamında şu haklarınız mevcuttur:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>Verilerinize erişim ve düzeltme talep etme</li>
                  <li>Verilerinizin silinmesini isteme ("unutulma hakkı")</li>
                  <li>İşlemenin kısıtlanmasını talep etme</li>
                  <li>Veri taşınabilirliği</li>
                </ul>
                <p>Başvuru için: <strong className="text-primary">kvkk@fenomenstar.com</strong></p>
              </Section>

              <Section title="5. Veri Güvenliği">
                <p>Verileriniz AES-256 şifrelemesi, TLS 1.3 iletişim güvenliği ve ISO 27001 sertifikalı sunucularda korunmaktadır. Periyodik güvenlik denetimleri gerçekleştirilmektedir.</p>
              </Section>
            </motion.div>
          )}

          {/* ── Çerez Politikası ── */}
          {tab === "cookies" && (
            <motion.div key="cookies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Section title="Çerez Nedir?">
                <p>Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınıza kaydedilen küçük metin dosyalarıdır. Oturum yönetimi, tercih hatırlama ve kullanım analizi amacıyla kullanılır.</p>
              </Section>

              <Section title="Kullandığımız Çerez Türleri">
                {[
                  { type: "Zorunlu Çerezler", desc: "Oturum yönetimi ve güvenlik için gereklidir. Devre dışı bırakılamaz.", color: "text-red-400" },
                  { type: "İşlevsel Çerezler", desc: "Dil tercihi, tema seçimi gibi tercihlerinizi hatırlar.", color: "text-cyan-400" },
                  { type: "Analitik Çerezler", desc: "Platform kullanımını analiz ederek deneyimi iyileştirmemize yardımcı olur (Google Analytics).", color: "text-yellow-400" },
                  { type: "Pazarlama Çerezleri", desc: "Kişiselleştirilmiş içerik ve reklam gösterimi için kullanılır.", color: "text-primary" },
                ].map((c, i) => (
                  <div key={i} className="py-2 border-b border-white/5 last:border-0">
                    <p className={cn("font-semibold text-sm", c.color)}>{c.type}</p>
                    <p>{c.desc}</p>
                  </div>
                ))}
              </Section>

              <Section title="Çerezleri Yönetme">
                <p>Tarayıcı ayarlarınızdan çerezleri yönetebilir veya silebilirsiniz. Zorunlu çerezlerin devre dışı bırakılması Platform'un çalışmasını etkileyebilir.</p>
                <p>Tarayıcı bazlı ayarlar: Chrome → Ayarlar → Gizlilik → Çerezler ve diğer site verileri</p>
              </Section>
            </motion.div>
          )}

          {/* ── İade Politikası ── */}
          {tab === "refund" && (
            <motion.div key="refund" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Section title="Genel İade Koşulları">
                <p>FenomenStar'da satın alınan sanal paralar (FenomenCoin ve StarCoin) dijital içerik niteliğinde olduğundan, Mesafeli Sözleşmeler Yönetmeliği'nin 15/ğ maddesi uyarınca cayma hakkı kapsamı dışındadır.</p>
              </Section>

              <Section title="İade Yapılmayan Durumlar">
                <ul className="list-disc ml-4 space-y-1">
                  <li>Kullanılmış doping paketleri</li>
                  <li>Gönderilen hediyeler</li>
                  <li>Tamamlanan yarışmaya katılım ücretleri</li>
                  <li>Kısmi olarak kullanılmış coin paketleri</li>
                  <li>Hesap ihlali nedeniyle feshedilen hesaplardaki coinler</li>
                </ul>
              </Section>

              <Section title="İstisna Durumlar">
                <p>Aşağıdaki durumlarda 7 iş günü içinde iade talebinde bulunulabilir:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Teknik hata nedeniyle coin teslim edilmemesi</li>
                  <li>Mükerrer (çift) ödeme yapılması</li>
                  <li>Ödeme sırasında sistem arızası</li>
                </ul>
                <p>İade başvurusu: <strong className="text-primary">iade@fenomenstar.com</strong></p>
              </Section>

              <Section title="İade Süreci">
                <p>Onaylanan iadeler, ödeme yönteminize (kredi/banka kartı) 3–10 iş günü içinde yansıtılır. Stripe üzerinden yapılan ödemelerde süre bankaya göre değişebilir.</p>
              </Section>
            </motion.div>
          )}

          {/* ── Mesafeli Satış ── */}
          {tab === "distance" && (
            <motion.div key="distance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Section title="Taraflar">
                <p><strong className="text-white">Satıcı:</strong> FenomenStar A.Ş. — Levent, İstanbul, Türkiye<br />Vergi No: 1234567890 | Mersis: 0123456789000001</p>
                <p><strong className="text-white">Alıcı:</strong> Platform'da hesap oluşturan gerçek veya tüzel kişi</p>
              </Section>

              <Section title="Sözleşme Konusu">
                <p>Bu sözleşme, FenomenStar uygulaması üzerinden yapılan dijital içerik (FenomenCoin, StarCoin, doping paketi) satışlarını kapsar.</p>
              </Section>

              <Section title="Sipariş ve Ödeme">
                <p>Siparişler uygulama içi satın alma ekranı üzerinden gerçekleştirilir. Ödeme Stripe altyapısıyla 3D Secure güvenliği ile işlenir.</p>
                <p>Toplam tutar sipariş özetinde açıkça gösterilir; ek vergi veya masraf uygulanmaz.</p>
              </Section>

              <Section title="Teslimat">
                <p>Dijital içerik satın alımı onaylandıktan sonra FenomenCoin/StarCoin hesabınıza anında aktarılır. Teslimat gecikmeleri için destek hattımıza başvurabilirsiniz.</p>
              </Section>

              <Section title="Uygulanacak Hukuk">
                <p>Bu sözleşme Türk Hukuku'na tabidir. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir. Ayrıca Tüketici Hakem Heyeti'ne başvurabilirsiniz.</p>
              </Section>
            </motion.div>
          )}

        </AnimatePresence>

        {/* İletişim */}
        <div className="mt-8 bg-white/3 border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-sm text-muted-foreground">Hukuki konularda sorularınız için</p>
          <a href="mailto:hukuk@fenomenstar.com" className="text-primary font-semibold hover:text-primary/80 transition-colors">hukuk@fenomenstar.com</a>
        </div>
      </div>
    </Layout>
  );
}
