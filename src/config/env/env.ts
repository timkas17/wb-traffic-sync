import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.union([z.undefined(), z.enum(["development", "production"])]),
    POSTGRES_HOST: z.union([z.undefined(), z.string()]),
    POSTGRES_PORT: z
        .string()
        .regex(/^[0-9]+$/)
        .transform((value) => parseInt(value)),
    POSTGRES_DB: z.string(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    APP_PORT: z.union([
        z.undefined(),
        z
            .string()
            .regex(/^[0-9]+$/)
            .transform((value) => parseInt(value)),
    ]),

    //Tokens for Google Sheets and Wildberries API
    WB_API_URL: z.string(),
    WB_API_TOKEN: z.string(),
    GOOGLE_TOKEN: z.string(),
    GOOGLE_SHEETS_IDS: z
        .string()
        .default("")
        .transform((value) => 
            value
                .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        ),
});

const env = envSchema.parse({
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    NODE_ENV: process.env.NODE_ENV,
    APP_PORT: process.env.APP_PORT,
    GOOGLE_SHEETS_IDS: process.env.GOOGLE_SHEETS_IDS,
    GOOGLE_TOKEN: process.env.GOOGLE_TOKEN,
    WB_API_URL: process.env.WB_API_URL,
    WB_API_TOKEN: process.env.WB_API_TOKEN,
});

export default env;
