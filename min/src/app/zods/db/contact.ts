import { z } from "zod";

const FullContactSchema = z.object({
  ID: z.number().int(),
  Admin_ID: z.string(),
  Message: z.string(),
  Status: z.enum(["Open", "Resolved"]),
  CreatedAt: z.date(),
  ResolvedAt: z.date(),
  ResolvedByDev: z.string(),
  Response: z.string().nullable(),
});

const PostContactSchema = FullContactSchema.pick({
  Admin_ID: true,
  Message: true,
});

const PatchContactSchema = FullContactSchema.omit({
  ID: true,
  Admin_ID: true,
  CreatedAt: true,
}).partial();

type FullContactInterface = z.infer<typeof FullContactSchema>;

type PostContactInterface = z.infer<typeof PostContactSchema>;

type PatchContactInterface = z.infer<typeof PatchContactSchema>;

export const ContactSchema = {
  full: FullContactSchema,
  post: PostContactSchema,
  patch: PatchContactSchema,
};

export interface ContactInterface {
  full: FullContactInterface;
  post: PostContactInterface;
  patch: PatchContactInterface;
}
