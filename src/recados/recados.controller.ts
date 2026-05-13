import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { RecadosService } from './recados.service';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ParseIntIdPipe } from 'src/common/pipes/parse-int-id.pipe';
import { AddHeaderInterceptor } from 'src/common/interceptors/add-header.interceptor';

// PATCH / PUT -> Atualizar um recado

// PATCH - Atualizar dados de um recurso (partes de um objeto)
// PUT - Atualizar um recurso inteiro

// DTO - Data Transfer Object -> Objeto de transferência de dados
// DTO -> Objeto simples de transporte de dados -> Validar dados / Transformar dados
@Controller('recados')
@UseInterceptors(AddHeaderInterceptor)
@UsePipes(ParseIntIdPipe)
export class RecadosController {
  constructor(private readonly recadosService: RecadosService) {}
  //Encontrar todos os recados
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.recadosService.findAll(paginationDto);
  }

  @Get(':id')
  //Encontrar um recado
  findOne(@Param('id') id: number) {
    return this.recadosService.findOne(id);
  }

  @Post()
  create(@Body() createRecadoDto: CreateRecadoDto) {
    return this.recadosService.create(createRecadoDto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateRecadoDto: UpdateRecadoDto) {
    return this.recadosService.update(id, updateRecadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.recadosService.remove(id);
  }
}
