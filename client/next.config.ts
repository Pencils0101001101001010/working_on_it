import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "localhost:5050",
    "192.168.110.134:3000", // Add your local network host here
  ],
};

export default nextConfig;
