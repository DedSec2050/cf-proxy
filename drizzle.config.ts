import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
	schema: './src/db/schema.ts',
	out: './drizzle/migrations',
	driver: 'd1-http',
	dialect: 'sqlite',
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
		token: process.env.CLOUDFLARE_API_TOKEN!,
	},
};
