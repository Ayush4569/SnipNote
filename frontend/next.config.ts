import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
   remotePatterns: [
     {
       protocol: 'https',
       hostname: 'lh3.googleusercontent.com',
       port: '',
       pathname: '/**',
     }
   ],
  },
 compiler:{
   removeConsole: process.env.NODE_ENV === "production",
 }
};

export default nextConfig;