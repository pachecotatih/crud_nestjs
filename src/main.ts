import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ParseIntIdPipe } from './common/pipes/parse-int-id.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove chaves que não estão no DTO
      forbidNonWhitelisted: true, // retorna erro se houver chaves que não estão no DTO
      transform: false, // tenta transformar os tipos de dados de parâmetros e DTOs, mas a performance não é boa
    }),
    new ParseIntIdPipe(),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
