import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsUUID, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class GuestCartItemDTO {
    @ApiProperty({
        type: String,
        required: false,
        example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
    })
    @IsOptional()
    @IsUUID()
    productId!: string;

    @ApiProperty({
        type: String,
        required: false,
        example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
    })
    @IsOptional()
    @IsUUID()
    variantOptionId!: string;

    @ApiProperty({
        type: Number,
        required: true,
        example: 2,
    })
    @IsNotEmpty()
    @IsNumber()
    quantity!: number;
}

export class GuestCartMergeDTO {
    @ApiProperty({
        type: [GuestCartItemDTO],
        required: true,
        description: 'Array of guest cart items to merge'
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GuestCartItemDTO)
    @IsNotEmpty()
    guestCartItems!: GuestCartItemDTO[];
}
