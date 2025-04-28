"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./auth-forms.module.css"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { signUpAction } from "@/app/actions"
import { useMutation } from "@tanstack/react-query"
import { Register } from "@/types/auth"

const signUpSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
    repeatPassword: z
  .string()
  .min(6, { message: "Please confirm your password" }),
});


type SignUpSchema = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const [showPasswords, setShowPasswords] = useState(false)

   const {
     register,
     handleSubmit,
     formState: { errors },
   } = useForm<SignUpSchema>({
     resolver: zodResolver(signUpSchema),
   });
   
const { mutate, isPending, error } = useMutation({
  mutationFn: signUpAction,
  onSuccess: (data) => {
    console.log("Register success", data);
  },
  onError: (error) => {
    console.error("Register error", error.message);
    if (error.message === "User already registered") {
      error.message = "Email is already taken"
    }
  },
});

const onSubmit = (data: SignUpSchema) => {
    const registerData: Register = {
      email: data.email,
      password: data.password,
      repeatPassword: data.repeatPassword,
    };
    mutate(registerData);
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
        </div>

        <div className="relative">
          <input
            type={showPasswords ? "text" : "password"}
            placeholder="••••••••"
            {...register("password")}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm pr-10"
          />

          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="absolute right-2 top-2.5"
            tabIndex={-1}
          >
           {showPasswords ? (
              <Eye className="h-4 w-4 text-gray-500" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>

        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/*REPEAT PASSWORD */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Repeat Password</label>
        </div>

        <div className="relative">
          <input
            type={showPasswords ? "text" : "password"}
            placeholder="••••••••"
            {...register("repeatPassword")}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm pr-10"
          />

          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="absolute right-2 top-2.5"
            tabIndex={-1}
          >
            {showPasswords ? (
              <Eye className="h-4 w-4 text-gray-500" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>

        {errors.repeatPassword && (
          <p className="text-xs text-red-500 mt-1">{errors.repeatPassword.message}</p>
        )}
      </div>

      {/* SUBMIT */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing up...
          </>
        ) : (
          "Sign Up"
        )}
      </Button>
    </form>
  )
}

