
import { JSX } from 'react';
import styles from './logoutButton.module.css';
import { useAuth } from '@/app/context/AuthProvider';
import { signOutAction } from '@/app/actions';
import { LogOut } from 'lucide-react';

export default function LogoutButton({
   onClick,
}: {
   onClick?: () => void;
}): JSX.Element {
   const { setUser } = useAuth();
      
   const signOutHandler = async (): Promise<void> => {
      setUser(null);
      await signOutAction();
   };

   return(
      <div className={styles.buttonContainer} onClick={onClick}>
         <button
            onClick={signOutHandler}
         >
            Logout
         </button>
         <LogOut className={styles.logoutIcon}/>
      </div>
   );
};