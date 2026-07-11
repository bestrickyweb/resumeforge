/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Keep large native/CJS server packages external so they aren't re-bundled.
  // (ESM-only packages like ai/@ai-sdk/google are left bundled on purpose.)
  serverExternalPackages: ['better-auth', 'pg', 'drizzle-orm', 'drizzle-orm/node-postgres'],
}

export default nextConfig
