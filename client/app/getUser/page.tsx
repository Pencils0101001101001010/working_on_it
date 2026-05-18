"use client";

import { useEffect, useState } from "react";

interface UserInterface {
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  age: number;
}

function page() {
  const [users, setUsers] = useState<UserInterface[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await fetch(`${baseUrl}/user/all`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response) {
          throw new Error("Failed to load users.");
        }

        //extract data and parse the json payload
        const data: UserInterface[] = await response.json();

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
      <ul>
        {users.map((user, index) => (
          <li key={index}>
            {user.firstName} {user.lastName} {user.username} {user.email}{" "}
            {user.age} {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default page;
