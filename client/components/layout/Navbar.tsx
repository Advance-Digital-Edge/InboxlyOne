import Link from "next/link"
import { Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import styles from "./navbar.module.css"
import MobileMenu from "./NavbarMobile"
import { JSX } from "react";

export default function Navbar(): JSX.Element {
  return (
    <header className={styles.header}>
        <div className={styles.logo}>
          <Inbox className={styles.logoIcon} />
          <span className={styles.logoText}>InBoxlyOne</span>
        </div>
        <nav className={styles.desktopNav}>
          <Link href="#features" className={styles.navLink}>
            Features
          </Link>
          <Link href="#how-it-works" className={styles.navLink}>
            How It Works
          </Link>
          <Link href="#pricing" className={styles.navLink}>
            Pricing
          </Link>
          <Link href="#faq" className={styles.navLink}>
            FAQ
          </Link>
        </nav>
        <div className={styles.headerButtons}>
          <Link href="/login" className={styles.loginLink}>
            Log in
          </Link>
          <Button className={styles.ctaButton}>Get Started</Button>
        </div>
        <MobileMenu />
      </header>
  );
}
