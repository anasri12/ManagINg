import { z } from "zod";

const FullCollaborationSchema = z.object({
  ID: z.number().int(),
  Permission: z.enum(["View", "Edit"]),
  Status: z.enum(["Pending", "Accepted", "Rejected"]),
  Inventory_ID: z.number().int(),
  Inventory_Name: z.string(),
  Owner_ID: z.string(),
  Owner_Username: z.string(),
  Collaborator_ID: z.string(),
  Collaborator_Username: z.string(),
  CreatedAt: z.date(),
  ResolvedAt: z.date().nullable(),
});

const QueryCollaborationSchema = FullCollaborationSchema.partial();

const PostCollaborationSchema = z.object({
  Permission: z.enum(["View", "Edit"]),
  Status: z.enum(["Pending", "Accepted", "Rejected"]).optional(),
  Inventory_ID: z.number().int(),
  Owner_ID: z.string(),
  Collaborator_ID: z.string().nullable().optional(),
  Collaborator_Username: z.string(),
});

const PatchCollaborationSchema = PostCollaborationSchema.pick({
  Permission: true,
  Status: true,
})
  .merge(z.object({ ResolvedAt: z.date() }))
  .partial();

type FullCollaborationInterface = z.infer<typeof FullCollaborationSchema>;

type QueryCollaborationInterface = z.infer<typeof QueryCollaborationSchema>;

type PostCollaborationInterface = z.infer<typeof PostCollaborationSchema>;

type PatchCollaborationInterface = z.infer<typeof PatchCollaborationSchema>;

export const CollaborationSchema = {
  full: FullCollaborationSchema,
  query: QueryCollaborationSchema,
  post: PostCollaborationSchema,
  patch: PatchCollaborationSchema,
};

export interface CollaborationInterface {
  full: FullCollaborationInterface;
  query: QueryCollaborationInterface;
  post: PostCollaborationInterface;
  patch: PatchCollaborationInterface;
}
