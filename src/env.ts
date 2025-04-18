import { z } from 'zod';

const EnvSchema = z.object({
	NODE_ENV: z.string().default('development'),
	LOG_LEVEL: z.enum([
		'fatal',
		'error',
		'warn',
		'info',
		'debug',
		'trace',
		'silent',
	]),
	DATABASE_URL: z.string().url(),
	DATABASE_AUTH_TOKEN: z.string().optional(),
	BETTER_AUTH_SECRET: z.string(),
	CLOUDINARY_CLOUD_NAME: z.string(),
	CLOUDINARY_API_KEY: z.string(),
	CLOUDINARY_API_SECRET: z.string(),
});

export type Environment = z.infer<typeof EnvSchema>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function parseEnv(data: any) {
	const { data: env, error } = EnvSchema.safeParse(data);

	if (error) {
		const errorMessage = `❌ Invalid env - ${Object.entries(
			error.flatten().fieldErrors,
		)
			.map(([key, errors]) => `${key}: ${errors.join(',')}`)
			.join(' | ')}`;
		throw new Error(errorMessage);
	}

	return env;
}
