/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // Disable React strict mode
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "files.edgestore.dev", // Domain for external images
                port: "", // Optional: specify a port if needed
                pathname: "**", // Matches any image path under this hostname
            },
        ],
    },
    async redirects() {
        return [
            {
                source: "/", // Match the root path
                destination: "/home", // Redirect to /home
                permanent: true, // Indicates a permanent redirect (status code 301)
            },
        ];
    },
};

export default nextConfig;