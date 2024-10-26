import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

export const RabbitModule = RabbitMQModule.forRoot(RabbitMQModule, {
  name: 'booking.connection',
  uri: 'amqp://dotg:dotg@194.87.118.178:5672',
  prefetchCount: 1,
  queues: [
    {
      name: 'booking.queue',
      options: {
        durable: false,
        exclusive: false,
      },
    },
  ],
});
