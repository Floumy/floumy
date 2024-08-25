import { IsNotEmpty } from 'class-validator';

export class CreateFeatureRequestDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}
