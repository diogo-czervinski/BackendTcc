import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConfg } from './Config/config.postgres.service';
import { UserModule } from './User/user.module';
import { AuthModule } from './Auth/auth.module';
import { AdsModule } from './Adds/ads.module';
import { QuestionModule } from './Questions/question.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    AdsModule,
    QuestionModule,
    TypeOrmModule.forRootAsync({ useClass: PostgresConfg}) 
  ],
})
export class AppModule {}
