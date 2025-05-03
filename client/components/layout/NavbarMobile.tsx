"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/Button/button"
import styles from "./navbarMobile.module.css"
import { useAuth } from "@/app/context/AuthProvider"
import LogoutButton from "../ui/Button/LogoutButton"
import LoginButton from "../ui/Button/LoginButton"

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading } = useAuth();

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
              {loading ? (
                  <Button
                    style={{ backgroundColor: "gray", opacity: "80" }}
                    className={`w-full mr-2 animate-pulse`}
                  ></Button>
                ) : !user ? (
                    <LoginButton onClick={toggleMenu}/>
                ) : (
                  <LogoutButton onClick={toggleMenu}/>
                )}
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