import { TestBed, inject } from '@angular/core/testing';
import { LogicService } from '../logic.service';
import { DataService } from '../data.service';

fdescribe('LogicService', () => {

  let logicService: LogicService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LogicService]
    });
  });

  it('should be created', () => {
    const fake = { };
    logicService = new LogicService(fake as DataService);
    expect(logicService).toBeTruthy();
  });
});
