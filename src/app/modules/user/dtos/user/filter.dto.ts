import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base/baseFilter.dto';
import { IsOptional } from 'class-validator';

export class FilterUserDTO extends BaseFilterDTO {
    @ApiProperty({
        type: [String],
        description: 'array of user roles',
        default: '',
        required: false,
    })
    @IsOptional()
    readonly roles!: string;
}
