import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.set('trust proxy', true);
  app.enableShutdownHooks();

  const feUrl = config.get<string>('FE_URL', 'http://localhost:3000');
  const isDev = process.env.NODE_ENV === 'development';

  app.enableCors({
    origin: isDev ? true : [feUrl],
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });

  if (isDev) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('GoPlay API')
      .setVersion('1.0')
      .addCookieAuth('access_token', { type: 'apiKey' })
      .build();

    SwaggerModule.setup('swagger', app, SwaggerModule.createDocument(app, swaggerConfig));
  }

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);
}

void bootstrap();
