import { Injectable } from '@nestjs/common';

@Injectable()
export class RecadosUtils {
  inverteString(str: string) {
    // Luiz -> ziuL
    return str.split('').reverse().join('');
  }
}

@Injectable()
export class RecadosUtilsMock {
  inverteString(str: string) {
    return 'sasfasdf';
  }
}
