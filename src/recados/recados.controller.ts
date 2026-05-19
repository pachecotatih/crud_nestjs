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
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { ROUTE_POLICY_KEY } from 'src/auth/constants/auth.constants';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';

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
  async findAll(@Query() paginationDto: PaginationDto) {
    const recados = await this.recadosService.findAll(paginationDto);
    return recados;
  }

  @Get(':id')
  //Encontrar um recado
  findOne(@Param('id') id: number) {
    return this.recadosService.findOne(id);
  }
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @Post()
  @SetRoutePolicy(RoutePolicies.createRecado)
  create(
    @Body() createRecadoDto: CreateRecadoDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.recadosService.create(createRecadoDto, tokenPayload);
  }
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @Patch(':id')
  @SetRoutePolicy(RoutePolicies.updateRecado)
  update(
    @Param('id') id: number,
    @Body() updateRecadoDto: UpdateRecadoDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.recadosService.update(id, updateRecadoDto, tokenPayload);
  }
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @Delete(':id')
  @SetRoutePolicy(RoutePolicies.removeRecado)
  remove(
    @Param('id') id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.recadosService.remove(id, tokenPayload);
  }
}
