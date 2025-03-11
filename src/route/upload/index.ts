import { OpenAPIHono } from '@hono/zod-openapi';
import type { AppBindings } from '~/lib/type';
import { uploadImageHandler, uploadImageRoute } from './upload-image';

export const uploadRouter = new OpenAPIHono<AppBindings>();

uploadRouter.openapi(uploadImageRoute, uploadImageHandler);
