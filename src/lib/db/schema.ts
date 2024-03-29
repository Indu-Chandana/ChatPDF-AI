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

// get the typeof chat
export type DrizzleChat = typeof chats.$inferSelect;

export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    chatId: integer('chat_id').references(() => chats.id).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    role: userSystemEnum('role').notNull() // role is either 'system' or 'user'
})

// schema to store records of whether a user has paid for the pro subdcription or not.
// export new table 
export const userSubscriptions = pgTable('user_subscriptions', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 256 }).notNull().unique(),
    stripeCustomerId: varchar('stripe_customer_id', { length: 256 }).notNull().unique(),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 256 }).unique(),
    stripePriceId: varchar('stripe_price_id', { length: 256 }),
    stripeCurrentPeriodEnd: timestamp('stripe_current_period_end')
})
// now we need to push it to our DB 'npx drizzle-kit push:pg' run on the terminal.
// after that new DB has been created within the neonDB