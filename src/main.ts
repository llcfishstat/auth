import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { AppModule } from './app/app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule, new ExpressAdapter(express()));

    const configService = app.get(ConfigService);
    const expressApp = app.getHttpAdapter().getInstance();

    app.use(cookieParser());

    const corsOrigin = configService.get<string>('app.corsOrigin') || '*';
    const allowedOrigins = [corsOrigin, 'http://localhost:8888'];
    app.enableCors({
        origin: allowedOrigins,
        methods: 'GET,POST,PUT,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Authorization',
        credentials: true,
    });

    expressApp.get('/', (_req: Request, res: Response) => {
        res.status(200).json({
            status: 200,
            message: `Hello from ${configService.get('app.name')}`,
            timestamp: new Date().toISOString(),
        });
    });

    const port: number = configService.get<number>('app.http.port', 3000);
    const host: string = configService.get<string>('app.http.host', '0.0.0.0');
    const globalPrefix: string = configService.get<string>('app.globalPrefix', 'api');
    const versioningPrefix: string = configService.get<string>('app.versioning.prefix', 'v');
    const version: string = configService.get<string>('app.versioning.version', '1');
    const versionEnable: boolean = configService.get<boolean>('app.versioning.enable', true);

    app.use(helmet());
    logger.log('✅ Helmet enabled for security');
    app.useGlobalPipes(new ValidationPipe());
    logger.log('✅ Validation pipe enabled');
    app.setGlobalPrefix(globalPrefix);
    logger.log(`✅ Global prefix set to: ${globalPrefix}`);

    if (versionEnable) {
        app.enableVersioning({
            type: VersioningType.URI,
            defaultVersion: version,
            prefix: versioningPrefix,
        });
        logger.log(
            `✅ API versioning enabled with prefix: ${versioningPrefix}, default version: ${version}`,
        );
    }

    setupSwagger(app);

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [configService.get<string>('rmq.uri')],
            queue: configService.get<string>('rmq.auth'),
            queueOptions: {
                durable: true,
                autoDelete: false,
            },
            prefetchCount: 1,
        },
    });
    await app.startAllMicroservices();
    await app.listen(port, host);
    logger.log(
        `🚀 ${configService.get('app.name')} service started successfully on ${host}:${port}`,
    );
}
bootstrap();
