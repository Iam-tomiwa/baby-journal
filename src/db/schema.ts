import {
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const children = pgTable("children", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  birthDate: date("birth_date", { mode: "string" }).notNull(),
  coverColor: text("cover_color").notNull().default("tomato"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const memories = pgTable(
  "memories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    author: text("author"),
    happenedOn: date("happened_on", { mode: "string" }).notNull(),
    mediaPublicId: text("media_public_id"),
    mediaUrl: text("media_url"),
    mediaType: text("media_type"),
    mediaWidth: integer("media_width"),
    mediaHeight: integer("media_height"),
    songUrl: text("song_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("memories_child_date_idx").on(t.childId, t.happenedOn)],
);

export const songs = pgTable(
  "songs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    title: text("title").notNull(),
    note: text("note"),
    thumbnail: text("thumbnail"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("songs_child_idx").on(t.childId)],
);

/** Small pieces of app-wide state, such as the parent passcode once it has been changed in the app. */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
