import { z } from "zod";

export const SessionSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  profilePictureUrl: z.string().url("Invalid URL").nullable().optional(),
});

export type SessionInterface = z.infer<typeof SessionSchema>;
