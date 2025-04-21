import { Facebook, Inbox, Instagram, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import { JSX } from "react";
import styles from "./footer.module.css";

export default function Footer () : JSX.Element {
   return (
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <Inbox className={styles.footerLogoIcon} />
            <span className={styles.footerLogoText}>InBoxlyOne</span>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerLinkColumn}>
              <h4 className={styles.footerLinkTitle}>Product</h4>
              <Link href="#" className={styles.footerLink}>
                Features
              </Link>
              <Link href="#" className={styles.footerLink}>
                Pricing
              </Link>
              <Link href="#" className={styles.footerLink}>
                Integrations
              </Link>
              <Link href="#" className={styles.footerLink}>
                Roadmap
              </Link>
            </div>
            <div className={styles.footerLinkColumn}>
              <h4 className={styles.footerLinkTitle}>Company</h4>
              <Link href="#" className={styles.footerLink}>
                About
              </Link>
              <Link href="#" className={styles.footerLink}>
                Blog
              </Link>
              <Link href="#" className={styles.footerLink}>
                Careers
              </Link>
              <Link href="#" className={styles.footerLink}>
                Contact
              </Link>
            </div>
            <div className={styles.footerLinkColumn}>
              <h4 className={styles.footerLinkTitle}>Resources</h4>
              <Link href="#" className={styles.footerLink}>
                Documentation
              </Link>
              <Link href="#" className={styles.footerLink}>
                Help Center
              </Link>
              <Link href="#" className={styles.footerLink}>
                Community
              </Link>
              <Link href="#" className={styles.footerLink}>
                Webinars
              </Link>
            </div>
            <div className={styles.footerLinkColumn}>
              <h4 className={styles.footerLinkTitle}>Legal</h4>
              <Link href="#" className={styles.footerLink}>
                Privacy
              </Link>
              <Link href="#" className={styles.footerLink}>
                Terms
              </Link>
              <Link href="#" className={styles.footerLink}>
                Security
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>© {new Date().getFullYear()} InBoxlyOne. All rights reserved.</p>
          <div className={styles.socialLinks}>
            <Link href="#" className={styles.socialLink}>
              <Twitter className={styles.socialIcon} />
            </Link>
            <Link href="#" className={styles.socialLink}>
              <Facebook className={styles.socialIcon} />
            </Link>
            <Link href="#" className={styles.socialLink}>
              <Instagram className={styles.socialIcon} />
            </Link>
            <Link href="#" className={styles.socialLink}>
              <Linkedin className={styles.socialIcon} />
            </Link>
          </div>
        </div>
      </footer>
   );

}