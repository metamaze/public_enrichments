import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as Sentry from '@sentry/node';
import bodyParser from 'body-parser';
import { AppModule } from './app.module';
import env from './env';

async function bootstrap() {
  if (!['local', 'development'].includes(env.NODE_ENV)) Sentry.init({ dsn: env.SENTRY_DSN });
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true
  });

  app.use(bodyParser.json({ limit: '200mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));

  await app.listen(env.PORT);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
