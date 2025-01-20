import { IsOptional, IsString, IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyVerificationStatus } from '@prisma/client';

export class CompanyUpdateDto {
    @ApiProperty({
        description: 'The ID of the company to update',
        example: 'cf024c64-3b2c-4c57-bc83-233d36ad1d66',
    })
    @IsNotEmpty()
    @IsString()
    id: string;

    @ApiPropertyOptional({
        description: 'Director first name',
        example: 'Павел',
    })
    @IsOptional()
    @IsString()
    directorFirstName?: string;

    @ApiPropertyOptional({
        description: 'Director last name',
        example: 'Рублев',
    })
    @IsOptional()
    @IsString()
    directorLastName?: string;

    @ApiPropertyOptional({
        description: 'Director patronymic (middle name)',
        example: 'Михайлович',
    })
    @IsOptional()
    @IsString()
    directorPatronymic?: string;

    @ApiPropertyOptional({
        description: 'Company name',
        example: 'ООО ФИШСТАТ',
    })
    @IsOptional()
    @IsString()
    organizationName?: string;

    @ApiPropertyOptional({
        description: 'Legal address',
        example: '690021, Приморский край, город Владивосток, Черемуховая ул, д. 7, офис 410',
    })
    @IsOptional()
    @IsString()
    legalAddress?: string;

    @ApiPropertyOptional({
        description: 'Company email',
        example: 'support@fishstat.ru',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        description: 'Company phone number',
        example: '79999999999',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        description: 'Short description of the company',
        example: 'Площадка для торговли рыбой',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'URL of the company logo (to update)',
        example: 'https://my-bucket.s3.amazonaws.com/company-logos/acme-updated.jpg',
    })
    @IsOptional()
    @IsString()
    logoUrl?: string;

    @ApiPropertyOptional({
        description: 'INN (Tax Identification Number)',
        example: '123456789012',
    })
    @IsOptional()
    @IsString()
    inn?: string;

    @ApiPropertyOptional({
        description: 'OGRN (Primary State Registration Number)',
        example: '1234567890123',
    })
    @IsOptional()
    @IsString()
    ogrn?: string;

    @ApiPropertyOptional({
        description: 'Country where the company is registered',
        example: 'Russia',
    })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional({
        description: 'City where the company is located',
        example: 'Vladivostok',
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({
        description: 'URL of the document associated with the company',
        example: 'https://my-bucket.s3.amazonaws.com/company-documents/document.pdf',
    })
    @IsOptional()
    @IsString()
    documentUrl?: string;

    @ApiPropertyOptional({
        description: 'Verification status of the company',
        example: 'UNVERIFIED',
        enum: CompanyVerificationStatus,
    })
    @IsOptional()
    @IsEnum(CompanyVerificationStatus)
    status?: CompanyVerificationStatus;
}
