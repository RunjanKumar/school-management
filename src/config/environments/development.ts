type Config = {
	PORT: number | string;
	JWT_SECRET: string | undefined;
	JWT_REFRESH_SECRET: string | undefined;
	SMTP: any;
	ADMIN_CRED: any;
	DB: any;
	HOST: string;
	PROTOCOL: string;
	SERVER_URL: string;
	SWAGGER_AUTH: any;
	CLIENT_EMAIL: string;
	PATH_TO_UPLOAD_FILES_ON_LOCAL_SERVER: string;
	AWS: Record<string, string>;
	S3_BUCKET: {
		BUCKET_NAME: string;
		ACCESS_KEY_ID: string;
		SECRET_ACCESS_KEY: string;
		REGION: string;
	};
	COMMUNICATION_EMAIL: string;
	GOOGLE_OAUTH: {
		CLIENT_ID: string;
		CLIENT_SECRET: string;
		CALLBACK_URL: string;
	};
	FRONTEND_URL: string;
};

const config: Config = {
	JWT_SECRET: process.env.JWT_SECRET,
	JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

	PROTOCOL: process.env.SERVER_PROTOCOL ?? 'http',
	HOST: process.env.SERVER_HOST ?? '0.0.0.0',
	PORT: process.env.PORT ?? 3000,
	PATH_TO_UPLOAD_FILES_ON_LOCAL_SERVER: process.env.PATH_TO_UPLOAD_FILES_ON_LOCAL_SERVER ?? 'uploads/',
	get SERVER_URL() {
		return process.env.SERVER_URL ?? `${this.PROTOCOL}://${this.HOST}:${this.PORT}`;
	},
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
		SENDER: process.env.SENDER_EMAIL ?? ''
	},
	ADMIN_CRED: {
		NAME: process.env.ADMIN_NAME ?? '',
		EMAIL: process.env.ADMIN_EMAIL ?? '',
		PASSWORD: process.env.ADMIN_PASSWORD ?? ''
	},
	SWAGGER_AUTH: {
		USERNAME: process.env.SWAGGER_AUTH_USERNAME ?? '',
		PASSWORD: process.env.SWAGGER_AUTH_PASSWORD ?? ''
	},
	DB: {
		PROTOCOL: process.env.DB_PROTOCOL ?? '',
		HOST: process.env.DB_HOST ?? '',
		PORT: process.env.DB_PORT,
		NAME: process.env.DB_NAME ?? '',
		USER: process.env.DB_USER ?? '',
		PASSWORD: process.env.DB_PASSWD ?? '',
		get DATABASE_URI() {
			return process.env.DATABASE_URI ?? `${this.PROTOCOL}://${this.HOST}:${this.PORT}/${this.NAME}`;
		}
	},
	AWS: {
		REGION: process.env.AWS_REGION ?? '',
		SES_ACCESS_ID: process.env.AWS_SES_ACCESS_ID ?? '',
		SES_SECRET_KEY: process.env.AWS_SES_SECRET_KEY ?? ''
	},
	S3_BUCKET: {
		BUCKET_NAME: process.env.S3_BUCKET_NAME ?? 'school-management-bucket',
		ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID ?? '',
		SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS ?? '',
		REGION: process.env.S3_REGION ?? ''
	},
	CLIENT_EMAIL: process.env.CLIENT_EMAIL ?? '',
	COMMUNICATION_EMAIL: process.env.COMMUNICATION_EMAIL ?? '',
	GOOGLE_OAUTH: {
		CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
		CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? '',
		CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3000/v1/auth/google/callback'
	},
	FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173'
};

export default config;
