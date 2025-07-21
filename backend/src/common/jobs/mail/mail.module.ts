import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MailJob } from './mail.job';
import { MailProcessor } from './mail.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  providers: [MailJob, MailProcessor],
  exports: [MailJob],
})
export class MailModule {}
