import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from '../request-context.service';

export function createContextMiddleware(contextService: RequestContextService) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawLang = req.headers['accept-language']?.split(',')[0] || 'vi';
    const lang = rawLang.split('-')[0].toLowerCase();
    contextService.run(
      () => {
        contextService.set('lang', lang);
        next();
      },
      { lang },
    );
  };
}
