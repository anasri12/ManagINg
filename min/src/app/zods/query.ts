import { z } from "zod";

export const QueryUserSchema = z.object({
  role: z.enum(["Admin", "User", "Developer"]).optional().nullable(),
  username: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  fields: z.string().optional().nullable(),
});
