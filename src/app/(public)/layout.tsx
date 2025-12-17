import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { UserProvider } from "@/contexts/UserContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ToastProvider } from "@/components/ui/toast-provider";

export const metadata: Metadata = {
  title: "Trawell | Plan your next trip in seconds",
  description: "Instantly generate a detailed itinerary with real-time information for your next trip based on your preferences and budget.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mapsApiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <UserProvider>
          <NotificationProvider>
            {children}
            <ToastProvider />
          </NotificationProvider>
        </UserProvider>
        {mapsApiKey && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places&language=en`}
            strategy="afterInteractive"
            async
            defer
          />
        )}
      </body>
    </html>
  );
}