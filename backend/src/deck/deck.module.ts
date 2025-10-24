import { Module } from '@nestjs/common';
import { DeckService } from './deck.service';
import { DeckController } from './deck.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Deck } from './entities/deck.entity';
import { Carta } from 'src/library/entities/library.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Deck, Carta])],
  controllers: [DeckController],
  providers: [DeckService],
})
export class DeckModule {}
