"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Loading from "../(loading spinner)/Loading";
import toast from "react-hot-toast";
import "./styles.css";

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
  // state to trigger open modal
  const [editModal, setEditModal] = useState(false);
  // state to edit note
  const [editNote, setEditNote] = useState<Note | null>(null);
  // to pass edited title and description to backend
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const getNotes = async () => {
    try {
      setLoading(true);
      // fetch all notes
      const response = await fetch(`${baseUrl}/api/notes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        if (response.status === 204) {
          setError("You have no notes, create now");
          return setLoading(false);
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
       * This code loops through  current list of notes in the browser and creates a new array that leaves out the one  just deleted. React then instantly updates the screen with this filtered list so the deleted note vanishes without needing to reload the page.
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
    //pass data to note edit state
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

      //Optimistic UI Update, buy comparing the previous state and updated state we can update the ui immediately
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
    <div className="noteBodyContainer">
      <div className="noteHeader">
        <span className="pageTitle">Notes</span>
        {loading && <Loading />}

        <Link href={"/createNote"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            fill="currentColor"
            className="bi bi-patch-plus-fill addNoteIconStyle"
            viewBox="0 0 16 16"
          >
            <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zM8.5 6v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 1 0" />
          </svg>
        </Link>
      </div>

      {notes.map((n) => (
        <div key={n._id} className="cardStyle">
          <div className="noteTitleAndDescription">
            {" "}
            <span className="cardTitleStyle">{n.title}</span>
            <span className="cardDescriptionStyle">{n.description}</span>
          </div>

          <div className="noteDelAndCreateBtn">
            <span className="deleteButton">
              <button onClick={() => handleDeleteNote(n._id)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  fill="currentColor"
                  className="bi bi-trash-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                </svg>
              </button>
            </span>
            <span className="editButton">
              <button onClick={() => handleOpenEdit(n)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  fill="currentColor"
                  className="bi bi-pencil"
                  viewBox="0 0 16 16"
                >
                  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                </svg>
              </button>
            </span>
          </div>
        </div>
      ))}

      {editModal && (
        <div className="modalBackdrop" onClick={closeEditModal}>
          {/* stopPropagation prevents clicking inside the form from closing the modal */}
          <div className="modalBody" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleEditSubmit} className="formBodySection">
              <div className="formHeader">
                <h3>Edit Note</h3>
                <button
                  type="button"
                  className="closeButton"
                  onClick={closeEditModal}
                >
                  ✕
                </button>
              </div>

              <label className="formInputTitle">Change Title:</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="inputsStlForms"
              />

              <label className="formInputTitle">Change Description:</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                required
                className="inputsStlForms"
              />

              <button type="submit" className="saveButton">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
