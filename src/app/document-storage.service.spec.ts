import { TestBed } from '@angular/core/testing';

import { Block, DocumentStorageService } from './document-storage.service';


describe('DocumentStorageService', () => {
  let service: DocumentStorageService;

  let blockA: Block;
  let blockB: Block;
  let initialData: Block[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentStorageService);
    blockA = new Block('line 1');
    blockB = new Block('line 2');
    initialData = [blockA, blockB];
    service.insert(initialData);
  });

  describe('fetch', () => {
    it('should return inserted document blocks', () => {
      const blocks = service.fetch();
      expect(blocks).toEqual(initialData);
    });
  })

  describe('insert', () => {
    it('should insert new blocks at bottom', () => {
      const block = new Block('content');
      service.insert([block]);
      const blocks = service.fetch();
      expect(blocks).toEqual([...initialData, block]);
    });

    it('should insert sub-blocks when parent is set in block constructor', () => {
      const block = new Block('content', blockA.id);
      service.insert([block]);
      const blocks = service.fetch();
      expect(blocks).toEqual(initialData);
      expect(blockA.children).toEqual([block]);
    });

    it('should insert sub-blocks when parent is set as function argument', () => {
      const block = new Block('content');
      service.insert([block], blockA.id);
      const blocks = service.fetch();
      expect(blocks).toEqual(initialData);
      expect(blockA.children).toEqual([block]);
    });

    it('should not insert the same item twice', () => {
      const block = new Block('content');
      service.insert([block, block]);
      service.insert([block]);
      const blocks = service.fetch();
      expect(blocks).toEqual([...initialData, block]);
    });
  })

  describe('delete', () => {
    it('should delete any block from middle', () => {
      const newBlock = new Block('content');
      service.insert([newBlock]);

      service.delete([blockB]);
      const blocks = service.fetch();
      expect(blocks).toEqual([blockA, newBlock]);
    });
    it('should delete the first block', () => {
      service.delete([blockA]);
      const blocks = service.fetch();
      expect(blocks).toEqual([blockB]);
    });
    it('should delete last block', () => {
      service.delete([blockB]);
      const blocks = service.fetch();
      expect(blocks).toEqual([blockA]);
    });
    it('should delete multiple blocks in any order', () => {
      service.delete([blockB, blockA]);
      const blocks = service.fetch();
      expect(blocks).toEqual([]);
    });
    it('should not delete the same element twice', () => {
      service.delete([blockA, blockB, blockA, blockB]);
      const blocks = service.fetch();
      expect(blocks).toEqual([]);
    });
    it('should not fail on empty array', () => {
      service.delete([]);
      const blocks = service.fetch();
      expect(blocks).toEqual(initialData);
    });
  })

  describe('move', () => {

    it('should move a block to another position on same level', () => {
      service.move(blockA, 1);
      const blocks = service.fetch();
      expect(blocks).toEqual([blockB, blockA]);
    });

    it('should move a block to the first position', () => {
      service.move(blockB, 0);
      const blocks = service.fetch();
      expect(blocks).toEqual([blockB, blockA]);
    });

    it('should move a block to the last position', () => {
      service.move(blockA, service.fetch().length);
      const blocks = service.fetch();
      expect(blocks).toEqual([blockB, blockA]);
    });

    it('should move a block under a different block', () => {
      service.move(blockA, 0, blockB);
      const blocks = service.fetch();
      expect(blocks).toEqual([blockB]);

      expect(blockB.children[0]).toBe(blockA);
      expect(blockA.parent).toBe(blockB.id);
    });

    it('should fail when out of array boundaries', () => {
      expect(() => service.move(blockA, -1)).toThrow();
      expect(() => service.move(blockA, Number.MAX_VALUE)).toThrow();
    });

    it('should fail when moving an item into self', () => {
      expect(() => service.move(blockA, 0, blockA)).toThrow();
    });

    it('should fail when moving an item under same sub tree', () => {
      const subBlock = new Block('sub 1');
      service.insert([subBlock], blockA.id);
      expect(() => service.move(blockA, 0, subBlock)).toThrow();
    });
  })

  describe('duplicate', () => {
    it('should copy a block under the same item', () => {
      const newBlock = service.duplicate(blockA);
      expect(service.fetch()).toEqual([blockA, newBlock, blockB]);
      const blockBClone = service.duplicate(blockB);
      expect(service.fetch()).toEqual([blockA, newBlock, blockB, blockBClone]);
    });
    it('cloned item should equal content, and a new id', () => {
      const newBlock = service.duplicate(blockA);
      expect(newBlock).not.toBe(blockA);
      expect(newBlock.content).toEqual(blockA.content);
      expect(newBlock.id).not.toEqual(blockA.id);
    });
    it('should clone children', () => {
      const subBlock = new Block('sub 1');
      service.insert([subBlock], blockA.id);
      const newBlock = service.duplicate(blockA);
      expect(newBlock.children).not.toEqual(blockA.children);
      expect(newBlock.children[0]).not.toEqual(subBlock);
      expect(newBlock.children[0].content).toEqual(subBlock.content);
    });
    it('cloned item can be cloned', () => {
      const clone1 = service.duplicate(blockA);
      const clone2 = service.duplicate(clone1);
      expect(service.fetch()).toEqual([blockA, clone1, clone2, blockB]);
    });
  });

  describe('export', () => {
    it('should export the full document to a single string', () => {
      const result = service.export('\n');
      expect(result).toEqual(initialData.map(b => b.content).join('\n'));
    });
    it('should contain the content of all subblocks', () => {
      const subBlock = new Block('sub-text', blockA.id);
      service.insert([subBlock]);
      const result = service.export('\n');
      expect(result).toContain(subBlock.content);
    });
  });
});
