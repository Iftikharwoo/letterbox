import type { Metadata } from "next";
import { garamond, courier, dmsans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Letterbox",
  description: "Write a letter. Seal it. Let time deliver it.",
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
        {/* Panda fur grain texture */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundSize: "256px",
          }}
        />
        {/* Subtle panda patch shapes */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute -top-32 -right-32 w-80 h-80 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(240,240,236,0.02) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(240,240,236,0.015) 0%, transparent 70%)" }}
          />
        </div>
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
