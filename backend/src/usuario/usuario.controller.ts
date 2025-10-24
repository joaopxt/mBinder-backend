import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles/role.enum';

@ApiBearerAuth()
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':nickname')
  findOne(@Param('nickname') nickname: string) {
    return this.usuarioService.findOne(nickname);
  }

  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Patch(':nickname')
  update(
    @Param('nickname') nickname: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuarioService.update(nickname, updateUsuarioDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(+id);
  }

  @Get(':id/matches/:targetId')
  async findMatchesBetweenUsers(
    @Param('id') userId: number,
    @Param('targetId') targetUserId: number,
    @Query('type') type: 'want' | 'passe',
  ) {
    return this.usuarioService.findMatchesBetweenUsers(
      userId,
      targetUserId,
      type,
    );
  }

  @Get(':id/matches')
  async findMatches(
    @Param('id') userId: number,
    @Query('type') type: 'want' | 'passe',
  ) {
    return this.usuarioService.findMatches(userId, type);
  }
}
