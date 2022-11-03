export class ResultPaymentsDto {
  // 결제 일자, 상품 이름, 구매 개수, 상품 금액, 결제 금액, 할인 금액

  payments: {
    paymentCreateAt: Date;
    paymentPrice: number;
    productName: string;
    ordersQuantity: string;
    productPrice: number;
    salePrice: number;
    userName: string;
  }[];
}
