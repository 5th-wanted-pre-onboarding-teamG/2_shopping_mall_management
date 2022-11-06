import { CouponType } from '../../entities/enums/couponType';

export class ResultExistsOwnedCouponDto {
  // 결제 일자, 상품 이름, 구매 개수, 상품 금액, 결제 금액, 할인 금액

  ownedCouponId: number;
  couponType: CouponType;
  discount: number;
}
