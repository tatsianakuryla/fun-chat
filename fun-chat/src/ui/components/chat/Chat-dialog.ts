import { FLEX_CLASS } from '../../..';
import {
  type LoginUser,
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
  private readonly _HISTORY_ERROR = 'An error of loading occurred';
  private readonly _DIALOG_PLACEHOLDER = 'Type a message…';
  private readonly _element: HTMLElement;
  private readonly _header: HTMLElement;
  private readonly _body: HTMLElement;
  private readonly _footer: HTMLElement;
  private _currentUser!: LoginUser;
  private readonly _statusDiv: HTMLElement;

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

      if (message.type === RequestResponseTypes.MSG_DELETE) {
        const deletedId = message.payload.message.id;
        const element = this._body.querySelector(
          `[data-msg-id="${deletedId}"]`,
        );
        if (element) element.remove();
      }

      if (message.type === RequestResponseTypes.MSG_EDIT) {
        const m = message.payload.message;
        this._applyEdit(m.id, m.text);
      }

      if (message.type === RequestResponseTypes.MSG_READ) {
        const readId = message.payload.message.id;
        const wrapper = this._body.querySelector(`[data-msg-id="${readId}"]`);
        if (wrapper) {
          const statusElement = wrapper.querySelector('.msg-status');
          if (statusElement) statusElement.textContent = 'read';
        }
      }
    });
  }

  public get element(): HTMLElement {
    return this._element;
  }

  public get currentUser(): LoginUser {
    return this._currentUser;
  }

  public openWith(user: LoginUser): void {
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
            (message) => message.from === user.login && !message.status.isRead,
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

  private _renderHeader(user: LoginUser): void {
    this._header.replaceChildren();
    const nameDiv = createElementWithClassId('div', [
      style['chat__dialog-username'],
    ]);
    nameDiv.textContent = user.login;
    this._statusDiv.classList.add(
      user.isLogin
        ? style['chat__dialog-status_online']
        : style['chat__dialog-status_offline'],
    );
    this._statusDiv.textContent = user.isLogin ? 'online' : 'offline';
    this._statusDiv.textContent = user.isLogin ? 'online' : 'offline';
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

    const metaDiv = createElementWithClassId('div', [style['chat__msg-meta']]);
    const userSpan = createElementWithClassId('span', [
      style['chat__msg-username'],
    ]);
    userSpan.textContent = message.from;
    const timeSpan = createElementWithClassId('span', [
      style['chat__msg-time'],
    ]);
    timeSpan.textContent = new Date(message.datetime).toLocaleString();
    metaDiv.append(userSpan, timeSpan);

    if (isMine) {
      const statusSpan = createElementWithClassId('span', ['msg-status']);
      statusSpan.textContent = message.status.isRead
        ? 'read'
        : this._currentUser.isLogin
          ? 'delivered'
          : 'sent';
      metaDiv.append(statusSpan);
    }
    wrapper.append(metaDiv);

    const textDiv = createElementWithClassId('div', [
      style['chat__dialog-text'],
    ]);
    textDiv.textContent = message.text;
    wrapper.append(textDiv);

    let editButton: HTMLButtonElement | null = null;
    if (isMine) {
      const actions = createElementWithClassId('div', [
        style['chat__dialog-actions'],
      ]);

      editButton = ButtonFactory.create(
        [style['chat__msg-edit-btn']],
        'button',
        '✏️',
      );
      editButton.classList.add('edit-btn');
      editButton.addEventListener('click', () =>
        this._startEdit(message.id, textDiv),
      );
      actions.append(editButton);

      const delButton = ButtonFactory.create(
        [style['chat__msg-delete-btn']],
        'button',
        '🗑',
      );
      delButton.addEventListener('click', () => {
        wrapper.remove();
        void WebSocketService.deleteMessage(message.id);
      });
      actions.append(delButton);

      wrapper.append(actions);
    }

    if (message.status.isEdited) {
      const mark = document.createElement('span');
      mark.className = 'edited-mark';
      mark.textContent = 'edited';
      mark.setAttribute('aria-hidden', 'true');

      if (editButton) {
        editButton.after(mark);
      } else {
        textDiv.after(mark);
      }
    }

    this._body.append(wrapper);
    this._scrollToBottom();
  }

  private _startEdit(messageId: string, textDiv: HTMLElement): void {
    const oldText = textDiv.textContent!;
    const input = document.createElement('input');
    input.value = oldText;
    input.className = style['chat__edit-input'];
    textDiv.replaceWith(input);
    input.focus();

    const cleanup = (): void => {
      input.removeEventListener('blur', save);
      input.removeEventListener('keydown', onKeyDown);
    };

    const save = (): void => {
      cleanup();
      const newText = input.value.trim();
      input.replaceWith(textDiv);
      if (!newText || newText === oldText) return;
      WebSocketService.editMessage(messageId, newText).then((editedMessage) => {
        this._applyEdit(messageId, editedMessage.text);
      });
      // .catch(console.error);
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Enter') {
        event.preventDefault();
        save();
      }
    };

    input.addEventListener('blur', save);
    input.addEventListener('keydown', onKeyDown);
  }

  private _applyEdit(messageId: string, newText: string): void {
    const wrapper = this._body.querySelector(`[data-msg-id="${messageId}"]`);
    if (!wrapper) return;

    const textDiv = wrapper.querySelector(`.${style['chat__dialog-text']}`);
    if (textDiv) {
      textDiv.textContent = newText;
    }

    const editButton = wrapper.querySelector('button.edit-btn');
    if (editButton && !wrapper.querySelector('.edited-mark')) {
      const mark = document.createElement('span');
      mark.className = 'edited-mark';
      mark.textContent = 'edited';
      mark.setAttribute('aria-hidden', 'true');
      editButton.after(mark);
    }
  }

  private _scrollToBottom(): void {
    this._body.scrollTop = this._body.scrollHeight;
  }
}
