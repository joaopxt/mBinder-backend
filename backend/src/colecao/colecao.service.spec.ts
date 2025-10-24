import { Test, TestingModule } from '@nestjs/testing';
import { ColecaoService } from './colecao.service';

describe('ColecaoService', () => {
  let service: ColecaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ColecaoService],
    }).compile();

    service = module.get<ColecaoService>(ColecaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
