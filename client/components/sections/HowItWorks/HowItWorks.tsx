import Image from "next/image";
import { JSX } from "react";
import styles from "./howItWorks.module.css";

export default function HowItWorks(): JSX.Element {

   return(
      <section id="how-it-works" className={styles.howItWorks}>
      <h2 className={styles.sectionTitle}>How It Works</h2>
      <div className={styles.stepsContainer}>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <h3 className={styles.stepTitle}>Connect Your Accounts</h3>
          <p className={styles.stepDescription}>
            Link your email and social media accounts with secure OAuth integration.
          </p>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <h3 className={styles.stepTitle}>Customize Your Inbox</h3>
          <p className={styles.stepDescription}>
            Set up filters, priorities, and notification preferences to suit your workflow.
          </p>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <h3 className={styles.stepTitle}>Manage Everything</h3>
          <p className={styles.stepDescription}>
            Respond to messages, archive, delegate, or schedule follow-ups from one interface.
          </p>
        </div>
      </div>
      <div className={styles.workflowImageContainer}>
        <Image
          src="/placeholder.svg?height=400&width=1000"
          alt="InBoxlyOne workflow"
          width={1000}
          height={400}
          className={styles.workflowImage}
        />
      </div>
    </section>
   );
};