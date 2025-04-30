"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/Button/button"
import styles from "./navbarMobile.module.css"
import { useAuth } from "@/app/context/AuthProvider"
import { signOutAction } from "@/app/actions"

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasUser, setHasUser] = useState<boolean | null>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const { user, setUser } = useAuth();

  useEffect(() => {
    const user = localStorage.getItem("user");
    setHydrated(true);
    setHasUser(!!user);
  }, [user]);

  const signOutHandler = async (): Promise<void> => {
    localStorage.removeItem("user");
    setUser(null);
    setHasUser(false);
    await signOutAction();
  };

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
             
              {hydrated ? (
                !hasUser ? (
                  <Link href="/sign-in" className={styles.loginLink}>
                    Log in
                  </Link>
                ) : (
                  <Button
                    className={styles.loginLink}
                    style={{ backgroundColor: "red" }}
                    onClick={signOutHandler}
                  >
                    Logout
                  </Button>
                )
              ) : (
                // Skeleton placeholder
                <Button className={styles.loginLink} style={{ width: "60px", height: "30px", backgroundColor: "#eee", borderRadius: "4px" }} />
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