import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Block } from "../document-storage.service";

@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.css']
})
export class BlockComponent {

  @Input()
  public block!: Block;

  @Input()
  public selectedBlock?: Block;

  @Output()
  selected = new EventEmitter<Block>();
}
