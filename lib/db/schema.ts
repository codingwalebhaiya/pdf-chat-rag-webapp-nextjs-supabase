import { relations } from "drizzle-orm";
import {
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
    jsonb,
    index
} from "drizzle-orm/pg-core";

//Supabase Auth stores users in its special auth schema,
//  and application tables can reference those users.
export const profiles = pgTable("profiles", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().unique(), // unique ensures 1:1 relationship
    name: varchar("name", { length: 255 }).notNull(),
    email: text("email").notNull(),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(), // Tied directly to Supabase auth.users UUID
    fileName: varchar("file_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),
    fileSize: integer("file_size").notNull(),
    storagePath: text("storage_path").notNull(), // Location path in Supabase bucket
    fileStatus: text("file_status", { enum: ["pending", "processing", "complete", "failed"] }).default("pending").notNull(),
    pineconeNamespace: varchar("pinecone_namespace", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
    // add index for user id to quickly get all documents for a user
    (table) => ({
        userIndex: index("documents_user_id_idx").on(table.userId)
    })

);

export const chats = pgTable("chats", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    //  The one PDF this chat is about
    // onDelete: "cascade" → deleting the document deletes the chat too
    //   (this is fine because 1 chat = 1 doc — they're a pair)
    documentId: uuid("document_id").references(() => documents.id, { onDelete: "cascade" }).notNull(), // Which document this chat is about
    title: varchar("title", { length: 255 }).notNull(), // e.g., "Chat with Q4_Report.pdf"
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
    // add index for user id to quickly get all chats for a user
    (table) => ({
        userIndex: index("chats_user_id_idx").on(table.userId),
        documentIndex: index("chats_document_id_idx").on(table.documentId)
    })
)

export const messages = pgTable("messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    chatId: uuid("chat_id").references(() => chats.id, { onDelete: "cascade" }).notNull(),
    role: varchar("role", { enum: ["user", "assistant"] }).notNull(), // 'user' or 'ai'
    content: text("content").notNull(),
    citations: jsonb("citations").$type<{ pageNumber: number; fileName: string }[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
    // add index for chat id to quickly get all messages for a chat
    (table) => ({
        chatIndex: index("messages_chat_id_idx").on(table.chatId),
    })
)


// ─── RELATIONS
export const documentsRelations = relations(documents, ({ many }) => ({
    chats: many(chats),// 1 doc could have many chats in theory, but UI creates 1:1
}))

export const chatsRelations = relations(chats, ({ one, many }) => ({
    document: one(documents, {
        fields: [chats.documentId],
        references: [documents.id],
    }),
    messages: many(messages)
}))

export const messagesRelations = relations(messages, ({ one }) => ({
    chat: one(chats, {
        fields: [messages.chatId],
        references: [chats.id],
    })
}))

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;