import { z } from "zod";

export const UserIDSchema = z.object({
  userID: z.string().min(3, "Username must be at least 3 characters long"),
});

export type UserIDType = z.infer<typeof UserIDSchema>;