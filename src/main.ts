import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ParseIntIdPipe } from './common/pipes/parse-int-id.pipe';
import appConfig from './app/config/app.config';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  const documentBuilder = new DocumentBuilder()
    .setTitle('Recados API')
    .setDescription('API para gerenciamento de recados')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, documentBuilder);

  SwaggerModule.setup('docs', app, document, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Recados API',
  });

  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
