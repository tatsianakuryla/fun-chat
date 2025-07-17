export class IdCreator {
  private static _idCounter: number = 0;

  public static getNew(): string {
    this._idCounter += 1;
    return String(this._idCounter);
  }
}
