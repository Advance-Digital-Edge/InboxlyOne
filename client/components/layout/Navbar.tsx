"use client";

import Link from "next/link";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import styles from "./navbar.module.css";
import MobileMenu from "./NavbarMobile";
import { JSX } from "react";
import ProfileNavbar from "../ui/Profile/ProfileNavbar";

export default function Navbar(): JSX.Element {
  const { user } = useAuth();

  return (
    <header className={styles.header}>
      <Link href={"/"}>
        <div className={styles.logo}>
          <Inbox className={styles.logoIcon} />
          <span className={styles.logoText}>InBoxlyOne</span>
        </div>
      </Link>
      <nav className={styles.desktopNav}>
        <Link href="/#features" className={styles.navLink}>
          Features
        </Link>
        <Link href="/#how-it-works" className={styles.navLink}>
          How It Works
        </Link>
        <Link href="/#pricing" className={styles.navLink}>
          Pricing
        </Link>
        <Link href="/#faq" className={styles.navLink}>
          FAQ
        </Link>
      </nav>
      <div className={styles.headerButtons}>
        <ProfileNavbar />
        <Button className={styles.ctaButton}>Get Started</Button>
      </div>
      <MobileMenu />
    </header>
  );
}
