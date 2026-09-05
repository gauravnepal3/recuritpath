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

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: process.env.S3_IMAGE_HOSTNAME ?? 'recruit-path.s3.ap-south-1.amazonaws.com',
                port: '',
                pathname: '/public-folder/**',
            },
        ],
    },

    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
        },
    },

    // See apps/main/next.config.mjs — same Turbopack migration.
    serverExternalPackages: [
        "canvas",
        "jsdom",
        "handlebars",
        "mailcomposer",
    ],

    turbopack: {},
};

export default nextConfig;
