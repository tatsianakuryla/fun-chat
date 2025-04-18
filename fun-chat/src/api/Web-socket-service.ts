import { Router } from '../core/router/router';
import { AuthState } from '../core/auth/Auth-state';
import { IdCreator } from '../core/id-creator/id-creator';
import type {
  AuthErrorResponse,
  AuthErrorsMessages,
  AuthRequest,
  AuthResponse,
  LoginedUser,
  LogoutRequest,
  LogoutResponse,
} from './api-types';
import { Routes } from '../types';

export class WebSocketService {
  private static _socket: WebSocket;
  private static _loginResponseMap = new Map<
    string,
    {
      resolve: (user: LoginedUser) => void;
      reject: (error: AuthErrorsMessages) => void;
    }
  >();

  public static connect(): void {
    this._socket = new WebSocket('ws://localhost:4000');
    this._socket.addEventListener('message', this._handleLoginMessage);
    this._socket.addEventListener('open', () => {
      const user = AuthState.user;
      const password = AuthState.password;
      if (user && password) {
        WebSocketService.loginUser(user.login, password)
          .then((loginedUser) => {
            AuthState.setUser(loginedUser, password);
          })
          .catch(() => {
            AuthState.clear();
          });
      }
    });
    this._socket.addEventListener('close', () => {
      console.log('WebSocket отключён!');
    });
  }

  public static loginUser(
    login: string,
    password: string,
  ): Promise<LoginedUser> {
    const id = IdCreator.getNew();
    const message: AuthRequest = {
      id,
      type: 'USER_LOGIN',
      payload: {
        user: { login, password },
      },
    };
    return new Promise((resolve, reject) => {
      this._loginResponseMap.set(id, { resolve, reject });
      this._socket?.send(JSON.stringify(message));
    });
  }

  public static logoutUser(
    login: string,
    password: string,
  ): Promise<LoginedUser> {
    const id = IdCreator.getNew();
    const message: LogoutRequest = {
      id,
      type: 'USER_LOGOUT',
      payload: {
        user: { login, password },
      },
    };

    return new Promise((resolve, reject) => {
      this._loginResponseMap.set(id, { resolve, reject });
      this._socket.send(JSON.stringify(message));
    });
  }

  private static _handleLoginMessage = (event: MessageEvent): void => {
    const result: AuthErrorResponse | AuthResponse | LogoutResponse =
      JSON.parse(event.data);

    const handler = this._loginResponseMap.get(result.id);
    if (!handler) return;

    this._loginResponseMap.delete(result.id);

    switch (result.type) {
      case 'USER_LOGIN':
      case 'USER_LOGOUT':
        handler.resolve(result.payload.user);
        break;
      case 'ERROR':
        handler.reject(result.payload.error);
        break;
    }
  };
}
