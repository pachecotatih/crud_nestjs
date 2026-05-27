import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  SetMetadata,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { RecadosService } from './recados.service';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ParseIntIdPipe } from 'src/common/pipes/parse-int-id.pipe';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ResponseRecadoDto } from './dto/response-recado.dto';

// PATCH / PUT -> Atualizar um recado

// PATCH - Atualizar dados de um recurso (partes de um objeto)
// PUT - Atualizar um recurso inteiro

// DTO - Data Transfer Object -> Objeto de transferência de dados
// DTO -> Objeto simples de transporte de dados -> Validar dados / Transformar dados
@Controller('recados')
//@UseInterceptors(AuthTokenInterceptor)
@UsePipes(ParseIntIdPipe)
export class RecadosController {
  constructor(private readonly recadosService: RecadosService) {}
  //Encontrar todos os recados
  @Get()
  @ApiOperation({ summary: 'Obter todos os recados' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    default: 10,
    description: 'Número máximo de recados a serem retornados',
  })
  @ApiQuery({
    name: 'offset',
    required: true,
    type: Number,
    example: 0,
    description: 'Quantidade de recados a serem pulados',
    default: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Recados encontrados',
    type: [ResponseRecadoDto],
  })
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  async findAll(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Query() paginationDto?: PaginationDto,
  ) {
    const recados = await this.recadosService.findAll(
      tokenPayload,
      paginationDto,
    );
    return recados;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter somente um recado' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID do recado a ser encontrado',
  })
  @ApiResponse({ status: 404, description: 'Recado não encontrado' })
  @ApiResponse({
    status: 200,
    description: 'Recado encontrado',
    type: ResponseRecadoDto,
  })
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  //Encontrar um recado
  findOne(@Param('id') id: number) {
    return this.recadosService.findOne(id);
  }
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar um recado' })
  @ApiResponse({
    status: 201,
    description: 'Recado criado',
    type: ResponseRecadoDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @Post()
  create(
    @Body() createRecadoDto: CreateRecadoDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.recadosService.create(createRecadoDto, tokenPayload);
  }
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar um recado' })
  @ApiResponse({
    status: 200,
    description: 'Recado atualizado',
    type: ResponseRecadoDto,
  })
  @ApiResponse({ status: 404, description: 'Recado não encontrado' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID do recado a ser atualizado',
  })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateRecadoDto: UpdateRecadoDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.recadosService.update(id, updateRecadoDto, tokenPayload);
  }
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover um recado' })
  @ApiResponse({
    status: 200,
    description: 'Recado removido',
    type: Boolean,
    example: true,
  })
  @ApiResponse({ status: 404, description: 'Recado não encontrado' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID do recado a ser removido',
  })
  @Delete(':id')
  remove(
    @Param('id') id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.recadosService.remove(id, tokenPayload);
  }
}
