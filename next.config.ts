const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_HOST = SUPABASE_URL ? new URL(SUPABASE_URL).host : undefined;

const nextConfig = {
  images: {
    remotePatterns: SUPABASE_HOST
      ? [
          {
            protocol: "https",
            hostname: SUPABASE_HOST,
          },
        ]
      : [],
  },
};

export default nextConfig;
