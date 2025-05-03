"use client";

import Image from "next/image";
import { JSX } from "react";
import DefaultAvatar from "@/public/assets/default-avatar.webp";
import styles from "./profileNavbar.module.css";
import Link from "next/link";
import { Button } from "../Button/button";
import { useAuth } from "@/app/context/AuthProvider";
import LogoutButton from "../Button/LogoutButton";
import LoginButton from "../Button/LoginButton";

export default function ProfileNavbar(): JSX.Element {
   const { user, loading } = useAuth();
   
     console.log("Navbar user", user);
   
   return(
      <div className={styles.container}>
         <div className={styles.avatarWrapper}>
            <Image 
               src={DefaultAvatar} 
               alt="Default Avatar Picture" 
               width={50}
               height={50}
            />
         </div>
         <div className={styles.dropdown}>
            <span className={styles.profileEmail}>john1doe@gmail.com</span>
            <ul className={styles.dropdownLinks}>
               <li><Link href={"/protected"}>Profile</Link></li>
               <li><Link href={"/dashboard"}>Dashboard</Link></li>
            </ul>
            {loading ? (
               <Button
                  style={{ backgroundColor: "gray", opacity: "80" }}
                  className={`w-full mr-2 animate-pulse`}
               ></Button>
            ) : !user ? (
               <LoginButton />
            ) : (
               <LogoutButton />
            )}
         </div>
      </div>
   );
}