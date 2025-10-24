import { PartialType } from '@nestjs/mapped-types';
import { CreateWantDto } from './create-want.dto';

export class UpdateWantDto extends PartialType(CreateWantDto) {}
