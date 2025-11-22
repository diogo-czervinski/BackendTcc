import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import * as fs from 'fs'; // Necessário para garantir que a pasta existe

describe('Ads (RFxx) - Anúncios, Upload e Permissões', () => {
    let app: INestApplication;
    let tokenProducer: string;
    let tokenTarefeiro: string;
    let adId: number;

    // Mock PNG buffer
    const mockImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4DwAADgAEE+Jz8QAAAABJRU5ErkJggg==',
        'base64',
    );

    beforeAll(async () => {
        // --- CORREÇÃO 1: Garantir que a pasta de upload existe ---
        const uploadDir = './uploads/ads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        // -------------------------------------------------------

        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication({ logger: false });
        
        await app.init();

        // 1. Setup: Criar Usuário PRODUTOR
        await request(app.getHttpServer())
            .post('/user')
            .send({
                name: 'Ad Producer',
                email: 'producer@ads.com',
                password: 'password123',
                tel: '41988881111',
                role: 'PRODUTOR',
            });

        const loginProducer = await request(app.getHttpServer())
            .post('/login')
            .send({
                email: 'producer@ads.com',
                password: 'password123',
            });
        tokenProducer = loginProducer.body.access_token;

        // 2. Setup: Criar Usuário TAREFEIRO
        await request(app.getHttpServer())
            .post('/user')
            .send({
                name: 'Ad Viewer',
                email: 'viewer@ads.com',
                password: 'password123',
                tel: '41988882222',
                role: 'TAREFEIRO',
            });

        const loginTarefeiro = await request(app.getHttpServer())
            .post('/login')
            .send({
                email: 'viewer@ads.com',
                password: 'password123',
            });
        tokenTarefeiro = loginTarefeiro.body.access_token;
    });

    // =================================================================
    // TESTES DE CRIAÇÃO (POST /ads)
    // =================================================================

    it('não deve criar anúncio sem imagens ou campos obrigatórios', async () => {
        const response = await request(app.getHttpServer())
            .post('/ads')
            .set('Authorization', `Bearer ${tokenProducer}`)
            .send({}); 

        expect(response.status).not.toBe(201);
    });

    it('deve criar um anúncio com imagens sendo PRODUTOR (201)', async () => {
        const response = await request(app.getHttpServer())
            .post('/ads')
            .set('Authorization', `Bearer ${tokenProducer}`)
            // --- CORREÇÃO 2: Campos corretos conforme seu DTO ---
            .field('title', 'Venda de Erva Mate') 
            .field('description', 'Saca de 50kg recém colhida')
            .field('localizacao', 'Fazenda São João - PR') // Campo Obrigatório!
            // ----------------------------------------------------
            .attach('images', mockImageBuffer, 'foto1.png')
            .attach('images', mockImageBuffer, 'foto2.png');

        // Se der erro aqui, mude logger: false para true no beforeAll para ver o motivo
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('images');
        
        adId = response.body.id;
    });

    // =================================================================
    // TESTES DE LEITURA
    // =================================================================

    it('PRODUTOR deve conseguir ver seus próprios anúncios (GET /ads/me)', async () => {
        const response = await request(app.getHttpServer())
            .get('/ads/me')
            .set('Authorization', `Bearer ${tokenProducer}`);

        expect(response.status).toBe(200);
        const myAds: any[] = response.body;
        const found = myAds.some(ad => ad.id === adId);
        expect(found).toBeTruthy();
    });

    it('PRODUTOR NÃO deve conseguir listar todos os anúncios (GET /ads) -> 403 Forbidden', async () => {
        const response = await request(app.getHttpServer())
            .get('/ads')
            .set('Authorization', `Bearer ${tokenProducer}`);

        expect(response.status).toBe(403);
    });

    it('TAREFEIRO deve conseguir listar todos os anúncios (GET /ads)', async () => {
        const response = await request(app.getHttpServer())
            .get('/ads')
            .set('Authorization', `Bearer ${tokenTarefeiro}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    // =================================================================
    // TESTES DE ATUALIZAÇÃO
    // =================================================================

    it('deve atualizar um anúncio e adicionar nova imagem (200)', async () => {
        const response = await request(app.getHttpServer())
            .patch(`/ads/${adId}`)
            .set('Authorization', `Bearer ${tokenProducer}`)
            .field('title', 'Venda de Erva Mate (Atualizado)')
            .attach('images', mockImageBuffer, 'nova_foto.png');

        expect(response.status).toBe(200);
        if (response.body.title) {
             expect(response.body.title).toContain('Atualizado');
        }
    });

    // =================================================================
    // TESTES DE DELEÇÃO
    // =================================================================

    it('não deve deletar anúncio de outro usuário', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/ads/${adId}`)
            .set('Authorization', `Bearer ${tokenTarefeiro}`);

        expect(response.status).not.toBe(200); 
    });

    it('deve deletar o próprio anúncio (200)', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/ads/${adId}`)
            .set('Authorization', `Bearer ${tokenProducer}`);

        expect(response.status).toBe(200);

        // Verifica se sumiu
        const checkResponse = await request(app.getHttpServer())
            .get('/ads/me')
            .set('Authorization', `Bearer ${tokenProducer}`);
        
        const myAds: any[] = checkResponse.body;
        const found = myAds.some(ad => ad.id === adId);
        expect(found).toBeFalsy();
    });

    afterAll(async () => {
        await app.close();
    });
});