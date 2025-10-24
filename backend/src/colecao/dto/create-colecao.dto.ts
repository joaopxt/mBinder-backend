import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateColecaoDto {
  @IsNotEmpty()
  @IsNumber()
  usuarioId: number;
}
