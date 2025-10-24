import { Test, TestingModule } from '@nestjs/testing';
import { MostWantedService } from './most-wanted.service';

describe('MostWantedService', () => {
  let service: MostWantedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MostWantedService],
    }).compile();

    service = module.get<MostWantedService>(MostWantedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
