"use client";

import { useState } from "react";
import "./style.css";
import {
  registerSchema,
  RegisterInput,
  RegisterOutput,
} from "@/app/lib/validators/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

function Register() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const route = useRouter();

  // Initialize useForm with zod schema :
  // Pass RegisterInput here to handle the raw form fields accurately
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      age: 16,
      password: "",
      confirmPassword: "",
    },
  });

  //use Registeroutput here because the data is fully validated by this point
  const onSubmit = async (data: RegisterInput) => {
    try {
      setServerError(null);
      setSuccess(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${baseUrl}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccess("Registration Successfull.");
        reset();
        setTimeout(() => {
          route.push("/login");
        }, 1000);
      }
    } catch (error) {
      setServerError("Something went wrong.");
    }
  };

  return (
    <div className="mainContainer">
      <div className="imgStl">
        <Image
          width={2000}
          height={2000}
          className="imgStl"
          alt="Mars"
          src="/mars.jpg"
        />
      </div>
      <div>
        {" "}
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <h1>Signup</h1>
          {serverError && <p style={{ color: "red" }}>{serverError}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}
          <label>Username:</label>
          <input className="inpStl" type="text" {...register("username")} />
          {errors.username && (
            <span className="error">{errors.username.message}</span>
          )}
          <label>Email:</label>
          <input className="inpStl" type="email" {...register("email")} />
          {errors.email && (
            <span className="error">{errors.email.message}</span>
          )}
          <label>First name:</label>
          <input className="inpStl" type="text" {...register("firstName")} />
          {errors.firstName && (
            <span className="error">{errors.firstName.message}</span>
          )}
          <label>Last name:</label>
          <input className="inpStl" type="text" {...register("lastName")} />
          {errors.lastName && (
            <span className="error">{errors.lastName.message}</span>
          )}
          <label>Age:</label>
          <input className="inpStl" type="number" {...register("age")} />
          {errors.age && <span className="error">{errors.age.message}</span>}
          <label>Password:</label>
          <input className="inpStl" type="password" {...register("password")} />
          {errors.password && (
            <span className="error">{errors.password.message}</span>
          )}
          <label>Confirm password:</label>
          <input
            className="inpStl"
            type="password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="error">{errors.confirmPassword.message}</span>
          )}
          <button type="submit" className="bttnS">
            Signup
          </button>
          <span className="loginLink">
            Already have an acount:{" "}
            <Link href={"/login"} className="hvrLink">
              Login
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
}

export default Register;
