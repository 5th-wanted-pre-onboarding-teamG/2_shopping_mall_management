import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Countries } from '../../entities/Countries';
import { countriesData } from '../data/countriesData';

export default class CountriesSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const repository = dataSource.getRepository(Countries);
    await repository.insert(countriesData);
  }
}
