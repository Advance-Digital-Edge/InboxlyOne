import { Button } from "@/components/ui/Button/button";
import { CheckCircle } from "lucide-react";
import { JSX } from "react";
import styles from "./pricing.module.css";

export default function Pricing(): JSX.Element{

   return(
      <section id="pricing" className={styles.pricing}>
      <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
      <div className={styles.pricingCards}>
        <div className={styles.pricingCard}>
          <h3 className={styles.pricingTier}>Free</h3>
          <div className={styles.pricingAmount}>$0</div>
          <p className={styles.pricingPeriod}>forever</p>
          <ul className={styles.pricingFeatures}>
            <li className={styles.pricingFeature}>
              <CheckCircle className={styles.checkIcon} />
              <span>Connect up to 3 accounts</span>
            </li>
            <li className={styles.pricingFeature}>
              <CheckCircle className={styles.checkIcon} />
              <span>Basic filtering</span>
            </li>
            <li className={styles.pricingFeature}>
              <CheckCircle className={styles.checkIcon} />
              <span>Standard support</span>
            </li>
          </ul>
          <Button variant="outline" className={styles.pricingButton}>
            Get Started
          </Button>
        </div>
        <div className={`${styles.pricingCard} ${styles.popularPlan}`}>
          <div className={styles.popularBadge}>Most Popular</div>
          <h3 className={styles.pricingTier}>Pro</h3>
          <div className={styles.pricingAmount}>$9.99</div>
          <p className={styles.pricingPeriod}>per month</p>
          <ul className={styles.pricingFeatures}>
            <li className={styles.pricingFeature}>
              <CheckCircle className={styles.checkIcon} />
              <span>Connect unlimited accounts</span>
            </li>
            <li className={styles.pricingFeature}>
              <CheckCircle className={styles.checkIcon} />
              <span>Advanced filtering & AI sorting</span>
            </li>
            <li className={styles.pricingFeature}>
              <CheckCircle className={styles.checkIcon} />
              <span>Priority support</span>
            </li>
            <li className={styles.pricingFeature}>
              <CheckCircle className={styles.checkIcon} />
              <span>Custom templates</span>
            </li>
          </ul>
          <Button className={styles.pricingButton}>Choose Pro</Button>
        </div>
        <div className={styles.pricingCard}>
          <h3 className={styles.pricingTier}>Team</h3>
          <div className={styles.pricingAmount}>$24.99</div>
          <p className={styles.pricingPeriod}>per user/month</p>
          <ul className={styles.pricingFeatures}>
            <li className={styles.pricingFeature}>
              <CheckCircle className={styles.checkIcon} />
              <span>Everything in Pro</span>
            </li>
            <li className={styles.pricingFeature}>
              <CheckCircle className={styles.checkIcon} />
              <span>Team collaboration</span>
            </li>
            <li className={styles.pricingFeature}>
              <CheckCircle className={styles.checkIcon} />
              <span>Admin controls</span>
            </li>
            <li className={styles.pricingFeature}>
              <CheckCircle className={styles.checkIcon} />
              <span>Analytics & reporting</span>
            </li>
          </ul>
          <Button variant="outline" className={styles.pricingButton}>
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
   );
}