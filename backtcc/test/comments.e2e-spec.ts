import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../src/app.module';

describe('Comments (RFxx) - Criação, Listagem e Deleção', () => {
    let app: INestApplication;
    let tokenUser: string;   // Usuário que vai comentar
    let tokenOther: string;  // Usuário "hacker" para testar segurança
    let questionId: number;  // ID da questão onde vamos comentar
    let commentId: number;   // ID do comentário criado

    // Mock PNG buffer (necessário para criar a questão pré-requisito)
    const mockImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4DwAADgAEE+Jz8QAAAABJRU5ErkJggg==',
        'base64',
    );

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        // Logger desativado para não poluir o console
        app = moduleRef.createNestApplication({ logger: false });

        await app.init();

        // 1. Setup: Criar Usuário Principal (Comentarista)
        await request(app.getHttpServer())
            .post('/user')
            .send({
                name: 'Commenter User',
                email: 'commenter@test.com',
                password: 'password123',
                tel: '41999998888',
                role: 'PRODUTOR',
            });

        const loginUser = await request(app.getHttpServer())
            .post('/login')
            .send({
                email: 'commenter@test.com',
                password: 'password123',
            });
        tokenUser = loginUser.body.access_token;

        // 2. Setup: Criar Outro Usuário (Para testes de permissão)
        await request(app.getHttpServer())
            .post('/user')
            .send({
                name: 'Other User',
                email: 'other@test.com',
                password: 'password123',
                tel: '41999997777',
                role: 'PRODUTOR',
            });

        const loginOther = await request(app.getHttpServer())
            .post('/login')
            .send({
                email: 'other@test.com',
                password: 'password123',
            });
        tokenOther = loginOther.body.access_token;

        // 3. Setup: Criar uma Questão (Pré-requisito para comentar)
        // Precisamos de uma questão válida para atrelar o comentário
        const questionResponse = await request(app.getHttpServer())
            .post('/questions')
            .set('Authorization', `Bearer ${tokenUser}`)
            .field('text', 'Questão para teste de comentários')
            .attach('images', mockImageBuffer, 'image.png');

        questionId = questionResponse.body.id;
    });

    // =================================================================
    // TESTES DE CRIAÇÃO (POST /comment/:idQuestion)
    // =================================================================

    it('não deve comentar sem estar logado (401)', async () => {
        const response = await request(app.getHttpServer())
            .post(`/comment/${questionId}`)
            .send({
                text: 'Comentário anônimo',
            });
        expect(response.status).toBe(401);
    });

    it('deve criar um comentário em uma questão existente (201)', async () => {
        const response = await request(app.getHttpServer())
            .post(`/comment/${questionId}`)
            .set('Authorization', `Bearer ${tokenUser}`)
            .send({
                text: 'Este é um comentário de teste!', // Verifique se seu DTO usa 'text' ou 'content'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('text', 'Este é um comentário de teste!');

        commentId = response.body.id;
    });

    // =================================================================
    // TESTES DE LISTAGEM (GET /comment/:idQuestion)
    // =================================================================

    it('deve listar os comentários de uma questão (200)', async () => {
        const response = await request(app.getHttpServer())
            .get(`/comment/${questionId}`)
            .set('Authorization', `Bearer ${tokenUser}`); // Rota protegida pelo Guard

        expect(response.status).toBe(200);

        // O retorno esperado é:
        // 1. Um array de comentários
        // OU
        // 2. O objeto Question com a propriedade "comments" populada (depende do seu service)

        // Assumindo que retorna o objeto da Questão com os comentários:
        if (response.body.comments) {
            expect(response.body.comments).toBeInstanceOf(Array);
            const commentFound = response.body.comments.some(c => c.id === commentId);
            expect(commentFound).toBeTruthy();
        }
        // Assumindo que retorna direto o array de comentários:
        else if (Array.isArray(response.body)) {
            const commentFound = response.body.some(c => c.id === commentId);
            expect(commentFound).toBeTruthy();
        }
    });

    // =================================================================
    // TESTES DE DELEÇÃO (DELETE /comment/:idComment)
    // =================================================================

    it('não deve permitir que outro usuário delete o comentário (403/401/404)', async () => {
        // Tentativa de deletar usando o token do "Other User"
        const response = await request(app.getHttpServer())
            .delete(`/comment/${commentId}`)
            .set('Authorization', `Bearer ${tokenOther}`);

        // Espera que seja negado (Service deve validar se userId bate com authorId do comentário)
        expect([401, 403, 404]).toContain(response.status);
    });

    it('deve deletar o próprio comentário (200)', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/comment/${commentId}`)
            .set('Authorization', `Bearer ${tokenUser}`);

        expect(response.status).toBe(200);

        // Verificação Opcional: Tentar buscar a questão novamente
        const checkResponse = await request(app.getHttpServer())
            .get(`/comment/${questionId}`)
            .set('Authorization', `Bearer ${tokenUser}`);

        // CORREÇÃO AQUI:
        let commentsList: any[] = [];

        if (Array.isArray(checkResponse.body)) {
            commentsList = checkResponse.body;
        } else if (checkResponse.body.comments) {
            commentsList = checkResponse.body.comments;
        }

        const found = commentsList.some(c => c.id === commentId);
        expect(found).toBeFalsy();
    });

    afterAll(async () => {
        await app.close();
    });
});