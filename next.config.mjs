/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... (otras configuraciones que puedas tener)

  async headers() {
    return [
      {
        // Aplicar estas cabeceras a todas tus rutas de API
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          
          // ¡IMPORTANTE! Cambia "*" por tu dominio de producción
          // y http://localhost:3000 para desarrollo.
          // Por ahora, "*" funcionará para desbloquearte.
          { key: "Access-Control-Allow-Origin", value: "*" }, 
          
          // Métodos permitidos
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          
          // Cabeceras permitidas (Content-Type es crucial)
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },

  // ... (otras configuraciones)
};

export default nextConfig;