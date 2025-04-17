import { LoginedUser } from '../../api/api-types';
import { LocalStorageKeys } from './local-storage-types';

export class LocalStorage {
  public static setLogin(key: LocalStorageKeys, value: string): void {
    localStorage.setItem(key, value);
  }

  public static getLogin(key: LocalStorageKeys.Login): string | null {
    const result = localStorage.getItem(key);
    return result ? JSON.parse(result) : null;
  }

  public static setUser(key: LocalStorageKeys, user: LoginedUser): void {
    localStorage.setItem(key, JSON.stringify(user));
  }

  public static getUser(key: LocalStorageKeys.User): LoginedUser | null {
    const result = localStorage.getItem(key);
    return result ? JSON.parse(result) : null;
  }

  public static removeItem(key: LocalStorageKeys): void {
    localStorage.removeItem(key);
  }
}
