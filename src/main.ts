import { AppModule } from '@app/app.module';
import { ConfigSchema } from '@libs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger as PinoLogger } from 'nestjs-pino';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      options: {
        host: '0.0.0.0',
        port: 5051,
      },
      transport: Transport.TCP,
      logger:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn', 'log']
          : ['error', 'warn', 'log', 'debug'],
      bufferLogs: true,
    },
  );

  app.useLogger(app.get(PinoLogger));

  const logger = new Logger('Bootstrap');

  const config = app.get(ConfigSchema);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen();

  logger.log(`Auth Microservice application started on port ${config.port}`);
}

bootstrap();
