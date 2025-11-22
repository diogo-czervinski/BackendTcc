import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';

describe('Autenticação (RF01)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('deve autenticar usuário com credenciais válidas', async () => {
    const response = await request(app.getHttpServer())
      .post('/login')
      .send({
        email: 'produtor@gmail.com',
        password: '123456',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('access_token');
  });

  it('deve rejeitar senha incorreta', async () => {
    const response = await request(app.getHttpServer())
      .post('/login')
      .send({
        email: 'teste@gmail.com',
        password: 'senhaerrada',
      });

    expect(response.status).toBe(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
