/** @type {import('next').NextConfig} */
console.log('>>> process.env', process.env.REACT_APP_DEV_DOMAIN)
const nextConfig = {
  distDir: 'build',
  basePath: '/_MYAPP',
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  publicRuntimeConfig: {
    DEV_DOMAIN: process.env.REACT_APP_DEV_DOMAIN,
    IS_PROD: process.env.REACT_APP_IS_PROD,
  }
}

module.exports = nextConfig
