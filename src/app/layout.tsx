import type { Metadata, Viewport } from "next";
import { Caprasimo, Gochi_Hand, Schibsted_Grotesk } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const display = Caprasimo({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-caprasimo",
});
const hand = Gochi_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gochi",
});
const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
});

export const metadata: Metadata = {
  title: {
    default: "The family journals",
    template: "%s · The family journals",
  },
  description:
    "A baby journal for photos, videos, firsts, notes and the songs that went with them.",
};

export const viewport: Viewport = {
  themeColor: "#1d2145",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${hand.variable} ${sans.variable} antialiased`}
    >
      <body className="min-h-svh">
        <MotionProvider>{children}</MotionProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
