import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../src/app.module';

describe('Usuários (RF02) - CRUD', () => {
    let app: INestApplication;
    let tokenProdutor: string;
    let tokenCrud: string;
    let createdUserId: number;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();

        // 1. Criar usuário de autenticação (produtor)
        await request(app.getHttpServer())
            .post('/user')
            .send({
                name: 'Produtor Teste',
                email: 'produtor@teste.com',
                password: '123456',
                tel: '41999999999',
                role: 'PRODUTOR',
            });

        const loginProdutor = await request(app.getHttpServer())
            .post('/login') 
            .send({
                email: 'produtor@teste.com',
                password: '123456',
            });
        tokenProdutor = loginProdutor.body.access_token;
        
        // 3. Criar usuário CRUD
        const creationResponse = await request(app.getHttpServer())
            .post('/user')
            .send({
                name: 'Usuário CRUD',
                email: 'crud@teste.com',
                password: '123456',
                tel: '42999999999',
                role: 'PRODUTOR',
            });
            
        createdUserId = creationResponse.body.id;

        // 4. Login CRUD e obtenção do token
        const loginCrud = await request(app.getHttpServer())
            .post('/login')
            .send({
                email: 'crud@teste.com',
                password: '123456',
            });
            
        tokenCrud = loginCrud.body.access_token;
    });

    it('deve criar um novo usuário (POST /user)', async () => {
        const response = await request(app.getHttpServer())
            .post('/user')
            .send({
                name: 'Usuário Temporário',
                email: 'temp@teste.com',
                password: '123456',
                tel: '43999999999',
                role: 'PRODUTOR',
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
    });

    it('não deve criar usuário com e-mail duplicado', async () => {
        const response = await request(app.getHttpServer())
            .post('/user')
            .send({
                name: 'Duplicado',
                email: 'crud@teste.com',
                password: '123456',
                tel: '42999999999',
                role: 'PRODUTOR',
            });

        expect(response.status).toBe(409);
    });

    it('deve buscar usuário por ID (GET /user/:id)', async () => {
        const response = await request(app.getHttpServer()).get(
            `/user/${createdUserId}`
        );
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body.id).toBe(createdUserId);
    });

    it('deve retornar 404 ao buscar ID inexistente', async () => {
        const response = await request(app.getHttpServer()).get('/user/99999');
        expect(response.status).toBe(404);
    });

    it('deve atualizar usuário (PATCH /user)', async () => {
        const response = await request(app.getHttpServer())
            .patch('/user')
            .set('Authorization', `Bearer ${tokenCrud}`)
            .send({
                name: 'Nome Atualizado',
            });
        expect(response.status).toBe(200); 
        expect(response.body.name).toBe('Nome Atualizado');
    });

    it('não deve atualizar sem token', async () => {
        const response = await request(app.getHttpServer())
            .patch('/user')
            .send({ name: 'Sem Token' });
        expect(response.status).toBe(401);
    });

    it('deve deletar usuário (DELETE /user)', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/user`)
            .set('Authorization', `Bearer ${tokenCrud}`);
        expect(response.status).toBe(200);

        // Verifica se foi realmente deletado
        const checkDelete = await request(app.getHttpServer()).get(
            `/user/${createdUserId}`
        );
        expect(checkDelete.status).toBe(404);
    });

    afterAll(async () => {
        await app.close();
    });
});