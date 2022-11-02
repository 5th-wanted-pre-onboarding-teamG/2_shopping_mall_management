import { IsNotEmpty } from 'class-validator';

export class CreateCountriesDto {
  @IsNotEmpty()
  countryCode: string;

  @IsNotEmpty()
  dCode: string;

  @IsNotEmpty()
  name: string;
}
