import { RecadosController } from './recados.controller';

describe('RecadosController', () => {
  let controller: RecadosController;
  const recadosServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    controller = new RecadosController(recadosServiceMock as any);
  });

  it('create - deve usar o RecadosService com os argumentos corretos', async () => {
    const argument1 = { key: 'value' };
    const argument2 = { key: 'value' };
    const expected = { anyKey: 'anyValue' };

    jest.spyOn(recadosServiceMock, 'create').mockResolvedValue(expected);

    const result = await controller.create(argument1 as any, argument2 as any);

    expect(recadosServiceMock.create).toHaveBeenCalledWith(
      argument1,
      argument2,
    );
    expect(result).toEqual(expected);
  });

  it('findAll - deve usar o RecadosService com os argumentos corretos', async () => {
    const argument1 = { key: 'value' };
    const argument2 = { key: 'value' };
    const expected = { anyKey: 'anyValue' };

    jest.spyOn(recadosServiceMock, 'findAll').mockResolvedValue(expected);

    const result = await controller.findAll(argument1 as any, argument2 as any);

    expect(recadosServiceMock.findAll).toHaveBeenCalledWith(
      argument1,
      argument2,
    );
    expect(result).toEqual(expected);
  });

  it('findOne - deve usar o RecadosService com o argumento correto', async () => {
    const argument = 1;
    const expected = { anyKey: 'anyValue' };

    jest.spyOn(recadosServiceMock, 'findOne').mockResolvedValue(expected);

    const result = await controller.findOne(argument);

    expect(recadosServiceMock.findOne).toHaveBeenCalledWith(argument);
    expect(result).toEqual(expected);
  });

  it('update - deve usar o RecadosService com os argumentos corretos', async () => {
    const argument1 = 1;
    const argument2 = { key: 'value' };
    const argument3 = { key: 'value' };
    const expected = { anyKey: 'anyValue' };

    jest.spyOn(recadosServiceMock, 'update').mockResolvedValue(expected);

    const result = await controller.update(
      argument1,
      argument2 as any,
      argument3 as any,
    );

    expect(recadosServiceMock.update).toHaveBeenCalledWith(
      argument1,
      argument2,
      argument3,
    );
    expect(result).toEqual(expected);
  });

  it('remove - deve usar o RecadosService com os argumentos corretos', async () => {
    const argument1 = 1;
    const argument2 = { key: 'value' };
    const expected = { anyKey: 'anyValue' };

    jest.spyOn(recadosServiceMock, 'remove').mockResolvedValue(expected);

    const result = await controller.remove(argument1, argument2 as any);

    expect(recadosServiceMock.remove).toHaveBeenCalledWith(
      argument1,
      argument2,
    );
    expect(result).toEqual(expected);
  });
});
