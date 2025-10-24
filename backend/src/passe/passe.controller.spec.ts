import { Test, TestingModule } from '@nestjs/testing';
import { PasseController } from './passe.controller';
import { PasseService } from './passe.service';

describe('PasseController', () => {
  let controller: PasseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PasseController],
      providers: [PasseService],
    }).compile();

    controller = module.get<PasseController>(PasseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
