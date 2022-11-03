import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { OperateGuard } from 'src/auth/auth.guard';
import { Countries } from 'src/entities/Countries';
import { CountriesService } from './countries.service';
import { CreateCountriesDto } from './dto/create-countries.dto';
import { UpdateCountriesDto } from './dto/update-countries.dto';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  /**
   * @url POST '/api/countires'
   * @param createCountriesDto 국적정보 {국적코드, 국적번호, 국적명}
   * @description 새로운 국정정보를 생성합니다
   * @returns 국적정보 생성 결과
   */
  @UseGuards(OperateGuard)
  @Post()
  async createCountries(@Body() createCountriesDto: CreateCountriesDto) {
    return await this.countriesService.createCountries(createCountriesDto);
  }

  /**
   * @url GET '/api/countries'
   * @param req.originalUrl 검색 키워드를 포함한 요청 URL {국적코드, 국적번호, 국적명}
   * @description 국적정보를 검색합니다
   * @returns 국적정보 검색 결과
   */
  @UseGuards(OperateGuard)
  @Get()
  async searchCountries(@Req() req: Request) {
    return await this.countriesService.searchCountries(req.originalUrl);
  }

  /**
   * @url PUT '/api/countires'
   * @param countriesId 수정하려는 국적 아이디
   * @param updateCountriesDto 국정정보 {국적코드, 국적번호, 국적명}
   * @description 국적정보를 수정합니다
   * @returns 국적정보 수정 결과
   */
  @UseGuards(OperateGuard)
  @Put(':countryId')
  async updateCountriesById(
    @Param('countryId', ParseIntPipe) countryId: Countries['countryId'],
    @Body() updateCountriesDto: UpdateCountriesDto,
  ) {
    return await this.countriesService.updateCountriesById(countryId, updateCountriesDto);
  }

  /**
   * @url DELETE '/api/countries'
   * @param countryId 삭제하려는 국적 아이디
   * @description 국적정보를 삭제합니다
   * @returns 국적정보 삭제 결과
   */
  @UseGuards(OperateGuard)
  @Delete(':countryId')
  async deleteCountreisById(@Param('countryId', ParseIntPipe) countryId: Countries['countryId']) {
    return await this.countriesService.deleteCountreisById(countryId);
  }
}
