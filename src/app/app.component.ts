import { Component, ElementRef, ViewChild } from '@angular/core';
import { Block, DocumentStorageService } from "./document-storage.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  contentToInsert: string = '';
  selected: Block | undefined;
  newParentId: string = '';
  newItemIndex: number = 0;

  @ViewChild('output') output!: ElementRef<HTMLTextAreaElement>;

  constructor(private service: DocumentStorageService) {

  }

  // public readonly data = this.service.root;
  // or using the fetch operation:
  public get data() {
    return this.service.fetch()
  }

  public insertRoot() {
    const block = new Block(this.contentToInsert);
    this.service.insert([block]);
  }

  public insertUnderSelected() {
    const block = new Block(this.contentToInsert, this.selected);
    this.service.insert([block]);
  }

  cleanSelection() {
    this.selected = undefined;
  }

  deleteSelected() {
    this.service.delete(this.selected ? [this.selected] : []);
    this.cleanSelection();
  }

  duplicateSelected() {
    if (this.selected) {
      this.service.duplicate(this.selected);
    }
  }

  moveSelected() {
    if (this.selected) {
      this.service.move(this.selected, 0, this.service.fetch()[0]);
    }
  }

  moveSelectedToRoot() {
    if (this.selected) {
      this.service.move(this.selected, 0, undefined);
    }
  }

  moveToPosition() {
    if (this.selected) {
      this.service.move(this.selected, this.newItemIndex, this.service.getById(this.newParentId));
    }
  }

  export() {
    const data = this.service.export();
    this.output.nativeElement.value = data.join('\r\n');
  }
}
