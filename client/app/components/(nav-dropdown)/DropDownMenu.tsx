import { useRef } from "react"; // Added useRef
import Link from "next/link";
import "./user-dropdown.css";
import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";
import { useOutsideClick } from "@/app/hooks/useOutsideClick";

interface UserProfileProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DropDownMenu = ({ isOpen, setIsOpen }: UserProfileProps) => {
  const { user, logoutUser } = useAuth();
  const router = useRouter();

  // Create a reference element container
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Trigger conditional state change if clicked outside this container
  useOutsideClick(dropdownRef, () => {
    if (isOpen) setIsOpen(false);
  });

  const handleLogout = async () => {
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
    }
  };

  const handleSound = () => {
    const audio = new Audio("/audio/hover-sound.mp3");
    audio.play().catch((err) => alert("Audio blocked by browser."));
  };

  const handleLogoutSound = () => {
    const audio = new Audio("/audio/logout-sound.mp3");
    audio.play().catch((err) => alert("Audio blocked by browser."));
  };

  return (
    // Attach the DOM reference pointer here
    <div ref={dropdownRef}>
      <div className="user-icon">{user?.username}</div>
      {isOpen && (
        <div className="dropdown-body">
          <Link
            onMouseOver={handleSound}
            href={"/notes"}
            className="button-89"
            onClick={() => setIsOpen(false)}
          >
            Notes
          </Link>
          <Link
            href={"/videos"}
            onMouseOver={handleSound}
            className="button-89"
            onClick={() => setIsOpen(false)}
          >
            Videos
          </Link>
          <Link
            onMouseOver={handleSound}
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
