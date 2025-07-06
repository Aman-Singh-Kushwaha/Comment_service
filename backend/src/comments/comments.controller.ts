import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../users/user.entity';

interface IRequestWithUser extends Request {
  user: User;
}

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: IRequestWithUser,
  ) {
    return this.commentsService.create(createCommentDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  @Get(':id/replies')
  findReplies(@Param('id') id: string) {
    return this.commentsService.findReplies(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: IRequestWithUser,
  ) {
    return this.commentsService.update(id, updateCommentDto, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  softDelete(@Param('id') id: string, @Request() req: IRequestWithUser) {
    return this.commentsService.softDelete(id, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/restore')
  restore(@Param('id') id: string, @Request() req: IRequestWithUser) {
    return this.commentsService.restore(id, req.user.id);
  }
}
