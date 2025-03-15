import { z } from '@hono/zod-openapi';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { createMessageObjectSchema } from 'stoker/openapi/schemas';

export const ZOD_ERROR_MESSAGES = {
	REQUIRED: 'Required',
	EXPECTED_NUMBER: 'Expected number, received nan',
	NO_UPDATES: 'No updates provided',
};

export const ZOD_ERROR_CODES = {
	INVALID_UPDATES: 'invalid_updates',
};

export const notFoundSchema = createMessageObjectSchema(
	HttpStatusPhrases.NOT_FOUND,
);

export const okSchema = createMessageObjectSchema(HttpStatusPhrases.OK);

export const idParamSchema = z.object({
	id: z.coerce.number().openapi({
		param: {
			name: 'id',
			in: 'path',
			required: true,
		},
		required: ['id'],
	}),
});
