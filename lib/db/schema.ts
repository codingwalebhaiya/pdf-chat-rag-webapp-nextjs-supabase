import {
    pgTable,
    text,
    timestamp,
    uuid,
    varchar
} from "drizzle-orm/pg-core";

// Simple profiles table - no complex indexes needed
export const profiles = pgTable("profiles", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().unique(), // unique ensures 1:1 relationship
    name: varchar("name", { length: 255 }).notNull(),
    email: text("email").notNull(),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Export types for TypeScript
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;