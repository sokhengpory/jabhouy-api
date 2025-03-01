import { LibsqlDialect } from '@libsql/kysely-libsql';
import { betterAuth } from 'better-auth';
import { openAPI, username } from 'better-auth/plugins';

const dialect = new LibsqlDialect({
	url: process.env.DATABASE_URL || '',
	authToken: process.env.DATABASE_AUTH_TOKEN || '',
});

export const auth = betterAuth({
	database: {
		type: 'sqlite',
		dialect,
	},
	secret: process.env.BETTER_AUTH_SECRET,
	basePath: '/auth',
	plugins: [username(), openAPI()],
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 4,
	},
});
