import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/user.entity';
import { NotificationsService } from './notifications.service';

interface IRequestWithUser extends Request {
  user: User;
}

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Req() req: IRequestWithUser) {
    return this.notificationsService.findAll(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: IRequestWithUser) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
