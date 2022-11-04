import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthStrategy } from './auth.strategy';
import { Users } from '../entities/Users';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { SessionSerializer } from './auth.session.serializer';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users]), PassportModule.register({ defaultStrategy: 'local', session: true })],
  providers: [AuthService, AuthStrategy, SessionSerializer],
  controllers: [AuthController],
})
export class AuthModule {}
