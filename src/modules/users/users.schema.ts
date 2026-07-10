import { z } from "zod";

export const UserBaseSchema = z.object({
  name: z.string().min(1),
  is_active: z.boolean().default(true),
});

export const UserCreateSchema = UserBaseSchema.extend({
  created_by_user_id: z.number(),
});

export const UserUpdateSchema = UserBaseSchema.partial().extend({
  updated_by_user_id: z.number().optional(),
});

export type UserCreateDTO = z.infer<typeof UserCreateSchema>;
export type UserUpdateDTO = z.infer<typeof UserUpdateSchema>;
export type User = z.infer<typeof UserBaseSchema> & { id: number };
