import { type ButtonTypes } from '../../types';
import { createElementWithClassId } from '../../utils/helpers';

export class ButtonFactory {
  public static create(
    classes: string[],
    type: ButtonTypes,
    textContent?: string,
  ): HTMLButtonElement {
    const button = createElementWithClassId('button', classes);
    button.type = type;
    if (textContent) {
      button.textContent = textContent;
    }
    return button;
  }
}
