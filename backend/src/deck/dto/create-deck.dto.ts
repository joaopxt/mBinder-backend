import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDeckDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  formato:
    | 'Commander'
    | 'Standard'
    | 'Pioneer'
    | 'Modern'
    | 'Premodern'
    | 'Legacy'
    | 'Vintage'
    | 'Draft'
    | 'Selado'
    | 'Outros';

  @IsNumber()
  @IsNotEmpty()
  usuarioId: number;
}
