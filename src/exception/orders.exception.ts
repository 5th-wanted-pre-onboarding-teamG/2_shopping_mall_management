import { HttpException, HttpStatus } from '@nestjs/common';

export class OrderNotFoundException extends HttpException {
  constructor() {
    super('주문 정보를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
  }
}
