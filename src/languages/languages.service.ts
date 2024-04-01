import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class LanguagesService {
  private readonly logger = new Logger(LanguagesService.name);
  library: {
    am: { [name: string]: string };
    en: { [name: string]: string };
    ru: { [name: string]: string };
  } = { am: {}, ru: {}, en: {} };

  constructor() {
    const dataAm = readFileSync(join(__dirname, 'resources', 'am.json'), {
      encoding: 'utf-8',
    });
    const dataEn = readFileSync(join(__dirname, 'resources', 'en.json'), {
      encoding: 'utf-8',
    });
    const dataRu = readFileSync(join(__dirname, 'resources', 'ru.json'), {
      encoding: 'utf-8',
    });

    this.library = {
      am: JSON.parse(dataAm),
      en: JSON.parse(dataEn),
      ru: JSON.parse(dataRu),
    };

    this.logger.log('Library initialized');
  }
}
