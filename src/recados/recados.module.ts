import { forwardRef, Module } from '@nestjs/common';
import { RecadosController } from './recados.controller';
import { RecadosService } from './recados.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recado } from './entities/recado.entity';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import { RecadosUtils } from './recados.utils';
import { RegexFactory } from 'src/common/regex/regex.factory';
import {
  ONLY_LOWERCASE_LETTERS_REGEX,
  REMOVE_SPACES_REGEX,
} from './recados.constant';
import { RemoveSpacesRegex } from 'src/common/regex/remove-spaces.regex';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recado]),
    forwardRef(() => PessoasModule),
  ],
  controllers: [RecadosController],
  providers: [
    RecadosService,
    RecadosUtils,
    RegexFactory,
    {
      provide: REMOVE_SPACES_REGEX, // token
      useFactory: (regexFactory: RegexFactory) => {
        return regexFactory.create('RemoveSpacesRegex');
      },
      inject: [RegexFactory], // vão ser injetadas na factory na ordem, por exemplo (regexFactory: RegexFactory)
    },
    {
      provide: ONLY_LOWERCASE_LETTERS_REGEX, // token
      useFactory: (regexFactory: RegexFactory) => {
        return regexFactory.create('OnlyLowercaseLettersRegex');
      },
      inject: [RegexFactory], // vão ser injetadas na factory na ordem, por exemplo (regexFactory: RegexFactory)
    },
  ],
  exports: [RecadosUtils],
})
export class RecadosModule {}
