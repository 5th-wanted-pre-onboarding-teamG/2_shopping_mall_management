import { Orders } from '../../entities/Orders';

export class CreatePaymentDto {
  paymentPrice: number;
  orderId: number;
}
