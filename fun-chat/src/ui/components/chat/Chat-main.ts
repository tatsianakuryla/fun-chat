import { FLEX_CLASS } from '../../..';
import { AuthFormFields, type UserStatus } from '../../../types';
import { createElementWithClassId } from '../../../utils/helpers';
import { ContainerFactory } from '../container/Container';
import { InputFactory } from '../Input';
import style from './chat.module.css';

export class ChatMainFactory {
  public static createContainer(): HTMLElement {
    const mainContainer = ContainerFactory.create('chat-main');
    mainContainer.append(
      this._createUsersInfoWrapper(),
      this._createUserDialog(),
    );
    return mainContainer;
  }

  private static _createUsersInfoWrapper(): HTMLElement {
    const wrapper = createElementWithClassId('div', [
      style['chat__users-info'],
      FLEX_CLASS,
    ]);

    wrapper.append(this._createSearchInput(), this._createUsersList());
    return wrapper;
  }

  private static _createSearchInput(): HTMLInputElement {
    const searchInput = InputFactory.create(
      [style['chat__search-input']],
      'search',
      AuthFormFields.Search,
      '',
    );
    return searchInput;
  }

  private static _createUsersList(): HTMLUListElement {
    const list = createElementWithClassId('ul', [
      style['chat__users-list'],
      FLEX_CLASS,
    ]);

    return list;
  }

  private static _createUserListItem(
    status: UserStatus,
    login: string,
    newMessages: number,
  ): HTMLLIElement {
    const item = createElementWithClassId('li', [
      style['chat__users-item'],
      FLEX_CLASS,
    ]);

    const statusDiv = createElementWithClassId('div', [
      style['chat__users-item-status'],
      style[`chat__users-item-status_${status}`],
    ]);
    statusDiv.textContent = status;

    const loginDiv = createElementWithClassId('div', [
      style['chat__users-item-login'],
    ]);
    loginDiv.textContent = login;

    const newMessagesDiv = createElementWithClassId('div', [
      style['chat__users-item-new-messages'],
    ]);
    newMessagesDiv.textContent = String(newMessages);

    item.append(statusDiv, loginDiv, newMessagesDiv);
    return item;
  }

  private static _createUserDialog(): HTMLElement {
    const dialog = createElementWithClassId('div', [
      style['chat__user-dialog'],
      FLEX_CLASS,
    ]);
    return dialog;
  }
}
