import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConfg } from './Config/config.postgres.service';
import { UserModule } from './User/user.module';
import { AuthModule } from './Auth/auth.module';
import { AdsModule } from './Adds/ads.module';
import { QuestionModule } from './Questions/question.module';
import { CommentModule } from './Comments/comment.module';
import { CommentGateway } from './Comments/comment.gateway';

@Module({
  imports: [
    UserModule,
    AuthModule,
    AdsModule,
    QuestionModule,
    CommentModule,
    TypeOrmModule.forRootAsync({ useClass: PostgresConfg}) 
  ],
  providers:[CommentGateway]
})
export class AppModule {}
