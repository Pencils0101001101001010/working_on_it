// @ts-nocheck
import Note from "../models/Notes.js";

export const getNotes = async (req, res) => {
  //get all notes that belongs to the user logged in
  try {
    const notes = await Note.find({ user: req.user.userId });

    if (notes.length === 0) {
      return res.status(204).json([]);
    }

    return res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//create new note for logged in users
export const createNote = async (req, res) => {
  try {
    const { title, description } = req.body;

    const newNote = await Note.create({
      user: req.user.userId, //extract user from req
      title,
      description,
    });

    return res.status(201).json({ message: newNote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get a single note (ensuring it belongs to the user)
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!note) {
      return res
        .status(404)
        .json({ message: "Note not found or unauthorized" });
    }

    return res.status(200).json(note);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//update note ensuring it belongs to user
export const updateNote = async (req, res) => {
  try {
    const updateNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId }, //enforce ownership
      req.body,
      { new: true, runValidators: true },
    );

    if (!updateNote) {
      return res
        .status(404)
        .json({ message: "Note not found or unauthorized" });
    }

    return res.status(200).json(updateNote);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//delete a note ensuring ownership
export const deleteNote = async (req, res) => {
  try {
    const deletedNote = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!deletedNote) {
      return res
        .status(404)
        .json({ message: "Note not found or unauthorized" });
    }

    return res.status(200).json({ message: "Note successfully deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
