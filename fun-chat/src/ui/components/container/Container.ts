import { FLEX_CLASS } from '../../..';
import { createElementWithClassId } from '../../../utils/helpers';
import style from './container.module.css';

export class ContainerFactory {
  public static create(modificator: string): HTMLElement {
    const base = style['container'];
    const modifier = style[`container_${modificator}`];

    const classList = [FLEX_CLASS, base];
    if (modifier) classList.push(modifier);

    return createElementWithClassId('div', classList);
  }
}
