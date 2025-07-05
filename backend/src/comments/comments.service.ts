import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: { content: string }, authorId: string): Promise<Comment> {
    const newComment = this.commentRepository.create({
      ...createCommentDto,
      authorId,
    });
    return this.commentRepository.save(newComment);
  }

  async findAll(): Promise<Comment[]> {
    return this.commentRepository.find({ 
      order: { createdAt: 'DESC' },
      relations: ['author'],
    });
  }
}
