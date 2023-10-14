// This file is for , our table definitions are going

import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core' // prostgres core

// drizzle-orm -> interacting with the Databse
// drizzle-kit -> This Provide us  with utility functions to create migrations and make sure that all database is synced up with this schema here.

// let's create tables.

export const userSystemEnum = pgEnum('user_system_enum', ['system', 'user'])

// 1. Table name
// 2. colums 

export const chats = pgTable('chats', {
    id: serial('id').primaryKey(),
    pdfName: text('pdf_name').notNull(),
    pdfUrl: text('pdf_url').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userId: varchar('user_id', { length: 256 }).notNull(),
    fileKey: text('file_key').notNull() // retriving the file from AWS S3
})

export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    chatId: integer('chat_id').references(() => chats.id).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    role: userSystemEnum('role').notNull() // role is either 'system' or 'user'
})