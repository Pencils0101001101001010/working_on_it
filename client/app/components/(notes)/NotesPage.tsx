"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Loading from "../(loading spinner)/Loading";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Note {
  _id: string;
  user: User;
  title: string;
  description: string;
}

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const route = useRouter();

  const getNotes = async () => {
    try {
      setLoading(false);

      const response = await fetch(`${baseUrl}/api/notes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        if (response.status === 204) {
          return setError("You have no notes");
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          setError("Login to view your notes.");
        } else
          setError("Failed to load notes, Try logging in or creating a note.");
        return;
      }

      if (response.ok) {
        const data: Note[] = await response.json();

        console.log(data);
        setNotes(data);
        setLoading(false);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  useEffect(() => {
    getNotes();
  }, []);

  const handleDeleteNote = async (id: string) => {
    try {
      setSuccess(null);
      setError(null);
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/notes/${id}`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        return setError("Note not deleted.");
      }

      /**Optimistic UI Update
       * This code loops through your current list of notes in the browser and creates a new array that leaves out the one you just deleted. React then instantly updates the screen with this filtered list so the deleted note vanishes without needing to reload the page.
       */
      setNotes((prevNote) => prevNote.filter((notes) => notes._id !== id));

      setLoading(false);
      setSuccess("Note deleted");
    } catch (error) {
      setError("Failed to delete note");
      console.log(error);
    }
  };
  return (
    <div>
      <div>
        <Link href={"/createNote"}>Create</Link>
      </div>

      {loading && <Loading />}
      {error}
      {notes.map((n) => (
        <div key={n._id}>
          <h1>{n.title}</h1>
          <p>{n.description}</p>
          <button onClick={() => handleDeleteNote(n._id)}>delete</button>
        </div>
      ))}
    </div>
  );
};

export default NotesPage;
