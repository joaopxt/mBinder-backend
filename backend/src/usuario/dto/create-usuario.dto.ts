import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @Type(() => Number)
  @IsInt()
  @Min(8, { message: 'A idadde mínima é de 8 anos' })
  idade: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Número inválido' })
  @MaxLength(16, { message: 'Número Inválido' })
  celular: string;

  @IsString()
  @IsNotEmpty()
  uf: string;

  @IsString()
  @IsNotEmpty()
  cidade: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'A senha precisa ter mais do que seis caracteres!' })
  password: string;
}
