import { UserRank } from 'src/entities/enums/userRank';

export class CreateUserDto {
  email: string;

  password: string;

  name: string;

  rank: UserRank;

  phone: string;
}
