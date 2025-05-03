
import { JSX } from 'react';
import styles from './logoutButton.module.css';
import { useAuth } from '@/app/context/AuthProvider';
import { signOutAction } from '@/app/actions';
import { LogOut } from 'lucide-react';

export default function LogoutButton(): JSX.Element {
   const { user, setUser, loading } = useAuth();
      
   const signOutHandler = async (): Promise<void> => {
      setUser(null);
      await signOutAction();
   };

   return(
      <div className={styles.buttonContainer}>
         <button
            onClick={signOutHandler}
         >
            Logout
         </button>
         <LogOut className={styles.logoutIcon}/>
      </div>
   );
};