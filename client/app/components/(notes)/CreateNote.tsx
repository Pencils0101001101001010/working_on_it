"use client";
import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { noteSchema, NoteSchema } from "./createNoteValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Loading from "../(loading spinner)/Loading";
import toast from "react-hot-toast";

function CreateNote() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const route = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NoteSchema>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  let handleOnSubmit = async (data: NoteSchema) => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          setError("Login to create notes");
        } else {
          setError("Something went wrong");
        }
      }

      if (response.ok) {
        setSuccess("Note Created");
        setLoading(false);
        setTimeout(() => {
          route.push("/notes");
        });
      }
    } catch (error) {
      setError("Something went wrong");
      console.log(error);
    }
  };

  useEffect(() => {
    if (success) {
      toast.success(success);
      setSuccess(null);
    }

    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [success, error]);

  return (
    <div>
      {user ? (
        <div>
          <form onSubmit={handleSubmit(handleOnSubmit)}>
            <h1>Create note</h1>

            {loading && <Loading />}

            <label>
              Title:
              <input type="text" {...register("title")} />
            </label>

            <label>
              Note:
              <textarea {...register("description")} />
            </label>

            <button type="submit">Submit</button>
          </form>
        </div>
      ) : (
        <div>
          To create a note <Link href={"/login"}>Login</Link>
        </div>
      )}
    </div>
  );
}

export default CreateNote;
