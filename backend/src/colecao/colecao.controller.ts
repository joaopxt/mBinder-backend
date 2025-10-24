import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ColecaoService } from './colecao.service';
import { CreateColecaoDto } from './dto/create-colecao.dto';
import { UpdateColecaoDto } from './dto/update-colecao.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('colecao')
export class ColecaoController {
  constructor(private readonly colecaoService: ColecaoService) {}

  // @Post()
  // create(@Body() createColecaoDto: CreateColecaoDto) {
  //   return this.colecaoService.create(createColecaoDto);
  // }

  // @Get()
  // findAll() {
  //   return this.colecaoService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.colecaoService.findOne(+id);
  }

  @Get('user/:userId')
  getByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.colecaoService.findByUserId(userId);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateColecaoDto: UpdateColecaoDto) {
  //   return this.colecaoService.update(+id, updateColecaoDto);
  // }

  @Delete(':colecaoId/:cardId')
  remove(
    @Param('colecaoId', ParseIntPipe) colecaoId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
  ) {
    return this.colecaoService.removeCardFromColecao(colecaoId, cardId);
  }

  @Post('bulk-import')
  bulkImport(@Body() body: { userId: number; cardNames: string[] }) {
    return this.colecaoService.bulkImport(body.userId, body.cardNames || []);
  }

  @Post('addCardToColecao')
  addCardToColecao(@Body() body: { userId: number; cardId: number }) {
    return this.colecaoService.addCardToColecao(body.userId, body.cardId);
  }
}
