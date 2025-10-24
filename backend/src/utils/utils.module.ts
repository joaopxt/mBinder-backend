import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilsService } from './utils.service';
import { Carta } from '../library/entities/library.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Carta])],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
