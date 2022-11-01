import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Countries } from '../../entities/Countries';
import { countriesData } from '../data/countriesData';
import { deliveryCostsData } from '../data/deliveryCostsData';
import { DeliveryCosts } from '../../entities/DeliveryCosts';

export default class DataSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const countriesRepository = dataSource.getRepository(Countries);
    const deliveryCostsRepository = dataSource.getRepository(DeliveryCosts);

    await countriesRepository.delete({});
    await deliveryCostsRepository.delete({});

    // countries Seed 데이터 추가
    await countriesRepository.insert(countriesData);

    // deliveryCosts Seed 데이터 추가
    for (const deliveryCost of deliveryCostsData) {
      const { id, ...items } = deliveryCost; //
      const rows = Object.keys(items).map((key) => {
        return {
          countryName: id,
          quantity: parseInt(key),
          price: parseInt(items[key]),
        };
      });

      await deliveryCostsRepository.insert(rows);
    }
  }
}
