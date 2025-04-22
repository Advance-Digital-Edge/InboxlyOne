"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/Button/button"
import styles from "./navbarMobile.module.css"

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={styles.mobileMenuContainer}>
      <button className={styles.menuToggle} onClick={toggleMenu} aria-label={isOpen ? "Close menu" : "Open menu"}>
        {isOpen ? <X className={styles.menuIcon} /> : <Menu className={styles.menuIcon} />}
      </button>

      {isOpen && (
        <div className={styles.mobileMenuOverlay}>
          <nav className={styles.mobileNav}>
            <Link href="#features" className={styles.mobileNavLink} onClick={toggleMenu}>
              Features
            </Link>
            <Link href="#how-it-works" className={styles.mobileNavLink} onClick={toggleMenu}>
              How It Works
            </Link>
            <Link href="#pricing" className={styles.mobileNavLink} onClick={toggleMenu}>
              Pricing
            </Link>
            <Link href="#faq" className={styles.mobileNavLink} onClick={toggleMenu}>
              FAQ
            </Link>
            <div className={styles.mobileNavButtons}>
              <Link href="/login" className={styles.mobileLoginLink} onClick={toggleMenu}>
                Log in
              </Link>
              <Button className={styles.mobileCta} onClick={toggleMenu}>
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}