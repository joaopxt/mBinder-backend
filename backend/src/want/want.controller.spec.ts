import { Test, TestingModule } from '@nestjs/testing';
import { WantController } from './want.controller';
import { WantService } from './want.service';

describe('WantController', () => {
  let controller: WantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WantController],
      providers: [WantService],
    }).compile();

    controller = module.get<WantController>(WantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
