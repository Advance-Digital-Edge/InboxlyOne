"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import styles from "./auth-forms.module.css"
import Link from "next/link"


export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!name || !email || !password) {
      setError("Please fill in all fields")
      return
    }

    if (!acceptTerms) {
      setError("You must accept the terms and conditions")
      return
    }

    try {
      setIsLoading(true)
      // Here you would implement your registration logic
      // For demo purposes, we're just simulating a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to dashboard or handle registration
      console.log("Sign up with:", { name, email, password })

      // Simulate navigation
      window.location.href = "/dashboard"
    } catch (err) {
      setError("Failed to create account")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError("")
    try {
      setIsLoading(true)
      // Here you would implement Google authentication
      // For demo purposes, we're just simulating a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Sign up with Google")

      // Simulate navigation
      window.location.href = "/dashboard"
    } catch (err) {
      setError("Failed to sign up with Google")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.formWrapper}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <Label htmlFor="name" className={styles.label}>
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <Label htmlFor="email" className={styles.label}>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <Label htmlFor="password" className={styles.label}>
            Password
          </Label>
          <div className={styles.passwordWrapper}>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={styles.input}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.passwordToggle}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className={styles.passwordIcon} /> : <Eye className={styles.passwordIcon} />}
            </button>
          </div>
          <p className={styles.passwordHint}>Password must be at least 8 characters long</p>
        </div>

        <div className={styles.termsGroup}>
          <div className={styles.checkboxWrapper}>
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              disabled={isLoading}
            />
            <label htmlFor="terms" className={styles.termsLabel}>
              I agree to the{" "}
              <Link href="/terms" className={styles.termsLink}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className={styles.termsLink}>
                Privacy Policy
              </Link>
            </label>
          </div>
        </div>

        <Button type="submit" className={styles.submitButton} disabled={isLoading || !acceptTerms}>
          {isLoading ? (
            <>
              <Loader2 className={styles.spinnerIcon} />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className={styles.divider}>
        <Separator className={styles.separator} />
        <span className={styles.dividerText}>or</span>
        <Separator className={styles.separator} />
      </div>

      <Button
        type="button"
        variant="outline"
        className={styles.googleButton}
        onClick={handleGoogleSignUp}
        disabled={isLoading}
      >
        <svg
          className={styles.googleIcon}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path
            fill="currentColor"
            d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.086-9.8l4.046-3.455A5.936 5.936 0 0 0 12 6.8a6.2 6.2 0 1 0 0 12.4 6.073 6.073 0 0 0 4.242-1.571 6.871 6.871 0 0 0 1.962-4.446h-7.29v2.017z"
          />
        </svg>
        Sign up with Google
      </Button>
    </div>
  )
}

