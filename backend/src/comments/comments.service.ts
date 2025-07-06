import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    authorId: string,
  ): Promise<Comment> {
    if (!createCommentDto.content || createCommentDto.content.trim() === '') {
      throw new ForbiddenException('Content cannot be empty');
    }
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
      where: { id: commentId, isDeleted: false },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    if (comment.author.id !== userId) {
      throw new ForbiddenException('Not authorized to edit this comment');
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

  async softDelete(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, isDeleted: false },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    if (comment.author.id !== userId) {
      throw new ForbiddenException('Not authorized to delete this comment');
    }

    const query = `
      WITH RECURSIVE comment_tree AS (
        SELECT id FROM comments WHERE id = $1
        UNION ALL
        SELECT c.id FROM comments c
        INNER JOIN comment_tree ct ON c.parent_id = ct.id
      )
      UPDATE comments
      SET is_deleted = true, deleted_at = NOW()
      WHERE id IN (SELECT id FROM comment_tree)
    `;

    await this.dataSource.query(query, [commentId]);
  }

  async restore(commentId: string, userId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    if (!comment.isDeleted || !comment.deletedAt) {
      throw new ForbiddenException('Comment is not deleted');
    }

    if (comment.author.id !== userId) {
      throw new ForbiddenException('Not authorized to restore this comment');
    }

    const fifteenMinutes = 15 * 60 * 1000;
    const timeElapsed = Date.now() - comment.deletedAt.getTime();

    if (timeElapsed > fifteenMinutes) {
      throw new ForbiddenException(
        'Comment restoration time window has expired.',
      );
    }

    if (comment.parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: comment.parentId },
      });
      if (parentComment && parentComment.isDeleted) {
        throw new ForbiddenException(
          'Cannot restore a reply whose parent comment is still deleted.',
        );
      }
    }

    const query = `
      WITH RECURSIVE comment_tree AS (
        SELECT id, parent_id, deleted_at FROM comments WHERE id = $1
        UNION ALL
        SELECT c.id, c.parent_id, c.deleted_at FROM comments c
        INNER JOIN comment_tree ct ON c.parent_id = ct.id
      )
      UPDATE comments
      SET is_deleted = false, deleted_at = null
      WHERE id IN (SELECT id FROM comment_tree)
    `;

    await this.dataSource.query(query, [commentId]);

    const restoredComment = await this.commentRepository.findOneBy({ id: commentId });
    if (!restoredComment) {
      // This should ideally not happen if the query succeeded
      throw new NotFoundException('Restored comment could not be found.');
    }
    return restoredComment;
  }
}
