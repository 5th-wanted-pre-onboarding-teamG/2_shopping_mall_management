import { HttpException, HttpStatus } from '@nestjs/common';

export class CouponTypeNotFoundException extends HttpException {
  constructor() {
    super('등록되지 않은 쿠폰 타입입니다.', HttpStatus.NOT_FOUND);
  }
}
