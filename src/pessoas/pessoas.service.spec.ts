import { Test, TestingModule } from '@nestjs/testing';
import { PessoasService } from './pessoas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';

import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { ConflictException } from '@nestjs/common';

describe('PessoasService', () => {
  let pessoaService: PessoasService;
  let pessoaRepository: Repository<Pessoa>;
  let hashingService: HashingServiceProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PessoasService,
        {
          provide: getRepositoryToken(Pessoa),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: HashingServiceProtocol,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();
    pessoaService = module.get<PessoasService>(PessoasService);
    pessoaRepository = module.get<Repository<Pessoa>>(
      getRepositoryToken(Pessoa),
    );
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
  });

  test('deve estar definido', () => {
    expect(pessoaService).toBeDefined();
  });

  describe('create', () => {
    test('deve criar uma nova pessoa', async () => {
      // Arrange
      const createPessoaDto: CreatePessoaDto = {
        email: 'tatiana@email.com',
        password: '123456',
        nome: 'Tatiana',
      };
      const passwordHash = 'hashedPassword';
      const novaPessoa = {
        id: 1,
        nome: createPessoaDto.nome,
        email: createPessoaDto.email,
        passwordHash,
      };

      // Mocking do valor retornado pelo hashingService.hash e pessoaRepository.create
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(pessoaRepository, 'create')
        .mockReturnValue(novaPessoa as Pessoa);

      // Act
      const result = await pessoaService.create(createPessoaDto);

      // Assert
      expect(hashingService.hash).toHaveBeenCalledWith(
        createPessoaDto.password,
      );
      expect(pessoaRepository.create).toHaveBeenCalledWith({
        nome: createPessoaDto.nome,
        passwordHash,
        email: createPessoaDto.email,
      });
      expect(pessoaRepository.save).toHaveBeenCalledWith(novaPessoa);
      expect(result).toEqual(novaPessoa);
    });
    test('deve lançar ConflictException se o email já existir', async () => {
      jest.spyOn(pessoaRepository, 'save').mockRejectedValue({
        code: '23505',
      });
      await expect(pessoaService.create({} as CreatePessoaDto)).rejects.toThrow(
        ConflictException,
      );
    });
    test('deve lançar Error se ocorrer outro erro', async () => {
      jest
        .spyOn(pessoaRepository, 'save')
        .mockRejectedValue(new Error('Erro desconhecido'));
      await expect(pessoaService.create({} as CreatePessoaDto)).rejects.toThrow(
        new Error('Erro desconhecido'),
      );
    });
  });
});
