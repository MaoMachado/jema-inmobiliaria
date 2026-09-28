import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { SmsProviderFactory } from './sms-provider';

@Module({
  controllers: [OtpController],
  providers: [OtpService, SmsProviderFactory],
})
export class OtpModule {}
