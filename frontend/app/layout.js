import { Inter } from "next/font/google";
import "./globals.css";

// Autohospedada pelo Next (sem chamada externa ao Google Fonts); exposta como variável CSS
// porque boa parte das telas referencia "Inter" diretamente em `style={{ fontFamily }}`.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata = {
  title: "ImunoPet Brasil",
  description: "Sistema de gestão de vacinação animal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
