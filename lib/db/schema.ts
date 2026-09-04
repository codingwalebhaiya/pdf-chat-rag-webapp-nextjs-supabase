import { uuid, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";


// Reference to Supabase auth.users (not creating the table, just referencing)
export const authUsers = pgTable('auth.users', {
    id: uuid('id').primaryKey()
})


// Profiles table - will be created by Drizzle
export const profiles = pgTable('profiles',

    {

        id: uuid('id').defaultRandom().primaryKey(),
        userId: uuid('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
        name: text('name').notNull(),
        email: text('email').notNull(),
        avatarUrl: text('avatar_url'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),

    },

    (table) => {
        return {
            userIdIndex: uniqueIndex('profiles_user_id_idx').on(table.userId),
            emailIdIndex: uniqueIndex('profiles_email_id_idx').on(table.email),
        }

    }


)


//export types
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type AuthUser = typeof authUsers.$inferSelect;