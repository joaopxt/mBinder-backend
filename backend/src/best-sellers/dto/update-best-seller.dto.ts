import { PartialType } from '@nestjs/mapped-types';
import { CreateBestSellerDto } from './create-best-seller.dto';

export class UpdateBestSellerDto extends PartialType(CreateBestSellerDto) {}
