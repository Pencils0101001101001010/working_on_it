"use client";

import { useRef, useState } from "react"; // Added useRef
import Link from "next/link";
import "./user-dropdown.css";
import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";
import { useOutsideClick } from "@/app/hooks/useOutsideClick";
import Loading from "../(loading spinner)/Loading";

interface UserProfileProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DropDownMenu = ({ isOpen, setIsOpen }: UserProfileProps) => {
  const { user, logoutUser } = useAuth();
  const router = useRouter();
  const [loading, isLoading] = useState(false);

  // Create a reference element container
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Trigger conditional state change if clicked outside this container
  useOutsideClick(dropdownRef, () => {
    if (isOpen) setIsOpen(false);
  });

  //!There is a error on the deployement logs regarding user login. Where the authToken is not being seen by the backend
  const handleLogout = async () => {
    isLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      await fetch(`${baseUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed on server.", error);
    } finally {
      logoutUser();
      setIsOpen(false);
      router.refresh();
      router.push("/login");
      isLoading(false);
    }
  };

  const handleLogoutSound = () => {
    const audio = new Audio("/audio/logout-sound.mp3");
    audio.play().catch((err) => alert("Audio blocked by browser."));
  };

  return (
    // Attach the DOM reference pointer here

    <div ref={dropdownRef}>
      {loading ? (
        <Loading />
      ) : (
        <div className="user-icon">{user?.username}</div>
      )}

      {isOpen && (
        <div className="dropdown-body">
          <Link
            href={"/notes"}
            className="button-89"
            onClick={() => setIsOpen(false)}
          >
            Notes
          </Link>
          <Link
            href={"/videos"}
            className="button-89"
            onClick={() => setIsOpen(false)}
          >
            Videos
          </Link>
          <Link
            href={"/user-profile"}
            className="button-89"
            onClick={() => setIsOpen(false)}
          >
            User
          </Link>
          <button
            onMouseOver={handleLogoutSound}
            onClick={handleLogout}
            className="button-89"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default DropDownMenu;
