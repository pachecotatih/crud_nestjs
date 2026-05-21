import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post()
  @ApiOperation({ summary: 'Logar um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário logado' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Atualizar tokens de acesso' })
  @ApiResponse({ status: 200, description: 'Tokens atualizados' })
  @ApiResponse({ status: 401, description: 'Tokens inválidos' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}
