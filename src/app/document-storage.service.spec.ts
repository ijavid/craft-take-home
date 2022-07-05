import { TestBed } from '@angular/core/testing';

import { Block, DocumentStorageService } from './document-storage.service';

describe('DocumentStorageService', () => {
  let service: DocumentStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('root document should exists', () => {
    expect(service.children).toBeTruthy();
  });

  describe('fetch', () => {
    it('without attr should return root document', () => {
      const document = service.fetch();
      expect(document).toEqual(service.children);
    });
  })

  describe('insert', () => {
    it('insert at root', () => {
      const block = new Block('content');
      service.insert([block]);
      expect(service.children).toEqual([block]);
    });
  })



});
