import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../src/app.module';

describe('Questions (RFxx) - CRUD, Upload e Segurança', () => {
    let app: INestApplication;
    let tokenOwner: string;
    let tokenOther: string;
    let ownerUserId: number;
    let questionId: number;

    // Mock PNG buffer (1x1 transparente)
    const mockImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4DwAADgAEE+Jz8QAAAABJRU5ErkJggg==',
        'base64',
    );

    // Mock TXT buffer
    const mockTextBuffer = Buffer.from('Este não é um arquivo de imagem.', 'utf-8');

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        // 🔥 Removendo logs do console (inclusive o erro do multer)
        app = moduleRef.createNestApplication({
            logger: false,
        });

        await app.init();

        // 1. Criar e Logar Usuário Proprietário (Owner)
        await request(app.getHttpServer())
            .post('/user')
            .send({
                name: 'Question Owner',
                email: 'owner@questions.com',
                password: 'password123',
                tel: '41988887777',
                role: 'PRODUTOR',
            });

        const loginOwner = await request(app.getHttpServer())
            .post('/login')
            .send({
                email: 'owner@questions.com',
                password: 'password123',
            });

        tokenOwner = loginOwner.body.access_token;

        const profileResponse = await request(app.getHttpServer())
            .get('/user/profile/me')
            .set('Authorization', `Bearer ${tokenOwner}`);

        ownerUserId = profileResponse.body.id;

        // 2. Criar e Logar Outro Usuário (Other)
        await request(app.getHttpServer())
            .post('/user')
            .send({
                name: 'Other User',
                email: 'other@questions.com',
                password: 'password123',
                tel: '41988886666',
                role: 'PRODUTOR',
            });

        const loginOther = await request(app.getHttpServer())
            .post('/login')
            .send({
                email: 'other@questions.com',
                password: 'password123',
            });

        tokenOther = loginOther.body.access_token;
    });

    // =================================================================
    // TESTES DE CRIAÇÃO
    // =================================================================

    it('não deve criar uma questão sem token (401)', async () => {
        const response = await request(app.getHttpServer())
            .post('/questions')
            .send({
                text: 'Descrição',
            });

        expect(response.status).toBe(401);
    });

    it('deve criar uma nova questão com upload de imagens (201)', async () => {
        const response = await request(app.getHttpServer())
            .post('/questions')
            .set('Authorization', `Bearer ${tokenOwner}`)
            .field('text', 'Esta é uma descrição detalhada da pergunta.')
            .attach('images', mockImageBuffer, 'mock_image_1.png')
            .attach('images', mockImageBuffer, 'mock_image_2.png');

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('images');
        expect(response.body.images.length).toBe(2);

        questionId = response.body.id;
    });

    it('não deve criar questão com arquivo inválido (fileFilter)', async () => {
        const response = await request(app.getHttpServer())
            .post('/questions')
            .set('Authorization', `Bearer ${tokenOwner}`)
            .field('text', 'Desc')
            .attach('images', mockTextBuffer, 'mock_file.txt');

        expect(response.status).toBe(500); // Multer lança erro → Nest retorna 500 no ambiente de teste
    });

    // =================================================================
    // TESTES DE BUSCA
    // =================================================================

    it('deve retornar a questão criada em GET /questions/me', async () => {
        const response = await request(app.getHttpServer())
            .get('/questions/me')
            .set('Authorization', `Bearer ${tokenOwner}`);

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);

        const found = response.body.some((q) => q.id === questionId);
        expect(found).toBe(true);
    });

    it('deve retornar todas as questões em GET /questions', async () => {
        const response = await request(app.getHttpServer())
            .get('/questions')
            .set('Authorization', `Bearer ${tokenOwner}`);

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    // =================================================================
    // TESTES DE DELEÇÃO E AUTORIZAÇÃO
    // =================================================================

    it('não deve deletar a questão se não for o proprietário', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/questions/${questionId}`)
            .set('Authorization', `Bearer ${tokenOther}`);

        expect([401, 403, 404]).toContain(response.status);
    });

    it('deve deletar a questão pelo proprietário', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/questions/${questionId}`)
            .set('Authorization', `Bearer ${tokenOwner}`);

        expect(response.status).toBe(200);

        const checkDelete = await request(app.getHttpServer())
            .get('/questions/me')
            .set('Authorization', `Bearer ${tokenOwner}`);

        const foundAfterDelete = checkDelete.body.some((q) => q.id === questionId);
        expect(foundAfterDelete).toBe(false);
    });

    afterAll(async () => {
        await app.close();
    });
});
