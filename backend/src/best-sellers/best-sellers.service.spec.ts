import { Test, TestingModule } from '@nestjs/testing';
import { BestSellersService } from './best-sellers.service';

describe('BestSellersService', () => {
  let service: BestSellersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BestSellersService],
    }).compile();

    service = module.get<BestSellersService>(BestSellersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
