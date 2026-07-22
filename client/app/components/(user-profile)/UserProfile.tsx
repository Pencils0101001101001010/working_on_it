"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import "./user-profile.css";
import Loading from "../(loading spinner)/Loading";

interface UserInterface {
  profileImage: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  age: number;
}

export default function UserProfile() {
  const [users, setUsers] = useState<UserInterface | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/user/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to load users.");
        const data: UserInterface = await response.json();
        setUsers(data);
      } catch (err) {
        console.error("Something went wrong:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (!users)
    return (
      <div className="user-Profile-page-container">Login to see profile</div>
    );

  // ⬇️ Determine image source: Use upload if it exists, otherwise use Dicebear
  const avatarSrc =
    users.profileImage ||
    `https://api.dicebear.com/10.x/lorelei/png?seed=${encodeURIComponent(users.username)}`;

  return (
    <div className="user-Profile-page-container">
      <div className="child-container-border">
        <div className="image-container-div">
          {loading && <Loading />}
          <Image
            src={avatarSrc}
            alt={`${users.username}'s avatar`}
            width={100}
            height={100}
            className="user-avatar"
          />
        </div>

        <span className="username">{users.username}</span>

        <p>First name:</p>
        <p>{users.firstName}</p>
        <p>Last name:</p>
        <p>{users.lastName}</p>
        <p>Email:</p>
        <p>{users.email}</p>
        <p>Role:</p>
        <p>{users.role}</p>
      </div>
    </div>
  );
}
