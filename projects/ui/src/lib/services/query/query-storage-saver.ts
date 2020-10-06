export interface QueryStorage {
  setItem(key: string, value: string);
  getItem(key: string): string;
}

export class QueryStorageSaver {

  readonly storageToken = 'global';
  readonly storage: QueryStorage = sessionStorage;

  setItem(param: string, value: string) {
    this.storage.setItem(`${this.storageToken}-${param}`, value);
  }

  getItem(param: string) {
    return this.storage.getItem(`${this.storageToken}-${param}`);
  }
}
