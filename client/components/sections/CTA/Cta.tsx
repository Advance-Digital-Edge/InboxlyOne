import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { JSX } from "react";
import styles from "./cta.module.css";

export default function CTA (): JSX.Element {
   return (
      <section className={styles.cta}>
      <div className={styles.ctaContent}>
        <h2 className={styles.ctaTitle}>Ready to Simplify Your Communication?</h2>
        <p className={styles.ctaDescription}>
          Join thousands of professionals who have streamlined their messaging workflow with InBoxlyOne.
        </p>
        <Button className={styles.ctaButton}>
          Get Started for Free
          <ArrowRight className={styles.ctaButtonIcon} />
        </Button>
      </div>
    </section>
   );
}