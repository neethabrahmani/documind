/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "pdfjs-dist", "tesseract.js"],
  },
};

export default nextConfig;
