"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Login, Register } from "@/types/auth";

const baseUrl = process.env.NEXT_SERVER_URL || "http://localhost:3000";

export const signUpAction = async (formData: Register) => {
  const { email, password, repeatPassword } = formData;
  const supabase = await createClient();
  // const origin = (await headers()).get("origin");

  if (!email || !password || !repeatPassword) {
    throw new Error("All fields are required");
  }

  if (password !== repeatPassword) {
    throw new Error("Passwords do not match");
  }

  const { error, data: user } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.code === "auth_user_already_exists") {
      throw new Error(
        "This email is already registered. Try logging in instead."
      );
    }
    console.log(error);
    throw new Error(error.message);
  }

  return user;
};

export const signInAction = async (formData: Login) => {
  const { email, password } = formData;
  const supabase = await createClient();

  const { error, data: user } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  return user;
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const getUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return user;
};

export const getUserIntegrations = async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    // Gmail integrations
    const { data: gmailAccounts, error: gmailError } = await supabase
      .from("user_integrations")
      .select("id,metadata")
      .eq("user_id", user.id)
      .eq("provider", "gmail");

    if (gmailError) throw new Error("Failed to fetch Gmail accounts");

    // Facebook Page
    const { data: fbPage, error: fbError } = await supabase
      .from("facebook_pages")
      .select("id,page_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fbError) throw new Error("Failed to fetch Facebook Pages");

    // Facebook User Integration
    const { data: fbUser, error: fbUserError } = await supabase
      .from("user_integrations")
      .select("id,metadata,access_token")
      .eq("user_id", user.id)
      .eq("provider", "facebook")
      .maybeSingle();

    if (fbUserError) throw new Error("Failed to fetch Facebook User");

    // If either fbUser or fbPage is missing → no Facebook + no Instagram
    if (!fbUser || !fbPage) {
      return {
        facebook: [],
        instagram: [],
        gmail: gmailAccounts || [],
      };
    }

    // Construct FB data
    const fullFbData = [
      {
        id: fbUser.id,
        user: {
          name: fbUser.metadata?.name,
          picture: fbUser.metadata?.picture,
          accessToken: fbUser.access_token,
        },
        page: {
          id: fbPage.id,
          name: fbPage.page_name,
        },
      },
    ];

    // Instagram (linked to FB page)
    const { data: igAccount, error: igError } = await supabase
      .from("instagram_accounts")
      .select("id, username, fb_page_id, profile_picture")
      .eq("fb_page_id", fbPage.id)
      .maybeSingle();

    if (igError) throw new Error("Failed to fetch Instagram Accounts");

    return {
      facebook: fullFbData,
      instagram: igAccount ? [igAccount] : [],
      gmail: gmailAccounts || [],
    };
  } catch (error) {
    console.error("Error in getUserIntegrations:", error);
    throw error;
  }
};

export const removeIntegration = async (
  integrationId: string,
  provider: string
) => {
  const headersList = await headers();
  const cookie = headersList.get("cookie") || "";

  const res = await fetch(`${baseUrl}/api/integrations/${integrationId}`, {
    method: "DELETE",
    headers: {
      cookie, // manually forward cookie header
    },
    body: JSON.stringify({ provider }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return true;
};

export const incrementFacebookUnread = async (senderId: string) => {
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_facebook_unread", {
    p_sender_id: senderId,
  });

  if (error) {
    console.error("Failed to increment unread count:", error);
  }
};

export const resetFacebookUnread = async (senderId: string) => {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reset_facebook_unread", {
    p_sender_id: senderId,
  });

  if (error) {
    console.error("Failed to reset unread count:", error);
  }
};
