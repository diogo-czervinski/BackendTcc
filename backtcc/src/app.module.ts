import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConfg } from './Config/config.postgres.service';

@Module({
  imports: [
    
    TypeOrmModule.forRootAsync({ useClass: PostgresConfg})
  ],
})
export class AppModule {}
