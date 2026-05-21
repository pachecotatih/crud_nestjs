import { ApiProperty } from '@nestjs/swagger';

export class ResponseRecadoDto {
  @ApiProperty({
    description: 'ID do recado',
    example: 1,
    type: Number,
  })
  id!: number;
  @ApiProperty({
    description: 'Texto do recado',
    example: 'Recado de exemplo',
    required: true,
    type: String,
  })
  texto!: string;
  @ApiProperty({
    example: {
      id: 1,
      nome: 'João Silva',
    },
    type: Object,
    description: 'Pessoa que enviou o recado',
  })
  de!: {
    id: number;
    nome: string;
  };
  @ApiProperty({
    example: {
      id: 2,
      nome: 'Maria Souza',
    },
    type: Object,
    description: 'Pessoa que recebeu o recado',
  })
  para!: {
    id: number;
    nome: string;
  };
  @ApiProperty({
    description: 'Indica se o recado foi lido ou não',
    example: true,
    type: Boolean,
    required: false,
  })
  lido!: boolean;
  @ApiProperty({
    description: 'Data de envio do recado',
    example: '2022-01-01T00:00:00.000Z',
    type: Date,
  })
  data!: Date;
  @ApiProperty({
    description: 'Data de criação do recado',
    example: '2022-01-01T00:00:00.000Z',
    type: Date,
  })
  createdAt?: Date;
  @ApiProperty({
    description: 'Data de atualização do recado',
    example: '2022-01-01T00:00:00.000Z',
    type: Date,
  })
  updatedAt?: Date;
}
