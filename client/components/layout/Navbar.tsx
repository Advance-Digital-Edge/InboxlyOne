"use client"

import Link from "next/link"
import { Inbox } from "lucide-react"
import { Button } from "@/components/ui/Button/button"
import styles from "./navbar.module.css"
import MobileMenu from "./NavbarMobile"
import { JSX } from "react";
import {useState, useEffect} from "react";
import { useAuth } from "@/app/context/AuthProvider"
import { signOutAction } from "@/app/actions"

export default function Navbar(): JSX.Element {
  const [hasUser, setHasUser] = useState<boolean | null>(false);
  const { user, setUser } = useAuth();

  useEffect(() => {
    const user = localStorage.getItem("user");
    setHasUser(!!user);
  }, [user]);

  const signOutHandler = async (): Promise<void> => {
    localStorage.removeItem("user");
    setUser(null);
    setHasUser(false);
    await signOutAction();
  };

  return (
    <header className={styles.header}>
      <Link href={"/"}>
        <div className={styles.logo}>
          <Inbox className={styles.logoIcon} />
          <span className={styles.logoText}>InBoxlyOne</span>
        </div>
      </Link>
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
      {!hasUser ? (
          <>
            <Link href="/sign-in" className={styles.loginLink}>
              Log in
            </Link>
          </>
        ) : (
          <Button 
            className={styles.loginLink} 
            style={{backgroundColor: "red"}}
            onClick={signOutHandler}
            >
            Logout
          </Button>
        )}
        <Button className={styles.ctaButton}>Get Started</Button>
      </div>
      <MobileMenu />
    </header>
  );
}
