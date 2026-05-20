import { Test, TestingModule } from '@nestjs/testing';
import { PessoasService } from './pessoas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';

import { CreatePessoaDto } from './dto/create-pessoa.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import * as path from 'path';
import * as fs from 'fs/promises';
//mockResolvedValue - mockando o retorno de uma promise
// mockReturnValue - mockando o retorno de uma função síncrona
jest.mock('fs/promises');

describe('PessoasService', () => {
  let pessoasService: PessoasService;
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
            findOneBy: jest.fn(),
            find: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
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
    pessoasService = module.get<PessoasService>(PessoasService);
    pessoaRepository = module.get<Repository<Pessoa>>(
      getRepositoryToken(Pessoa),
    );
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
  });

  test('deve estar definido', () => {
    expect(pessoasService).toBeDefined();
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
      const result = await pessoasService.create(createPessoaDto);

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
      await expect(
        pessoasService.create({} as CreatePessoaDto),
      ).rejects.toThrow(ConflictException);
    });
    test('deve lançar Error se ocorrer outro erro', async () => {
      jest
        .spyOn(pessoaRepository, 'save')
        .mockRejectedValue(new Error('Erro desconhecido'));
      await expect(
        pessoasService.create({} as CreatePessoaDto),
      ).rejects.toThrow(new Error('Erro desconhecido'));
    });
  });
  describe('findOne', () => {
    test('deve retornar uma pessoa existente', async () => {
      const pessoaId = 1;
      const pessoaEncontrada = {
        id: pessoaId,
        nome: 'Tatiana',
        email: 'tatiana@email.com',
        passwordHash: 'hashedPassword',
      };
      jest
        .spyOn(pessoaRepository, 'findOneBy')
        .mockResolvedValue(pessoaEncontrada as Pessoa);
      const result = await pessoasService.findOne(pessoaId);
      expect(result).toEqual(pessoaEncontrada);
    });

    test('deve lançar NotFoundException se a pessoa não for encontrada', async () => {
      await expect(pessoasService.findOne(1)).rejects.toThrow(
        new NotFoundException('Pessoa não encontrada'),
      );
    });
  });
  describe('findAll', () => {
    test('deve retornar uma lista de pessoas', async () => {
      const pessoasMock: Pessoa[] = [
        {
          id: 1,
          nome: 'Tatiana',
          email: 'tatiana@email.com',
          passwordHash: 'hashedPassword',
        } as Pessoa,
        {
          id: 2,
          nome: 'Tatiana',
          email: 'tatiana1@email.com',
          passwordHash: 'hashedPassword',
        } as Pessoa,
      ];
      jest.spyOn(pessoaRepository, 'find').mockResolvedValue(pessoasMock);
      const result = await pessoasService.findAll();
      expect(result).toEqual(pessoasMock);
      expect(pessoaRepository.find).toHaveBeenCalledWith({
        order: {
          createdAt: 'DESC',
        },
      });
    });
  });
  describe('update', () => {
    test('deve atualizar uma pessoa se o usuário for autorizado', async () => {
      const pessoaId = 1;
      const updatePessoaDto: UpdatePessoaDto = {
        nome: 'Tatiana Silva',
        password: '654321',
      };
      const tokenPayload: TokenPayloadDto = {
        sub: pessoaId,
        email: 'tatiana@email.com',
      };
      const passwordHash = 'hashedPassword';
      const dadosPessoa = {
        id: pessoaId,
        nome: updatePessoaDto.nome,
        passwordHash,
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(pessoaRepository, 'preload')
        .mockResolvedValue(dadosPessoa as Pessoa);
      jest
        .spyOn(pessoaRepository, 'save')
        .mockResolvedValue(dadosPessoa as Pessoa);

      const result = await pessoasService.update(
        pessoaId,
        updatePessoaDto,
        tokenPayload,
      );

      expect(hashingService.hash).toHaveBeenCalledWith(
        updatePessoaDto.password,
      );
      expect(pessoaRepository.preload).toHaveBeenCalledWith({
        id: pessoaId,
        nome: updatePessoaDto.nome,
        passwordHash,
      });
      expect(pessoaRepository.save).toHaveBeenCalledWith(dadosPessoa);
      expect(result).toEqual(dadosPessoa);
    });
    test('deve lançar NotFoundException se a pessoa não for encontrada', async () => {
      const pessoaId = 1;
      const tokenPayload: TokenPayloadDto = {
        sub: pessoaId,
        email: 'tatiana@email.com',
      };
      const updatePessoaDto: UpdatePessoaDto = {
        nome: 'Tatiana Silva',
      };
      jest.spyOn(pessoaRepository, 'preload').mockResolvedValue(undefined);
      await expect(
        pessoasService.update(pessoaId, updatePessoaDto, tokenPayload),
      ).rejects.toThrow(new NotFoundException('Pessoa não encontrada'));
    });
    test('deve lançar ForbiddenException se a pessoa não for autorizada', async () => {
      const pessoaId = 1;
      const tokenPayload: TokenPayloadDto = {
        sub: 2,
        email: 'tatiana@email.com',
      };
      const updatePessoaDto: UpdatePessoaDto = {
        nome: 'Tatiana Silva',
      };
      const pessoaExiste = {
        id: pessoaId,
        nome: updatePessoaDto.nome,
      };
      jest
        .spyOn(pessoaRepository, 'preload')
        .mockResolvedValue(pessoaExiste as Pessoa);
      await expect(
        pessoasService.update(pessoaId, updatePessoaDto, tokenPayload),
      ).rejects.toThrow(new ForbiddenException('Acesso negado!'));
    });
  });
  describe('remove', () => {
    test('deve remover uma pessoa se o usuário for autorizado', async () => {
      const pessoaId = 1;
      const tokenPayload: TokenPayloadDto = {
        sub: pessoaId,
        email: 'tatiana@email.com',
      };
      const pessoaEncontrada = {
        id: pessoaId,
        nome: 'Tatiana',
        email: 'tatiana@email.com',
        passwordHash: 'hashedPassword',
      } as Pessoa;
      jest
        .spyOn(pessoaRepository, 'findOneBy')
        .mockResolvedValue(pessoaEncontrada);
      jest
        .spyOn(pessoaRepository, 'remove')
        .mockResolvedValue(pessoaEncontrada);
      const result = await pessoasService.remove(pessoaId, tokenPayload);
      expect(pessoaRepository.findOneBy).toHaveBeenCalledWith({ id: pessoaId });
      expect(pessoaRepository.remove).toHaveBeenCalledWith(pessoaEncontrada);
      expect(result).toEqual(pessoaEncontrada);
    });
    test('deve lançar NotFoundException se a pessoa nao for encontrada', async () => {
      const pessoaId = 1;
      const tokenPayload: TokenPayloadDto = {
        sub: pessoaId,
        email: 'tatiana@email.com',
      };
      jest.spyOn(pessoaRepository, 'findOneBy').mockResolvedValue(null);
      await expect(
        pessoasService.remove(pessoaId, tokenPayload),
      ).rejects.toThrow(new NotFoundException('Pessoa não encontrada'));
    });
    test('deve lançar ForbiddenException se a pessoa nao for autorizada', async () => {
      const pessoaId = 1;
      const tokenPayload: TokenPayloadDto = {
        sub: 2,
        email: 'tatiana@email.com',
      };
      const pessoaEncontrada = {
        id: pessoaId,
        nome: 'Tatiana',
        email: 'tatiana@email.com',
        passwordHash: 'hashedPassword',
      } as Pessoa;
      jest
        .spyOn(pessoaRepository, 'findOneBy')
        .mockResolvedValue(pessoaEncontrada);
      await expect(
        pessoasService.remove(pessoaId, tokenPayload),
      ).rejects.toThrow(new ForbiddenException('Acesso negado!'));
    });
  });
  describe('uploadPicture', () => {
    test('deve salvar a imagem corretamente e atualizar a pessoa', async () => {
      const mockFile = {
        originalname: 'profile.png',
        size: 2048,
        buffer: Buffer.from('fake image data'),
      } as Express.Multer.File;
      const mockPessoa = {
        id: 1,
        nome: 'Tatiana',
        email: 'tatiana@email.com',
      } as Pessoa;
      const tokenPayload: TokenPayloadDto = {
        sub: 1,
        email: 'tatiana@email.com',
      };
      const filePath = path.resolve(process.cwd(), 'pictures', '1.png');
      jest.spyOn(pessoasService, 'findOne').mockResolvedValue(mockPessoa);
      jest.spyOn(pessoaRepository, 'save').mockResolvedValue({
        ...mockPessoa,
        picture: '1.png',
      } as Pessoa);

      const result = await pessoasService.uploadPicture(mockFile, tokenPayload);

      expect(fs.writeFile).toHaveBeenCalledWith(filePath, mockFile.buffer);
      expect(pessoaRepository.save).toHaveBeenCalledWith({
        ...mockPessoa,
        picture: '1.png',
      } as Pessoa);
      expect(result).toEqual({
        ...mockPessoa,
        picture: '1.png',
      } as Pessoa);
    });
    test('deve lançar BadRequestException se o arquivo for muito pequeno', async () => {
      const mockFile = {
        originalname: 'profile.png',
        size: 1,
        buffer: Buffer.from('fake image data'),
      } as Express.Multer.File;
      const tokenPayload: TokenPayloadDto = {
        sub: 1,
        email: 'tatiana@email.com',
      };
      await expect(
        pessoasService.uploadPicture(mockFile, tokenPayload),
      ).rejects.toThrow(BadRequestException);
    });
    test('deve lançar NotFoundException se a pessoa nao for encontrada', async () => {
      const mockFile = {
        originalname: 'profile.png',
        size: 2048,
        buffer: Buffer.from('fake image data'),
      } as Express.Multer.File;
      const tokenPayload: TokenPayloadDto = {
        sub: 1,
        email: 'tatiana@email.com',
      };
      jest.spyOn(pessoaRepository, 'findOneBy').mockResolvedValue(null);
      jest
        .spyOn(pessoasService, 'findOne')
        .mockRejectedValue(new NotFoundException('Pessoa não encontrada'));
      await expect(
        pessoasService.uploadPicture(mockFile, tokenPayload),
      ).rejects.toThrow(new NotFoundException('Pessoa não encontrada'));
    });
  });
});
