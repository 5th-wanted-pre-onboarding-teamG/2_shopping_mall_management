export class CreateOrderDto {
  productId: number;
  countryId: number;
  quantity: number;
  city: string;
  zipCode: string;
  name?: string;
  phone?: string;
}
