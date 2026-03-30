import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hermes",
  icons: "/hermes-icon.svg",
  description: "A transactional email microservice built with Node.js.",
};

// Suas variáveis e constantes globais
export const GitHub: string = 'https://github.com/RuanLopes1350';
export const Version: string = '1.0.0';
export const Documentacao: string = '#';
export const Status: string = '#';
export const Privacidade: string = '#';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* O fundo global escuro e as classes de altura são aplicadas diretamente no body */}
      <body className="min-h-full flex flex-col bg-[#0E0E10]">
        {/* Todo o conteúdo (auth, system, etc) será injetado aqui */}
        {children}
      </body>
    </html>
  );
}