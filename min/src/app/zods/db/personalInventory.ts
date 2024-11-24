import { PersonalInventoryItemFields } from "@/app/utils/mapfields/personalInventoryItem";
import { z } from "zod";

const InputEnableSchema = z.object({
  Enable: z
    .array(z.string())
    .nonempty()
    .refine(
      (items) =>
        items.every((item) => PersonalInventoryItemFields.includes(item)),
      {
        message: "Invalid keys in 'Enable'. Must match allowed keys.",
      }
    ),
});

const FullPersonalInventorySchema = z.object({
  ID: z.number(),
  Name: z.string(),
  Description: z.string().nullable(),
  Owner_ID: z.string(),
  Owner_Username: z.string(),
  CreatedAt: z.date(),
  UpdatedAt: z.date(),
  Input_Enable: InputEnableSchema,
  Collaborator_Number: z.number(),
  Collaborator_Username: z.array(z.string()),
  UpdatedBy: z.string(),
  UpdatedBy_Username: z.string(),
});

const PostPersonalInventorySchema = z.object({
  Name: z.string(),
  Description: z.string().nullable(),
  Owner_ID: z.string(),
  Input_Enable: InputEnableSchema,
  UpdatedBy: z.string(),
});

const PatchPersonalInventorySchema = FullPersonalInventorySchema.partial();

type FullPersonalInventoryInterface = z.infer<
  typeof FullPersonalInventorySchema
>;

type PostPersonalInventoryInterface = z.infer<
  typeof PostPersonalInventorySchema
>;

type PatchPersonalInventoryInterface = z.infer<
  typeof PatchPersonalInventorySchema
>;

export const PersonalInventorySchema = {
  full: FullPersonalInventorySchema,
  post: PostPersonalInventorySchema,
  patch: PatchPersonalInventorySchema,
};

export interface PersonalInventoryInterface {
  full: FullPersonalInventoryInterface;
  post: PostPersonalInventoryInterface;
  patch: PatchPersonalInventoryInterface;
}
