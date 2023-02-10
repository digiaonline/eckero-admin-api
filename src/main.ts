import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import helmet from 'helmet';
import {AppModule} from './app.module';
import {LoggerService} from '@utils/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {bufferLogs: true});
  app.enableVersioning();
  app.use(helmet());
  app.useLogger(await app.resolve(LoggerService));
  await app.listen(8080);
}
bootstrap();
