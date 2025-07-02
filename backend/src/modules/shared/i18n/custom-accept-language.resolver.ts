import { Injectable } from '@nestjs/common';
import { I18nResolver } from 'nestjs-i18n';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class CustomAcceptLanguageResolver implements I18nResolver {
  async resolve(context: ExecutionContext): Promise<string | undefined> {
    const req = context.switchToHttp().getRequest(); 
    const rawLang = req.headers['accept-language'];
    if (!rawLang) return;

    const lang = rawLang.split(',')[0].split('-')[0].toLowerCase();
    return lang;
  }
}
