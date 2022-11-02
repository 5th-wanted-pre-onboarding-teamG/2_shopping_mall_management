export enum CouponType {
  DELIVERY = '배송비', // 배송비 100% 면제
  PERCENT = '퍼센트 할인', // 주문가격의 (discountedPrice)% 만큼 할인
  FLAT_RATE = '정액제', // 주문가격의 (discountedPrice)원 금액 만큼 할인
}
