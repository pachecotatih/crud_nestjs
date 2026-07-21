import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { RecadosModule } from 'src/recados/recados.module';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import { GlobalConfigModule } from 'src/global-config/global-config.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
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

const createUser = async (
  app: INestApplication,
  nome = 'Any User',
  email = 'anyuser@email.com',
  password = '123456',
) => {
  const response = await request(app.getHttpServer()).post('/pessoas').send({
    nome,
    email,
    password,
  });

  return response.body;
};

describe('RecadosController (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let loggedUser: any;
  let targetUser: any;

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
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
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

    loggedUser = await createUser(
      app,
      'User Remetente',
      'remetente@email.com',
      '123456',
    );
    authToken = await login(app, 'remetente@email.com', '123456');

    targetUser = await createUser(
      app,
      'User Destinatario',
      'destinatario@email.com',
      '123456',
    );
  });

  describe('/recados (POST)', () => {
    it('deve falhar quando usuário não está logado', async () => {
      const createRecadoDto = {
        texto: 'Texto do recado de teste',
        paraId: targetUser.id,
      };

      const response = await request(app.getHttpServer())
        .post('/recados')
        .send(createRecadoDto)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toEqual({
        error: 'Unauthorized',
        message: 'Não logado!',
        statusCode: 401,
      });
    });

    it('deve criar um novo recado com sucesso', async () => {
      const createRecadoDto = {
        texto: 'Texto do recado de teste',
        paraId: targetUser.id,
      };

      const response = await request(app.getHttpServer())
        .post('/recados')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createRecadoDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          texto: createRecadoDto.texto,
          de: {
            id: loggedUser.id,
            nome: loggedUser.nome,
          },
          para: {
            id: targetUser.id,
            nome: targetUser.nome,
          },
        }),
      );
    });

    it('deve falhar se o texto for muito curto', async () => {
      const createRecadoDto = {
        texto: '1234',
        paraId: targetUser.id,
      };

      const response = await request(app.getHttpServer())
        .post('/recados')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createRecadoDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain(
        'O texto deve ter no mínimo 5 caracteres',
      );
    });

    it('deve falhar se o texto for muito longo', async () => {
      const createRecadoDto = {
        texto: 'a'.repeat(256),
        paraId: targetUser.id,
      };

      const response = await request(app.getHttpServer())
        .post('/recados')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createRecadoDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain(
        'O texto deve ter no máximo 255 caracteres',
      );
    });

    it('deve falhar se o texto for vazio', async () => {
      const createRecadoDto = {
        texto: '',
        paraId: targetUser.id,
      };

      const response = await request(app.getHttpServer())
        .post('/recados')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createRecadoDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('O texto deve ser preenchido');
    });

    it('deve falhar se o destinatário não for encontrado', async () => {
      const createRecadoDto = {
        texto: 'Texto do recado de teste',
        paraId: 9999,
      };

      await request(app.getHttpServer())
        .post('/recados')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createRecadoDto)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /recados', () => {
    it('deve falhar quando usuário não está logado', async () => {
      await request(app.getHttpServer())
        .get('/recados')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('deve retornar todos os recados do usuário logado', async () => {
      await request(app.getHttpServer())
        .post('/recados')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          texto: 'Recado 1 de teste',
          paraId: targetUser.id,
        })
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .get('/recados')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            texto: 'Recado 1 de teste',
            de: {
              id: loggedUser.id,
              nome: loggedUser.nome,
            },
            para: {
              id: targetUser.id,
              nome: targetUser.nome,
            },
          }),
        ]),
      );
    });
  });

  describe('/recados/:id (GET)', () => {
    it('deve falhar quando usuário não está logado', async () => {
      const recado = await request(app.getHttpServer())
        .post('/recados')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          texto: 'Recado para buscar',
          paraId: targetUser.id,
        })
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get(`/recados/${recado.body.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('deve retornar o recado quando usuário está logado', async () => {
      const recadoResponse = await request(app.getHttpServer())
        .post('/recados')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          texto: 'Recado para buscar',
          paraId: targetUser.id,
        })
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .get(`/recados/${recadoResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: recadoResponse.body.id,
          texto: 'Recado para buscar',
          de: {
            id: loggedUser.id,
            nome: loggedUser.nome,
          },
          para: {
            id: targetUser.id,
            nome: targetUser.nome,
          },
        }),
      );
    });

    it('deve retornar erro para recado não encontrado', async () => {
      await request(app.getHttpServer())
        .get('/recados/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /recados/:id', () => {
    it('deve atualizar um recado pertencente ao usuário', async () => {
      const recadoResponse = await request(app.getHttpServer())
        .post('/recados')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          texto: 'Texto original',
          paraId: targetUser.id,
        })
        .expect(HttpStatus.CREATED);

      const recadoId = recadoResponse.body.id;

      const updateResponse = await request(app.getHttpServer())
        .patch(`/recados/${recadoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          texto: 'Texto atualizado',
          lido: true,
        })
        .expect(HttpStatus.OK);

      expect(updateResponse.body).toEqual(
        expect.objectContaining({
          id: recadoId,
          texto: 'Texto atualizado',
          lido: true,
        }),
      );
    });

    it('deve retornar erro ao tentar atualizar recado de outro usuário', async () => {
      const recadoResponse = await request(app.getHttpServer())
        .post('/recados')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          texto: 'Texto original',
          paraId: targetUser.id,
        })
        .expect(HttpStatus.CREATED);

      const outroUserToken = await login(
        app,
        'destinatario@email.com',
        '123456',
      );

      await request(app.getHttpServer())
        .patch(`/recados/${recadoResponse.body.id}`)
        .set('Authorization', `Bearer ${outroUserToken}`)
        .send({
          texto: 'Tentativa de atualização não autorizada',
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('deve retornar erro para recado não encontrado', async () => {
      await request(app.getHttpServer())
        .patch('/recados/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          texto: 'Texto atualizado',
        })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /recados/:id', () => {
    it('deve remover um recado pertencente ao usuário', async () => {
      const recadoResponse = await request(app.getHttpServer())
        .post('/recados')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          texto: 'Texto para remover',
          paraId: targetUser.id,
        })
        .expect(HttpStatus.CREATED);

      const recadoId = recadoResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/recados/${recadoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: recadoId,
        }),
      );
    });

    it('deve retornar erro ao tentar remover recado de outro usuário', async () => {
      const recadoResponse = await request(app.getHttpServer())
        .post('/recados')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          texto: 'Texto original',
          paraId: targetUser.id,
        })
        .expect(HttpStatus.CREATED);

      const outroUserToken = await login(
        app,
        'destinatario@email.com',
        '123456',
      );

      await request(app.getHttpServer())
        .delete(`/recados/${recadoResponse.body.id}`)
        .set('Authorization', `Bearer ${outroUserToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('deve retornar erro para recado não encontrado', async () => {
      await request(app.getHttpServer())
        .delete('/recados/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
