import { CouponType } from '../entities/enums/couponType';
import { NotFoundException } from '@nestjs/common';

/**
 * 결제 금액 계산
 * @param totalProductPrice 상품 총 금액
 * @param deliveryPrice 배송비
 * @param salePrice 할인 금액
 * @param countryCode 국가 코드
 */
export const calculatePaymentPrice = (
  totalProductPrice: number = 0,
  deliveryPrice: number = 0,
  salePrice: number = 0,
  countryCode: string,
) => {
  let orderPrice = totalProductPrice + deliveryPrice;
  orderPrice = correctionDollar(orderPrice, countryCode);
  return orderPrice - salePrice;
};

/**
 * 할인 금액 계산
 * @param totalProductPrice 상품 총 금액
 * @param deliveryPrice 배송비
 * @param couponType 쿠폰 타입
 * @param discountedPrice 쿠폰 할인 금액/퍼센트
 * @param countryCode 국가 코드
 */
export const calculateSalePrice = (
  totalProductPrice: number = 0,
  deliveryPrice: number = 0,
  couponType: CouponType,
  discountedPrice: number = 0,
  countryCode: string,
) => {
  if (!couponType) return 0;

  let salePrice = 0;

  if (isDeliveryCouponType(couponType)) {
    salePrice = calculateDeliverySalePrice(deliveryPrice, discountedPrice);
  } else if (isPercentCouponType(couponType)) {
    salePrice = calculatePercentSalePrice(totalProductPrice, discountedPrice);
  } else if (isFlatRateCouponType(couponType)) {
    salePrice = discountedPrice;
  } else {
    throw new NotFoundException('등록되지 않은 쿠폰 타입입니다.');
  }

  return correctionDollar(salePrice, countryCode);
};

/**
 * 배송비 할인 금액 계산
 * @param deliveryPrice 배송비
 * @param salePercent 배송 할인 퍼센트
 */
const calculateDeliverySalePrice = (deliveryPrice: number = 0, salePercent: number = 0) => {
  return Math.round((deliveryPrice * salePercent) / 100);
};

/**
 * 퍼센트 할인 금액 계산
 * @param totalProductPrice 상품 총 금액
 * @param salePercent 상품 할인 퍼센트
 */
const calculatePercentSalePrice = (totalProductPrice: number = 0, salePercent: number = 0) => {
  return Math.round((totalProductPrice * salePercent) / 100);
};

/**
 * 배송비 쿠폰 확인
 * @param couponType 쿠폰 타입
 */
const isDeliveryCouponType = (couponType: CouponType) => {
  return couponType === CouponType.DELIVERY;
};

/**
 * 퍼센트 쿠폰 확인
 * @param couponType 쿠폰 타입
 */
const isPercentCouponType = (couponType: CouponType) => {
  return couponType === CouponType.PERCENT;
};

/**
 * 정액 쿠폰 확인
 * @param couponType 쿠폰 타입
 */
const isFlatRateCouponType = (couponType: CouponType) => {
  return couponType === CouponType.FLAT_RATE;
};

const correctionDollar = (price: number, countryCode: string) => {
  if (isKoreaCode(countryCode)) {
    return price;
  }

  const oneDollarPerWon = 1200;
  return Math.round(price / oneDollarPerWon);
};

const isKoreaCode = (countryCode: string) => {
  return countryCode === 'KR';
};
