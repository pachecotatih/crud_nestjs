import { registerAs } from '@nestjs/config';

export default registerAs('recados', () => ({
  teste1: 'TESTE 1',
  teste2: 'TESTE 2',
}));
