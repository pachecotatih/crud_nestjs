import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRecadoDto {
  @ApiProperty({
    description: 'Texto do recado',
    example: 'Recado de exemplo',
    type: String,
    required: true,
    minLength: 5,
    maxLength: 255,
  })
  @IsString({
    message: 'O texto deve ser uma string',
  })
  @IsNotEmpty({
    message: 'O texto deve ser preenchido',
  })
  @MinLength(5, {
    message: 'O texto deve ter no mínimo 5 caracteres',
  })
  @MaxLength(255, {
    message: 'O texto deve ter no máximo 255 caracteres',
  })
  readonly texto!: string;

  @ApiProperty({
    description: 'ID da pessoa para quem o recado é destinado',
    example: 1,
    type: Number,
    required: true,
  })
  @IsPositive()
  paraId!: number;
}
