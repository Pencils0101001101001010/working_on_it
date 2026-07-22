"use client";

import Link from "next/link";
import "./styles.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authContext";
import Loading from "../(loading spinner)/Loading";
import { useState } from "react";
import DropDownMenu from "../(nav-dropdown)/DropDownMenu";

function Navbar() {
  //create a button that shows signin when now user is login and user name when login:
  //~ using the auth context created to detirmine the state of user
  const { user, logoutUser, loading } = useAuth();

  //-------------handle dropdown---------------
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const toggleDropdown = () => {
    setIsOpenDropdown((prev) => !prev);
  };
  // --------------------------------------------

  return (
    <nav>
      <div className="navBody">
        <div className="logoStyle">
          {loading ? (
            <Loading />
          ) : (
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
          )}
        </div>
        {user ? (
          <div className="userMenu">
            <div
              onClick={toggleDropdown}
              aria-haspopup="true"
              aria-expanded={isOpenDropdown}
              aria-label="Toggle user profile menu"
            >
              <DropDownMenu
                isOpen={isOpenDropdown}
                setIsOpen={setIsOpenDropdown}
              />
            </div>
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
