import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailService } from '../../services/email.service';
@ApiTags('Email')
@Controller('internal/email')
export class EmailInternalController {
  constructor(private readonly service: EmailService) { }

  @Get('test')
  async sendEmail(@Query('to') to: string): Promise<any> {
    return this.service.sendEmailThroughDefaultGateway({
      to: to,
      subject: 'Hello',
      html: 'Hello from Fibonacci Books!',
    });
  }
}
