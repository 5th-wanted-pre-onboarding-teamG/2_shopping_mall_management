import { IsNotEmpty } from 'class-validator';

export class UpdateCountriesDto {
  @IsNotEmpty()
  countryCode: string;

  @IsNotEmpty()
  dCode: string;

  @IsNotEmpty()
  name: string;
}
