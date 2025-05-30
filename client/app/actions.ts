"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Login, Register } from "@/types/auth";

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

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("user_integrations")
      .select("id,provider,metadata")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching integrations:", error);
      throw new Error("Failed to fetch user integrations");
    }

    console.log("Integration status:", data);
    return data;
  } catch (error) {
    console.error("An error occurred in getUserIntegrations:", error);
    throw error; // Re-throw the error to propagate it if needed
  }
};

export const removeIntegration = async (integrationId: string) => {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_integrations")
    .delete()
    .eq("id", integrationId);

  if (error) {
    console.error("Error removing integration:", error);
    throw new Error("Failed to remove integration");
  }

  return true;
};
