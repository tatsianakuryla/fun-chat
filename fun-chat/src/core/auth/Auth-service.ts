import type { LoginedUser } from '../../api/api-types';
import { WebSocketService } from '../../api/Web-socket-service';

export class AuthService {
  public static login(login: string, password: string): Promise<LoginedUser> {
    return WebSocketService.loginUser(login, password);
  }
}
