import { DynamicModule, Module } from '@nestjs/common';

export type MyDynamicModuleConfigs = {
  apiKey: string;
  apiUrl: string;
};

export const MY_DYNAMIC_CONFIG = 'MY_DYNAMIC_CONFIG';
@Module({})
export class MyDynamicModule {
  // execute, register, forRoot, forRootAsync
  static register(configs: MyDynamicModuleConfigs): DynamicModule {
    return {
      module: MyDynamicModule,
      imports: [],
      providers: [
        {
          provide: MY_DYNAMIC_CONFIG,
          useValue: configs,
        },
      ],
      exports: [MY_DYNAMIC_CONFIG],
      controllers: [],
    };
  }
}
