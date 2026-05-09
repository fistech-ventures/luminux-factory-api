import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";


export class FilterQuoteDTO {
    @ApiProperty({
        type: Number,
        description: 'The page number',
        default: 1,
        required: false,
    })
    @IsOptional()
    readonly page: number = 1;

    @ApiProperty({
        type: Number,
        description: 'Limit the number of results',
        default: 10,
        required: false,
    })
    @IsOptional()
    readonly limit: number = 10;

    @ApiProperty({
        type: String,
        description: 'The search term',
        default: '',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly searchTerm!: string;
}
