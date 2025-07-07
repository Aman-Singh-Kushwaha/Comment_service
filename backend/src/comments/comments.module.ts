import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
