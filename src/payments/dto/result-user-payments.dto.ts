import { PaymentState } from '../../entities/enums/paymentState';

export class ResultUserPayments {
  payments: {
    paymentCreateAt: Date;
    salePrice: number;
    paymentPrice: number;
    paymentState: PaymentState;
    productName: string;
    productPrice: number;
    quantity: number;
  }[];
}
