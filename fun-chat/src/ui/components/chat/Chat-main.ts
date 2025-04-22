import { FLEX_CLASS } from '../../..';
import { LoginedUser } from '../../../api/api-types';
import { WebSocketService } from '../../../api/Web-socket-service';
import { AuthState } from '../../../core/auth/Auth-state';
import { AuthFormFields, UserStatus } from '../../../types';
import { createElementWithClassId } from '../../../utils/helpers';
import { ContainerFactory } from '../container/Container';
import { InputFactory } from '../Input';
import style from './chat.module.css';

export class ChatMain {
  private _searchTimeoutId!: ReturnType<typeof setTimeout>;
  private readonly _SEARCH_TIMEOUT = 300;
  private _searchTerm = '';
  private _usersList: HTMLUListElement;

  constructor() {
    this._usersList = createElementWithClassId('ul', [
      style['chat__users-list'],
      FLEX_CLASS,
    ]);
    this.renderUsersList();
  }

  public createContainer(): HTMLElement {
    const mainContainer = ContainerFactory.create('chat-main');
    mainContainer.append(
      this._createUsersInfoWrapper(),
      ChatMain._createUserDialog(),
    );
    return mainContainer;
  }

  private _createUsersInfoWrapper(): HTMLElement {
    const wrapper = createElementWithClassId('div', [
      style['chat__users-info'],
      FLEX_CLASS,
    ]);

    wrapper.append(this._createSearchInput(), this._usersList);
    return wrapper;
  }

  private _createSearchInput(): HTMLInputElement {
    const searchInput = InputFactory.create(
      [style['chat__search-input']],
      'search',
      AuthFormFields.Search,
      '',
    );

    searchInput.addEventListener('input', () => {
      clearTimeout(this._searchTimeoutId);
      this._searchTerm = searchInput.value;
      this._searchTimeoutId = setTimeout(
        () => this.renderUsersList(),
        this._SEARCH_TIMEOUT,
      );
    });

    return searchInput;
  }

  public renderUsersList(): void {
    ChatMain._getAllUsers().then((users) => {
      this._usersList.replaceChildren();
      console.log('Ghbdtn', users);
      const withoutCurrentUser = users
        .filter((user) => user.login !== AuthState.user?.login)
        .filter((user) =>
          user.login
            .toLowerCase()
            .includes(this._searchTerm.trim().toLowerCase()),
        );

      const userItemsPromises = withoutCurrentUser.map(async (user) => {
        const login = user.login;
        const status = user.isLogined ? UserStatus.Online : UserStatus.Offline;

        // const newMessages = await WebSocketService.getUnreadMessagesCount(login);
        const newMessages = 0;
        return ChatMain._createUserListItem(status, login, newMessages);
      });

      Promise.all(userItemsPromises).then((userItems) => {
        userItems.forEach((item) => this._usersList.appendChild(item));
      });
    });
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

  private static async _getAllUsers(): Promise<LoginedUser[]> {
    const [onlineUsers, offlineUsers] = await Promise.all([
      WebSocketService.getActiveUsers(),
      WebSocketService.getInactiveUsers(),
    ]);

    return [...onlineUsers, ...offlineUsers];
  }

  // private static async _getUnredMessagesQuantity(): Promise<number> {
  //   return await WebSocketService.getUnreadMessagesQuantity();
  // }
}
