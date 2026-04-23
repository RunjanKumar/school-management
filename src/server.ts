import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import express, { Application } from 'express';

import CONFIG from './config';
import app from './startup/app';
import { logger } from './services/logger';
import connectToDatabase from './startup/mongoStartup';

const application: Application = express();
const server = http.createServer(application);
const PORT = CONFIG.PORT ?? 3000;

const startServer = async () => {
	try {
		console.clear();
		logger.info('Starting server...');

		// 1. Connect to MongoDB first
		await connectToDatabase();

		// 2. Initialize app (routes, middleware, migrations, crons)
		logger.info('Initializing app (routes, migrations, crons)...');
		await app(application);

		// 3. Start listening only after DB + app are ready
		server
			.listen(PORT, () => {
				logger.info(`✅ Server is running on port ${PORT}`);
				console.warn(`Server is running on: http://localhost:${PORT}/documentation`);
			})
			.on('error', (error: any) => {
				logger.error(`Error occurred while starting the server: \n ${error}`);
				process.exit(1);
			});
	} catch (error: any) {
		logger.error(`Failed to start server: \n ${error}`);
		process.exit(1);
	}
};

startServer();

// ─── Graceful Shutdown (fixes EADDRINUSE on nodemon restart) ─────────────────
const gracefulShutdown = (signal: string) => {
	logger.info(`${signal} received. Shutting down gracefully...`);
	server.close(() => {
		process.exit(0);
	});
	// Force exit if server doesn't close in 3s
	setTimeout(() => process.exit(1), 3000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (error: any) => {
	logger.error(`Unhandled rejection: \n ${error}`);
	console.log(error.message);
});
