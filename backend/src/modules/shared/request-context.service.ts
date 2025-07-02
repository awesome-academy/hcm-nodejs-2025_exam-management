import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

type ContextStore = {
  lang?: string;
};

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<ContextStore>();

  run(callback: () => void, context: ContextStore) {
    this.storage.run(context, callback);
  }

  get<T extends keyof ContextStore>(key: T): ContextStore[T] | undefined {
    return this.storage.getStore()?.[key];
  }

  set<T extends keyof ContextStore>(key: T, value: ContextStore[T]) {
    const store = this.storage.getStore();
    if (store) store[key] = value;
  }

  getLang(): string | undefined {
    return this.get('lang');
  }
}
