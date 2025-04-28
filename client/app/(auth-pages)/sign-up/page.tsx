import Link from "next/link"
import { Inbox, MessageSquare } from "lucide-react"
import SignUpForm from "@/components/ui/Forms/Auth/sign-up-form"
import styles from "./sign-up.module.css"
import GoogleButton from "@/components/ui/Button/GoogleButton"

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>

        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Create your account</h2>
          <p className={styles.formSubtitle}>
            Join thousands of professionals who have streamlined their messaging workflow.
          </p>
        </div>

        <SignUpForm />
        <div className={styles.orSeparator}>
            <span className={styles.orText}>OR</span>
          </div>
        <GoogleButton />

        <div className={styles.formFooter}>
          <p className={styles.formFooterText}>
            Already have an account?{" "}
            <Link href="/sign-in" className={styles.formFooterLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className={styles.imageContainer}>
        <div className={styles.imageContent}>
          <MessageSquare className={styles.imageIcon} />
          <h2 className={styles.imageTitle}>Simplify your communication</h2>
          <p className={styles.imageText}>
            Create an account to connect all your messaging platforms in one unified inbox.
          </p>
        </div>
      </div>
    </div>
  )
}
