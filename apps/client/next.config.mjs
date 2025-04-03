import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));


const nextConfig = {
  output: 'standalone',
  server: {
    host: '0.0.0.0',
    port: 3001
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  transpilePackages: ["@repo/ui"],
  reactStrictMode: true,
  webpack: (config) => {
    // config.externals = [...config.externals, "canvas", "jsdom"];
    config.resolve.alias = {
      ...config.resolve.alias,
      'handlebars': path.resolve(__dirname, 'node_modules', 'handlebars', 'dist', 'handlebars.js'),
      // 'handlebars': 'handlebars/runtime.js',
      "@/": path.resolve(__dirname, "src/"), // Fix alias resolution
    };
    config.resolve.fallback = {

      // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped.
      ...config.resolve.fallback,

      fs: false, // the solution
    };
    return config;
  },
}

export default nextConfig
