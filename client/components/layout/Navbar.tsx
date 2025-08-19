"use client";

import Link from "next/link";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import styles from "./navbar.module.css";
import MobileMenu from "./NavbarMobile";
import Image from "next/image";
import { JSX } from "react";
import ProfileNavbar from "../ui/Profile/ProfileNavbar";
import { useAuth } from "@/app/context/AuthProvider";

export default function Navbar(): JSX.Element {
  const { user } = useAuth();

  return (
    <header className={styles.header}>
      <Link href={"/"}>
        <div className={styles.logo}>
          <Image
            src="/assets/inboxlyone.png"
            alt="Inboxlyone"
            width={40} // adjust size
            height={40} // adjust size
            className="object-contain mb-4 mx-2"
          />
          <span className="text-purple-900 text-2xl font-medium">Inboxlyone</span>
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
        <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-base font-medium text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
          Get Started
        </Button>
      </div>
      <MobileMenu />
    </header>
  );
}
