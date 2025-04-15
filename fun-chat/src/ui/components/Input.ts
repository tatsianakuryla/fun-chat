import type { AuthFormFields, InputTypes } from '../../types';
import { createElementWithClassId } from '../../utils/helpers';

export class InputFactory {
  public static create(
    classes: string[],
    type: InputTypes,
    name: AuthFormFields,
    placeholder: string,
  ): HTMLInputElement {
    const input = createElementWithClassId('input', classes);
    input.type = type;
    input.name = name;
    input.placeholder = placeholder;
    return input;
  }
}
