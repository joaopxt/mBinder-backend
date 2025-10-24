import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MostWantedService } from './most-wanted.service';
import { MostWantedController } from './most-wanted.controller';
import { MostWanted } from './entities/most-wanted.entity';
import { Want } from '../want/entities/want.entity';
import { Carta } from '../library/entities/library.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MostWanted, Want, Carta])],
  controllers: [MostWantedController],
  providers: [MostWantedService],
  exports: [MostWantedService],
})
export class MostWantedModule {}
