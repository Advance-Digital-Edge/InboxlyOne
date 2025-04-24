import Link from "next/link"
import { Inbox, Mail } from "lucide-react"
import SignInForm from "@/components/ui/Forms/Auth/sign-in-form"
import styles from "./sign-in.module.css"

export default function SignInPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>

        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Sign in to your account</h2>
          <p className={styles.formSubtitle}>Welcome back! Please enter your details.</p>
        </div>

        <SignInForm />

        <div className={styles.formFooter}>
          <p className={styles.formFooterText}>
            Don't have an account?{" "}
            <Link href="/sign-up" className={styles.formFooterLink}>
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className={styles.imageContainer}>
        <div className={styles.imageContent}>
          <Mail className={styles.imageIcon} />
          <h2 className={styles.imageTitle}>All your messages in one place</h2>
          <p className={styles.imageText}>
            Sign in to access your unified inbox and never miss an important message again.
          </p>
        </div>
      </div>
    </div>
  )
}
