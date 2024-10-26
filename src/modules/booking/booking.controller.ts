import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class BookingController {
  @MessagePattern('booking.search')
  public async search() {}

  @MessagePattern('booking.book')
  public async book() {}
}
