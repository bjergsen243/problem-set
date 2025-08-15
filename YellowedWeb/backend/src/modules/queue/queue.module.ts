import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { QUEUE_NAME } from './queue.enum';
import { QueueProcessor } from './queue.processor';
import { QueueService } from './queue.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAME.EMAIL,
    }),
  ],
  exports: [],
  providers: [QueueService, QueueProcessor],
  controllers: [QueueController],
})
export class QueueModule {}
