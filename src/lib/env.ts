/** Server-side configuration checks. Never import this from a Client Component. */
export const hasDatabase = Boolean(process.env.DATABASE_URL);

export const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET,
);

/** Whether a starting passcode is set in the environment. One changed in the app lives in the database. */
export const hasEnvPasscode = Boolean(process.env.PARENT_PASSCODE);
