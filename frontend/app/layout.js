import "./globals.css";

export const metadata = {
  title: "ImunoPet Brasil",
  description: "Sistema de gestão de vacinação animal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
