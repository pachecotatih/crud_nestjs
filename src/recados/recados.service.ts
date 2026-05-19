import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { Recado } from './entities/recado.entity';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PessoasService } from 'src/pessoas/pessoas.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import type { ConfigType } from '@nestjs/config';
import recadosConfig from './recados.config';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

// Scope.DEFAULT -> O provider é um singleton, instanciado quando aplicação inicia e mantém a mesma instância
// singleton -> quando uma classe foi instanciada, sempre retorna a mesma instância quando for reutilizá-la

// Scope.REQUEST -> O provider é instanciado a cada requisição
// Scope.TRANSIENT -> É criada uma instância do provider para cada classe que injetar este provider

@Injectable()
export class RecadosService {
  constructor(
    @InjectRepository(Recado)
    private readonly recadoRepository: Repository<Recado>,
    private readonly pessoasService: PessoasService,
    @Inject(recadosConfig.KEY)
    private readonly recadosConfiguration: ConfigType<typeof recadosConfig>,
  ) {}
  throwNotFoundException() {
    throw new NotFoundException('Recado não encontrado');
  }

  async findAll(paginationDto?: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto ?? {};
    const recados = await this.recadoRepository.find({
      take: limit,
      skip: offset,
      relations: ['de', 'para'],
      order: { id: 'DESC' },
      select: {
        de: {
          id: true,
          nome: true,
        },
        para: {
          id: true,
          nome: true,
        },
      },
    });
    return recados;
  }

  async findOne(id: number) {
    const recado = await this.recadoRepository.findOne({
      where: { id },
      relations: ['de', 'para'],
      order: { createdAt: 'DESC' },
      select: {
        de: {
          id: true,
          nome: true,
        },
        para: {
          id: true,
          nome: true,
        },
      },
    });
    if (recado) return recado;
    this.throwNotFoundException();
  }

  async create(
    createRecadoDto: CreateRecadoDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const { paraId } = createRecadoDto;

    const de = await this.pessoasService.findOne(tokenPayload.sub);

    const para = await this.pessoasService.findOne(paraId);
    const novoRecado = {
      texto: createRecadoDto.texto,
      de,
      para,
      lido: false,
      data: new Date(),
    };
    const recadoSave = await this.recadoRepository.create(novoRecado);
    await this.recadoRepository.save(recadoSave);
    return {
      ...recadoSave,
      de: {
        id: recadoSave.de.id,
        nome: recadoSave.de.nome,
      },
      para: {
        id: recadoSave.para.id,
        nome: recadoSave.para.nome,
      },
    };
  }

  async update(
    id: number,
    updateRecadoDto: UpdateRecadoDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const recado = await this.findOne(id);

    if (!recado) return this.throwNotFoundException();
    if (recado.de.id !== tokenPayload.sub) {
      throw new ForbiddenException(
        'Esse recado nao pertence ao usuario logado',
      );
    }
    recado.texto = updateRecadoDto.texto ?? recado.texto;
    recado.lido = updateRecadoDto.lido ?? recado.lido;
    await this.recadoRepository.save(recado);
    return recado;
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {
    const recado = await this.findOne(id);
    if (recado) {
      if (recado.de.id !== tokenPayload.sub) {
        throw new ForbiddenException(
          'Esse recado nao pertence ao usuario logado',
        );
      }
      return this.recadoRepository.remove(recado);
    }
    this.throwNotFoundException();
  }
}
