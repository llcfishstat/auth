import { faker } from '@faker-js/faker';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, type Company, User } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { CompanyResponseDto } from 'src/modules/company/dtos/company.response.dto';

export class UserResponseDto implements User {
    @ApiProperty({
        description: 'Unique identifier for the user',
        example: faker.string.uuid(),
    })
    id: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: faker.internet.email(),
    })
    email: string;

    @ApiProperty({
        description: 'First name of the user',
        example: faker.person.firstName(),
    })
    firstName: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: faker.person.lastName(),
    })
    lastName: string;

    @ApiProperty({
        description: 'Patronymic of the user',
        example: faker.person.middleName(),
    })
    patronymic: string;

    @ApiProperty({
        description: 'Phone number of the user',
        example: faker.phone.number(),
    })
    phoneNumber: string;

    @ApiProperty({
        description: "URL of the user's profile picture",
        example: faker.image.avatar(),
        required: false,
    })
    avatar: string;

    @ApiProperty({
        description: "Indicates if the user's email is verified",
        example: true,
    })
    isEmailVerified: boolean;

    @ApiProperty({
        description: "Indicates if the user's phone is verified",
        example: true,
    })
    isPhoneVerified: boolean;

    @ApiProperty({
        example: 'e2cfd6d0-9c7b-4382-b672-cc9b4dcaf534',
        description: 'Verification code for email confirmation',
        nullable: true,
    })
    public verification: string;

    @ApiProperty({
        description: 'The date and time until the user can verify their email',
        example: faker.date.future().toISOString(),
        required: false,
        nullable: true,
    })
    verificationExpires: Date | null;

    @ApiProperty({
        description: 'Number of login attempts the user has made',
        example: 0,
    })
    loginAttempts: number;

    @ApiProperty({
        description: 'The date and time until which the user is blocked from certain actions',
        example: null,
        required: false,
        nullable: true,
    })
    blockExpires: Date | null;

    @ApiProperty({
        description: 'Role of the user in the system',
        enum: $Enums.Role,
        example: $Enums.Role.USER,
    })
    role: $Enums.Role;

    @ApiProperty({
        description: 'The date and time when the user was created',
        example: faker.date.past().toISOString(),
    })
    createdAt: Date;

    @ApiProperty({
        description: 'The date and time when the user information was last updated',
        example: faker.date.recent().toISOString(),
    })
    updatedAt: Date;

    @ApiProperty({
        description: 'The date and time when the user was deleted',
        example: null,
        required: false,
        nullable: true,
    })
    deletedAt: Date | null;

    @ApiProperty({
        description: 'Unique identifier for the company',
        example: faker.string.uuid(),
    })
    companyId: string;

    @ApiPropertyOptional({ type: CompanyResponseDto })
    company?: Company;

    @Exclude()
    password: string;
}
