"use client";

import { useRouter } from "next/navigation";

function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Tell backend to clear httpOnly cookie
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      await fetch(`${baseUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Failed to log out on server", error);
    } finally {
      //Clear UI-only data in local storage
      localStorage.removeItem("user");

      //reset state and force view update
      router.refresh();
      router.push("/login");
    }
  };

  return (
    <button onClick={handleLogout} className=" ">
      Log Out
    </button>
  );
}

export default LogoutButton;
