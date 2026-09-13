export type TikTokConnection = {
  id: string;
  restaurant_id: string;
  tiktok_username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  follower_count: number | null;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  created_at: string;
  updated_at: string;
};
