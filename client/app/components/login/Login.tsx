"use client";
import { useState } from "react";
import "./styles.css";
import Image from "next/image";
import { useForm } from "react-hook-form";
import {
  LoginInput,
  loginSchema,
  RegisterInput,
  registerSchema,
} from "@/app/lib/validators/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";

function Login() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccess("Logged in.");
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
        <form onSubmit={handleSubmit(onSubmit)}>
          {serverError && <p style={{ color: "red" }}>{serverError}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}
          <label>Username:</label>
          <input className="inputS" type="text" {...register("username")} />
          {errors.username && (
            <span className="error">{errors.username.message}</span>
          )}
          <label>Password:</label>
          <input className="inputS" type="password" {...register("password")} />
          {errors.password && (
            <span className="error">{errors.password.message}</span>
          )}

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
