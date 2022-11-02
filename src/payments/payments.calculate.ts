import { CouponType } from '../entities/enums/couponType';
import { NotFoundException } from '@nestjs/common';

export const calculatePaymentPrice = (
  quantity: number = 0,
  productPrice: number = 0,
  deliveryPrice: number = 0,
  salePrice: number = 0,
  countryCode: string,
) => {
  let orderPrice = productPrice * quantity + deliveryPrice;
  orderPrice = correctionDollar(orderPrice, countryCode);
  return orderPrice - salePrice;
};

export const calculateSalePrice = (
  productPrice: number,
  quantity: number,
  deliveryPrice: number,
  couponType: CouponType,
  sale: number,
  countryCode: string,
) => {
  if (!couponType) return 0;

  let salePrice = 0;

  if (isDeliveryCouponType(couponType)) {
    salePrice = deliveryPrice;
  } else if (isPercentCouponType(couponType)) {
    salePrice = calculatePercentSalePrice(productPrice, quantity, deliveryPrice, sale);
  } else if (isFlatRateCouponType(couponType)) {
    salePrice = sale;
  } else {
    throw new NotFoundException('등록되지 않은 쿠폰 타입입니다.');
  }

  return correctionDollar(salePrice, countryCode);
};

const isDeliveryCouponType = (couponType: CouponType) => {
  return couponType === CouponType.DELIVERY;
};

const isPercentCouponType = (couponType: CouponType) => {
  return couponType === CouponType.PERCENT;
};

const isFlatRateCouponType = (couponType: CouponType) => {
  return couponType === CouponType.FLAT_RATE;
};

const calculatePercentSalePrice = (
  productPrice: number = 0,
  quantity: number = 0,
  deliveryPrice: number = 0,
  sale: number = 0,
) => {
  const orderPrice = productPrice * quantity + deliveryPrice;
  return Math.round((orderPrice * sale) / 100);
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
