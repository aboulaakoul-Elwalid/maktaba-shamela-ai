import type React from "react";
import "./globals.css";

export const metadata = {
  title: "Ziryab Guide - Islamic Studies & Arabic Science",
  description:
    "Your AI companion for exploring Islamic literature and Arabic scientific heritage",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 overflow-hidden">{children}</body>
      <footer className="bg-gray-800 text-white py-4 text-center">
        &copy; {new Date().getFullYear()} Ziryab. All rights reserved.
      </footer>
    </html>
  );
}
