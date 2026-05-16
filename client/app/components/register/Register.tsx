"use client";

import { FormEvent, useState } from "react";
import "./style.css";
import {
  registerSchema,
  RegisterSchema,
} from "@/app/lib/validators/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

function Register() {
  const [formData, setFormData] = useState<RegisterSchema>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    age: 16,
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      registerSchema.parse(formData);

      const response = await fetch("http://localhost:5050/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess("Registration successfull");
        setError(null);
        setFormData({
          username: "",
          email: "",
          firstName: "",
          lastName: "",
          age: 16,
          password: "",
          confirmPassword: "",
        });
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.message || "Failed registration");
        setSuccess(null);
      }
    } catch (error) {
      setError("An unexpected error occurred");

      setSuccess(null);
    }
  };

  return (
    <div className="mainContainer">
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit} className="form">
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>
        <label>
          First name
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </label>
        <label>
          Last name
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </label>
        <label>
          Age
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </label>
        <button type="submit">register</button>
      </form>
    </div>
  );
}

export default Register;
