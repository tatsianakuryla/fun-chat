import { errorNotificationClass, FLEX_CLASS } from '../..';
import { createElementWithClassId } from '../../utils/helpers';

export class PrimaryLayout {
  private _main: HTMLElement;
  private _header: HTMLElement;
  private _footer: HTMLElement;

  constructor() {
    this._header = createElementWithClassId('header', [FLEX_CLASS]);
    this._main = createElementWithClassId('main', []);
    this._footer = createElementWithClassId('footer', [FLEX_CLASS]);
  }

  public get header(): HTMLElement {
    return this._header;
  }

  public get main(): HTMLElement {
    return this._main;
  }

  public get footer(): HTMLElement {
    return this._footer;
  }

  public render(): void {
    document.body.append(
      this._header,
      this._main,
      this._footer,
      errorNotificationClass.errorNotification,
    );
  }
}
