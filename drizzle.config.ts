import type { Config } from 'drizzle-kit';
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" })

// we can not access the process.env.DATABASE_URL because of out side src folder will not have access to the .env
// for that we need package called dotenv as above  

export default {
    driver: 'pg',
    schema: './src/lib/db/schema.ts',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL!,
    }
} satisfies Config