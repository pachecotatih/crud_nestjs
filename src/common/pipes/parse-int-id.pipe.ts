import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
// Manipular, transformar ou validar o corpo da requisição
@Injectable() // funciona a função mesmo se não utilizar isso, mas se for adicionar uma dependência (como um service de recados por exemplo), vai dar erro.
export class ParseIntIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param' || metadata.data !== 'id') return value;
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      throw new BadRequestException('id deve ser uma string numérica');
    }
    if (parsedValue <= 0) {
      throw new BadRequestException('id deve ser maior que zero');
    }
    return parsedValue;
  }
}
