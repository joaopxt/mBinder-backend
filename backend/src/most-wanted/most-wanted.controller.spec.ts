import { Test, TestingModule } from '@nestjs/testing';
import { MostWantedController } from './most-wanted.controller';
import { MostWantedService } from './most-wanted.service';

describe('MostWantedController', () => {
  let controller: MostWantedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MostWantedController],
      providers: [MostWantedService],
    }).compile();

    controller = module.get<MostWantedController>(MostWantedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
