import type { Metadata } from "next";
import "./globals.css";
import { Inria_Serif, Roboto } from "next/font/google";
import SessionProviderWrapper from "./SessionProviderWrapper";
import { EdgeStoreProvider } from "@/lib/edgestore";

const inriaSerif = Inria_Serif({
  weight: ["300", "400", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-inriaSerif",
});

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin", "latin-ext"],
});
export const metadata: Metadata = {
  title: "ManagINg",
  description: "Managing Inventory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.className} ${inriaSerif.variable} antialiased`}
      >
        <EdgeStoreProvider>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </EdgeStoreProvider>
      </body>
    </html>
  );
}
