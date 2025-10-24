import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}
  @Get('search')
  async searchCards(
    @Query('query') query: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 5;
    return this.libraryService.searchCards(query, limitNumber);
  }

  @Get('search/all')
  async searchAllCards(@Query('query') query: string) {
    return this.libraryService.searchCardsAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log(`[LibraryController] findOne called with id: "${id}"`);
    const cardId = parseInt(id, 10);
    return this.libraryService.findOne(cardId);
  }

  @Get('card/:cardId/variants')
  async getCardVariants(@Param('cardId') cardId: string) {
    return this.libraryService.getCardVariants(+cardId);
  }

  @Get('card/name/:cardName/variants')
  async getCardVariantsByName(@Param('cardName') cardName: string) {
    return this.libraryService.getCardVariantsByName(cardName);
  }
}
