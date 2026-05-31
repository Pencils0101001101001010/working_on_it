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
  const [editModal, setEditModal] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const route = useRouter();

  const getNotes = async () => {
    try {
      setLoading(true);

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
      setLoading(false);
      console.log(error);
    }
  };

  const handleOpenEdit = (note: Note) => {
    setEditModal(true);
    setEditNote(note);
    setNewTitle(note.title);
    setNewDescription(note.description);
  };

  const closeEditModal = () => {
    setEditModal(false);
    setEditNote(null);
  };

  const handleEditSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);

    try {
      const response = await fetch(`${baseUrl}/api/notes/${editNote?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
        }),
      });

      if (!response.ok) {
        setError("Failed to update.");
      }

      const updateNote: Note = await response.json();

      setNotes((prevNote) =>
        prevNote.map((n) => (n._id === updateNote._id ? updateNote : n)),
      );

      setLoading(false);
      setSuccess("Note updated");
      setEditModal(false);
    } catch (error) {
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <Link href={"/createNote"}>Create</Link>
      </div>

      {loading && <Loading />}
      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
      {notes.map((n) => (
        <div key={n._id}>
          <h1>{n.title}</h1>
          <p>{n.description}</p>
          <button onClick={() => handleDeleteNote(n._id)}>delete</button>

          <button onClick={() => handleOpenEdit(n)}>Edit</button>
        </div>
      ))}

      {editModal && editModal && (
        <div style={{ padding: 30 }}>
          <button style={{ padding: 10 }} onClick={() => closeEditModal()}>
            close
          </button>
          <form onSubmit={handleEditSubmit}>
            <label>Change Title:</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />

            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              required
              style={{ border: "1px solid black", padding: "5px" }}
            />
            <button type="submit">save</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
