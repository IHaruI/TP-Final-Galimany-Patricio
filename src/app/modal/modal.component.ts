import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  @Input() title = '';
  @Input() message = '';
  @Input() showInput = false;
  @Output() onConfirm = new EventEmitter<string | null>();
  @Output() onCancel = new EventEmitter<void>();

  inputValue: string = '';

  close() {
    this.onCancel.emit();
  }

  confirm() {
    this.onConfirm.emit(this.showInput ? this.inputValue : null);
    this.close();
  }
}
