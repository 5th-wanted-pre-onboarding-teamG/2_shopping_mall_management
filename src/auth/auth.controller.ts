import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard, AuthLocalGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  /**
   * @url POST '/api/auth/signUp'
   * @description 회원가입을 통해 사용자 정보를 저장합니다.
   */
  @UseGuards(AuthLocalGuard)
  @Post('signUp')
  signUp(): void {}

  /**
   * @url POST '/api/auth/login'
   * @description 로그인 성공/실패 여부를 반환합니다.
   */
  @UseGuards(AuthLocalGuard)
  @Post('login')
  login(): void {}

  /**
   * @url GET '/api/auth/logout'
   * @description 로그아웃 처리를 위해 세션을 제거합니다.
   */
  @UseGuards(AuthenticatedGuard)
  @Get('logout')
  logout(@Req() req): void {
    req.session.destroy();
  }
}