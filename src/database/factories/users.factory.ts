import { setSeederFactory } from 'typeorm-extension';
import { Users } from '../../entities/Users';
import * as bcrypt from 'bcrypt';
import { UserRank } from '../../entities/enums/userRank';

export default setSeederFactory(Users, async (faker) => {
  const number = Math.floor(Math.random() * 10) % 2;

  const user = new Users();

  user.name = faker.name.fullName({ gender: number === 0 ? 'male' : 'female' });
  user.email = faker.internet.email();
  const password = '1234qwer';
  user.password = await bcrypt.hash(password, 12);
  user.phone = faker.phone.number('###-###-####');
  user.rank = number === 0 ? UserRank.NORMAL : UserRank.MANAGER;

  return user;
});
