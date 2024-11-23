import { z } from "zod";

const FullOrganizationMemberSchema = z.object({
  ID: z.number(),
  Role: z.string(),
  Organization_Code: z.string().nullable(),
  User_ID: z.string(),
});

const PostOrganizationMemberSchema = FullOrganizationMemberSchema;

const PatchOrganizationMemberSchema = FullOrganizationMemberSchema.partial();

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

export interface OrganizationInterface {
  full: FullOrganizationMemberInterface;
  post: PostOrganizationMemberInterface;
  patch: PatchOrganizationMemberInterface;
}