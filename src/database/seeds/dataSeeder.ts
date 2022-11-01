import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Countries } from '../../entities/Countries';
import { countriesData } from '../data/countriesData';
import { deliveryCostsData } from '../data/deliveryCostsData';
import { DeliveryCosts } from '../../entities/DeliveryCosts';
import { Users } from '../../entities/Users';

export default class DataSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const usersRepository = dataSource.getRepository(Users);
    const countriesRepository = dataSource.getRepository(Countries);
    const deliveryCostsRepository = dataSource.getRepository(DeliveryCosts);

    await deliveryCostsRepository.delete({});
    await countriesRepository.delete({});
    await usersRepository.delete({});

    // users Seed 데이터 추가
    const userFactory = await factoryManager.get(Users);
    await userFactory.saveMany(10);

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
