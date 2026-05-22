import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class GuestWishlistItemDTO {
    @ApiProperty({
        type: String,
        required: true,
        example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
    })
    @IsNotEmpty()
    @IsUUID()
    productId!: string;
}

export class GuestWishlistMergeDTO {
    @ApiProperty({
        type: [GuestWishlistItemDTO],
        required: true,
        description: 'Array of guest wishlist items to merge'
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GuestWishlistItemDTO)
    @IsNotEmpty()
    guestWishlistItems!: GuestWishlistItemDTO[];
}
