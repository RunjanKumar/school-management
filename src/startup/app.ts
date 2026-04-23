import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import healthcheck from 'express-healthcheck';
import express, { Application, Request, Response, NextFunction } from 'express';

import { routes } from '../routes/api';
import routeUtils from '../utils/routeUtils';
import { requestLogger } from '../middleware/requestLogger';
import runMigrations from '../utils/dbMigration';
import runCrons from '../startup/cron';
import config from '../config';

export default async (app: Application) => {
	/** middleware for each api call to logging **/
	console.log('config.FRONTEND_URL', config.FRONTEND_URL);

	const allowedOrigins = [ config.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174' ];

	// CORS — must be the VERY FIRST middleware, before requestLogger
	app.use(
		cors({
			origin: allowedOrigins,
			credentials: true,
			methods: [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS' ],
			allowedHeaders: [ 'Content-Type', 'Authorization', 'x-api-key' ],
			exposedHeaders: [ 'set-cookie' ]
		})
	);

	// Explicitly handle every OPTIONS preflight so Express never 404s them
	app.options(
		'*',
		cors({
			origin: allowedOrigins,
			credentials: true,
			methods: [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS' ],
			allowedHeaders: [ 'Content-Type', 'Authorization', 'x-api-key' ],
			exposedHeaders: [ 'set-cookie' ]
		})
	);

	app.use(requestLogger);
	app.use(cookieParser());

	// Middleware
	app.use(express.json({ limit: '50mb' }));
	app.use(express.urlencoded({ extended: true, limit: '50mb' }));

	// initalize routes.
	await routeUtils.route(app, routes);

	app.use('/swagger', express.static(path.join(__dirname, '../../swagger.json')));
	// serve static folder.
	app.use('/health', healthcheck({ healthy: () => ({ status: 'healthy' }) }));

	app.use('/public', express.static('public'));

	app.use('/uploads', express.static('uploads'));

	// Run migrations
	await runMigrations();

	// Run crons
	await runCrons();
};
