import { type LoginedUser } from '../../api/api-types';
import { LocalStorage } from '../local-storge/Local-storage';
import { LocalStorageKeys } from '../local-storge/local-storage-types';

export class AuthState {
  private static _user: LoginedUser | null = null;
  private static _password: string | null;

  public static get user(): LoginedUser | null {
    return this._user;
  }

  public static get password(): string | null {
    return this._password;
  }

  public static get isAuthorized(): boolean {
    return this._user !== null;
  }

  public static init(): void {
    this._user = LocalStorage.getUser(LocalStorageKeys.User);
    this._password = LocalStorage.getUserData(LocalStorageKeys.Password);
  }

  public static setUser(user: LoginedUser, password: string): void {
    this._user = user;
    this._password = password;
    LocalStorage.setUser(LocalStorageKeys.User, user);
    LocalStorage.setUserData(LocalStorageKeys.Password, password);
  }

  public static clear(): void {
    this._user = null;
    this._password = null;
    LocalStorage.removeItem(LocalStorageKeys.User);
  }
}
