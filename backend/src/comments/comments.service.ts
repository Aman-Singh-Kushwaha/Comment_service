import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto, authorId: string): Promise<Comment> {
    const newComment = this.commentRepository.create({
      content: createCommentDto.content,
      parentId: createCommentDto.parentId,
      author: { id: authorId },
    });
    return this.commentRepository.save(newComment);
  }

  async findAll(): Promise<any[]> {
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.parentId IS NULL')
      .orderBy('comment.createdAt', 'DESC')
      .getMany();

    return Promise.all(comments.map(async (comment) => {
      const childrenCount = await this.commentRepository.count({ where: { parentId: comment.id } });
      return { ...comment, childrenCount };
    }));
  }

  async findReplies(parentId: string): Promise<any[]> {
    const replies = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.parentId = :parentId', { parentId })
      .orderBy('comment.createdAt', 'ASC')
      .getMany();
    
    return Promise.all(replies.map(async (reply) => {
      const childrenCount = await this.commentRepository.count({ where: { parentId: reply.id } });
      return { ...reply, childrenCount };
    }));
  }
}
