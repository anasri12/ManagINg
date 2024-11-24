import { z } from "zod";

const FullPersonalInventoryItemSchema = z.object({
  ID: z.number().int(),
  Name: z.string(),
  Brand: z.string().nullable(),
  Picture_URL: z.string().nullable(),
  Description: z.string().nullable(),
  Price: z.union([z.string(), z.number()]).nullable(),
  Amount: z.number().int(),
  Bought_From: z.string().nullable(),
  Bought_Date: z.union([z.string(), z.date()]).nullable(),
  Guarantee_Period: z.string().nullable(),
  Current_Used_Day: z.number().int().nullable(),
  Avg_Used_Day_Per_Amount: z.number().nullable(),
  EXP_BFF_Date: z.union([z.string(), z.date()]).nullable(),
  CreatedAt: z.date(),
  CreatedBy: z.string(),
  UpdatedAt: z.date(),
  UpdatedBy: z.string(),
});

const PostPersonalInventoryItemSchema = z.object({
  Name: z.string(),
  Brand: z.string().nullable().optional(),
  Picture_URL: z.string().nullable().optional(),
  Description: z.string().nullable().optional(),
  Price: z.number().nullable().optional(),
  Amount: z.number().int(),
  Bought_From: z.string().nullable().optional(),
  Bought_Date: z.union([z.string(), z.date()]).nullable().optional(),
  Guarantee_Period: z.string().nullable().optional(),
  Current_Used_Day: z.number().int().nullable().optional(),
  Avg_Used_Day_Per_Amount: z.number().nullable().optional(),
  EXP_BFF_Date: z.union([z.string(), z.date()]).nullable().optional(),
  CreatedBy: z.string(),
  UpdatedBy: z.string(),
});

const PatchPersonalInventoryItemSchema = PostPersonalInventoryItemSchema.omit({
  CreatedBy: true,
}).partial();

type FullPersonalInventoryItemInterface = z.infer<
  typeof FullPersonalInventoryItemSchema
>;

type PostPersonalInventoryItemInterface = z.infer<
  typeof PostPersonalInventoryItemSchema
>;

type PatchPersonalInventoryItemInterface = z.infer<
  typeof PatchPersonalInventoryItemSchema
>;

export const PersonalInventoryItemSchema = {
  full: FullPersonalInventoryItemSchema,
  post: PostPersonalInventoryItemSchema,
  patch: PatchPersonalInventoryItemSchema,
};

export interface PersonalInventoryItemInterface {
  full: FullPersonalInventoryItemInterface;
  post: PostPersonalInventoryItemInterface;
  patch: PatchPersonalInventoryItemInterface;
}
