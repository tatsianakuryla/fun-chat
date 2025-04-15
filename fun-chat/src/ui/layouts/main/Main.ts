import { createElementWithClassId } from '../../../utils/helpers';
import style from './main.module.css';

export class Main {
  public readonly element: HTMLElement;

  constructor() {
    this.element = createElementWithClassId('main', [style.chat]);
  }
}
