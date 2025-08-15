import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [],
  exports: [],
})
export class SharedModule {
  static forFeature(models: { name: string; schema: any }[]) {
    return {
      module: SharedModule,
      imports: [MongooseModule.forFeature(models)],
      exports: [MongooseModule],
    };
  }
}
