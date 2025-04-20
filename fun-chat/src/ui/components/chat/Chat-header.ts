import { FLEX_CLASS } from '../../..';
import { AuthState } from '../../../core/auth/Auth-state';
import { createElementWithClassId } from '../../../utils/helpers';
import { ContainerFactory } from '../container/Container';
import style from './chat.module.css';

export class ChatHeaderFactory {
  private static readonly _HEADING = 'FUN CHAT';

  public static createContainer(): HTMLElement {
    const headerContainer = ContainerFactory.create('chat-header');
    headerContainer.append(this._createHeading());
    return headerContainer;
  }

  private static _createHeading(): HTMLElement {
    const wrapper = createElementWithClassId('div', [
      style['chat__header-wrapper'],
      FLEX_CLASS,
    ]);
    const heading = createElementWithClassId('h1', [style['chat__heading']]);
    heading.textContent = this._HEADING;

    const userLogin = createElementWithClassId('h2', [
      style['chat__user-login'],
    ]);
    userLogin.textContent = AuthState.user
      ? 'Hello, ' + AuthState.user.login + '!'
      : '';
    wrapper.append(heading, userLogin);
    return wrapper;
  }
}
