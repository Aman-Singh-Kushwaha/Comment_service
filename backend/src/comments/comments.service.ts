import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

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

  private getChildrenCountSubquery() {
    return this.commentRepository
      .createQueryBuilder('sub_comment')
      .select('COUNT(*)')
      .where('sub_comment.parentId = comment.id')
      .andWhere('sub_comment.is_deleted = false')
      .getQuery();
  }

  private getCommentQueryBuilder() {
    return this.commentRepository
      .createQueryBuilder('comment')
      .select([
        'comment.id',
        'comment.content',
        'comment.parentId',
        'comment.isEdited',
        'comment.createdAt',
        'author.id',
        'author.username',
      ])
      .addSelect(`(${this.getChildrenCountSubquery()})`, 'childrenCount')
      .leftJoin('comment.author', 'author')
      .where('comment.isDeleted = false');
  }

  async findAll(): Promise<any[]> {
    return this.getCommentQueryBuilder()
      .andWhere('comment.parentId IS NULL')
      .orderBy('comment.createdAt', 'DESC')
      .getRawMany();
  }

  async findReplies(parentId: string): Promise<any[]> {
    return this.getCommentQueryBuilder()
      .andWhere('comment.parentId = :parentId', { parentId })
      .orderBy('comment.createdAt', 'DESC')
      .getRawMany();
  }

  async update(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    if (comment.author.id !== userId) {
      throw new ForbiddenException(
        'Not authorized to edit this comment',
      );
    }

    const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
    const timeElapsed = Date.now() - comment.createdAt.getTime();

    if (timeElapsed > fifteenMinutes) {
      throw new ForbiddenException(
        'Comment Editing time window has expired. You can only edit comments within 15 minutes of posting.',
      );
    }

    comment.content = updateCommentDto.content;
    comment.isEdited = true;

    return this.commentRepository.save(comment);
  }
}
