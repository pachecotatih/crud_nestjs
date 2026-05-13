// Cliente (Navegador) -> (Servidor) -> Vários Middleware (Request, Response)
// -> NestJs (Guards, Interceptors, Pipes, Filters)

import { NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

export class AnotherMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const authorization = req.headers?.authorization;
    if (authorization) {
      req['user'] = {
        nome: 'Tatiana',
        sobrenome: 'Pacheco',
      };
    }

    res.setHeader('CABECALHO', 'Do Middleware');

    // Terminar cadeia de chamadas
    // return res.status(404).send({
    //   message: 'Não encontrado',
    // });
    next();
  }
}
