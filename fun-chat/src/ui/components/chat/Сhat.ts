import { Router } from '../../../core/router/router';
import { Routes } from '../../../types';
import { WebSocketService } from '../../../api/Web-socket-service';
import { AuthState } from '../../../core/auth/Auth-state';
import { createElementWithClassId } from '../../../utils/helpers';
import { ButtonFactory } from '../Button';
import { ContainerFactory } from '../container/Container';
import style from './chat.module.css';

export class Chat {
  private static readonly _HEADING = 'FUN CHAT';
  private _headerContainer = ContainerFactory.create('chat-header');
  private _logoutErrorMessage = createElementWithClassId('div', [
    style['chat__logout-error'],
  ]);
  private _mainContainer = ContainerFactory.create('chat-main');

  constructor() {
    Chat._updateErrorMessage(this._logoutErrorMessage, []);
    this._renderHeader();
  }

  public get headerContainer(): HTMLElement {
    return this._headerContainer;
  }

  private static _createHeading(): HTMLElement {
    const wrapper = createElementWithClassId('div', [style['chat__wrapper']]);
    const heading = createElementWithClassId('h1', [style['chat__heading']]);
    heading.textContent = Chat._HEADING;

    const userLogin = createElementWithClassId('h2', [
      style['chat__user-login'],
    ]);
    userLogin.textContent = AuthState.user?.login ?? '';

    wrapper.append(heading, userLogin);
    return wrapper;
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

  private _renderHeader(): void {
    this._headerContainer.append(
      Chat._createHeading(),
      this._createLogoutButton(),
    );
  }
}
