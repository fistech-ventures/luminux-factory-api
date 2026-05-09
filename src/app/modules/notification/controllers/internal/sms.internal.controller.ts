import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SmsService } from '../../services/sms.service';

@ApiTags('SMS')
@Controller('sms')
export class SmsInternalController {
  constructor(private readonly service: SmsService) { }

  @Get('test')
  async sendSms(): Promise<any> {
    return this.service.sendSmsThroughDefaultGateway({
      recipient: '01211212121',
      message: 'Hello from Fibonacci Books!',
    });
  }
}
