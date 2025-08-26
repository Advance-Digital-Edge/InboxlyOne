"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type WaitlistFormProps = {
  source: string;
  variant?: "inline" | "stacked";
  className?: string;
  buttonLabel?: string;
  inputClassName?: string;
  buttonClassName?: string;
  helperText?: string;
  onSuccess?: () => void; // 👈 нов проп
};

export default function WaitlistForm({
  source,
  variant = "inline",
  className = "mx-auto",
  buttonLabel = "Get Early Access",
  inputClassName,
  buttonClassName,
  helperText = "Don’t miss out — secure your spot on the waitlist",
  onSuccess,
}: WaitlistFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle"
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMsg(null);

    // Чети имейла първо
    const formEl = e.currentTarget as HTMLFormElement;
    const formData = new FormData(formEl);
    const emailValue =
      variant === "stacked"
        ? email.trim()
        : String(formData.get("email") || "").trim();

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, source }),
      });
      const data = await res.json();

      if (res.ok && data?.ok) {
        setStatus("ok");
        setMsg("You’re officially in 🚀");

        if (variant === "stacked") {
          setEmail(""); // чисти state за stacked
        } else {
          formEl.reset(); // чисти form за inline
        }

        localStorage.setItem("inboxlyone_joined", "1");
        onSuccess?.();
        return;
      }

      setStatus("err");
      setMsg(data?.error || `HTTP ${res.status}`);
    } catch (err) {
      console.error("Waitlist submit error:", err);
      setStatus("err");
      setMsg("Network error. Please try again.");
    }
  }

  const defaultInlineInput =
    "flex-1 h-12 px-4 shadow-purple-900 shadow-md rounded-2xl border-0 bg-white/80 backdrop-blur-sm focus:shadow-lg transition-all duration-300 text-gray-900 placeholder:text-gray-500";
  const defaultInlineButton =
    "rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-base font-medium text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl";
  const defaultStackedInput =
    "h-10 bg-white text-gray-900 border border-gray-300 focus-visible:ring-2 focus-visible:ring-purple-500";
  const defaultStackedButton =
    "h-10 font-semibold text-white bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600";

  const inputCls =
    inputClassName ??
    (variant === "inline" ? defaultInlineInput : defaultStackedInput);
  const buttonCls =
    buttonClassName ??
    (variant === "inline" ? defaultInlineButton : defaultStackedButton);

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {variant === "inline" ? (
        <>
          <div className="flex justify-between items-center flex-col gap-3 sm:flex-row sm:gap-2 max-w-md lg:mx-0">
            <Input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className={inputCls}
            />
            <Button
              type="submit"
              className={buttonCls}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Submitting…" : buttonLabel}
            </Button>
          </div>
          {msg && (
            <p
              className={`text-sm font-extrabold ${status === "ok" ? "text-green-600" : "text-red-600"}`}
            >
              {msg}
            </p>
          )}
          {helperText && <p className="text-sm text-gray-500">{helperText}</p>}
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              aria-label="Email address"
            />
            <Button
              type="submit"
              className={buttonCls}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Submitting…" : "Join Early Access"}
            </Button>
          </div>
          {msg && (
            <p
              className={`text-sm ${status === "ok" ? "text-green-600" : "text-red-600"}`}
            >
              {msg}
            </p>
          )}
        </>
      )}
    </form>
  );
}
