"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthProvider";

export default function GoogleButton() {
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const router = useRouter();

  const handleSignInWithGoogle = async (response: any) => {
    const supabase = await createClient();
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      if (error) {
        throw error;
      }

      setUser(data.user);
      router.push("/");
    } catch (err: any) {
      // TODO: Show errors in ui
      setError("Authentication failed. Please try again.");
      console.error("Google Sign-In Error:", err.message);
    }
  };

  const initializeGoogleSignIn = () => {
    // Check if the Google API is loaded
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id:
          "562422830388-bbpn9vnn0acun0vjfdq6i6kbgmvau427.apps.googleusercontent.com",
        callback: handleSignInWithGoogle,
        ux_mode: "popup",
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv")!,
        {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          locale: "en-US"
        }
      );
    }
  };

  // Use effect to wait for window.google to be available
  useEffect(() => {
    // Ensure the Google API is available before attempting initialization
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client?hl=en";
      script.onload = () => {
        console.log("Google API script loaded successfully");
        initializeGoogleSignIn();
      };
      document.body.appendChild(script);

      // Clean up script when the component unmounts
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []); // Empty dependency array to ensure this runs only once

  return (
    <>
      <div id="googleSignInDiv" data-locale/>
      {error && <p className="text-red-500">{error}</p>}
    </>
  );
}
