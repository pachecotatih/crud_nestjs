import { validate } from 'class-validator';
import { CreateRecadoDto } from './create-recado.dto';

describe('CreateRecadoDto', () => {
  it('deve validar um DTO válido', async () => {
    const dto = Object.assign(new CreateRecadoDto(), {
      texto: 'Recado de exemplo',
      paraId: 1,
      deId: 2,
      lido: false,
      data: new Date(),
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0); // Nenhum erro significa que o DTO é válido
  });

  it('deve falhar se o texto for muito longo', async () => {
    const dto = Object.assign(new CreateRecadoDto(), {
      texto: 'a'.repeat(256),
      paraId: 1,
      deId: 2,
      lido: false,
      data: new Date(),
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('texto');
  });

  it('deve falhar se o paraId for inválido', async () => {
    const dto = Object.assign(new CreateRecadoDto(), {
      texto: 'Recado de exemplo',
      paraId: -1,
      deId: 2,
      lido: false,
      data: new Date(),
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('paraId');
  });
});
