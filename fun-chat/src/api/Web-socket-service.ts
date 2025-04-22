import { AuthState } from '../core/auth/Auth-state';
import { IdCreator } from '../core/id-creator/id-creator';
import {
  GetActiveUsersRequest,
  GetActiveUsersResponse,
  GetInactiveUsersRequest,
  GetInactiveUsersResponse,
  RequestResponseTypes,
  type AuthErrorResponse,
  type AuthErrorsMessages,
  type AuthRequest,
  type AuthResponse,
  type LoginedUser,
  type LogoutRequest,
  type LogoutResponse,
} from './api-types';

export class WebSocketService {
  private static _socket: WebSocket;
  private static _messageQueue: string[] = [];
  private static _loginResponseMap = new Map<
    string,
    {
      resolve: (u: LoginedUser) => void;
      reject: (e: AuthErrorsMessages) => void;
    }
  >();
  private static _usersResponseMap = new Map<
    string,
    {
      resolve: (users: LoginedUser[]) => void;
      reject: (e: AuthErrorsMessages) => void;
    }
  >();
  private static _onDisconnect: Array<() => void> = [];
  private static _onReconnect: Array<() => void> = [];
  private static _onOpen: Array<() => void> = [];
  private static _shouldReconnect = true;
  private static _reconnectDelay = 1000;
  private static _maxReconnectDelay = 30000;

  public static connect(): void {
    this._socket = new WebSocket('ws://localhost:4000');

    this._socket.addEventListener('open', () => {
      this._messageQueue.forEach((data) => this._socket.send(data));
      this._messageQueue = [];

      this._onOpen.forEach((fn) => fn());
      this._reconnectDelay = 1000;
      this._onReconnect.forEach((fn) => fn());

      const user = AuthState.user;
      const password = AuthState.password;
      if (user && password) {
        this.loginUser(user.login, password)
          .then((loginedUser) => AuthState.setUser(loginedUser, password))
          .catch(() => AuthState.clear());
      }
    });

    this._socket.addEventListener('message', this._handleLoginMessage);

    this._socket.addEventListener('close', () => {
      this._onDisconnect.forEach((fn) => fn());

      if (this._shouldReconnect) {
        setTimeout(() => this.connect(), this._reconnectDelay);
        this._reconnectDelay = Math.min(
          this._reconnectDelay * 2,
          this._maxReconnectDelay,
        );
      }
    });

    this._socket.addEventListener('error', () => {
      this._socket.close();
    });
  }

  public static get isConnected(): boolean {
    return this._socket?.readyState === WebSocket.OPEN;
  }

  public static onDisconnect(fn: () => void): void {
    this._onDisconnect.push(fn);
  }

  public static onReconnect(fn: () => void): void {
    this._onReconnect.push(fn);
  }

  private static _sendMessage(message: object): void {
    const data = JSON.stringify(message);

    if (this._socket.readyState === WebSocket.OPEN) {
      this._socket.send(data);
    } else {
      this._messageQueue.push(data);
    }
  }

  public static loginUser(
    login: string,
    password: string,
  ): Promise<LoginedUser> {
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
  ): Promise<LoginedUser> {
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

  public static getActiveUsers(): Promise<LoginedUser[]> {
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

  public static getInactiveUsers(): Promise<LoginedUser[]> {
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

  private static _handleLoginMessage = (event: MessageEvent): void => {
    const result:
      | AuthErrorResponse
      | AuthResponse
      | LogoutResponse
      | GetActiveUsersResponse
      | GetInactiveUsersResponse = JSON.parse(event.data);

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
  };
}
