import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // cria pastas de upload se não existirem
  const uploadPath = join(__dirname, '..', 'uploads', 'questions');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // cast para NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  // serve arquivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // para acessar como http://IP:3000/uploads/nomeDaImagem.jpg
  });
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Backend rodando em: http://0.0.0.0:${process.env.PORT ?? 3000}`);
}
bootstrap();
