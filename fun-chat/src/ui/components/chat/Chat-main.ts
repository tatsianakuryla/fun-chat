import { FLEX_CLASS } from '../../..';
import { LoginedUser, RequestResponseTypes } from '../../../api/api-types';
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
  private static _unreadMap = new Map<string, number>();

  constructor() {
    this._usersList = createElementWithClassId('ul', [
      style['chat__users-list'],
      FLEX_CLASS,
    ]);
    this.renderUsersList();

    WebSocketService.onMessage((msg) => {
      if (msg.type === RequestResponseTypes.MSG_SEND) {
        const from = msg.payload.message.from;
        if (from === AuthState.user?.login) return;
        const prev = ChatMain._unreadMap.get(from) || 0;
        ChatMain._unreadMap.set(from, prev + 1);
        this.renderUsersList();
      }
    });
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

        const newMessages = ChatMain._unreadMap.get(login) || 0;
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
    item.append(statusDiv, loginDiv);

    const newMessagesDiv =
      newMessages > 0
        ? createElementWithClassId('div', [
            style['chat__users-item-new-messages'],
          ])
        : null;
    if (newMessagesDiv) {
      newMessagesDiv.textContent = String(newMessages);
      item.append(newMessagesDiv);
    }

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
