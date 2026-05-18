import { forwardRef, Module } from '@nestjs/common';
import { PessoasService } from './pessoas.service';
import { PessoasController } from './pessoas.controller';
import { Pessoa } from './entities/pessoa.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecadosModule } from 'src/recados/recados.module';
// dependência circular: RecadosModule e PessoasModule importam uns dos outros
// solução: usar forwardRef
@Module({
  imports: [
    TypeOrmModule.forFeature([Pessoa]),
    forwardRef(() => RecadosModule),
  ],
  controllers: [PessoasController],
  providers: [PessoasService],
  exports: [PessoasService], // ao importar este módulo em outro móduo
})
export class PessoasModule {}
