import {
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateHotelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  description: string;

  @IsString()
  @MaxLength(255)
  image: string;

  @IsDecimal()
  @IsNotEmpty()
  price: number;

  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsNotEmpty()
  ownerId: number;
}
