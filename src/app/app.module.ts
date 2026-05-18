import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecadosModule } from 'src/recados/recados.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import appConfig from './app.config';

// TypeOrmModule.forRoot() -> para raiz da aplicação
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY],
      useFactory: async (appConfigurations: ConfigType<typeof appConfig>) => {
        console.log('TypeOrmModule', appConfigurations.environment);
        return {
          type: appConfigurations.database.type,
          host: appConfigurations.database.host,
          port: appConfigurations.database.port,
          username: appConfigurations.database.username,
          password: appConfigurations.database.password,
          database: appConfigurations.database.database,
          autoLoadEntities: appConfigurations.database.autoLoadEntities, // carrega automaticamente as entidades do projeto sem especificá-las
          synchronize: appConfigurations.database.synchronize, // Sincroniza com o banco de dados. Não deve ser usado em produção
        };
      },
    }),
    RecadosModule,
    PessoasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
