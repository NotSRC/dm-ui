export interface QueryStorage {
  setItem(key: string, value: string);
  getItem(key: string);
}

export class QueryStorageSaver {

  readonly storageToken = 'global';
  readonly storage: QueryStorage = sessionStorage;

  setItem(param: string, value: string|number) {
    this.storage.setItem(`${this.storageToken}-${param}`, `${value}`);
  }

  getItem<T>(param: string): T {
    return this.storage.getItem(`${this.storageToken}-${param}`);
  }
}
