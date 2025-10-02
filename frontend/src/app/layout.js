import "./globals.css";
import { Header } from "./header/header"; //
import { Footer } from "./footer/footer";

export const metadata = {
  title: "Loja Leonete Modas",
  description: "Modas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" crxemulator="i">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
