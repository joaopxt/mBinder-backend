import { Test, TestingModule } from '@nestjs/testing';
import { BestSellersController } from './best-sellers.controller';
import { BestSellersService } from './best-sellers.service';

describe('BestSellersController', () => {
  let controller: BestSellersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BestSellersController],
      providers: [BestSellersService],
    }).compile();

    controller = module.get<BestSellersController>(BestSellersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
