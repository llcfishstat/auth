import {
    Injectable,
    HttpException,
    HttpStatus,
    BadRequestException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { addMinutes, addHours, isAfter } from 'date-fns';
import * as bcrypt from 'bcryptjs';

import { SendFlashCallDto, VerifyFlashCallDto } from 'src/common/dtos/send-flash-call.dto';
import {
    SendFlashCallResponseDto,
    VerifyFlashCallResponseDto,
} from 'src/common/dtos/flash-call-response.dto';

import { CallFactory } from 'src/modules/call/call.factory';
import { CallProviders } from 'src/modules/call/interfaces/call.interface';
import { PrismaService } from 'src/common/services/prisma.service';

const MIN_INTERVAL_MINUTES = 1;
const MAX_REQUESTS_PER_DAY = 5;
const BLOCK_DURATION_HOURS = 24;
const PINCODE_EXPIRATION_MINUTES = 10;

@Injectable()
export class FlashCallService {
    private readonly logger = new Logger(FlashCallService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly callFactory: CallFactory,
    ) {}

    /**
     * Отправка флеш-звонка пользователю.
     * Проверяем ограничения и, если всё в порядке, генерируем pincode через провайдер и отправляем звонок.
     */
    async sendFlashCall(sendFlashCallDto: SendFlashCallDto): Promise<SendFlashCallResponseDto> {
        const { phone } = sendFlashCallDto;

        const user = await this.prisma.user.findUnique({
            where: { phoneNumber: phone },
        });

        if (!user) {
            throw new NotFoundException('user.userNotFound');
        }

        const phoneCode = await this.prisma.phoneCode.findUnique({
            where: {
                id: user.id,
            },
        });

        const now = new Date();

        if (phoneCode) {
            if (phoneCode.blockedUntil && isAfter(now, phoneCode.blockedUntil) === false) {
                const remainingMinutes = Math.ceil(
                    (phoneCode.blockedUntil.getTime() - now.getTime()) / 60000,
                );
                throw new HttpException(
                    `Too many requests. Please try again after ${remainingMinutes} minutes.`,
                    HttpStatus.TOO_MANY_REQUESTS,
                );
            }

            if (phoneCode.lastSentAt) {
                const nextAllowedTime = addMinutes(phoneCode.lastSentAt, MIN_INTERVAL_MINUTES);
                if (isAfter(now, nextAllowedTime) === false) {
                    const remainingSeconds = Math.ceil(
                        (nextAllowedTime.getTime() - now.getTime()) / 1000,
                    );
                    throw new HttpException(
                        `Please wait ${remainingSeconds} seconds before requesting another flash call.`,
                        HttpStatus.TOO_MANY_REQUESTS,
                    );
                }
            }

            if (phoneCode.requestCount >= MAX_REQUESTS_PER_DAY) {
                await this.prisma.phoneCode.update({
                    where: { id: user.id },
                    data: {
                        blockedUntil: addHours(now, BLOCK_DURATION_HOURS),
                    },
                });
                throw new HttpException(
                    'You have exceeded the maximum number of flash calls. Please try again after 24 hours.',
                    HttpStatus.TOO_MANY_REQUESTS,
                );
            }
        }

        let pincode: string;
        try {
            const callService = this.callFactory.getCallService(CallProviders.ZVONOK);
            pincode = await callService.initiateFlashCall(sendFlashCallDto);

            if (!pincode || pincode.length !== 4) {
                throw new Error('Invalid pincode received from Zvonok API');
            }

            this.logger.log(`Flash call sent successfully to ${phone}`);
        } catch (error) {
            this.logger.error(`Failed to send flash call: ${error.message}`);
            throw new HttpException('Failed to send flash call', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (!pincode) {
            this.logger.error('Pincode is undefined or null before hashing.');
            throw new BadRequestException('Invalid pincode.');
        }

        const phoneCodeHash = await bcrypt.hash(pincode, 10);

        if (phoneCode) {
            await this.prisma.phoneCode.update({
                where: { id: user.id },
                data: {
                    phoneCodeHash,
                    requestCount: phoneCode.requestCount + 1,
                    lastSentAt: now,
                    expiresAt: addMinutes(now, PINCODE_EXPIRATION_MINUTES),
                },
            });
        } else {
            await this.prisma.phoneCode.create({
                data: {
                    userId: user.id,
                    phoneCodeHash,
                    requestCount: 1,
                    lastSentAt: now,
                    expiresAt: addMinutes(now, PINCODE_EXPIRATION_MINUTES),
                },
            });
        }

        return {
            status: 200,
            description: 'Flash call initiated successfully',
        };
    }

    /**
     * Верификация кода, полученного через флеш-звонок
     */
    async verifyFlashCall(
        verifyFlashCallDto: VerifyFlashCallDto,
    ): Promise<VerifyFlashCallResponseDto> {
        const { phone, code } = verifyFlashCallDto;

        const user = await this.prisma.user.findUnique({
            where: { phoneNumber: phone },
        });

        if (!user) {
            throw new HttpException(
                'User with this phone number does not exist',
                HttpStatus.NOT_FOUND,
            );
        }

        const phoneCode = await this.prisma.phoneCode.findFirst({
            where: { userId: user.id },
        });

        if (!phoneCode) {
            throw new HttpException(
                'No flash call request found for this phone number',
                HttpStatus.BAD_REQUEST,
            );
        }

        const now = new Date();

        if (phoneCode.blockedUntil && isAfter(now, phoneCode.blockedUntil) === false) {
            const remainingMinutes = Math.ceil(
                (phoneCode.blockedUntil.getTime() - now.getTime()) / 60000,
            );
            throw new HttpException(
                `You are temporarily blocked from verifying. Please try again after ${remainingMinutes} minutes.`,
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        if (isAfter(now, phoneCode.expiresAt)) {
            throw new HttpException(
                'Verification code has expired. Please request a new flash call.',
                HttpStatus.BAD_REQUEST,
            );
        }

        const isMatch = await bcrypt.compare(code, phoneCode.phoneCodeHash);
        if (!isMatch) {
            throw new HttpException('Invalid verification code.', HttpStatus.BAD_REQUEST);
        }

        await this.prisma.phoneCode.deleteMany({
            where: {
                userId: user.id,
            },
        });

        return {
            status: 200,
            description: 'Phone verified successfully',
        };
    }
}