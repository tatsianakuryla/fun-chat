import { FLEX_CLASS } from '../../..';
import {
  type LoginedUser,
  type Message,
  RequestResponseTypes,
} from '../../../api/api-types';
import { WebSocketService } from '../../../api/Web-socket-service';
import { AuthState } from '../../../core/auth/Auth-state';
import { createElementWithClassId } from '../../../utils/helpers';
import { ButtonFactory } from '../Button';
import style from './chat.module.css';

export class Dialog {
  private readonly _DIALOG_BEGIN_TEXTCONTENT =
    'It is the begining of the dialog';
  private readonly _HISTORY_ERROR = 'An error of loading occured';
  private readonly _DIALOG_PLACEHOLDER = 'Type a message…';
  private _element: HTMLElement;
  private _header: HTMLElement;
  private _body: HTMLElement;
  private _footer: HTMLElement;
  private _currentUser!: LoginedUser;
  private _statusDiv!: HTMLElement;

  constructor() {
    this._element = createElementWithClassId('div', [
      style['chat__user-dialog'],
      FLEX_CLASS,
    ]);

    this._header = createElementWithClassId('div', [
      style['chat__dialog-header'],
      FLEX_CLASS,
    ]);
    this._body = createElementWithClassId('div', [style['chat__dialog-body']]);
    this._footer = createElementWithClassId('div', [
      style['chat__dialog-footer'],
    ]);

    this._statusDiv = createElementWithClassId('div', [
      style['chat__dialog-status'],
    ]);

    this._element.append(this._header, this._body, this._footer);

    WebSocketService.onMessage((message) => {
      if (
        message.type === RequestResponseTypes.MSG_SEND &&
        this._currentUser &&
        ((message.payload.message.to === AuthState.user?.login &&
          message.payload.message.from === this._currentUser.login) ||
          (message.payload.message.from === AuthState.user?.login &&
            message.payload.message.to === this._currentUser.login))
      ) {
        this._appendMessage(message.payload.message);
      }

      if (message.type === RequestResponseTypes.USER_EXTERNAL_LOGIN) {
        const loginMessage = message;
        const other = loginMessage.payload.user;
        if (other && other?.login === this._currentUser?.login) {
          this._updateStatus(true);
        }
        return;
      }

      if (message.type === RequestResponseTypes.USER_EXTERNAL_LOGOUT) {
        const logoutMessage = message;
        const other = logoutMessage.payload.user;
        if (other && other?.login === this._currentUser?.login) {
          this._updateStatus(false);
        }
        return;
      }

      if (message.type === RequestResponseTypes.MSG_DELETED_FROM_SERVER) {
        const deletedId = message.payload.messageId;
        const element = this._body.querySelector(
          `[data-msg-id="${deletedId}"]`,
        );
        if (element) element.remove();
      }
    });
  }

  public get element(): HTMLElement {
    return this._element;
  }

  public get currentUser(): LoginedUser {
    return this._currentUser;
  }

  public openWith(user: LoginedUser): void {
    this._currentUser = user;
    this._renderHeader(user);
    this._body.replaceChildren();
    this._footer.replaceChildren();

    WebSocketService.getMessageHistory(user.login)
      .then((messages) => {
        this._renderMessageHistory(messages);
        this._renderFooter();

        messages
          .filter(
            (message) =>
              message.from === user.login && !message.status.isReaded,
          )
          .forEach((message) =>
            WebSocketService.readMessage(message.id).catch(() => {}),
          );
      })
      .catch(() => {
        // const errorDiv = createElementWithClassId('div');
        // errorDiv.textContent = this._HISTORY_ERROR;
        // this._body.append(errorDiv);
        this._renderFooter();
      });
  }

  public showPlaceholder(text: string): void {
    this._header.replaceChildren();
    this._body.replaceChildren();
    this._footer.replaceChildren();

    const placeholder = createElementWithClassId('div', [
      style['chat__dialog-placeholder'],
    ]);
    placeholder.textContent = text;

    this._body.append(placeholder);
  }

  private _renderHeader(user: LoginedUser): void {
    this._header.replaceChildren();
    const nameDiv = createElementWithClassId('div', [
      style['chat__dialog-username'],
    ]);
    nameDiv.textContent = user.login;
    this._statusDiv.classList.add(
      user.isLogined
        ? style['chat__dialog-status_online']
        : style['chat__dialog-status_offline'],
    );
    this._statusDiv.textContent = user.isLogined ? 'online' : 'offline';
    this._statusDiv.textContent = user.isLogined ? 'online' : 'offline';
    this._header.append(nameDiv, this._statusDiv);
  }

  private _updateStatus(isOnline: boolean): void {
    this._statusDiv.classList.toggle(
      style['chat__dialog-status_online'],
      isOnline,
    );
    this._statusDiv.classList.toggle(
      style['chat__dialog-status_offline'],
      !isOnline,
    );
    this._statusDiv.textContent = isOnline ? 'online' : 'offline';
  }

  private _renderFooter(): void {
    const input = createElementWithClassId('textarea', [
      style['chat__dialog-input'],
    ]);
    input.placeholder = this._DIALOG_PLACEHOLDER;

    const button = ButtonFactory.create(
      [style['chat__dialog-send']],
      'button',
      'Send',
    );
    button.disabled = true;

    this._sendMessageEventListeners(button, input);

    this._footer.append(input, button);
  }

  private _sendMessageEventListeners(
    button: HTMLButtonElement,
    input: HTMLTextAreaElement,
  ): void {
    input.addEventListener('input', () => {
      button.disabled = input.value.trim() === '';
    });

    button.addEventListener('click', () => {
      const text = input.value.trim();
      if (!text) return;
      this._send(text);
      input.value = '';
      button.disabled = true;
      input.focus();
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        button.click();
      }
    });
  }

  private _send(text: string): void {
    if (!this._currentUser) return;
    WebSocketService.sendMessage(this._currentUser!.login, text).catch(
      () => {},
    );
  }

  private _renderMessageHistory(messages: Message[]): void {
    if (messages.length === 0) {
      const startDiv = createElementWithClassId('div', [
        style['chat__dialog-empty'],
      ]);
      startDiv.textContent = this._DIALOG_BEGIN_TEXTCONTENT;
      this._body.append(startDiv);
    } else {
      messages.forEach((message) => this._appendMessage(message));
    }
    this._scrollToBottom();
  }

  private _appendMessage(message: Message): void {
    const isMine = message.from === AuthState.user?.login;
    const wrapper = createElementWithClassId('div', [
      style['chat__dialog-message'],
      isMine
        ? style['chat__dialog-message_sent']
        : style['chat__dialog-message_received'],
    ]);
    wrapper.setAttribute('data-msg-id', message.id);

    const textDiv = createElementWithClassId('div');
    textDiv.textContent = message.text;
    wrapper.append(textDiv);

    if (isMine) {
      const delButton = ButtonFactory.create(
        [style['chat__msg-delete-btn']],
        'button',
        '🗑',
      );
      delButton.addEventListener('click', () => {
        wrapper?.remove();
        WebSocketService.deleteMessage(message.id);
      });
      wrapper.append(delButton);
    }
    this._body.append(wrapper);
    this._scrollToBottom();
  }

  private _scrollToBottom(): void {
    this._body.scrollTop = this._body.scrollHeight;
  }
}
