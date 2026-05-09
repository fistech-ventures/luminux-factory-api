import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base/baseFilter.dto';
import { ENUM_DELIVERY_ZONE } from '@src/app/modules/order/const';
import { IsEnum, IsOptional, IsString } from 'class-validator';


export class FilterDeliveryChargeDTO extends BaseFilterDTO {
    @ApiProperty({
        type: String,
        required: false,
        example: Object.values(ENUM_DELIVERY_ZONE).join(' / '),
    })
    @IsOptional()
    @IsString()
    @IsEnum(ENUM_DELIVERY_ZONE)
    readonly deliveryZone!: string;
}
