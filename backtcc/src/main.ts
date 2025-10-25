import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Certifica que a pasta uploads e subpastas existem
  const uploadPath = join(__dirname, '..', 'uploads');
  const adsPath = join(uploadPath, 'ads');
  const questionsPath = join(uploadPath, 'questions');

  [uploadPath, adsPath, questionsPath].forEach((path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useStaticAssets(uploadPath, {
    prefix: '/uploads',
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Backend rodando em: http://0.0.0.0:${process.env.PORT ?? 3000}`);
}

bootstrap();
