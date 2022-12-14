import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Countries } from 'src/entities/Countries';
import { Users } from 'src/entities/Users';
import { Like, Repository } from 'typeorm';
import { CreateCountriesDto } from './dto/create-countries.dto';
import { UpdateCountriesDto } from './dto/update-countries.dto';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Countries)
    private readonly countriesRepository: Repository<Countries>,
  ) {}

  /**
   * @url POST '/api/countires'
   * @body createCountriesDto 국적정보 {국적코드, 국적번호, 국적명}
   * @description 새로운 국정정보를 생성합니다
   * @returns 국적정보 생성 결과
   */
  async createCountries(createCountriesDto: CreateCountriesDto) {
    const { name, countryCode } = createCountriesDto;
    const isMatched = /\+\d+/.test(countryCode);

    // 국적번호 형태(+number)가 잘못된 경우 400 응답
    if (isMatched) {
      throw new BadRequestException('잘못된 국적번호 형식입니다.');
    }

    // 중복된 국적명인 경우 400 응답
    const isDuplicated = await this.countriesRepository.countBy({ name });

    if (isDuplicated) {
      throw new BadRequestException('중복된 국적명입니다.');
    }

    return this.countriesRepository.save(createCountriesDto);
  }

  /**
   * @url GET '/api/countries'
   * @param originalUrl 검색 키워드를 포함한 요청 URL {국적코드, 국적번호, 국적명}
   * @description 국적정보를 검색합니다
   * @returns 국적정보 검색 결과
   */
  async searchCountries(originalUrl: string) {
    // 들어온 키워드가 국적번호 형식인지 확인
    const isDcode = originalUrl.match(/\+\d+/)?.[0];

    let where;
    if (isDcode) {
      // 국적코드로 검색
      where = { dCode: isDcode };
    } else {
      const queryKeyword = originalUrl.split('=')[1];

      // 국적코드와 국적명으로 검색
      where = [{ name: Like(`%${queryKeyword}$`) }, { countryCode: Like(`%${queryKeyword}%`) }];
    }

    // findOneByOrFail
    return await this.countriesRepository.find({ where });
  }

  /**
   * @param countriesId 수정하려는 국적 아이디
   * @param updateCountriesDto 국정정보 {국적코드, 국적번호, 국적명}
   * @description 국적정보를 수정합니다
   * @returns 국적정보 수정 결과
   */
  async updateCountriesById(countryId: Countries['countryId'], updateCountriesDto: UpdateCountriesDto) {
    const isExist = await this.countriesRepository.countBy({ countryId });
    const isDuplicatedName = await this.countriesRepository
      .createQueryBuilder('countries')
      .where('countries.name = :name', { name: updateCountriesDto.name })
      .andWhere('countries.countryId != :countryId', { countryId })
      .getOne();

    // 존재하지않는 경우 404 또는 중복된 경우 400 응답
    if (!isExist) {
      throw new NotFoundException('존재하지않는 국적입니다.');
    } else if (isDuplicatedName) {
      throw new BadRequestException('중복된 국적명입니다.');
    }

    return await this.countriesRepository.update({ countryId }, updateCountriesDto);
  }

  /**
   * @url DELETE '/api/countries'
   * @param countryId 삭제하려는 국적 아이디
   * @description 국적정보를 삭제합니다
   * @returns 국적정보 삭제 결과
   */
  async deleteCountreisById(countryId: Countries['countryId']): Promise<void> {
    const isAffected = await this.countriesRepository.delete(countryId);

    // 삭제된 국적이 없는 경우 404 응답
    if (!isAffected) {
      throw new NotFoundException('존재하지않는 국적입니다.');
    }
  }
}
