import { z } from "zod";

const FullLogSchema = z.object({
  ID: z.number().int(),
  User_ID: z.string(),
  Endpoint: z.string(),
  Method: z.enum(["GET", "POST", "PUT", "DELETE"]),
  Status: z.number().int(),
  Response_Time: z.number().int(),
  CreatedAt: z.date(),
});

const PostLogSchema = FullLogSchema.omit({
  ID: true,
  CreatedAt: true,
});

type FullLogInterface = z.infer<typeof FullLogSchema>;
type PostLogInterface = z.infer<typeof PostLogSchema>;

export const LogSchema = {
  full: FullLogSchema,
  post: PostLogSchema,
};

export type LogInterface = {
  full: FullLogInterface;
  post: PostLogInterface;
};
