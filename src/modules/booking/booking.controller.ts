import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { BookingService } from './booking.service';

@Controller()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @MessagePattern('booking.search')
  public async search({
    from,
    to,
    date,
  }: {
    from: string;
    to: string;
    date: Date;
  }) {
    return await this.bookingService.search({
      from,
      to,
      date,
    });
  }

  @MessagePattern('booking.search.near')
  public async searchNear({
    from,
    to,
    date,
  }: {
    from: string;
    to: string;
    date: Date;
  }) {
    return await this.bookingService.searchNear({
      from,
      to,
      date,
    });
  }

  // Встать в очередь
  @MessagePattern('booking.stand.queue')
  public async inQueue() {}

  // Расширяется список параметров для постановки в очередь
  @MessagePattern('booking.stand.near.queue')
  public async inNearQueue() {}

  @MessagePattern('booking.book')
  public async book({
    trainId,
    wagonId,
    seatId,
  }: {
    trainId: number;
    wagonId: number;
    seatId: number;
  }) {
    return await this.bookingService.book(trainId, wagonId, seatId);
  }
}
