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

const CollaboratorsSchema = z.object({
  update: z
    .array(
      z.object({
        collaborationID: z.string().nonempty("collaborationID is required"),
        username: z.string(),
        permission: z.enum(["View", "Edit"]),
      })
    )
    .optional(),
  delete: z
    .array(
      z.object({
        collaborationID: z.string().nonempty("collaborationID is required"),
      })
    )
    .optional(),
  add: z
    .array(
      z.object({
        username: z.string(),
        permission: z.enum(["View", "Edit"]),
      })
    )
    .optional(),
});

const FullPersonalInventorySchema = z.object({
  ID: z.number(),
  Name: z.string(),
  Description: z.string().nullable(),
  Owner_ID: z.string(),
  Owner_Username: z.string().optional(),
  CreatedAt: z.date(),
  UpdatedAt: z.date(),
  Input_Enable: InputEnableSchema,
  Collaboration_ID: z.array(z.string()).optional(),
  Collaborator_Username: z.array(z.string()).optional(),
  Collaborator_Permission: z.array(z.enum(["View", "Edit"])),
  UpdatedBy: z.string(),
  UpdatedBy_Username: z.string().optional(),
});

const PostPersonalInventorySchema = z.object({
  Name: z.string(),
  Description: z.string().nullable(),
  Owner_ID: z.string(),
  Input_Enable: InputEnableSchema,
  UpdatedBy: z.string(),
});

const PatchPersonalInventorySchema = PostPersonalInventorySchema.omit({
  Owner_ID: true,
})
  .merge(
    z.object({
      Collaborator_Number: z.number().optional(),
      Collaborators: CollaboratorsSchema.optional(),
    })
  )
  .partial();

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
