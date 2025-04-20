import Image from "next/image";
import { JSX } from "react";
import styles from "./testimonials.module.css";

export default function Testimonials(): JSX.Element {

   return(
      
      <section className={styles.testimonials}>
      <h2 className={styles.sectionTitle}>What Our Users Say</h2>
      <div className={styles.testimonialCards}>
        <div className={styles.testimonialCard}>
          <p className={styles.testimonialText}>
            "InBoxlyOne has completely transformed how I manage communications. I save at least 2 hours every day!"
          </p>
          <div className={styles.testimonialAuthor}>
            <div className={styles.testimonialAvatar}>
              <Image
                src="/placeholder.svg?height=50&width=50"
                alt="User avatar"
                width={50}
                height={50}
                className={styles.avatarImage}
              />
            </div>
            <div>
              <p className={styles.testimonialName}>Sarah Johnson</p>
              <p className={styles.testimonialRole}>Marketing Director</p>
            </div>
          </div>
        </div>
        <div className={styles.testimonialCard}>
          <p className={styles.testimonialText}>
            "As a social media manager handling multiple accounts, InBoxlyOne is a game-changer for my
            productivity."
          </p>
          <div className={styles.testimonialAuthor}>
            <div className={styles.testimonialAvatar}>
              <Image
                src="/placeholder.svg?height=50&width=50"
                alt="User avatar"
                width={50}
                height={50}
                className={styles.avatarImage}
              />
            </div>
            <div>
              <p className={styles.testimonialName}>Michael Chen</p>
              <p className={styles.testimonialRole}>Social Media Consultant</p>
            </div>
          </div>
        </div>
      </div>
    </section>
   );
};