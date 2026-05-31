"use client";

import Link from "next/link";
import "./styles.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authContext";
import Loading from "../(loading spinner)/Loading";

function Navbar() {
  //create a button that shows signin when now user is login and user name when login:
  //~ using the auth context created to detirmine the state of user
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

  if (loading)
    return (
      <nav>
        <div className="loading">
          <Loading />
        </div>
      </nav>
    );

  return (
    <nav>
      <div className="navBody">
        <div className="logoStyle">
          {" "}
          <Link href={"/"}>
            {" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              fill="currentColor"
              className="bi bi-asterisk"
              viewBox="0 0 16 16"
            >
              <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1" />
            </svg>
          </Link>
        </div>
        {user ? (
          <div className="userMenu">
            <button onClick={handleLogout} className="button-89">
              Logout
            </button>

            <Link href={"/notes"} className="button-89">
              Notes
            </Link>

            {/* <span className="userName">{user.username}</span> */}
          </div>
        ) : (
          <div className="signupAndLoginSection">
            <span>
              {" "}
              <Link href={"/register"} className="button-89">
                Signup
              </Link>
            </span>
            <span>
              <Link href={"/login"} className="button-89">
                Login
              </Link>
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
