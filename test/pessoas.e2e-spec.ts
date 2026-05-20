import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { RecadosModule } from 'src/recados/recados.module';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import { GlobalConfigModule } from 'src/global-config/global-config.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import globalConfig from 'src/global-config/global-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import appConfig from 'src/app/config/app.config';

const login = async (
  app: INestApplication,
  email: string,
  password: string,
) => {
  const response = await request(app.getHttpServer())
    .post('/auth')
    .send({ email, password });

  return response.body.accessToken;
};

const createUserAndLogin = async (app: INestApplication) => {
  const nome = 'Any User';
  const email = 'anyuser@email.com';
  const password = '123456';

  await request(app.getHttpServer()).post('/pessoas').send({
    nome,
    email,
    password,
  });

  return login(app, email, password);
};

describe('PessoasController (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;

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
    authToken = await createUserAndLogin(app);
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

    it('deve falhar se o nome for vazio', async () => {
      const createPessoaDto = {
        nome: '',
        email: 'tatiana1@email.com',
        password: '123456',
      };

      const response = await request(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain(
        'nome must be longer than or equal to 3 characters',
      );
      expect(response.body.message).toContain('nome should not be empty');
    });

    it('deve falhar se o email for vazio', async () => {
      const createPessoaDto = {
        nome: 'Tatiana',
        email: '',
        password: '123456',
      };

      const response = await request(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain('email must be an email');
    });

    it('deve falhar se a senha for vazia', async () => {
      const createPessoaDto = {
        nome: 'Tatiana',
        email: 'tatiana1@email.com',
        password: '',
      };

      const response = await request(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain('password should not be empty');
    });
  });
  describe('GET /pessoas', () => {
    it('deve retornar todas as pessoas', async () => {
      await request(app.getHttpServer())
        .post('/pessoas')
        .send({
          email: 'tatiana@email.com',
          nome: 'Tatiana',
          password: '123456',
        })
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .get('/pessoas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            email: 'tatiana@email.com',
            nome: 'Tatiana',
          }),
        ]),
      );
    });
  });
  describe('/pessoas/:id (GET)', () => {
    it('deve falhar quando usuário não está logado', async () => {
      const createPessoaDto = {
        nome: 'Tatiana',
        email: 'tatiana1@email.com',
        password: '123456',
      };
      const pessoa = await request(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .get(`/pessoas/${pessoa.body.id}`)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toEqual({
        error: 'Unauthorized',
        message: 'Não logado!',
        statusCode: 401,
      });
    });
    it('deve retornar a Pessoa quando usuário está logado', async () => {
      const createPessoaDto = {
        nome: 'Tatiana',
        email: 'tatiana1@email.com',
        password: '123456',
      };
      const pessoaResponse = await request(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.CREATED);
      const token = authToken;

      const response = await request(app.getHttpServer())
        .get(`/pessoas/${pessoaResponse.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        nome: createPessoaDto.nome,
        email: createPessoaDto.email,
        passwordHash: expect.any(String),
        id: pessoaResponse.body.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        isActive: true,
        picture: '',
      });
    });
    it('deve retornar erro para pessoa não encontrada', async () => {
      await request(app.getHttpServer())
        .get('/pessoas/9999') // ID fictício
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
  describe('PATCH /pessoas/:id', () => {
    it('deve atualizar uma pessoa', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/pessoas')
        .send({
          email: 'tatiana@email.com',
          nome: 'Tatiana',
          password: '123456',
        })
        .expect(HttpStatus.CREATED);

      const personId = createResponse.body.id;

      const authToken = await login(app, 'tatiana@email.com', '123456');

      const updateResponse = await request(app.getHttpServer())
        .patch(`/pessoas/${personId}`)
        .send({
          nome: 'Tatiana Atualizado',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(updateResponse.body).toEqual(
        expect.objectContaining({
          id: personId,
          nome: 'Tatiana Atualizado',
        }),
      );
    });

    it('deve retornar erro para pessoa não encontrada', async () => {
      await request(app.getHttpServer())
        .patch('/pessoas/9999') // ID fictício
        .send({
          nome: 'Nome Atualizado',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /pessoas/:id', () => {
    it('deve remover uma pessoa', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/pessoas')
        .send({
          email: 'tatiana@email.com',
          nome: 'Tatiana',
          password: '123456',
        })
        .expect(HttpStatus.CREATED);

      const authToken = await login(app, 'tatiana@email.com', '123456');

      const personId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/pessoas/${personId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.email).toBe('tatiana@email.com');
    });

    it('deve retornar erro para pessoa não encontrada', async () => {
      await request(app.getHttpServer())
        .delete('/pessoas/9999') // ID fictício
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
