import "./globals.css";
import { Header } from "./header/header"; //
import { Footer } from "./footer/footer";

export const metadata = {
  title: "Loja Leonete Modas",
  description: "Modas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
