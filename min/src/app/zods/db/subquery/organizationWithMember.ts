import { z } from "zod";

export const OrganizationWithMemberSchema = z.object({
  Code: z.string(),
  Name: z.string(),
  Description: z.string().nullable(),
  CreatedAt: z.date(),
  UpdatedAt: z.date().optional(),
  Member_Number: z.number().int(),
  Inventory_Number: z.number().int(),
  Founder_ID: z.string(),
  UpdatedBy: z.string().nullable(),
  ID: z.number(),
  Role: z.string(),
  Organization_Code: z.string().nullable(),
  User_ID: z.string(),
});

export type OrganizationWithMemberInterface = z.infer<
  typeof OrganizationWithMemberSchema
>;
