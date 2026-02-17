import { z } from "zod/v4";

import { ApiError } from "./api-error";

export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = z.prettifyError(result.error);

    throw ApiError.badRequest(message);
  }

  return result.data;
}
