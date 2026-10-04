/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip type checking during dev/build for speed (use tsc separately)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // On Vercel serverless, all dependencies are bundled automatically.
  // Do NOT use serverExternalPackages on Vercel — it removes packages
  // from the serverless function bundle, causing runtime errors.
  // (This was needed for self-hosted Docker deployments only.)
}

export default nextConfig
