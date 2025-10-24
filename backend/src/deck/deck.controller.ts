import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DeckService } from './deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deck')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Post()
  create(@Body() createDeckDto: CreateDeckDto) {
    return this.deckService.create(createDeckDto);
  }

  @Get()
  findAll() {
    return this.deckService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deckService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeckDto: UpdateDeckDto) {
    return this.deckService.update(+id, updateDeckDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deckService.remove(+id);
  }

  @Post(':id/cartas')
  async addCartasToDeck(
    @Param('id') deckId: number,
    @Body('cartaIds') cartaIds: number[],
  ) {
    return this.deckService.addCartasToDeck(deckId, cartaIds);
  }

  @Delete(':id/cartas')
  async removeCartasFromDeck(
    @Param('id') deckId: number,
    @Body('cartaIds') cartaIds: number[],
  ) {
    return this.deckService.removeCartasFromDeck(deckId, cartaIds);
  }
}
