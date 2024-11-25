import { z } from "zod";

const FullOrganizationMemberSchema = z.object({
  ID: z.number(),
  Role: z.enum(["Founder", "Admin", "Staff", "View-Only"]),
  Organization_Code: z.string(),
  User_ID: z.string(),
});

const PostOrganizationMemberSchema = z.object({
  Role: z.enum(["Founder", "Admin", "Staff", "View-Only"]),
  Organization_Code: z.string(),
  User_ID: z.string(),
});

const PatchOrganizationMemberSchema = PostOrganizationMemberSchema.pick({
  Role: true,
}).partial();

type FullOrganizationMemberInterface = z.infer<
  typeof FullOrganizationMemberSchema
>;

type PostOrganizationMemberInterface = z.infer<
  typeof PostOrganizationMemberSchema
>;

type PatchOrganizationMemberInterface = z.infer<
  typeof PatchOrganizationMemberSchema
>;

export const OrganizationMemberSchema = {
  full: FullOrganizationMemberSchema,
  post: PostOrganizationMemberSchema,
  patch: PatchOrganizationMemberSchema,
};

export interface OrganizationMemberInterface {
  full: FullOrganizationMemberInterface;
  post: PostOrganizationMemberInterface;
  patch: PatchOrganizationMemberInterface;
}
