import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRank } from '../entities/enums/userRank';
import { Users } from '../entities/Users';

@Injectable()
export class AuthLocalGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return result;
  }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  /**
   * 세션에 유저정보를 확인하여 인증 상태를 확인
   * @param context 실행 컨텍스트
   * @returns 세션에 저장되어있는 유저 정보
   */
  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    return request?.session?.passport?.user;
  }
}

@Injectable()
export class OperateGuard implements CanActivate {
  /**
   * 세션에 유저정보를 확인하여 인증 상태를 확인
   * @param context 실행 컨텍스트
   * @returns 세션에 저장되어있는 유저 정보
   */
  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const user = request?.session?.passport?.user;

    return this.isOperateRank(user);
  }

  /**
   * 유저의 권한이 관리자인지 확인
   * @param user
   * @return 유저의 권한이 관리자인지 판별값
   */
  isOperateRank(user: Users): boolean {
    return user?.rank === UserRank.MANAGER;
  }
}
