import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConfg } from './Config/config.postgres.service';
import { UserModule } from './User/user.module';
import { AuthModule } from './Auth/auth.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    TypeOrmModule.forRootAsync({ useClass: PostgresConfg}) 
  ],
})
export class AppModule {}
