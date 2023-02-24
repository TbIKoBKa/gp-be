import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'class-validator';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const configService = app.get(ConfigService);

  const baseUrl = configService.get<string>('FE_URL', 'http://localhost:3000');

  app.enableCors({
    origin:
      process.env.NODE_ENV === 'development'
        ? [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://0.0.0.0:3000',
          ]
        : [baseUrl],
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.set('trust proxy', true);

  const options = new DocumentBuilder()
    .setTitle('GP')
    .setDescription('API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  await app
    .startAllMicroservices()
    .then(() => console.info(`API server service started`));

  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  if (nodeEnv === 'production' || nodeEnv === 'staging') {
    app.enableShutdownHooks();
  }

  const port = configService.get<number>('PORT', 3001);

  await app.listen(port, () => {
    console.info(`API server is running on ${port} port`);
  });
}

void bootstrap();
