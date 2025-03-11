import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import type { AppRouteHandler } from '~/lib/type';
import { uploadStream } from '~/lib/upload';

const successResponseSchema = z.object({
	url: z.string(),
	public_id: z.string(),
});

const errorResponseSchema = z.object({
	message: z.string(),
});

export const uploadImageRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Upload'],
	request: {
		body: {
			required: true,
			content: {
				'multipart/form-data': {
					schema: z.object({
						image: z.instanceof(File).describe('Image file to upload'),
					}),
				},
			},
			description: 'Upload image request',
		},
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			successResponseSchema,
			'Uploaded image details',
		),
		[HttpStatusCodes.BAD_REQUEST]: jsonContent(
			errorResponseSchema,
			'Bad request error',
		),
		[HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
			errorResponseSchema,
			'Upload error response',
		),
	},
});

export const uploadImageHandler: AppRouteHandler<
	typeof uploadImageRoute
> = async (c) => {
	const { image } = c.req.valid('form');

	if (!image || !image.size) {
		return c.json(
			{
				message: 'No image file provided',
			},
			HttpStatusCodes.BAD_REQUEST,
		);
	}

	try {
		const buffer = Buffer.from(await image.arrayBuffer());
		const uploadResult = await uploadStream(buffer);

		return c.json(
			{
				url: uploadResult.secure_url,
				public_id: uploadResult.public_id,
			},
			HttpStatusCodes.OK,
		);
	} catch (error) {
		c.var.logger.error('Failed to upload image:', error);
		return c.json(
			{
				message: 'Failed to upload image',
			},
			HttpStatusCodes.INTERNAL_SERVER_ERROR,
		);
	}
};
