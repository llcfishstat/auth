import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/common/services/prisma.service';
import { AuthSignupByEmailDto } from 'src/modules/auth/dtos/auth.signup.dto';

import { UserResponseDto } from 'src/modules/user/dtos/user.response.dto';
import { UserUpdateDto } from 'src/modules/user/dtos/user.update.dto';
import { v4 } from 'uuid';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {}

    async getUserById(userId: string): Promise<UserResponseDto> {
        return this.prismaService.user.findUnique({ where: { id: userId } });
    }

    async getUserByEmail(email: string): Promise<UserResponseDto> {
        return this.prismaService.user.findUnique({ where: { email } });
    }

    async updateUser(userId: string, data: UserUpdateDto) {
        const { firstName, lastName, email, phoneNumber, avatar } = data;
        return this.prismaService.user.update({
            data: {
                firstName: firstName?.trim(),
                lastName: lastName?.trim(),
                email,
                phoneNumber,
                avatar,
            },
            where: {
                id: userId,
            },
        });
    }

    async createUserByEmail(data: AuthSignupByEmailDto) {
        return this.prismaService.user.create({
            data: {
                email: data?.email,
                password: data?.password,
                firstName: data?.firstName.trim(),
                verification: v4(),
                role: 'USER',
            },
        });
    }

    async softDeleteUsers(userIds: string[]) {
        await this.prismaService.user.updateMany({
            where: {
                id: {
                    in: userIds,
                },
            },
            data: {
                deletedAt: new Date(),
            },
        });
        return;
    }
}
