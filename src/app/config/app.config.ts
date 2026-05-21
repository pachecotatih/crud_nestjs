import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ParseIntIdPipe } from 'src/common/pipes/parse-int-id.pipe';

export default (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove chaves que não estão no DTO
      forbidNonWhitelisted: true, // retorna erro se houver chaves que não estão no DTO
      transform: false, // tenta transformar os tipos de dados de parâmetros e DTOs, mas a performance não é boa
    }),
    new ParseIntIdPipe(),
  );
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get('Reflector')),
  );
};
