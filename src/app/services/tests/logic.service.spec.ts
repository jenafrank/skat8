import { TestBed, inject } from '@angular/core/testing';

import { LogicService } from './logic.service';

describe('LogicService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LogicService]
    });
  });

  it('should be created', inject([LogicService], (service: LogicService) => {
    expect(service).toBeTruthy();
  }));
});
