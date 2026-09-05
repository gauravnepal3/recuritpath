import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Prisma's engine loader does dynamic filesystem access, which makes Next
    // trace from an inferred root. Pin it to the monorepo root so the
    // standalone output stays bounded instead of pulling in the whole project.
    outputFileTracingRoot: path.join(__dirname, '../../'),

    transpilePackages: ["@repo/ui"],
    reactStrictMode: true,

    // Next 16 builds with Turbopack by default. These packages are CommonJS and
    // resolve native/Node-only code at require time, so they stay external and
    // are required at runtime on the server instead of being bundled. This
    // replaces the old `config.externals` / `resolve.fallback.fs = false`
    // webpack setup.
    serverExternalPackages: [
        "canvas",
        "jsdom",
        "handlebars",
        "mailparser",
        "mailcomposer",
        "@react-pdf/renderer",
    ],

    turbopack: {},
};

export default nextConfig;
