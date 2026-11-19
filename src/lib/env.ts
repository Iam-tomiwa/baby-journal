/** Server-side configuration checks. Never import this from a Client Component. */
export const hasDatabase = Boolean(process.env.DATABASE_URL);

export const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET,
);

export const hasPasscode = Boolean(process.env.PARENT_PASSCODE);
