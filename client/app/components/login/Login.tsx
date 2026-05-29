"use client";
import { useState } from "react";
import "./styles.css";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { LoginInput, loginSchema } from "@/app/lib/validators/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authContext";

function Login() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { loginUser } = useAuth();
  const route = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  let onSubmit = async (data: LoginInput) => {
    try {
      setServerError(null);
      setSuccess(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        /* 
           This tells the browser to accept and 
           save the HTTP-only cookie sent from Node.js backend.
        */
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setServerError("Check user credentials");
        } else {
          setServerError("Something went wrong");
        }
      }

      if (response.ok) {
        // getting data from backend  response
        const resData = await response.json();

        // extracting the user name
        const user = resData.user;

        if (user) {
          loginUser(user);
        }

        setSuccess(`Success! Welcome back ${user.username}`);

        route.refresh();
        setTimeout(() => {
          route.push("/");
        }, 1000);
      }
    } catch (error) {
      setServerError("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="mainLoginContainer">
      <div className="imageSt">
        <Image
          width={1000}
          height={1000}
          alt="mars Image"
          src={"/marsplanet.jpg"}
        />
      </div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <h1>Login</h1>
          {serverError && <p style={{ color: "red" }}>{serverError}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}
          <label>Username:</label>
          <input className="inpStl" type="text" {...register("username")} />
          {errors.username && (
            <span className="error">{errors.username.message}</span>
          )}
          <label>Password:</label>
          <input className="inpStl" type="password" {...register("password")} />
          {errors.password && (
            <span className="error">{errors.password.message}</span>
          )}

          <button type="submit" className="bttnS">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
