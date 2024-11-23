import { z } from "zod";

export const QueryOnlySchema = z.object({
  fields: z.string().optional().nullable(),
});

export const QueryUserSchema = z.object({
  role: z.enum(["Admin", "User", "Developer"]).optional().nullable(),
  username: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  fields: z.string().optional().nullable(),
});

export const QueryOrganizationSchema = z.object({
  code: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  founder: z.string().optional().nullable(),
  fields: z.string().optional().nullable(),
});

export const QueryOrganizationMemberSchema = z.object({
  id: z.number().int().optional().nullable(),
  role: z.enum(["Admin", "User", "Developer"]).optional().nullable(),
  organization_code: z.string().optional().nullable(),
  user_id: z.string().optional().nullable(),
  fields: z.string().optional().nullable(),
});
