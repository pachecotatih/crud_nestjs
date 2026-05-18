import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { RecadosService } from './recados.service';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ParseIntIdPipe } from 'src/common/pipes/parse-int-id.pipe';
import { RemoveSpacesRegex } from 'src/common/regex/remove-spaces.regex';
import {
  ONLY_LOWERCASE_LETTERS_REGEX,
  REMOVE_SPACES_REGEX,
} from './recados.constant';
import { OnlyLowercaseLettersRegex } from 'src/common/regex/only-lowercase-letters.regex';

// PATCH / PUT -> Atualizar um recado

// PATCH - Atualizar dados de um recurso (partes de um objeto)
// PUT - Atualizar um recurso inteiro

// DTO - Data Transfer Object -> Objeto de transferência de dados
// DTO -> Objeto simples de transporte de dados -> Validar dados / Transformar dados
@Controller('recados')
//@UseInterceptors(AuthTokenInterceptor)
@UsePipes(ParseIntIdPipe)
export class RecadosController {
  constructor(
    private readonly recadosService: RecadosService,
    @Inject(REMOVE_SPACES_REGEX)
    private readonly removeSpacesRegex: RemoveSpacesRegex,
    @Inject(ONLY_LOWERCASE_LETTERS_REGEX)
    private readonly onlyLowercaseLettersRegex: OnlyLowercaseLettersRegex,
  ) {}
  //Encontrar todos os recados
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    console.log(this.removeSpacesRegex.execute('Olá Mundo!'));
    console.log(this.onlyLowercaseLettersRegex.execute('Olá Mundo!'));
    const recados = await this.recadosService.findAll(paginationDto);
    return recados;
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
