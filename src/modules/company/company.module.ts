import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';

import { CompanyService } from './services/company.service';
import { AuthCompanyController } from './controllers/company.auth.controller';

@Module({
    controllers: [AuthCompanyController],
    imports: [CommonModule],
    providers: [CompanyService],
    exports: [CompanyService],
})
export class CompanyModule {}
