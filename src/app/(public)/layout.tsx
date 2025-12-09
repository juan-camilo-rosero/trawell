import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { UserProvider } from "@/contexts/UserContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ToastProvider } from "@/components/ui/toast-provider";

export const metadata: Metadata = {
  title: "Trawell | planea tu proximo viaje en segundos",
  description: "Generamos al instante un itinerario detallado con información en tiempo real para tu próximo viaje basado en tus preferencias y presupuesto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mapsApiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;

  return (
    <html lang="es">
      <body className={`antialiased`}>
        <UserProvider>
          <NotificationProvider>
            {children}
            <ToastProvider />
          </NotificationProvider>
        </UserProvider>
        {mapsApiKey && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`}
            strategy="afterInteractive"
            async
            defer
          />
        )}
      </body>
    </html>
  );
}
