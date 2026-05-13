import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecadosModule } from 'src/recados/recados.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import { SimpleMiddleware } from 'src/common/middlewares/simple.middleware';
import { AnotherMiddleware } from 'src/common/middlewares/another.middleware';
// TypeOrmModule.forRoot() -> para raiz da aplicação
@Module({
  imports: [
    RecadosModule,
    PessoasModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'tatiana123',
      database: 'crud_nest',
      autoLoadEntities: true, // carrega automaticamente as entidades do projeto sem especificá-las
      synchronize: true, // Sincroniza com o banco de dados. Não deve ser usado em produção
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SimpleMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
    consumer.apply(AnotherMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
