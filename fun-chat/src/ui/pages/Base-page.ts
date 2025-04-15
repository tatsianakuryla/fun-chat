import { main } from '../..';

export class BasePage {
  public static open(
    elementToAppend: HTMLElement,
    elementToRemove?: HTMLElement,
  ): void {
    if (elementToRemove) this._close(elementToRemove);
    main.appendChild(elementToAppend);
  }

  private static _close(elementToRemove: HTMLElement): void {
    if (main.contains(elementToRemove)) {
      elementToRemove.remove();
    }
  }
}
