export default {
	UPLOAD_TO_S3_BUCKET: process.env.UPLOAD_TO_S3_BUCKET === 'true',
	PATH_TO_UPLOAD_FILES_ON_LOCAL: process.env.PATH_TO_UPLOAD_FILES_ON_LOCAL ?? 'uploads',

	PROTOCOL: process.env.SERVER_PROTOCOL ?? 'http',
	HOST: process.env.SERVER_HOST ?? '0.0.0.0',
	PORT: process.env.PORT ?? 3000,
	PATH_TO_UPLOAD_FILES_ON_LOCAL_SERVER: process.env.PATH_TO_UPLOAD_FILES_ON_LOCAL_SERVER ?? 'uploads/',
	get SERVER_URL() {
		return process.env.SERVER_URL ?? `${this.PROTOCOL}://${this.HOST}:${this.PORT}`;
	},
	DB: {
		PROTOCOL: process.env.DB_PROTOCOL ?? 'mongodb',
		HOST: process.env.DB_HOST ?? '127.0.0.1',
		PORT: process.env.DB_PORT ?? 27017,
		NAME: process.env.DB_NAME ?? 'adminBoilerplate',
		USER: process.env.DB_USER ?? '',
		PASSWORD: process.env.DB_PASSWORD ?? '',
		get DATABASE_URI() {
			return process.env.DATABASE_URI ?? `${this.PROTOCOL}://${this.HOST}:${this.PORT}/${this.NAME}`;
		}
	},
	ZENDESK: {
		ZENDESK_SUBDOMAIN: process.env.ZENDESK_SUBDOMAIN ?? 'subdomain',
		ZENDESK_EMAIL: process.env.ZENDESK_EMAIL ?? 'email',
		ZENDESK_API_TOKEN: process.env.ZENDESK_API_TOKEN ?? 'api-token'
	},
	JWT_SECRET: process.env.JWT_SECRET,
	JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
	SMTP: {
		TRANSPORT: {
			host: process.env.SMTP_HOST ?? 'smtp-relay.brevo.com',
			port: process.env.SMTP_PORT ?? 587,
			secure: false,
			auth: {
				user: process.env.SMTP_USER ?? '',
				pass: process.env.SMTP_PASSWORD ?? ''
			},
			tls: { rejectUnauthorized: false }
		},
		SENDER: process.env.SENDER_EMAIL ?? 'test.user@yopmail.com'
	},
	S3_BUCKET: {
		REGION: process.env.S3_REGION ?? 'region',
		ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID ?? 'access-key-id',
		SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY ?? 'secret-access-key',
		BUCKET_NAME: process.env.S3_BUCKET_NAME ?? 'bucket-name',
		CLOUDFRONT_URL: process.env.CLOUDFRONT_URL ?? 'cloudfront-url'
	},
	ADMIN_CRED: {
		NAME: process.env.ADMIN_NAME ?? 'Admin',
		EMAIL: process.env.ADMIN_EMAIL ?? 'admin@yopmail.com',
		PASSWORD: process.env.ADMIN_PASSWORD ?? '123456'
	},
	SWAGGER_AUTH: {
		USERNAME: process.env.SWAGGER_AUTH_USERNAME ?? 'username',
		PASSWORD: process.env.SWAGGER_AUTH_PASSWORD ?? 'password'
	},
	APPLE_KEYS_URL: process.env.APPLE_KEYS_URL ?? 'https://appleid.apple.com/auth/keys',
	AI_BASE_URL: process.env.AI_BASE_URL ?? 'http://localhost:5000',
	AI_BASE_URL_LOCAL: process.env.AI_BASE_URL_LOCAL ?? 'http://localhost:5000',
	AI_MEASURE_URL: process.env.AI_MEASURE_URL ?? 'http://localhost:8000',
	LEFFA_AI_BASE_URL: process.env.LEFFA_AI_BASE_URL ?? 'http://localhost:5000',
	CLOUDFRONT_URL: process.env.CLOUDFRONT_URL ?? 'https://your-cloudfront-url.cloudfront.net',
	FILE_BASE_URL: process.env.UPLOAD_TO_S3_BUCKET ? process.env.CLOUDFRONT_URL : process.env.PATH_TO_UPLOAD_FILES_ON_LOCAL,
	AI_API_ACCESS_KEY: process.env.AI_API_ACCESS_KEY ?? 'sample-access-key',
	DUMMY_DATA_FOR_TRY_ON: process.env.DUMMY_DATA_FOR_TRY_ON === '1',
	DUMMY_DATA_FOR_MEASUREMENT: process.env.DUMMY_DATA_FOR_MEASUREMENT === '1',
	OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? 'your-openai-api-key',
	IS_DUMMY_DATA_FOR_GARMENT_ANALYSIS: process.env.DUMMY_DATA_FOR_GARMENT_ANALYSIS === '1',
	CLIENT_EMAIL: process.env.CLIENT_EMAIL ?? 'adminboilerplate@yopmail.com',
	AWS: {
		REGION: process.env.AWS_REGION ?? '',
		SES_ACCESS_ID: process.env.AWS_SES_ACCESS_ID ?? '',
		SES_SECRET_KEY: process.env.AWS_SES_SECRET_KEY ?? ''
	},
	COMMUNICATION_EMAIL: process.env.COMMUNICATION_EMAIL ?? '',
	GOOGLE_OAUTH: {
		CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
		CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? '',
		CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3000/v1/auth/google/callback'
	},
	FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173'
};
