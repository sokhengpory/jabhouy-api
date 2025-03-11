import type { UploadApiResponse } from 'cloudinary';
import cloudinary from './cloudinary';

export async function uploadStream(
	buffer: Buffer<ArrayBuffer>,
): Promise<UploadApiResponse> {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				resource_type: 'image',
			},
			(error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result as UploadApiResponse);
				}
			},
		);

		uploadStream.end(buffer);
	});
}
