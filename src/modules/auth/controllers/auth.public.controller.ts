import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthUser } from 'src/common/decorators/auth.decorator';
import { Public } from 'src/common/decorators/public.decorator';

import { AuthJwtRefreshGuard } from 'src/common/guards/jwt.refresh.guard';
import { AuthLoginByEmailDto, AuthLoginByPhoneDto } from 'src/modules/auth/dtos/auth.login.dto';
import {
    AuthRefreshResponseDto,
    AuthResponseDto,
    SignUpByEmailResponseDto,
    VerifyEmailResponseDto,
} from 'src/modules/auth/dtos/auth.response.dto';
import { AuthSignupByEmailDto, AuthSignupByPhoneDto } from 'src/modules/auth/dtos/auth.signup.dto';
import { VerifyEmailDto } from 'src/modules/auth/dtos/auth.verify-email.dto';
import { VerifyPhoneDto } from 'src/modules/auth/dtos/auth.verify-phone.dto';
import { IAuthPayload } from 'src/modules/auth/interfaces/auth.interface';
import { AuthService } from 'src/modules/auth/services/auth.service';
import {
    SendFlashCallResponseDto,
    VerifyFlashCallResponseDto,
} from 'src/common/dtos/flash-call-response.dto';
import {
    ForgotPasswordDto,
    ForgotPasswordResponseDto,
    ForgotPasswordVerifyDto,
    ForgotPasswordVerifyResponseDto,
    ResetPasswordDto,
} from 'src/modules/auth/dtos/auth.forgot-password.dto';
import { Request } from 'express';

@ApiTags('public.auth')
@Controller({
    version: '1',
    path: '/auth',
})
export class PublicAuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login/email')
    public loginByEmail(@Body() payload: AuthLoginByEmailDto): Promise<AuthResponseDto> {
        return this.authService.loginByEmail(payload);
    }

    @Public()
    @Post('login/phone')
    public loginByPhone(@Body() payload: AuthLoginByPhoneDto): Promise<SendFlashCallResponseDto> {
        return this.authService.loginByPhone(payload);
    }

    @Public()
    @Post('signup/email')
    public signupByEmail(@Body() payload: AuthSignupByEmailDto): Promise<SignUpByEmailResponseDto> {
        return this.authService.signupByEmail(payload);
    }

    @Public()
    @Post('signup/phone')
    public signupByPhone(@Body() payload: AuthSignupByPhoneDto): Promise<SendFlashCallResponseDto> {
        return this.authService.signupByPhone(payload);
    }

    @Public()
    @Post('verify-email')
    public verifyEmail(@Body() payload: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
        return this.authService.verifyEmail(payload);
    }

    @Public()
    @Post('verify-phone')
    public verifyPhone(@Body() payload: VerifyPhoneDto): Promise<VerifyFlashCallResponseDto> {
        return this.authService.verifyPhone(payload);
    }

    @Public()
    @Post('forgot-password')
    public forgotPassword(
        @Req() req: Request,
        @Body() payload: ForgotPasswordDto,
    ): Promise<ForgotPasswordResponseDto> {
        return this.authService.forgotPassword(req, payload);
    }

    @Public()
    @Post('forgot-password-verify')
    public forgotPasswordVerify(
        @Req() req: Request,
        @Body() payload: ForgotPasswordVerifyDto,
    ): Promise<ForgotPasswordVerifyResponseDto> {
        return this.authService.forgotPasswordVerify(req, payload);
    }

    @Public()
    @Post('reset-password')
    public resetPassword(
        @Body() payload: ResetPasswordDto,
    ): Promise<ForgotPasswordVerifyResponseDto> {
        return this.authService.resetPassword(payload);
    }

    @Public()
    @UseGuards(AuthJwtRefreshGuard)
    @Get('refresh')
    public refreshTokens(@AuthUser() user: IAuthPayload): Promise<AuthRefreshResponseDto> {
        return this.authService.generateTokens(user);
    }
}
