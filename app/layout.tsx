import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Forex Risk Manager", description: "Smart forex risk management" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="ar" dir="rtl"><body>{children}</body></html>; }
