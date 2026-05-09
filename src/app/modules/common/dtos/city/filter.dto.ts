import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base/baseFilter.dto';
import { IsOptional } from 'class-validator';


export class FilterCityDTO extends BaseFilterDTO {
    @ApiProperty({
        type: String,
        required: false,
        description: 'delivery Charge id',
    })
    @IsOptional()
    readonly deliveryChargeId!: string;
}
