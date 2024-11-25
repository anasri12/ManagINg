import { z } from "zod";

const FullReportSchema = z.object({
  ID: z.number().int(),
  User_ID: z.string(),
  Message: z.string(),
  Status: z.enum(["Open", "Resolved"]),
  CreatedAt: z.date(),
  ResolvedAt: z.date(),
  ResolvedByAdmin: z.string(),
  Response: z.string().nullable(),
});

const PostReportSchema = FullReportSchema.pick({
  User_ID: true,
  Message: true,
});

const PatchReportSchema = FullReportSchema.omit({
  ID: true,
  User_ID: true,
  CreatedAt: true,
}).partial();

type FullReportInterface = z.infer<typeof FullReportSchema>;

type PostReportInterface = z.infer<typeof PostReportSchema>;

type PatchReportInterface = z.infer<typeof PatchReportSchema>;

export const ReportSchema = {
  full: FullReportSchema,
  post: PostReportSchema,
  patch: PatchReportSchema,
};

export interface ReportInterface {
  full: FullReportInterface;
  post: PostReportInterface;
  patch: PatchReportInterface;
}
