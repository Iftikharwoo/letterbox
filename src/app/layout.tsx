import type { Metadata } from "next";
import { garamond, courier, dmsans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Letterbox",
  description: "Secure transmission system. Messages across time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${garamond.variable} ${courier.variable} ${dmsans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        {/* Space grid */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Nebula glows */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 15% 15%, rgba(0,212,255,0.06) 0%, transparent 55%)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 85% 85%, rgba(0,255,159,0.04) 0%, transparent 55%)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 70% 20%, rgba(168,85,247,0.03) 0%, transparent 40%)" }}
          />
        </div>
        {/* Scanlines */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 4px)",
          }}
        />
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
