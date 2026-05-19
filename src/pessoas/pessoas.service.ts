import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { Repository } from 'typeorm';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';

@Injectable()
export class PessoasService {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>,
    private readonly hashingService: HashingServiceProtocol,
  ) {}
  async create(createPessoaDto: CreatePessoaDto) {
    try {
      const passwordHash = await this.hashingService.hash(
        createPessoaDto.password,
      );
      const dadosPessoa = {
        nome: createPessoaDto.nome,
        passwordHash,
        email: createPessoaDto.email,
      };
      const novaPessoa = this.pessoaRepository.create(dadosPessoa);
      await this.pessoaRepository.save(novaPessoa);
      return novaPessoa;
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Email já cadastrado');
      }
    }
  }

  async findAll() {
    const pessoas = await this.pessoaRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
    return pessoas;
  }

  async findOne(id: number) {
    const pessoa = await this.pessoaRepository.findOneBy({ id });
    if (!pessoa) throw new NotFoundException('Pessoa não encontrada');
    return pessoa;
  }

  async update(id: number, updatePessoaDto: UpdatePessoaDto) {
    const dadosPessoa = {
      nome: updatePessoaDto.nome,
    };
    if (updatePessoaDto?.password) {
      const passwordHash = await this.hashingService.hash(
        updatePessoaDto.password,
      );
      dadosPessoa['passwordHash'] = passwordHash;
    }
    const pessoa = await this.pessoaRepository.preload({
      id,
      ...dadosPessoa,
    });
    if (!pessoa) throw new NotFoundException('Pessoa não encontrada');
    return this.pessoaRepository.save(pessoa);
  }

  async remove(id: number) {
    const pessoa = await this.pessoaRepository.findOneBy({ id });
    if (!pessoa) throw new NotFoundException('Pessoa não encontrada');
    return this.pessoaRepository.remove(pessoa);
  }
}
