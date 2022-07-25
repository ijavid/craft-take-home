import { Injectable } from '@angular/core';
import { insertAfterItem, insertAtIndex, removeFromArray } from "./utils";

// Model
export class Block {

  public content: string;
  public parent?: string; // reference to parent, using an object here will result in circular structure
  public readonly id: string;
  public readonly children: Block[];

  constructor(content?: string, parentId?: string) {
    this.id = Math.floor(Math.random() * 10_000_000).toString(16);
    this.content = content || '';
    this.parent = parentId;
    this.children = [];
  }

  clone(newParent: string | undefined, onClone?: (clonedBlock: Block) => void): Block {
    const clonedBlock = new Block(this.content, newParent);
    this.children.forEach((o, i) => clonedBlock.children[i] = o.clone(clonedBlock.id, onClone));
    onClone && onClone(clonedBlock);
    return clonedBlock;
  }

  equal(block: Block | undefined): boolean {
    return !!block && this === block && this.id === block.id;
  }

  // helper for export
  getContentWithSubs(): string[] {
    return [this.content, ...this.children.flatMap(ch => ch.getContentWithSubs())];
  }

}

@Injectable({
  providedIn: 'root' // this ensures that this service will be singleton
})
export class DocumentStorageService {
  // root id
  readonly documentId = '';

  // indexed item cache
  private blocks: { [blockId: string]: Block } = {};

  // hierarchy cache
  private childrenById: { [blockId: string]: Block[] } = { [this.documentId]: [] };

  // document blocks
  public readonly children = this.childrenById[this.documentId];

  // generic helper to access a single block by its id
  public getById(id: string): Block {
    return this.blocks[id];
  }

  /**
   *
   * Fetch a list of existing blocks from the document
   * @param parentBlock if not set it returns the blocks under the document, if set only returns a sub-tree
   */
  public fetch(parentBlock?: Block) {
    return parentBlock ? this.childrenById[parentBlock.id] : this.children;
  }

  // inserts to bottom
  public insert(blocks: Block[], parentId?: string) {
    blocks.forEach(block => {
      // check if it was already inserted
      if (this.blocks[block.id]) {
        return;
      }
      // set parent if required
      if (parentId) {
        block.parent = parentId;
      }
      // alters the array
      insertAtIndex(this.getSiblings(block), block);
      // update indexes
      this.blocks[block.id] = block;
      this.childrenById[block.id] = block.children;
    });
  }

  public delete(blocks: Block[]) {
    blocks.forEach(block => {
      // check if it was already deleted
      if (!this.blocks[block.id]) {
        return;
      }

      // delete all children first
      this.delete(this.childrenById[block.id]); // === block.children
      // delete the block
      this.removeBlock(this.getSiblings(block), block);

      // update indexes
      delete this.blocks[block.id];
      delete this.childrenById[block.id];
    });
  }


  /**
   * Move an existing block to another position in the document
   *
   * The target position can be on any level in the hierarchy, not necessarily on the same level
   *
   * The moved block should keep its subblocks, so they move together
   */
  public move(block: Block, newIndex: number, newParent?: Block) {
    if (block === newParent) {
      throw new Error('Can\'t insert the item under the same item');
    }

    if (newParent && this.isChild(block, newParent)) {
      throw new Error('Can\'t insert the item under the same tree');
    }

    if (newIndex < 0) {
      throw new Error('Invalid newIndex');
    }

    if (newIndex > this.getSiblings(block).length) {
      throw new Error('Invalid newIndex');
    }

    this.removeBlock(this.getSiblings(block), block);

    block.parent = newParent?.id;
    insertAtIndex(this.getSiblings(block), block, newIndex);
  }

  /**
   *
   * Duplicate an existing block with all of its subblocks (including all levels of subblocks in the hierarchy)
   *  The location of the duplicated block should be under the original block
   */
  public duplicate(block: Block): Block {
    const clone = block.clone(block.parent, (clonedBlock) => {
      // update indexes
      this.blocks[clonedBlock.id] = clonedBlock;
      this.childrenById[clonedBlock.id] = clonedBlock.children;
    });
    insertAfterItem(this.getSiblings(block), clone, block);
    return clone;
  }

  /**
   *
   * Export the full document to a single string
   *
   * The output should contain the plain text content of all blocks (including subblocks on any level)
   */
  public export(separator: string = '\r\n') {
    return this.children.flatMap(ch => ch.getContentWithSubs()).join(separator);
  }

  /** returns all children of the parent elements */
  private getSiblings(block: Block): Block[] {
    return block.parent ? this.childrenById[block.parent] : this.children;
  }

  private removeBlock(array: Block[], block: Block) {
    removeFromArray(array, (o: Block) => o.equal(block));
  }

  private isChild(parent: Block, child: Block): boolean {
    return parent.children.some(ch => child.equal(ch) || this.isChild(ch, child));
  }


}
