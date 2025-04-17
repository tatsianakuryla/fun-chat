import { IdCreator } from '../core/id-creator/id-creator';
import type {
  AuthErrorResponse,
  AuthErrorsMessages,
  AuthRequest,
  AuthResponse,
  LoginedUser,
} from './api-types';

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
    this._socket.addEventListener('message', this._handleMessage);
    this._socket.addEventListener('open', () => {
      console.log('WebSocket подключён успешно!');
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

  private static _handleMessage = (event: MessageEvent): void => {
    const result: AuthErrorResponse | AuthResponse = JSON.parse(event.data);

    const handler = this._loginResponseMap.get(result.id);
    if (!handler) return;

    this._loginResponseMap.delete(result.id);

    if (result.type === 'USER_LOGIN') {
      handler.resolve(result.payload.user);
    } else {
      handler.reject(result.payload.error);
    }
  };
}
