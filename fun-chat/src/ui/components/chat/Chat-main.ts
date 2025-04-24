import { FLEX_CLASS } from '../../..';
import {
  type LoginedUser,
  type Message,
  RequestResponseTypes,
  type ServerResponse,
} from '../../../api/api-types';
import { WebSocketService } from '../../../api/Web-socket-service';
import { AuthState } from '../../../core/auth/Auth-state';
import { AuthFormFields, UserStatus } from '../../../types';
import { createElementWithClassId } from '../../../utils/helpers';
import { ContainerFactory } from '../container/Container';
import { InputFactory } from '../Input';
import { Dialog } from './Chat-dialog';
import style from './chat.module.css';

export class ChatMain {
  private static _unreadMap = new Map<string, number>();
  private _searchTimeoutId!: ReturnType<typeof setTimeout>;
  private readonly _SEARCH_TIMEOUT = 300;
  private _searchTerm = '';
  private _usersList: HTMLUListElement;
  private _dialog: Dialog;

  constructor() {
    this._usersList = createElementWithClassId('ul', [
      style['chat__users-list'],
      FLEX_CLASS,
    ]);
    this.renderUsersList();
    this._dialog = new Dialog();
    this._dialog.showPlaceholder('Choose a recipient');
    // WebSocketService.onMessage((message) => {
    //   if (message.type !== RequestResponseTypes.MSG_SEND) return;
    //   const m = message.payload.message;
    //   if (m.from === AuthState.user?.login) return;

    //   if (this._dialog.currentUser?.login === m.from) {
    //     WebSocketService.readMessage(m.id).catch(() => {});
    //   } else {
    //     const previous = ChatMain._unreadMap.get(m.from) || 0;
    //     ChatMain._unreadMap.set(m.from, previous + 1);
    //     this.renderUsersList();
    //   }
    // });

    WebSocketService.onMessage((message: ServerResponse) => {
      switch (message.type) {
        case RequestResponseTypes.MSG_SEND:
          this._handleIncomingMessage(message.payload.message);
          break;

        case RequestResponseTypes.USER_EXTERNAL_LOGIN:
        case RequestResponseTypes.USER_EXTERNAL_LOGOUT:
          this.renderUsersList();
          break;
      }
    });
    WebSocketService.onReconnect(() => this.renderUsersList());
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
    item.setAttribute('data-id', login);

    const statusDiv = createElementWithClassId('div', [
      style['chat__users-item-status'],
      style['chat__users-item-status_${status}'],
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

  private static async _getAllUsers(): Promise<LoginedUser[]> {
    const [onlineUsers, offlineUsers] = await Promise.all([
      WebSocketService.getActiveUsers(),
      WebSocketService.getInactiveUsers(),
    ]);

    return [...onlineUsers, ...offlineUsers];
  }

  public createContainer(): HTMLElement {
    const mainContainer = ContainerFactory.create('chat-main');
    mainContainer.append(this._createUsersInfoWrapper(), this._dialog.element);
    return mainContainer;
  }

  public renderUsersList(): void {
    ChatMain._getAllUsers().then((users) => {
      console.log('Все юзеры от сервера:', users);
      console.log('Текущий логин из AuthState:', AuthState.user?.login);
      this._usersList.replaceChildren();
      const withoutCurrentUser = users
        .filter((user) => user.login !== AuthState.user?.login)
        .filter((user) =>
          user.login
            .toLowerCase()
            .includes(this._searchTerm.trim().toLowerCase()),
        );

      console.log('После фильтрации:', withoutCurrentUser);
      const userItemsPromises = withoutCurrentUser.map(async (user) => {
        const login = user.login;
        const status = user.isLogined ? UserStatus.Online : UserStatus.Offline;

        const newMessages = ChatMain._unreadMap.get(login) || 0;
        const item = ChatMain._createUserListItem(status, login, newMessages);
        item.addEventListener('click', () => {
          this._onUserSelected(user);
        });

        return item;
      });

      Promise.all(userItemsPromises).then((userItems) => {
        userItems.forEach((item) => this._usersList.appendChild(item));
      });
    });
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

  private _onUserSelected(user: LoginedUser): void {
    ChatMain._unreadMap.set(user.login, 0);
    this.renderUsersList();
    this._dialog.openWith(user);
  }

  private _handleIncomingMessage(message: Message): void {
    const from = message.from;
    if (from === AuthState.user?.login) return;

    if (this._dialog.currentUser?.login === from) {
      WebSocketService.readMessage(message.id).catch(() => {});
    } else {
      const previous = ChatMain._unreadMap.get(from) || 0;
      ChatMain._unreadMap.set(from, previous + 1);
      this.renderUsersList();
    }
  }
}
