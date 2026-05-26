import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { ContactCreateDTO } from '../../dtos/create.dto';
import { Contact } from '../../entities/contact.entity';
import { ContactService } from '../../services/contact.service';

@ApiTags('Contacts')
@ApiBearerAuth()
@Controller('web/contacts')
export class ContactWebController {
  constructor(private readonly service: ContactService) { }

  @Public()
  @Post()
  async createOne(@Body() body: ContactCreateDTO): Promise<Contact> {
    return this.service.createOneBase(body);
  }
}
