import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  @OnEvent('notification.create')
  async create(data: {
    recipientId: string;
    senderId: string;
    commentId: string;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      recipient: { id: data.recipientId },
      sender: { id: data.senderId },
      comment: { id: data.commentId },
    });
    return this.notificationRepository.save(notification);
  }

  async findAll(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { recipient: { id: userId } },
      relations: ['sender', 'comment'],
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, recipient: { id: userId } },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }
}
