import { primaryLayout } from '../..';
import { About } from '../components/about/about';
import { AuthForm } from '../components/auth-form/Auth-form';
import { Chat } from '../components/chat/Сhat';

export abstract class BasePage<T extends Chat | AuthForm | About> {
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

  public clear(): void {
    if (!this._element) return;

    if (this._element instanceof Chat) {
      if (
        primaryLayout.header.contains(this._element.headerContainer) &&
        primaryLayout.footer.contains(this._element.footerContainer) &&
        primaryLayout.main.contains(this._element.mainContainer)
      ) {
        primaryLayout.header.removeChild(this._element.headerContainer);
        primaryLayout.footer.removeChild(this._element.footerContainer);
        primaryLayout.main.removeChild(this._element.mainContainer);
      }
    }

    if (this._element instanceof AuthForm) {
      if (primaryLayout.main.contains(this._element.mainContainer)) {
        primaryLayout.main.removeChild(this._element.mainContainer);
      }
    }

    if (this._element instanceof About) {
      if (primaryLayout.main.contains(this._element.mainContainer)) {
        primaryLayout.main.removeChild(this._element.mainContainer);
      }
    }

    this._element = null;
  }

  public abstract open(): void;
}
