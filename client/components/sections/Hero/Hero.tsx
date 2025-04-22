import { JSX } from "react";
import { Button } from "@/components/ui/Button/button"
import styles from "./hero.module.css";
import Image from "next/image"
import {
  MessageSquare,
  Mail,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react"

export default function Hero(): JSX.Element {
   return (
      <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>All Your Messages in One Place</h1>
        <p className={styles.heroSubtitle}>
          Simplify your communication with InBoxlyOne. Connect Gmail, social media, and messaging platforms in a
          single, unified inbox.
        </p>
        <div className={styles.heroCta}>
          <Button className={styles.primaryButton}>Start for Free</Button>
          <Button variant="outline" className={styles.secondaryButton}>
            Watch Demo
          </Button>
        </div>
        <div className={styles.platformIcons}>
          <Mail className={styles.platformIcon} />
          <Instagram className={styles.platformIcon} />
          <Twitter className={styles.platformIcon} />
          <Facebook className={styles.platformIcon} />
          <Linkedin className={styles.platformIcon} />
          <MessageSquare className={styles.platformIcon} />
        </div>
      </div>
      <div className={styles.heroImageContainer}>
        <Image
          src="/placeholder.svg?height=600&width=800"
          alt="InBoxlyOne dashboard preview"
          width={800}
          height={600}
          className={styles.heroImage}
        />
      </div>
    </section>
   );
   }