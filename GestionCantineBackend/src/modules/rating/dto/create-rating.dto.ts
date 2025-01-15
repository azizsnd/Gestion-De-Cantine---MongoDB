import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({
    description: 'The ID of the dish',
    example: '64d5f8b8e4b0f8b8e4b0f8b8',   })
  @IsString()
  @IsNotEmpty({ message: 'L\'ID du plat est obligatoire.' })
  idDish: string; 
  @ApiProperty({
    description: 'The ID of the user',
    example: '64d5f8b8e4b0f8b8e4b0f8b9',   })
  @IsString()
  @IsNotEmpty({ message: 'L\'ID de l\'utilisateur est obligatoire.' })
  idUser: string; 
  @ApiProperty({
    description: 'The number of stars',
    example: 5,
  })
  @IsNotEmpty({ message: 'Le nombre d\'étoiles est obligatoire.' })
  @IsNumber()
  @Min(1, { message: 'Le nombre d\'étoiles doit être au moins 1.' })
  @Max(5, { message: 'Le nombre d\'étoiles ne peut pas dépasser 5.' })
  nbStars: number;

  @ApiProperty({
    description: 'The feedback for the dish',
    example: 'Delicious!',
    required: false,
  })
  @IsString()
  feedback: string;
}