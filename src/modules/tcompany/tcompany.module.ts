import { Module } from '@nestjs/common';
import { TCompanyService } from './tcompany.service';
import { RedisModule } from '@libs/redis';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [RedisModule, HttpModule],
  providers: [TCompanyService],
  exports: [TCompanyService],
})
export class TCompanyModule {}
