import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRecadoDto } from './create-recado.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateRecadoDto extends PartialType(CreateRecadoDto) {
  @ApiProperty({
    description: 'Indica se o recado foi lido ou não',
    example: true,
    type: Boolean,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly lido?: boolean;
}
