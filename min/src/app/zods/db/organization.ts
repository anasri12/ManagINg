import { z } from "zod";

const FullOrganizationSchema = z.object({
  Code: z.string(),
  Name: z.string(),
  Description: z.string().nullable(),
  CreatedAt: z.date(),
  UpdatedAt: z.date(),
  Member_Number: z.number().int(),
  Inventory_Number: z.number().int(),
  Founder_ID: z.string(),
  UpdatedBy: z.string(),
});

const PostOrganizationSchema = z.object({
  Name: z.string(),
  Description: z.string().nullable(),
  Inventory_Number: z.number().int(),
  Founder_ID: z.string(),
  UpdatedBy: z.string(),
});

const PatchOrganizationSchema = PostOrganizationSchema.omit({
  Founder_ID: true,
})
  .merge(z.object({ Member_Number: z.number().int() }))
  .partial();

type FullOrganizationInterface = z.infer<typeof FullOrganizationSchema>;

type PostOrganizationInterface = z.infer<typeof PostOrganizationSchema>;

type PatchOrganizationInterface = z.infer<typeof PatchOrganizationSchema>;

export const OrganizationSchema = {
  full: FullOrganizationSchema,
  post: PostOrganizationSchema,
  patch: PatchOrganizationSchema,
};

export interface OrganizationInterface {
  full: FullOrganizationInterface;
  post: PostOrganizationInterface;
  patch: PatchOrganizationInterface;
}
