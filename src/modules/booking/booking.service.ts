import { TCompanyService } from '@modules/tcompany/tcompany.service';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DetailedRoute, WagonInfoWithSeats } from './booking.types';
import { convertToDate, convertToYYYYMMDD, formatDateToString } from '@libs/utils';
import {
  AmqpConnection,
  MessageHandlerErrorBehavior,
  Nack,
  RabbitPayload,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheStore,
    private readonly amqpConnection: AmqpConnection,
    private readonly tcompanyService: TCompanyService,
  ) {}

  private async setTrains(
    {
      from,
      to,
      date,
    }: {
      from: string;
      to: string;
      date: string;
    },
    trainInfo: {
      wagons_info: WagonInfoWithSeats[];
      train_id: number;
      global_route: string;
      startpoint_departure: string;
      endpoint_arrival: string;
      detailed_route: DetailedRoute[];
      available_seats_count: number;
    },
  ) {
    const existingTrains = await this.getTrains({ from, to, date });

    await this.cacheManager.set(
      `${from}.${to}.${date}`,
      [...(existingTrains ? existingTrains : []), trainInfo],
      {
        ttl: 30,
      },
    );
  }

  private async getTrains({
    from,
    to,
    date,
  }: {
    from: string;
    to: string;
    date: string;
  }): Promise<
    | {
        wagons_info: WagonInfoWithSeats[];
        train_id: number;
        global_route: string;
        startpoint_departure: string;
        endpoint_arrival: string;
        detailed_route: DetailedRoute[];
        available_seats_count: number;
      }[]
    | null
  > {
    const trains = await this.cacheManager.get<
      | {
          wagons_info: WagonInfoWithSeats[];
          train_id: number;
          global_route: string;
          startpoint_departure: string;
          endpoint_arrival: string;
          detailed_route: DetailedRoute[];
          available_seats_count: number;
        }[]
      | null
    >(`${from}.${to}.${date}`);

    return trains || null;
  }

  public async search({
    from,
    to,
    date,
  }: {
    from: string;
    to: string;
    date: Date;
  }) {
    const existingTrains = await this.getTrains({
      from,
      to,
      date: formatDateToString(date),
    });

    if (!existingTrains) {
      const trains = await this.tcompanyService.getTrainsInfo({
        startPoint: from,
        endPoint: to,
      });

      if (!trains?.length) {
        this.logger.warn(`Not found trains by query ${from} ${to} ${date}`);
        return null;
      }

      for (const train of trains) {
        const wagons = await this.tcompanyService.getWagonInfoByTrainId(
          train.train_id,
        );

        const trainWithWagon = { ...train, wagons_info: [...wagons] };

        await this.setTrains(
          {
            from,
            to,
            date: convertToYYYYMMDD(trainWithWagon.startpoint_departure),
          },
          trainWithWagon,
        );
      }

      const trainsByDate = await this.getTrains({
        from,
        to,
        date: formatDateToString(date),
      });

      if (!trainsByDate) {
        this.logger.warn(`Not found trains by date ${from} ${to} ${date}`);
        return null;
      }

      return trainsByDate;
    }

    return existingTrains;
  }

  public async searchNear({
    from,
    to,
    date,
  }: {
    from: string;
    to: string;
    date: Date;
  }) {
    const existingTrains = await this.getTrains({
      from,
      to,
      date: date.toLocaleDateString(),
    });

    if (!existingTrains) {
      return null;
    }

    // date +- 7 дней

    return existingTrains;
  }

  public async standQueue(standQueueDto: {
    dateFrom: string;
    dateTo: string;
    departure_dates: string[];
    from: string;
    to: string;
    priceFrom: number;
    priceTo: number;
    wagonType: 'PLATZCART' | 'COUPE';
    seatCount: number;
  }) {
    for (let i = 1; i <= standQueueDto.seatCount; i++) {
      this.amqpConnection.publish('', 'booking.queue', standQueueDto);
      this.logger.log(`${standQueueDto} added to rmq`);
    }
  }

  @RabbitSubscribe({
    connection: 'booking.connection',
    queue: 'booking.queue',
    queueOptions: { durable: false, exclusive: false },
  })
  public async handlerQueue(
    @RabbitPayload()
    payload: {
      dateFrom: string;
      dateTo: string;
      departure_dates: string[];
      from: string;
      to: string;
      priceFrom: number;
      priceTo: number;
      wagonType: 'PLATZCART' | 'COUPE';
      seatCount: number;
    },
  ) {
    const allTrains = [];

    for (const date of payload.departure_dates) {
      const trains = await this.search({
        from: payload.from,
        to: payload.to,
        date: convertToDate(date),
      });

      if (!trains?.length) {
        continue;
      }

      allTrains.push(trains);
    }

    if (!allTrains.length) {
      return new Nack(true);
    }
    const getSeatPlace = (seat) => {
      if (Number(seat.seatNum) % 2 === 0) {
        return 'upper'
      }
      return 'lower'
    }
    for (const train of allTrains) {
      for (let wagon of train.wagons_info) {
        if (wagon.type !== payload.wagonType) {
            continue; // Пропустить неправильный тип вагона
        }
        
        let availableSeats = [];
        
        for (let seat of wagon.seats) {
            // Проверка по критериям:
            if (
              (!payload.priceFrom || !payload.priceTo || (seat.price >= payload.priceFrom && seat.price <= payload.priceTo))
              && seat.bookingStatus !== 'CLOSED' || 'BOOKED') {
                this.logger.warn('BOOK_SUCCESS')
                return await this.book(train.train_id, wagon.wagon_id, seat.seat_id)
            }
        }
    }
  }
  this.logger.warn('BOOK_NOT_FOUND')
    // усли не вышли с цикла
    return new Nack(true);
  }

  public async inNearQueue() {}

  public async book(trainId: number, wagonId: number, seatId: number) {
    return await this.tcompanyService.book({ trainId, wagonId, seatId });
  }

  bookForce() {}
}
