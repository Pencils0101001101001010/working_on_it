import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().min(3, "Title should be longer than 3 characters."),
  description: z.string().max(600, "Description is too long"),
});

export type NoteSchema = z.input<typeof noteSchema>;
