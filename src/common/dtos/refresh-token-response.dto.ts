import { ApiProperty } from '@nestjs/swagger';

export class SuccessRefreshTokenResponseDto {
    @ApiProperty({ example: 'Successfully refresh token' })
    message: string;
}
