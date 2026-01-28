import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: varchar("username"),
  avatar_url: varchar("avatar_url"),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey(),
  user_id: varchar("user_id"),            // supporter
  related_user_id: varchar("related_user_id"), // host/streamer
  stream_id: varchar("stream_id"),
  type: varchar("type"),
  currency: varchar("currency"),
  amount: integer("amount"),
  created_at: timestamp("created_at").defaultNow(),
});
