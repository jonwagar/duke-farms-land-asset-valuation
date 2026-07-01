import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://land-assets.dukefarms.org"),
  title: "Land Asset Valuation Framework | Duke Farms",
  description:
    "Mission-first internal web tool for evaluating Duke Farms land-asset monetization opportunities.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
