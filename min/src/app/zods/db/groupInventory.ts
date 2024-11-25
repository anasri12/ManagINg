import { GroupInventoryFields } from "@/app/utils/mapfields/groupInventory";
import { z } from "zod";

const InputEnableSchema = z.object({
  Enable: z
    .array(z.string())
    .nonempty()
    .refine(
      (items) => items.every((item) => GroupInventoryFields.includes(item)),
      {
        message: "Invalid keys in 'Enable'. Must match allowed keys.",
      }
    ),
});

const FullGroupInventorySchema = z.object({
  ID: z.number(),
  Name: z.string(),
  Description: z.string().nullable(),
  Input_Enable: InputEnableSchema,
  CreatedAt: z.date(),
  CreatedBy: z.number(),
  Created_Username: z.string(),
  UpdatedAt: z.date(),
  UpdatedBy: z.number(),
  UpdatedBy_Username: z.string(),
  Organization_Code: z.string(),
});

const PostGroupInventorySchema = z.object({
  Name: z.string(),
  Description: z.string().nullable().optional(),
  Input_Enable: InputEnableSchema,
  CreatedBy: z.string(),
  Organization_Code: z.string(),
});

const PatchGroupInventorySchema = z.object({
  Name: z.string(),
  Description: z.string().nullable().optional(),
  Input_Enable: InputEnableSchema,
  UpdatedBy: z.number(),
});

type FullGroupInventoryInterface = z.infer<typeof FullGroupInventorySchema>;

type PostGroupInventoryInterface = z.infer<typeof PostGroupInventorySchema>;

type PatchGroupInventoryInterface = z.infer<typeof PatchGroupInventorySchema>;

export const GroupInventorySchema = {
  full: FullGroupInventorySchema,
  post: PostGroupInventorySchema,
  patch: PatchGroupInventorySchema,
};

export interface GroupInventoryInterface {
  full: FullGroupInventoryInterface;
  post: PostGroupInventoryInterface;
  patch: PatchGroupInventoryInterface;
}
