import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { PasseService } from './passe.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { OwnerUserParamGuard } from 'src/auth/guards/owner-user-param.guard';
import { ResourceOwnerGuard } from 'src/auth/guards/resource-owner.guard';
import { OwnerResource } from 'src/auth/decorators/owner-resource.decorator';
import { OwnerUserParam } from 'src/auth/decorators/owner-user-param.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('passe')
export class PasseController {
  constructor(private readonly passeService: PasseService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.passeService.findOne(+id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.passeService.findByUser(+userId);
  }

  @UseGuards(ResourceOwnerGuard)
  @OwnerResource({
    param: 'id',
    serviceToken: PasseService,
    checkOwnershipMethod: 'isOwnedBy',
  })
  @Post(':id/cartas')
  addCartasToPasse(
    @Param('id', ParseIntPipe) passeId: number,
    @Body('cartaIds') cartaIds: number[],
  ) {
    return this.passeService.addCartasToPasse(passeId, cartaIds);
  }

  @UseGuards(ResourceOwnerGuard)
  @OwnerResource({
    param: 'id',
    serviceToken: PasseService,
    checkOwnershipMethod: 'isOwnedBy',
  })
  @Delete(':id/cartas')
  removeCartasFromPasse(
    @Param('id', ParseIntPipe) passeId: number,
    @Body('cartaIds') cartaIds: number[],
  ) {
    return this.passeService.removeCartasFromPasse(passeId, cartaIds);
  }

  @UseGuards(OwnerUserParamGuard)
  @OwnerUserParam('userId')
  @Post(':userId/bulk-import')
  bulkImport(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: { cardNames: string[] },
  ) {
    return this.passeService.addBulkCards(userId, body.cardNames);
  }

  @UseGuards(OwnerUserParamGuard)
  @OwnerUserParam('userId')
  @Post(':userId/add-card/:cardId')
  addSingleCard(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
  ) {
    return this.passeService.addSingleCard(userId, cardId);
  }
}
