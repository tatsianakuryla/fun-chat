import { type LoginedUser } from '../../api/api-types';
import { LocalStorage } from '../local-storge/Local-storage';
import { LocalStorageKeys } from '../local-storge/local-storage-types';

export class AuthState {
  private static _user: LoginedUser | null = null;

  public static get user(): LoginedUser | null {
    return this._user;
  }

  public static get isAuthorized(): boolean {
    return this._user !== null;
  }

  public static init(): void {
    this._user = LocalStorage.getUser(LocalStorageKeys.User);
  }

  public static setUser(user: LoginedUser): void {
    this._user = user;
    LocalStorage.setUser(LocalStorageKeys.User, user);
  }

  public static clear(): void {
    this._user = null;
    LocalStorage.removeItem(LocalStorageKeys.User);
  }
}
