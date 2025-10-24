import { Module } from '@nestjs/common';
import { LibraryService } from './library.service';
import { LibraryController } from './library.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carta } from './entities/library.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Carta])],
  controllers: [LibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}
