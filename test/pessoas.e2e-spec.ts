import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';
import { RecadosModule } from 'src/recados/recados.module';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import { GlobalConfigModule } from 'src/global-config/global-config.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import globalConfig from 'src/global-config/global-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { ParseIntIdPipe } from 'src/common/pipes/parse-int-id.pipe';
import appConfig from 'src/app/config/app.config';
import { create } from 'domain';

describe('PessoasController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ServeStaticModule.forRoot({
          rootPath: path.resolve(__dirname, '..', '..', 'pictures'),
          serveRoot: '/pictures',
        }),
        ConfigModule.forFeature(globalConfig),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'tatiana123',
          database: 'crud_nest_testing',
          autoLoadEntities: true, // carrega automaticamente as entidades do projeto sem especificá-las
          synchronize: true, // Sincroniza com o banco de dados. Não deve ser usado em produção
          dropSchema: true, // apaga o banco de dados a cada teste
        }),
        RecadosModule,
        PessoasModule,
        GlobalConfigModule,
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();
    appConfig(app);
    await app.init();
  });

  describe('/pessoas (POST)', () => {
    it('deve criar uma nova pessoa com sucesso', async () => {
      const createPessoaDto = {
        nome: 'Tatiana',
        email: 'tatiana1@email.com',
        password: '123456',
      };

      const response = await request(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual({
        nome: createPessoaDto.nome,
        email: createPessoaDto.email,
        passwordHash: expect.any(String),
        id: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        isActive: true,
        picture: '',
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe(createPessoaDto.nome);
      expect(response.body.email).toBe(createPessoaDto.email);
    });

    it('deve falhar se o email for duplicado', async () => {
      const createPessoaDto = {
        nome: 'Tatiana',
        email: 'tatiana1@email.com',
        password: '123456',
      };

      await request(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.CONFLICT);
      expect(response.body.message).toBe('Email já cadastrado');
    });

    it('deve falhar se o nome for muito longo', async () => {
      const createPessoaDto = {
        nome: 'a'.repeat(101),
        email: 'tatiana1@email.com',
        password: '123456',
      };

      const response = await request(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain(
        'nome must be shorter than or equal to 100 characters',
      );
    });

    it('deve falhar se o email for inválido', async () => {
      const createPessoaDto = {
        nome: 'Tatiana',
        email: 'email-invalido',
        password: '123456',
      };

      const response = await request(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain('email must be an email');
    });

    it('deve falhar se a senha for muito curta', async () => {
      const createPessoaDto = {
        nome: 'Tatiana',
        email: 'tatiana1@email.com',
        password: '123',
      };

      const response = await request(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain(
        'password must be longer than or equal to 5 characters',
      );
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
