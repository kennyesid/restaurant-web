import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ReduxProvider } from "@/lib/providers";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const caveatBrush = localFont({
  src: "./fonts/CaveatBrush-Regular.ttf",
  variable: "--font-caveat", // Nombre de la variable CSS
  display: "swap",
});

export const metadata: Metadata = {
  title: "p.dev - Restaurante",
  description: "Admin dashboard for restaurant management",
  generator: "v0.app",
  icons: {
    icon: [
      // {
      //   url: "/icon-light-32x32.png",
      //   media: "(prefers-color-scheme: light)",
      // },
      // {
      //   url: "/icon-dark-32x32.png",
      //   media: "(prefers-color-scheme: dark)",
      // },
      // {
      //   url: "/icon.svg",
      //   type: "image/svg+xml",
      // },
      {
        url: "/ico/icon_patasca.ico",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${caveatBrush.variable}`}
      suppressHydrationWarning
    >
      {/* <body className="font-sans antialiased"> */}
      <body className="font-caveat" suppressHydrationWarning>
        <ReduxProvider>
          <div>
            {children}
            {process.env.NODE_ENV === "production" && <Analytics />}
            <Toaster position="top-right" richColors />
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
