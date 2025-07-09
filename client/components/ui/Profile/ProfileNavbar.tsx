"use client";

import { JSX, useState, useRef, useEffect } from "react";
import { User, Settings, Bell, HelpCircle, LogOut } from "lucide-react";
import styles from "./profileNavbar.module.css";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthProvider";
import LogoutButton from "../Button/LogoutButton";
import LoginButton from "../Button/LoginButton";

export default function ProfileNavbar(): JSX.Element {
   const { user, loading } = useAuth();
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);
   
   // Close dropdown when clicking outside
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   if (loading) {
      return (
         <div className={styles.skeleton}>
            <div className={styles.skeletonAvatar}></div>
         </div>
      );
   }

   if (!user) {
      // Show interactive demo avatar for non-logged users
      return (
         <div className={styles.profileWrapper} ref={dropdownRef}>
            <button 
               className={`${styles.avatarTrigger} ${isOpen ? styles.active : ''}`}
               onClick={() => setIsOpen(!isOpen)}
               aria-label="Open profile menu"
            >
               <div 
                  className={styles.avatarCircle}
                  style={{ backgroundColor: '#667eea' }}
               >
                  <span className={styles.avatarText}>GU</span>
               </div>
               <div className={styles.statusIndicator}></div>
            </button>

            {isOpen && (
               <div className={styles.dropdownMenu}>
                  {/* Header */}
                  <div className={styles.dropdownHeader}>
                     <div 
                        className={styles.headerAvatar}
                        style={{ backgroundColor: '#667eea' }}
                     >
                        <span className={styles.headerAvatarText}>GU</span>
                     </div>
                     <div className={styles.headerInfo}>
                        <h4 className={styles.headerName}>Guest User</h4>
                        <p className={styles.headerEmail}>guest@example.com</p>
                     </div>
                     <div className={styles.headerBadge}>Demo</div>
                  </div>

                  {/* Navigation Links */}
                  <div className={styles.dropdownBody}>
                     <div className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <User className={styles.itemIcon} />
                        <span>Sign In to Access Profile</span>
                     </div>
                     
                     <div className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <Settings className={styles.itemIcon} />
                        <span>Dashboard (Premium)</span>
                        <span className={styles.premiumBadge}>Pro</span>
                     </div>
                     
                     <div className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <Bell className={styles.itemIcon} />
                        <span>Notifications</span>
                        <span className={styles.badge}>5</span>
                     </div>
                     
                     <div className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <HelpCircle className={styles.itemIcon} />
                        <span>Help & Support</span>
                     </div>
                  </div>

                  {/* Footer */}
                  <div className={styles.dropdownFooter}>
                     <div className={styles.demoActions}>
                        <LoginButton />
                        <button className={styles.demoButton}>
                           Try Demo
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>
      );
   }

   // Generate avatar color based on email
   const getAvatarColor = (email: string) => {
      const colors = [
         '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
         '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
      ];
      const index = email.charCodeAt(0) % colors.length;
      return colors[index];
   };

   const getInitials = (email: string) => {
      const name = email.split('@')[0];
      return name.slice(0, 2).toUpperCase();
   };

   const avatarColor = getAvatarColor(user.email);
   const initials = getInitials(user.email);

   return (
      <div className={styles.profileWrapper} ref={dropdownRef}>
         <button 
            className={`${styles.avatarTrigger} ${isOpen ? styles.active : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Open profile menu"
         >
            <div 
               className={styles.avatarCircle}
               style={{ backgroundColor: avatarColor }}
            >
               <span className={styles.avatarText}>{initials}</span>
            </div>
            <div className={styles.statusIndicator}></div>
         </button>

         {isOpen && (
            <div className={styles.dropdownMenu}>
               {/* Header */}
               <div className={styles.dropdownHeader}>
                  <div 
                     className={styles.headerAvatar}
                     style={{ backgroundColor: avatarColor }}
                  >
                     <span className={styles.headerAvatarText}>{initials}</span>
                  </div>
                  <div className={styles.headerInfo}>
                     <h4 className={styles.headerName}>{user.email.split('@')[0]}</h4>
                     <p className={styles.headerEmail}>{user.email}</p>
                  </div>
                  <div className={styles.headerBadge}>Pro</div>
               </div>

               {/* Navigation Links */}
               <div className={styles.dropdownBody}>
                  <Link href="/protected" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                     <User className={styles.itemIcon} />
                     <span>My Profile</span>
                  </Link>
                  
                  <Link href="/dashboard" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                     <Settings className={styles.itemIcon} />
                     <span>Dashboard</span>
                  </Link>
                  
                  <Link href="/notifications" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                     <Bell className={styles.itemIcon} />
                     <span>Notifications</span>
                     <span className={styles.badge}>3</span>
                  </Link>
                  
                  <Link href="/help" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                     <HelpCircle className={styles.itemIcon} />
                     <span>Help & Support</span>
                  </Link>
               </div>

               {/* Footer */}
               <div className={styles.dropdownFooter}>
                  <div className={styles.logoutWrapper}>
                     <LogoutButton />
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}