import { Router } from '../../../core/router/router';
import { Routes } from '../../../types';
import { WebSocketService } from '../../../api/Web-socket-service';
import { AuthState } from '../../../core/auth/Auth-state';
import { createElementWithClassId } from '../../../utils/helpers';
import { ButtonFactory } from '../Button';
import style from './chat.module.css';
import { ChatFooterFactory } from './Chat-footer';
import { ChatHeaderFactory } from './Chat-header';
import { ChatMainFactory } from './Chat-main';

export class Chat {
  private _headerContainer = ChatHeaderFactory.createContainer();
  private _logoutErrorMessage = createElementWithClassId('div', [
    style['chat__logout-error'],
  ]);
  private _mainContainer = ChatMainFactory.createContainer();
  private _footerContainer = ChatFooterFactory.createContainer();

  constructor() {
    Chat._updateErrorMessage(this._logoutErrorMessage, []);
    this._headerContainer.append(this._createLogoutButton());
  }

  public get headerContainer(): HTMLElement {
    return this._headerContainer;
  }

  public get mainContainer(): HTMLElement {
    return this._mainContainer;
  }

  public get footerContainer(): HTMLElement {
    return this._footerContainer;
  }

  private static _updateErrorMessage(
    element: HTMLElement,
    messages: string[],
  ): void {
    element.textContent = messages.join(', ');
  }

  private _createLogoutButton(): HTMLElement {
    const wrapper = createElementWithClassId('div', [
      style['chat__logout-wrapper'],
    ]);

    const button = ButtonFactory.create(
      [style['chat__logout-button']],
      'button',
      'Logout',
    );

    button.addEventListener('click', () => {
      Chat._updateErrorMessage(this._logoutErrorMessage, []);

      const user = AuthState.user;
      if (!user) return;

      const password = AuthState.password;
      if (!password) return;

      WebSocketService.logoutUser(user.login, password)
        .then(() => {
          Chat._updateErrorMessage(this._logoutErrorMessage, []);
          AuthState.clear();
          Router.navigateTo(Routes.Authentication);
        })
        .catch((errors) => {
          Chat._updateErrorMessage(this._logoutErrorMessage, [errors]);
        });
    });

    wrapper.append(this._logoutErrorMessage, button);

    return wrapper;
  }
}
