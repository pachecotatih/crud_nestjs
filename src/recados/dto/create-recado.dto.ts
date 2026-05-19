import {
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRecadoDto {
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

  @IsPositive()
  paraId!: number;
}
