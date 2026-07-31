import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Achados da Shopee — Produtos selecionados",
  description:
    "Os melhores achados da Shopee, selecionados a dedo. Preços justos, qualidade comprovada e link direto para comprar.",
  openGraph: {
    title: "Achados da Shopee",
    description: "Os melhores achados da Shopee, selecionados a dedo.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#F5341A" />
      </head>
      <body className="bg-stone-50 text-stone-950 antialiased selection:bg-[#ffe3dc] selection:text-[#8f1c08] font-[Inter,sans-serif]">
        {children}
      </body>
    </html>
  );
}
