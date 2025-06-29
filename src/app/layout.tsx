import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Just Planet Earth",
  description: "A simple Earth simulation using WebGPU and React Three Fiber",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen">{children}</body>
    </html>
  );
}
