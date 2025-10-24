import { PartialType } from '@nestjs/mapped-types';
import { CreateMostWantedDto } from './create-most-wanted.dto';

export class UpdateMostWantedDto extends PartialType(CreateMostWantedDto) {}
