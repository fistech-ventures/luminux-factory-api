import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CartManageDTO {
    @ApiProperty({
        type: String,
        required: true,
        example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
    })
    @IsOptional()
    @IsUUID()
    productId!: string;

    @ApiProperty({
        type: String,
        required: true,
        example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
    })
    @IsOptional()
    @IsUUID()
    readonly variantOptionId!: string;

    @ApiProperty({
        type: Number,
        required: true,
        example: 2,
    })
    @IsNotEmpty()
    @IsNumber()
    quantity!: number;

    @ApiProperty({
        type: String,
        required: true,
        example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
    })
    @IsOptional()
    @IsUUID()
    readonly customerId!: string;

    @ApiProperty({
        type: String,
        required: true,
        example: 'add/remove/update',
    })
    @IsNotEmpty()
    @IsString()
    readonly action!: string;

    @IsOptional()
    readonly createdBy!: any;
}