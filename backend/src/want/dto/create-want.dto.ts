import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateWantDto {
  @IsNumber()
  @IsNotEmpty()
  usuarioId: number;
}
