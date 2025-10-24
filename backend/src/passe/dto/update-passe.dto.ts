import { PartialType } from '@nestjs/mapped-types';
import { CreatePasseDto } from './create-passe.dto';

export class UpdatePasseDto extends PartialType(CreatePasseDto) {}
