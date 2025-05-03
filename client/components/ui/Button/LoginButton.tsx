import { LogIn } from "lucide-react";
import Link from "next/link";
import { JSX } from "react";
import styles from "./loginButton.module.css";


export default function LoginButton({
   onClick,
}: {
   onClick?: () => void;
}): JSX.Element {
   return(
      <div className={styles.buttonContainer}>
      <Link href="/sign-in" onClick={onClick}>
         Log in
      </Link>
      <LogIn className={styles.loginIcon}/>
   </div>
   );
}