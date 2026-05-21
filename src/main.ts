import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ParseIntIdPipe } from './common/pipes/parse-int-id.pipe';
import appConfig from './app/config/app.config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appConfig(app);

  if (process.env.NODE_ENV === 'production') {
    // helmet -> cabeçalho de segurança no protocolo HTTP
    app.use(helmet());

    // cors -> permitir que outro domínio faça requests na nossa API
    app.enableCors({
      origin: 'https://meuapp.com.br',
    });
  }

  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
