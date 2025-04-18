import { primaryLayout } from '../..';
import { AuthForm } from '../components/auth-form/Auth-form';
import { Chat } from '../components/chat/Сhat';

export abstract class BasePage<T extends Chat | AuthForm> {
  protected _element: T | null;

  constructor() {
    this._element = null;
  }

  public get element(): T | null {
    return this._element;
  }

  public set element(value: T | null) {
    this._element = value;
  }

  public abstract open(): void;

  public clear(): void {
    if (!this._element) return;

    if (this._element instanceof Chat) {
      if (primaryLayout.header.contains(this._element.headerContainer)) {
        primaryLayout.header.removeChild(this._element.headerContainer);
      }
    }

    if (this._element instanceof AuthForm) {
      if (primaryLayout.main.contains(this._element.mainContainer)) {
        primaryLayout.main.removeChild(this._element.mainContainer);
      }
    }

    this._element = null;
  }
}
