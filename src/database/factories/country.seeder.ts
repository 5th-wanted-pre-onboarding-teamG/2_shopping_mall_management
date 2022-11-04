import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Users } from '../../entities/Users';

export default class CountriesSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const userFactory = await factoryManager.get(Users);

    await userFactory.saveMany(10);
  }
}
