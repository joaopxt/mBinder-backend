import { Test, TestingModule } from '@nestjs/testing';
import { PasseService } from './passe.service';

describe('PasseService', () => {
  let service: PasseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasseService],
    }).compile();

    service = module.get<PasseService>(PasseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
