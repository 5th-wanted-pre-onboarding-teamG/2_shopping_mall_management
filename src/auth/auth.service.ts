import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // 의존성 주입
  constructor(
    // 유저 레포지터리 주입
    private dataSource: DataSource,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  /**
   * 유저 회원가입 서비스입니다.
   * @param createUserDto 회원가입에 필요한 정보 { 이메일, 비밀번호, 이름, 랭크, 성별, 나이, 전화번호 }
   * @returns 유저 회원가입 결과
   */
  async signUp(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    // 데이터베이스를 조회하여 이미 존재하는 유저인지 검사합니다.
    const existsUser = await this.usersRepository.findOneBy({ email: createUserDto.email });

    // 이미 가입된 회원이라면 회원가입하면 안되므로 예외를 발생시킵니다.
    if (existsUser) {
      throw new BadRequestException('이미 가입된 회원입니다.');
    }

    // 데이터베이스에 바로 저장하지 않고 암호화해서 저장합니다.
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    return this.usersRepository.save({
      ...createUserDto,
      password: hashedPassword,
      age: +createUserDto.age,
    });
  }
}
