import { useState } from "react";
import { Layout } from "@/components/ui/Layout";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingCart,
  Clock,
  Gift,
  Info,
  Zap,
  Download,
} from "lucide-react";
import { useGetPaymentCatalog, useGetWalletSummary } from "@workspace/api-client-react";
import { PLAY_STORE_URL } from "@/lib/constants";

type WalletTab = "overview" | "buy" | "gifts" | "history";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<WalletTab>("overview");
  const { data: walletData, isLoading: walletLoading } = useGetWalletSummary({
    query: { retry: false },
  });
  const { data: catalogData } = useGetPaymentCatalog({ query: { retry: false } });

  const fenomenCoins = walletData?.wallet?.fenomenCoins ?? 0;
  const starCoins = walletData?.wallet?.starCoins ?? 0;
  const history = walletData?.history ?? [];
  const packages = catalogData?.packages ?? [];
  const gifts = catalogData?.gifts ?? [];
  const doping = catalogData?.doping ?? [];

  const tabs = [
    { id: "overview", label: "Genel Bakış", icon: Wallet },
    { id: "buy", label: "Paketler", icon: ShoppingCart },
    { id: "gifts", label: "Hediyeler", icon: Gift },
    { id: "history", label: "Geçmiş", icon: Clock },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-20">
        <div className="pt-8 pb-6">
          <h1 className="text-3xl font-display font-black flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </span>
            Cüzdanım
          </h1>
          <p className="text-muted-foreground mt-1">
            Mobil uygulamadaki cüzdan verilerini buradan görüntüle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div
            className="relative overflow-hidden rounded-3xl p-6 border border-primary/20"
            style={{ background: "linear-gradient(135deg, #1a0040 0%, #2d006a 100%)" }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-primary/80">
                  FenomenCoin
                </span>
              </div>
              <p className="text-5xl font-display font-black text-white mb-1">
                {fenomenCoins.toLocaleString("tr")}
              </p>
              <p className="text-sm text-primary/70">Mobil uygulama ile kullanılır</p>
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-3xl p-6 border border-yellow-500/20"
            style={{ background: "linear-gradient(135deg, #1a1000 0%, #2d2000 100%)" }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-yellow-400/80">
                  StarCoin
                </span>
              </div>
              <p className="text-5xl font-display font-black text-white mb-1">
                {starCoins.toLocaleString("tr")}
              </p>
              <p className="text-sm text-yellow-400/70">Mobil uygulama ile kullanılır</p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 border-b border-white/10 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as WalletTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all font-medium text-sm whitespace-nowrap shrink-0",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-white",
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-card border border-white/5 rounded-2xl divide-y divide-white/5">
                {walletLoading ? (
                  [1, 2, 3].map((item) => (
                    <div key={item} className="h-16 animate-pulse bg-white/5" />
                  ))
                ) : history.length === 0 ? (
                  <div className="px-4 py-10 text-center text-muted-foreground">
                    Henüz cüzdan geçmişi bulunmuyor.
                  </div>
                ) : (
                  history.slice(0, 6).map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center gap-3 px-4 py-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        {transaction.amount >= 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-green-400" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleString("tr-TR")}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "font-bold text-sm shrink-0",
                          transaction.amount >= 0 ? "text-green-400" : "text-red-400",
                        )}
                      >
                        {transaction.amount >= 0 ? "+" : ""}
                        {transaction.amount} {transaction.currency}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "buy" && (
            <motion.div
              key="buy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {packages.map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-card border border-white/5 rounded-2xl p-5 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 break-words">
                        {item.description || item.productId}
                      </p>
                    </div>
                    <a
                      href={PLAY_STORE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold inline-flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Uygulamayı İndir
                    </a>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-3 bg-white/3 border border-white/10 rounded-2xl p-4 text-sm text-muted-foreground">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  Satın alma işlemleri yalnızca mobil uygulama içinden yapılır. Web tarafında
                  paketleri ve mevcut cüzdan durumunu görüntüleyebilirsin.
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "gifts" && (
            <motion.div
              key="gifts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {gifts.map((gift: any) => (
                  <div
                    key={gift.id}
                    className="flex flex-col items-center gap-2 bg-card border border-white/5 rounded-2xl p-5"
                  >
                    <span className="text-4xl">{gift.icon || "🎁"}</span>
                    <p className="font-bold text-sm text-center">{gift.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {gift.cost || gift.price || 0} coin
                    </p>
                    <a
                      href={PLAY_STORE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-center hover:bg-white/10 transition-all"
                    >
                      Uygulamayı İndir
                    </a>
                  </div>
                ))}
              </div>

              {doping.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Doping Paketleri
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {doping.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-white/5 rounded-2xl p-4"
                      >
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">
                          ⚡
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground break-words">
                            {item.description}
                          </p>
                        </div>
                        <a
                          href={PLAY_STORE_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          İndir
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {history.length === 0 ? (
                <div className="bg-card border border-white/5 rounded-2xl px-4 py-10 text-center text-muted-foreground">
                  İşlemler burada görünecek.
                </div>
              ) : (
                history.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-3 bg-card border border-white/5 rounded-2xl px-4 py-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      {transaction.amount >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleString("tr-TR")}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "font-bold text-sm shrink-0",
                        transaction.amount >= 0 ? "text-green-400" : "text-red-400",
                      )}
                    >
                      {transaction.amount >= 0 ? "+" : ""}
                      {transaction.amount} {transaction.currency}
                    </span>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8">
          <Link
            href="/legal"
            className="text-xs text-muted-foreground hover:text-white transition-colors"
          >
            Cüzdan ve ödeme detayları için hukuki sayfayı gör
          </Link>
        </div>
      </div>
    </Layout>
  );
}
