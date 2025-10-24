import { Test, TestingModule } from '@nestjs/testing';
import { ColecaoController } from './colecao.controller';
import { ColecaoService } from './colecao.service';

describe('ColecaoController', () => {
  let controller: ColecaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColecaoController],
      providers: [ColecaoService],
    }).compile();

    controller = module.get<ColecaoController>(ColecaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
