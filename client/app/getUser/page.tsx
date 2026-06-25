"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface UserInterface {
  profileImage: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  age: number;
}

function page() {
  const [users, setUsers] = useState<UserInterface | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await fetch(`${baseUrl}/user/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response) {
          throw new Error("Failed to load users.");
        }

        //extract data and parse the json payload
        const data: UserInterface = await response.json();

        setUsers(data);
      } catch (err) {
        console.error("Something went wrong:", err);
        // setError(err.message || "Something went wrong.");
      }
    };

    fetchUser();
  }, []);

  return (
    <div>
      {users?.firstName} {users?.lastName} {users?.username} {users?.email}{" "}
      {users?.age} {users?.role} {users?.profileImage}
      {/* <Image
        src={`https://api.dicebear.com/10.x/lorelei/svg?seed=${users?.username}`}
        alt="user"
        width={100}
        height={100}
      /> */}
      {/* `//https://api.dicebear.com/10.x/pixel-art/svg?${users?.username}`*/}
    </div>
  );
}

export default page;
