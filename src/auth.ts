import { APIError, betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { createAuthMiddleware, openAPI, username } from "better-auth/plugins";

export const auth = betterAuth({
  database: {
    type: "sqlite",
    dialect: new LibsqlDialect({
      url: process.env.DATABASE_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    }),
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [username(), openAPI()],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 4,
  },
  trustedOrigins: ["http://localhost:5173"],
});
