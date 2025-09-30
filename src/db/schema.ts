import { pgTable, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';

export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: text('url').notNull().unique(),
  runId: text('run_id'), // Parallel.ai task run ID
  status: text('status').notNull().default('pending'), // pending, processing, completed, failed
  response: jsonb('response'), // Store the full Parallel.ai response
  error: text('error'), // Store any error messages
  fitScore: text('fit_score'), // OpenAI extracted score (1-10)
  pitch: text('pitch'), // OpenAI generated pitch
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
