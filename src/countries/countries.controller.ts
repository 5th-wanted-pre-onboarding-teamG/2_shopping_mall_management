import { Body, Controller, Post } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CreateCountriesDto } from './dto/create-countries.dto';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  /**
   * @url POST '/api/countires'
   * @param createCountriesDto 국적정보 {국적코드, 국적번호, 국적명}
   * @description 새로운 국정정보를 생성합니다
   * @returns 국적정보 생성 결과
   */
  @Post()
  async createCountries(@Body() createCountriesDto: CreateCountriesDto) {
    return await this.countriesService.createCountries(createCountriesDto);
  }
}
