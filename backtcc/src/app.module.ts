import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConfg } from './Config/config.postgres.service';
import { UserModule } from './User/user.module';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRootAsync({ useClass: PostgresConfg}) 
  ],
})
export class AppModule {}
