import "./globals.css";
import { Header } from "./header/header"; //
import { Footer } from "./footer/footer";
import { AuthProvider } from "./providers/auth-context";

export const metadata = {
  title: "Loja Leonete Modas",
  description: "Modas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" crxemulator="i">
      <body>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
