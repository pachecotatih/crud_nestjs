// Cliente (Navegador) -> (Servidor) -> Vários Middleware (Request, Response): mais próximo do servidor, nem chegou ao nestjs
// -> NestJs (Guards, Interceptors, Pipes, Filters)

import { NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

export class SimpleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const authorization = req.headers?.authorization;
    if (authorization) {
      req['user'] = {
        nome: 'Tatiana',
        sobrenome: 'Pacheco',
        role: 'admin',
      };
    }

    res.setHeader('CABECALHO', 'Do Middleware');

    // Terminar cadeia de chamadas
    // return res.status(404).send({
    //   message: 'Não encontrado',
    // });

    next(); // Próximo middleware

    // // após a execução do nest
    // res.on('finish', () => {
    //   console.log('SimpleMiddleware finalizado.');
    // });
  }
}
