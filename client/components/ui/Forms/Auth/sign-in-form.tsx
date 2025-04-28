"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../../Button/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { signInAction } from "@/app/actions";
import { Login } from "@/types/auth";
import { useAuth } from "@/app/context/AuthProvider";
import { useRouter } from "next/navigation";

// 1. Validation Schema
const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type SignInSchema = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();
  const { user, setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: signInAction,
    onSuccess: (data) => {
      // console.log("Login success", data);
      setUser(data.user);
      router.push("/protected")
    },
    onError: (error) => {
      console.error("Login error", error);
    },
  });

  const onSubmit = (data: SignInSchema) => {
    const loginData: Login = {
      email: data.email,
      password: data.password,
    };
    mutate(loginData);
  };
  

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Global Error */}
      {error && <p className="text-red-500 text-sm">{error.message}</p>}

      {/* EMAIL */}
      <div>
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* PASSWORD */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Password</label>
          <Link
            href="/forgot"
            className="text-xs text-blue-600 hover:underline"
          >
            Forgot?
          </Link>
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("password")}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm pr-10"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2.5"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>

        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* SUBMIT */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
