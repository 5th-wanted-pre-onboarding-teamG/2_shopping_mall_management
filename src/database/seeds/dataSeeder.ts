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
    let totalDeliveryCosts = [];
    for (const deliveryCosts of deliveryCostsData) {
      const { id, ...items } = deliveryCosts; //
      const country = await countriesRepository.findOneBy({ name: id });

      const data = Object.keys(items).map((key) => {
        return {
          country: country,
          quantity: parseInt(key),
          price: parseInt(items[key]),
        };
      });

      totalDeliveryCosts = totalDeliveryCosts.concat(data);
    }
    await deliveryCostsRepository.insert(totalDeliveryCosts);
  }
}
