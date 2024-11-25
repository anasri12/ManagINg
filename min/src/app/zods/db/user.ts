import { z } from "zod";

const FullUserSchema = z.object({
  ID: z.string().uuid(),
  Username: z.string().min(3),
  Email: z.string().email(),
  Password_Hash: z.string(),
  Profile_Picture_URL: z.string().url().nullable(),
  CreatedAt: z.date(),
  UpdatedAt: z.date(),
  Role: z.enum(["Admin", "User", "Developer"]),
});

const PostUserSchema = z.object({
  Username: z.string().min(3, "Username must be at least 3 characters long"),
  Email: z.string().email("Invalid email address"),
  Password: z.string().min(6, "Password must be at least 6 characters long"),
  Profile_Picture_URL: z.string().url("Invalid URL").nullable().optional(),
});

const PatchUserSchema = PostUserSchema.merge(
  z.object({ Role: z.enum(["Admin", "User", "Developer"]) })
).partial();

type FullUserInterface = z.infer<typeof FullUserSchema>;

type PostUserInterface = z.infer<typeof PostUserSchema>;

type PatchUserInterface = z.infer<typeof PatchUserSchema>;

export const UserSchema = {
  full: FullUserSchema,
  post: PostUserSchema,
  patch: PatchUserSchema,
};

export interface UserInterface {
  full: FullUserInterface;
  post: PostUserInterface;
  patch: PatchUserInterface;
}
