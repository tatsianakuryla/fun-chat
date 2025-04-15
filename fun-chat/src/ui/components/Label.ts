import type { AuthFormFields } from '../../types';
import { createElementWithClassId, textToUpperCase } from '../../utils/helpers';

export class LabelFactory {
  public static create(
    classes: string[],
    name: AuthFormFields,
  ): HTMLLabelElement {
    const label = createElementWithClassId('label', classes);
    label.setAttribute('for', name);
    label.textContent = textToUpperCase(name);
    return label;
  }
}
