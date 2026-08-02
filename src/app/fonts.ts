import { EB_Garamond, Courier_Prime, DM_Sans } from "next/font/google";

export const garamond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const courier = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-letter",
});

export const dmsans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
});
