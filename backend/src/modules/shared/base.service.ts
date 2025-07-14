import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from './request-context.service';

export class BaseService {
  constructor(
    protected readonly i18n: I18nService,
    protected readonly context: RequestContextService,
  ) {}

  protected get lang(): string {
    return this.context.getLang() || 'vi';
  }

  protected async t(key: string): Promise<string> {
    return this.i18n.translate(key, { lang: this.lang }) as Promise<string>;
  }
}
