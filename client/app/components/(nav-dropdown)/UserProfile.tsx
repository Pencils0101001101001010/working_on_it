import Link from "next/link";
import "./user-dropdown.css";
import { useAuth } from "@/app/context/authContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DropdownItems {
  isOpen: boolean;
}

const UserProfile = ({ isOpen }: DropdownItems) => {
  const { user, logoutUser, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      //clear the server HttpOnly cookie
      await fetch(`${baseUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed on server.", error);
    } finally {
      //clear state and localstorage via the context helper
      logoutUser();

      //Force state refresh and redirect
      router.refresh();
      router.push("/login");
    }
  };
  return (
    <div>
      <div>{user?.username}</div>
      <div>
        {isOpen && (
          <div className="dropdown-body">
            <Link href={"/notes"} className="button-89">
              Notes
            </Link>

            <Link href={"/videos"} className="button-89">
              Videos
            </Link>

            <Link href={"/"} className="button-89">
              User
            </Link>

            <button onClick={handleLogout} className="button-89">
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
