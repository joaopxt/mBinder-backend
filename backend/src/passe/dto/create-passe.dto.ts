import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePasseDto {
  @IsNumber()
  @IsNotEmpty()
  usuarioId: number;
}
