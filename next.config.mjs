/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Keep large server-only packages out of the Turbopack bundle so compilation
  // is faster and native deps aren't re-transpiled. They're required at runtime.
  serverExternalPackages: [
    'better-auth',
    '@ai-sdk/google',
    'ai',
    'pg',
    'drizzle-orm',
    'drizzle-orm/node-postgres',
    'jspdf',
  ],
}

export default nextConfig
