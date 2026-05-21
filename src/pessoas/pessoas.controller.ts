import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipeBuilder,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PessoasService } from './pessoas.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs/promises'; //filesystem
import { randomUUID } from 'crypto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma pessoa' })
  @ApiResponse({ status: 201, description: 'Pessoa criada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createPessoaDto: CreatePessoaDto) {
    return this.pessoasService.create(createPessoaDto);
  }

  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas as pessoas' })
  @ApiResponse({ status: 200, description: 'Pessoas listadas' })
  @Get()
  findAll() {
    return this.pessoasService.findAll();
  }

  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter uma pessoa específica' })
  @ApiResponse({ status: 200, description: 'Pessoa encontrada' })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID da pessoa',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pessoasService.findOne(+id);
  }

  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar uma pessoa' })
  @ApiResponse({ status: 200, description: 'Pessoa atualizada' })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID da pessoa',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePessoaDto: UpdatePessoaDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.pessoasService.update(+id, updatePessoaDto, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover uma pessoa' })
  @ApiResponse({ status: 200, description: 'Pessoa removida' })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID da pessoa',
  })
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.pessoasService.remove(+id, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload de foto de perfil' })
  @ApiResponse({ status: 200, description: 'Foto de perfil atualizada' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada' })
  @Post('upload-picture')
  async uploadPicture(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpeg|jpg|png',
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 10, //10MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.pessoasService.uploadPicture(file, tokenPayload);
  }
}
