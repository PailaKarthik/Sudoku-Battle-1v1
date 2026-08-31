import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ userId }, { friendId: userId }],
      },

      include: {
        user: true,
        friend: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return friendships.map((friendship) =>
      friendship.userId === userId ? friendship.friend : friendship.user,
    );
  }

  async getRequests(userId: string) {
    return this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },

      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async sendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new ConflictException('You cannot add yourself');
    }

    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.friendRequest.findFirst({
      where: {
        OR: [
          {
            senderId,
            receiverId,
          },
          {
            senderId: receiverId,
            receiverId: senderId,
          },
        ],
        status: {
          in: ['PENDING', 'ACCEPTED'],
        },
      },
    });

    if (existing) {
      throw new ConflictException('Friend relationship already exists');
    }

    return this.prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
      },
    });
  }

  async acceptRequest(userId: string, requestId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: {
        id: requestId,
      },
    });

    if (
      !request ||
      request.receiverId !== userId ||
      request.status !== 'PENDING'
    ) {
      throw new NotFoundException('Friend request not found');
    }

    const [userAId, userBId] =
      request.senderId < request.receiverId
        ? [request.senderId, request.receiverId]
        : [request.receiverId, request.senderId];

    return this.prisma.$transaction(async (tx) => {
      const existingFriendship = await tx.friendship.findUnique({
        where: {
          userId_friendId: {
            userId: userAId,
            friendId: userBId,
          },
        },
      });

      if (!existingFriendship) {
        await tx.friendship.create({
          data: {
            userId: userAId,
            friendId: userBId,
          },
        });
      }

      await tx.friendRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });

      return {
        success: true,
        friendship: {
          userId: userAId,
          friendId: userBId,
        },
      };
    });
  }

  async declineRequest(userId: string, requestId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.receiverId !== userId) {
      throw new NotFoundException('Friend request not found');
    }

    return this.prisma.friendRequest.update({
      where: { id: requestId },
      data: {
        status: 'DECLINED',
        respondedAt: new Date(),
      },
    });
  }

  async removeFriend(userId: string, friendId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          {
            userId,
            friendId,
          },
          {
            userId: friendId,
            friendId: userId,
          },
        ],
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    return this.prisma.friendship.delete({
      where: {
        id: friendship.id,
      },
    });
  }
}
