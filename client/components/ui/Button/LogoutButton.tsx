import { JSX } from "react";
import styles from "./logoutButton.module.css";
import { useAuth } from "@/app/context/AuthProvider";
import { signOutAction } from "@/app/actions";
import { LogOut } from "lucide-react";

export default function LogoutButton({
  onClick,
}: {
  onClick?: () => void;
}): JSX.Element {
  const { setUser } = useAuth();

  const signOutHandler = async (): Promise<void> => {
    await signOutAction();
    setUser(null);
  };

  return (
    <div className={styles.buttonContainer} onClick={onClick}>
      <button className="flex items-center gap-2" onClick={signOutHandler}>
        Logout
        <LogOut className={styles.logoutIcon} />
      </button>
    </div>
  );
}
