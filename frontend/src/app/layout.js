import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./header/header"; // 
import { Footer } from "./footer/footer";
import Banners from "./banners/Banners";





const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

