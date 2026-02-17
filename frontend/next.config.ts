import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    console.log('--------------------------------------------------');
    console.log('CONFIGURING REWRITES');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
    console.log(`> NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
    console.log(`> Resolved Backend URL: ${apiUrl}`);

    if (process.env.NODE_ENV === 'production' && apiUrl.includes('localhost')) {
      console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      console.error('WARNING: Using localhost API URL in production!');
      console.error('This means NEXT_PUBLIC_API_URL is missing/wrong.');
      console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    }
    console.log('--------------------------------------------------');

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`, // Proxy image uploads too
      },
    ];
  },
};

export default nextConfig;
