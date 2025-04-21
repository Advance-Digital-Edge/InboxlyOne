import { JSX } from "react";
import {
   MessageSquare,
   CheckCircle,
   Inbox
 } from "lucide-react"
 import styles from "./features.module.css";

export default function Features (): JSX.Element {

   return (
      <section id="features" className={styles.features}>
          <h2 className={styles.sectionTitle}>Why Choose InBoxlyOne?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <Inbox className={styles.featureIcon} />
              </div>
              <h3 className={styles.featureTitle}>Unified Inbox</h3>
              <p className={styles.featureDescription}>
                All your messages from Gmail, Twitter, Instagram, Facebook, and more in a single inbox.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <MessageSquare className={styles.featureIcon} />
              </div>
              <h3 className={styles.featureTitle}>Smart Filtering</h3>
              <p className={styles.featureDescription}>
                Automatically categorize and prioritize messages based on importance and content.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <CheckCircle className={styles.featureIcon} />
              </div>
              <h3 className={styles.featureTitle}>Quick Responses</h3>
              <p className={styles.featureDescription}>
                Reply to messages across platforms without switching between apps.
              </p>
            </div>
          </div>
        </section>
   );
}