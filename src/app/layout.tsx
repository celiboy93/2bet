import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "2D နေ့တိုင်း ပေါက်ချင်ပါသလား?",
  description: "2D Daily Prediction",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="my">
      <body className="antialiased">{children}</body>
    </html>
  );
}
