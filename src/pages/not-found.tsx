import { Layout } from "@/components/ui/Layout";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-primary to-accent mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-6">Sayfa Bulunamadı</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Aradığınız sayfa yayından kaldırılmış, ismi değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
        </p>
        <Link href="/" className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/30">
          Ana Sayfaya Dön
        </Link>
      </div>
    </Layout>
  );
}
