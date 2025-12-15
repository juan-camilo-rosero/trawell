import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trawell | Plan your next trip in seconds",
  description: "Instantly generate a detailed itinerary with real-time information for your next trip based on your preferences and budget.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
