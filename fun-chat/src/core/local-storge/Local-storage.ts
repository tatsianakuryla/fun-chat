import { type LoginedUser } from '../../api/api-types';
import { type LocalStorageKeys } from './local-storage-types';

export class LocalStorage {
  public static setUserData(
    key: LocalStorageKeys.Login | LocalStorageKeys.Password,
    value: string,
  ): void {
    localStorage.setItem(key, value);
  }

  public static getUserData(
    key: LocalStorageKeys.Login | LocalStorageKeys.Password,
  ): string | null {
    const result = localStorage.getItem(key);
    return result ? result : null;
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
