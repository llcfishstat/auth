import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthSignupByEmailDto {
    @ApiProperty({
        example: faker.internet.email(),
        description: 'The email address of the user',
    })
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    public email: string;

    @ApiProperty({
        example: faker.internet.password(),
        description: 'The password of the user',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    public password: string;

    @ApiProperty({
        example: faker.person.firstName(),
        description: 'The first name of the user',
    })
    @IsString()
    public firstName: string;
}
