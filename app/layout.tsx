import "./globals.css";
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { AvatarProvider } from "@/context/AvatarContext";

const figtree = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Talking Avatar",
  description: "A avatar which can mimic you",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={figtree.className}>
        <AvatarProvider>{children}</AvatarProvider>
      </body>
    </html>
  );
}
