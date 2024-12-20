"use client"

import { metadata } from "./metadata"; // server-side only
import localFont from "next/font/local";
import "./styles/globals.css";
import {Providers} from "./providers";
import AuthLayout from "./auth-layout";
import WithoutAuthLayout from "./without-auth-layout";
import { usePathname } from "next/navigation";
import {Suspense} from "react";
import {getAuthUser} from "@/app/hooks/auth";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const withoutAuthPaths = ['/', '/auth/login']; // exclude path
  const isWithoutAuth = withoutAuthPaths.includes(pathname)
  const Layout = isWithoutAuth ? WithoutAuthLayout : AuthLayout;

  return (
    <html lang="en" className='dark'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}>
        <Providers>
          <Layout metadata={metadata}>
            <Suspense fallback={<div>Layout stack ...</div>}>{children}</Suspense>
          </Layout>
        </Providers>
      </body>
    </html>
  );
}
