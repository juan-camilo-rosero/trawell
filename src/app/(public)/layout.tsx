import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trawell | planea tu proximo viaje en segundos",
  description: "Generamos al instante un itinerario detallado con información en tiempo real para tu próximo viaje basado en tus preferencias y presupuesto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
