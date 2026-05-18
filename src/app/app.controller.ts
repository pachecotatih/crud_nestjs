import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import type { ConfigType } from '@nestjs/config';
import globalConfig from 'src/global-config/global-config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(globalConfig.KEY)
    private readonly globalConfigurations: ConfigType<typeof globalConfig>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
