import { Lexend, Zilla_Slab } from "next/font/google";

export const fontHeading = Lexend({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const fontBody = Zilla_Slab({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});
