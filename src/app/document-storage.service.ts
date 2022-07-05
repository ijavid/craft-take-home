import { Injectable } from '@angular/core';
import { insertAfterItem, insertAtIndex, removeFromArray } from "./utils";


// Model - contains circular references, cannot be persisted as is...
export class Block {

  public content: string;
  public parent?: Block;
  public readonly id: string;
  public readonly children: Block[];

  constructor(content?: string, parent?: Block) {
    this.id = Math.floor(Math.random() * 10_000_000).toString(16);
    this.content = content || '';
    this.parent = parent;
    this.children = [];
  }

  get parentId() {
    return this.parent?.id
  }

  clone(newParent: Block | undefined = this.parent, onClone?: (clonedBlock: Block) => void): Block {
    const clonedBlock = new Block(this.content, newParent);
    this.children.forEach((o, i) => clonedBlock.children[i] = o.clone(clonedBlock, onClone));
    onClone && onClone(clonedBlock);
    return clonedBlock;
  }

  equal(block: Block | undefined): boolean {
    return !!block && this === block && this.id === block.id;
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
  public insert(blocks: Block[]) {
    blocks.forEach(block => {
      insertAtIndex(this.getSiblings(block), block);
      // update indexes
      this.blocks[block.id] = block;
      this.childrenById[block.id] = block.children;
    });
  }

  public delete(blocks: Block[]) {
    blocks.forEach(block => {
      this.removeBlock(this.getSiblings(block), block);
      this.delete(this.childrenById[block.id]); // block.children

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
      throw new Error('Invalid argument');
    }

    this.removeBlock(this.getSiblings(block), block);

    block.parent = newParent;
    insertAtIndex(this.getSiblings(block), block, newIndex);
  }

  /**
   *
   * Duplicate an existing block with all of its subblocks (including all levels of subblocks in the hierarchy)
   *  The location of the duplicated block should be under the original block
   */
  public duplicate(block: Block) {
    const clone = block.clone(block.parent, (clonedBlock) => {
      // update indexes
      this.blocks[clone.id] = clonedBlock;
      this.childrenById[clone.id] = clonedBlock.children;
    });
    insertAfterItem(this.getSiblings(block), clone, block);
  }

  /**
   *
   * Export the full document to a single string
   *
   * The output should contain the plain text content of all blocks (including subblocks on any level)
   */
  public export() {
    return this.children.flatMap(ch => this.getContent(ch));
  }

  private getSiblings(block: Block): Block[] {
    return block.parentId ? this.childrenById[block.parentId] : this.children;
  }

  // helper for export
  private getContent(block: Block): string[] {
    return [block.content, ...block.children.flatMap(ch => this.getContent(ch))];
  }

  private removeBlock(array: Block[], block: Block) {
    removeFromArray(array, (o: Block) => block.equal(o));
  }

  private isChild(parent: Block, child: Block): boolean {
    return parent.children.some(ch => child.equal(ch) || this.isChild(ch, child));
  }


}
