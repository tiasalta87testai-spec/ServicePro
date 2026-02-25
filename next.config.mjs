import withPWAInit from "@ducanh2912/next-pwa"

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    async redirects() {
        return [
            {
                source: '/dashboard',
                destination: '/',
                permanent: true,
            },
        ]
    },
}

export default withPWA(nextConfig)
