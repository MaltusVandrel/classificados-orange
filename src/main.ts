import './bootstrap';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppModule } from './app/app.module';

const cookieParser = require('cookie-parser');

function resolveDir(name: string): string {
  const direct = join(__dirname, name);
  if (existsSync(direct)) {
    return direct;
  }
  return join(__dirname, 'src', name);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.useStaticAssets(resolveDir('assets'));
  app.setBaseViewsDir(resolveDir('views'));
  app.setViewEngine('hbs');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}`,
  );
}

bootstrap();
