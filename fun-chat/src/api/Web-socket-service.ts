import { errorNotificationClass, SERVER_ERROR_TEXT_CONTENT } from '..';
import { AuthState } from '../core/auth/Auth-state';
import { IdCreator } from '../core/id-creator/id-creator';
import {
  type GetActiveUsersRequest,
  type GetInactiveUsersRequest,
  type Message,
  type MessageFromUserRequest,
  type MessageReadRequest,
  type MessageSendRequest,
  RequestResponseTypes,
  type ServerResponse,
  type AuthErrorsMessages,
  type AuthRequest,
  type LoginUser,
  type LogoutRequest,
  type MessageEditRequest,
} from './api-types';

export class WebSocketService {
  private static _socket: WebSocket;
  private static _messageQueue: string[] = [];
  private static _loginResponseMap = new Map<
    string,
    {
      resolve: (user: LoginUser) => void;
      reject: (error: AuthErrorsMessages) => void;
    }
  >();
  private static _usersResponseMap = new Map<
    string,
    {
      resolve: (users: LoginUser[]) => void;
      reject: (error: AuthErrorsMessages) => void;
    }
  >();
  private static _historyResponseMap = new Map<
    string,
    {
      resolve: (messages: Message[]) => void;
      reject: () => void;
    }
  >();
  private static _sendMessageResponseMap = new Map<
    string,
    { resolve: (messages: Message) => void; reject: () => void }
  >();
  private static _readResponseMap = new Map<
    string,
    {
      resolve: (message: { id: string; status: { isRead: boolean } }) => void;
      reject: () => void;
    }
  >();
  private static _deleteResponseMap = new Map<
    string,
    { resolve: (id: string) => void; reject: () => void }
  >();
  private static _editResponseMap = new Map<
    string,
    {
      resolve: (message: Message) => void;
      reject: () => void;
    }
  >();
  private static _messageListeners: Array<(message: ServerResponse) => void> =
    [];
  private static _onDisconnect: Array<() => void> = [];
  private static _onReconnect: Array<() => void> = [];
  private static _onOpen: Array<() => void> = [];
  private static _shouldReconnect = true;
  private static _reconnectDelay = 1000;
  private static _maxReconnectDelay = 30000;

  public static connect(): void {
    this._socket = new WebSocket('https://fun-chat-server-3m8s.onrender.com');

    this._socket.addEventListener('open', () => {
      this._messageQueue.forEach((data) => this._socket.send(data));
      this._messageQueue = [];

      this._onOpen.forEach((function_) => function_());
      this._reconnectDelay = 1000;
      this._onReconnect.forEach((function_) => function_());

      const user = AuthState.user;
      const password = AuthState.password;
      if (user && password) {
        this.loginUser(user.login, password)
          .then((loginUser) => AuthState.setUser(loginUser, password))
          .catch(() => AuthState.clear());
      }
    });

    this._socket.addEventListener('message', this._handleMessage);

    this._socket.addEventListener('error', () => {
      errorNotificationClass.open(SERVER_ERROR_TEXT_CONTENT);
      this._socket.close();
    });

    this._socket.addEventListener('close', () => {
      errorNotificationClass.open(SERVER_ERROR_TEXT_CONTENT);
      this._onDisconnect.forEach((function_) => function_());

      if (this._shouldReconnect) {
        setTimeout(() => this.connect(), this._reconnectDelay);
        this._reconnectDelay = Math.min(
          this._reconnectDelay * 2,
          this._maxReconnectDelay,
        );
      }
    });
  }

  public static onMessage(handler: (message: ServerResponse) => void): void {
    this._messageListeners.push(handler);
  }

  public static onDisconnect(function_: () => void): void {
    this._onDisconnect.push(function_);
  }

  public static onReconnect(function_: () => void): void {
    this._onReconnect.push(function_);
  }

  public static loginUser(login: string, password: string): Promise<LoginUser> {
    const id = IdCreator.getNew();
    const request: AuthRequest = {
      id,
      type: RequestResponseTypes.Login,
      payload: { user: { login, password } },
    };

    return new Promise((resolve, reject) => {
      this._loginResponseMap.set(id, { resolve, reject });
      this._sendMessage(request);
    });
  }

  public static logoutUser(
    login: string,
    password: string,
  ): Promise<LoginUser> {
    const id = IdCreator.getNew();
    const request: LogoutRequest = {
      id,
      type: RequestResponseTypes.Logout,
      payload: { user: { login, password } },
    };

    return new Promise((resolve, reject) => {
      this._loginResponseMap.set(id, { resolve, reject });
      this._sendMessage(request);
    });
  }

  public static getActiveUsers(): Promise<LoginUser[]> {
    const id = IdCreator.getNew();
    const request: GetActiveUsersRequest = {
      id,
      type: RequestResponseTypes.USER_ACTIVE,
      payload: null,
    };

    return new Promise((resolve, reject) => {
      this._usersResponseMap.set(id, { resolve, reject });
      this._sendMessage(request);
    });
  }

  public static getInactiveUsers(): Promise<LoginUser[]> {
    const id = IdCreator.getNew();
    const request: GetInactiveUsersRequest = {
      id,
      type: RequestResponseTypes.USER_INACTIVE,
      payload: null,
    };

    return new Promise((resolve, reject) => {
      this._usersResponseMap.set(id, { resolve, reject });
      this._sendMessage(request);
    });
  }

  public static getMessageHistory(login: string): Promise<Message[]> {
    const id = IdCreator.getNew();
    const request: MessageFromUserRequest = {
      id,
      type: RequestResponseTypes.MSG_FROM_USER,
      payload: { user: { login } },
    };
    return new Promise((resolve, reject) => {
      this._historyResponseMap.set(id, { resolve, reject });
      this._sendMessage(request);
    });
  }

  public static sendMessage(to: string, text: string): Promise<Message> {
    const id = IdCreator.getNew();
    const request: MessageSendRequest = {
      id,
      type: RequestResponseTypes.MSG_SEND,
      payload: { message: { to, text } },
    };

    return new Promise((resolve, reject) => {
      this._sendMessageResponseMap.set(id, { resolve, reject });
      this._sendMessage(request);
    });
  }

  public static deleteMessage(id: string): Promise<string> {
    const requestId = IdCreator.getNew();
    const request = {
      id: requestId,
      type: RequestResponseTypes.MSG_DELETE,
      payload: { message: { id } },
    };
    return new Promise((resolve, reject) => {
      this._deleteResponseMap.set(requestId, { resolve, reject });
      this._sendMessage(request);
    });
  }

  public static readMessage(
    messageId: string,
  ): Promise<{ id: string; status: { isRead: boolean } }> {
    const id = IdCreator.getNew();
    const request: MessageReadRequest = {
      id,
      type: RequestResponseTypes.MSG_READ,
      payload: { message: { id: messageId } },
    };
    return new Promise((resolve, reject) => {
      this._readResponseMap.set(id, { resolve, reject });
      this._sendMessage(request);
    });
  }

  public static editMessage(id: string, text: string): Promise<Message> {
    const requestId = IdCreator.getNew();
    const request: MessageEditRequest = {
      id: requestId,
      type: RequestResponseTypes.MSG_EDIT,
      payload: { message: { id, text } },
    };
    return new Promise((resolve, reject) => {
      this._editResponseMap.set(requestId, { resolve, reject });
      this._sendMessage(request);
    });
  }

  private static _sendMessage(message: object): void {
    const data = JSON.stringify(message);

    if (this._socket.readyState === WebSocket.OPEN) {
      this._socket.send(data);
    } else {
      this._messageQueue.push(data);
    }
  }

  private static _handleMessage = (event: MessageEvent): void => {
    const result: ServerResponse = JSON.parse(event.data);
    this._handleAuth(result);
    this._handleUsersList(result);
    this._handleHistory(result);
    this._handleSend(result);
    this._handleRead(result);
    this._handleDelete(result);
    this._handleEdit(result);
    this._messageListeners.forEach((function_) => function_(result));
  };

  private static _handleAuth(result: ServerResponse): void {
    if (
      result.type === RequestResponseTypes.Login ||
      result.type === RequestResponseTypes.Logout ||
      result.type === RequestResponseTypes.Error
    ) {
      const handler = this._loginResponseMap.get(result.id!);
      if (!handler) return;
      this._loginResponseMap.delete(result.id!);

      if (
        result.type === RequestResponseTypes.Login ||
        result.type === RequestResponseTypes.Logout
      ) {
        handler.resolve(result.payload.user);
      } else {
        handler.reject(result.payload.error);
      }
    }
  }

  private static _handleUsersList(result: ServerResponse): void {
    if (
      result.type === RequestResponseTypes.USER_ACTIVE ||
      result.type === RequestResponseTypes.USER_INACTIVE ||
      result.type === RequestResponseTypes.Error
    ) {
      const handler = this._usersResponseMap.get(result.id!);
      if (!handler) return;
      this._usersResponseMap.delete(result.id!);

      if (
        result.type === RequestResponseTypes.USER_ACTIVE ||
        result.type === RequestResponseTypes.USER_INACTIVE
      ) {
        handler.resolve(result.payload.users);
      } else {
        handler.reject(result.payload.error);
      }
    }
  }

  private static _handleHistory(result: ServerResponse): void {
    if (result.type === RequestResponseTypes.MSG_FROM_USER) {
      const handler = this._historyResponseMap.get(result.id!);
      if (!handler) return;
      this._historyResponseMap.delete(result.id!);
      handler.resolve(result.payload.messages);
    }
  }

  private static _handleSend(result: ServerResponse): void {
    if (result.type === RequestResponseTypes.MSG_SEND) {
      const handler = this._sendMessageResponseMap.get(result.id!);
      if (!handler) return;
      this._sendMessageResponseMap.delete(result.id!);
      handler.resolve(result.payload.message);
    }
  }

  private static _handleRead(result: ServerResponse): void {
    if (result.type === RequestResponseTypes.MSG_READ) {
      const handler = this._readResponseMap.get(result.id!);
      if (!handler) return;
      this._readResponseMap.delete(result.id!);
      handler.resolve(result.payload.message);
    }
  }

  private static _handleDelete(result: ServerResponse): void {
    if (result.type === RequestResponseTypes.MSG_DELETE) {
      const handler = this._deleteResponseMap.get(result.payload.message.id);
      if (handler) {
        this._deleteResponseMap.delete(result.payload.message.id);
        handler.resolve(result.payload.message.id);
      }
    }
  }

  private static _handleEdit(result: ServerResponse): void {
    if (result.type !== RequestResponseTypes.MSG_EDIT) return;
    const requestId = result.id;
    if (requestId) {
      const handler = this._editResponseMap.get(requestId);
      if (!handler) return;
      this._editResponseMap.delete(requestId);
      handler.resolve(result.payload.message);
    }
  }
}
