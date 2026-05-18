"use client";

import Link from "next/link";
import "./styles.css";
import { useEffect, useState } from "react";
import LogoutButton from "../(logoutButton)/LogoutButton";
import { useRouter } from "next/navigation";

function Navbar() {
  //create a button that shows signin when now user is login and user name when login:
  const [isMounted, setIsmounted] = useState(false);
  const [username, setUserName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // make sure we on the browser:
    setIsmounted(true);

    //  get user from local Storage

    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        //structure the data
        const parsedUser = JSON.parse(savedUser);
        // set data to state
        setUserName(parsedUser.username);
      } catch (error) {
        console.log("error parsing user data");
      }
    }
  });

  return (
    <div className="navBody">
      <div className="logoStyle">
        {" "}
        <Link href={"/"}>
          {" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            fill="currentColor"
            className="bi bi-asterisk"
            viewBox="0 0 16 16"
          >
            <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1" />
          </svg>
        </Link>
      </div>
      {username ? (
        <div className="userMenu">
          {/* <span className="welcomeText">{username}</span> */}
          <span>
            <LogoutButton />
          </span>
        </div>
      ) : (
        <Link href={"/register"} className="loginButtonStl">
          Logn/Signup
        </Link>
      )}
    </div>
  );
}

export default Navbar;
