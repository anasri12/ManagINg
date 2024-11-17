/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: "/", // Match the root path
                destination: "/home", // Redirect to /home
                permanent: true, // Set to `true` for a permanent redirect (301)
            },
        ];
    },
};

export default nextConfig;
