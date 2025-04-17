import { createElementWithClassId } from '../../../utils/helpers';

export class Main {
  public readonly element: HTMLElement;

  constructor() {
    this.element = createElementWithClassId('main', []);
  }
}
