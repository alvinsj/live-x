/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['pages','entities', 'utils', 'hooks',  'services'],
  },
}

module.exports = nextConfig
