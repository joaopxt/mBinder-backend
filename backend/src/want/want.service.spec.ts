import { Test, TestingModule } from '@nestjs/testing';
import { WantService } from './want.service';

describe('WantService', () => {
  let service: WantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WantService],
    }).compile();

    service = module.get<WantService>(WantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
