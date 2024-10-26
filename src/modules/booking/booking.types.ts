export type Train = {
  train_id: number;
  global_route: string;
  startpoint_departure: string;
  endpoint_arrival: string;
  detailed_route: DetailedRoute[];
  wagons_info: WagonsInfo[];
  available_seats_count: number;
};

export type DetailedRoute = {
  name: string;
  num: number;
  arrival: string;
  departure: string;
};

export type WagonsInfo = {
  wagon_id: 0;
  type: WagonType;
};

export type WagonInfoWithSeats = WagonsInfo & { seats: Seat[] };

export type Seat = {
  seat_id: number;
  seatNum: string;
  block: string;
  price: number;
  bookingStatus: BookingStatus;
};

type BookingStatus = 'CLOSED' | 'BOOKED';
type WagonType = 'PLATZCART' | 'COUPE' | 'LOCAL';
