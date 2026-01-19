import { appStoreMetadata } from "@calcom/app-store/appStoreMetaData";
import { appKeysSchemas } from "@calcom/app-store/apps.keys-schemas.generated";
import type { Prisma } from "@calcom/prisma/client";
import type { z } from "zod";

/**
 * Checks if an app has all required keys set and non-empty.
 * 
 * @param dirName - The directory name of the app
 * @param keys - The keys object from the database
 */
export async function hasRequiredAppKeys(
  dirName: string,
  keys: Prisma.JsonValue
): Promise<boolean> {
  const keySchema = appKeysSchemas[dirName as keyof typeof appKeysSchemas];
  
  // If no schema, the app doesn't require keys
  if (!keySchema) {
    return true;
  }

  const result = keySchema.safeParse(keys);

  return result.success;
}
