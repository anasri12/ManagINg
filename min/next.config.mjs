/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "files.edgestore.dev", // Add the domain for external images
            },
        ],
    },
    redirects: async () => [
        {
            source: "/", // Match the root path
            destination: "/home", // Redirect to /home
            permanent: true, // Indicates a permanent redirect (status code 301)
        },
    ],
};

export default nextConfig;