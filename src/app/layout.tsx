import type { Metadata, Viewport } from "next";
import { Caprasimo, Gochi_Hand, Schibsted_Grotesk } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorker } from "@/components/service-worker";
import { SITE_NAME, SITE_SHORT_NAME } from "@/lib/site";
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
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "A baby journal for photos, videos, firsts, notes and the songs that went with them.",
  applicationName: SITE_NAME,
  appleWebApp: {
    capable: true,
    title: SITE_SHORT_NAME,
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  // Matches the shelf, the first page an installed app opens on.
  themeColor: "#f7d774",
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
        <ServiceWorker />
      </body>
    </html>
  );
}
