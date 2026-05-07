import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Redirige sauvcoeur.re → www.sauvcoeur.re (permanent)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'sauvcoeur.re' }],
        destination: 'https://www.sauvcoeur.re/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig;
