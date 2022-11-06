import { PaymentState } from '../../entities/enums/paymentState';

export class ResultUserPayments {
  payments: {
    paymentCreateAt: Date;
    orderPrice: number;
    discountedPrice: number;
    paymentPrice: number;
    paymentState: PaymentState;
    productName: string;
    quantity: number;
  }[];
}
