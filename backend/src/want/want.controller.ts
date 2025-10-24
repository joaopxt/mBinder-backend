import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { WantService } from './want.service';
import { CreateWantDto } from './dto/create-want.dto';
import { UpdateWantDto } from './dto/update-want.dto';
import { OwnerUserParamGuard } from 'src/auth/guards/owner-user-param.guard';
import { ResourceOwnerGuard } from 'src/auth/guards/resource-owner.guard';
import { OwnerResource } from 'src/auth/decorators/owner-resource.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerUserParam } from 'src/auth/decorators/owner-user-param.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('want')
export class WantController {
  constructor(private readonly wantService: WantService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wantService.findOne(+id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.wantService.findByUser(+userId);
  }

  @UseGuards(ResourceOwnerGuard)
  @OwnerResource({
    param: 'id',
    serviceToken: WantService,
    checkOwnershipMethod: 'isOwnedBy',
  })
  @Post(':id/cartas')
  addCartasToWant(
    @Param('id', ParseIntPipe) wantId: number,
    @Body('cartaIds') cartaIds: number[],
  ) {
    return this.wantService.addCartasToWant(wantId, cartaIds);
  }

  @UseGuards(ResourceOwnerGuard)
  @OwnerResource({
    param: 'id',
    serviceToken: WantService,
    checkOwnershipMethod: 'isOwnedBy',
  })
  @Delete(':id/cartas')
  removeCartasFromWant(
    @Param('id', ParseIntPipe) wantId: number,
    @Body('cartaIds') cartaIds: number[],
  ) {
    return this.wantService.removeCartasFromWant(wantId, cartaIds);
  }

  @UseGuards(OwnerUserParamGuard)
  @OwnerUserParam('userId')
  @Post(':userId/bulk-import')
  bulkImport(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: { cardNames: string[] },
  ) {
    return this.wantService.addBulkCards(userId, body.cardNames);
  }

  @UseGuards(OwnerUserParamGuard)
  @OwnerUserParam('userId')
  @Post(':userId/add-card/:cardId')
  addSingleCard(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
  ) {
    return this.wantService.addSingleCard(userId, cardId);
  }
}
