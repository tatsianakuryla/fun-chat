import { main } from '../..';
import { type Routes } from '../../types';

export class BasePage {
  public static open(
    route: Routes,
    elementToAppend: HTMLElement,
    elementToRemove?: HTMLElement,
  ): void {
    import('../../core/router/router').then(({ Router }) => {
      Router.navigateTo(route);
    });
    if (elementToRemove) this._close(elementToRemove);
    main.appendChild(elementToAppend);
  }

  private static _close(elementToRemove: HTMLElement): void {
    if (main.contains(elementToRemove)) {
      elementToRemove.remove();
    }
  }
}
