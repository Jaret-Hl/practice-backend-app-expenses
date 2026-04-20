import { supabase } from "../db.js";
import { decode } from "jsonwebtoken";

/**
 * Token Blacklist using Supabase persistent storage
 * Tokens are stored with their expiration date to auto-cleanup
 */

export const revokeToken = async (token: string) => {
  try {
    // Decode token to get expiration
    const decoded = decode(token) as Record<string, unknown> | null;
    const expiresAt = decoded?.exp && typeof decoded.exp === 'number' 
      ? new Date(decoded.exp * 1000).toISOString() 
      : null;

    const { error } = await supabase.from("").insert({
      token: token,
      revoked_at: new Date().toISOString(),
      expires_at: expiresAt,
    });

    if (error) {
      console.error("Error revoking token:", error);
      // Fallback: still return success to not break logout flow
      return;
    }
  } catch (err) {
    console.error("Error revoking token:", err);
  }
};

export const isTokenRevoked = async (token: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("token_blacklist")
      .select("id")
      .eq("token", token)
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking token revocation:", error);
      // On error, allow token to be safe (will be validated again anyway)
      return false;
    }

    return !!data;
  } catch (err) {
    console.error("Error checking token revocation:", err);
    // On error, allow token to be safe
    return false;
  }
};

/**
 * Cleanup expired tokens from blacklist
 * Call this periodically (e.g., in a cron job)
 */
export const cleanupExpiredTokens = async () => {
  try {
    const { error } = await supabase
      .from("token_blacklist")
      .delete()
      .lt("expires_at", new Date().toISOString());

    if (error) {
      console.error("Error cleaning up expired tokens:", error);
    }
  } catch (err) {
    console.error("Error cleaning up expired tokens:", err);
  }
};
