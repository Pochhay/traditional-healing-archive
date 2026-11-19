import "./globals.css";
import collection from "../collection.config.js";
import { LanguageProvider } from "../components/LanguageProvider.js";
import SiteHeader from "../components/SiteHeader.js";

export const metadata = {
  title: collection.name,
  description: collection.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          backgroundColor: "#0C1511",
          color: "#DBE5DE",
          fontFamily: "'Kantumruy Pro', sans-serif",
          minHeight: "100vh",
        }}
      >
        <LanguageProvider>
          <SiteHeader />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
