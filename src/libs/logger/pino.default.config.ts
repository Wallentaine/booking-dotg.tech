import { ConfigSchema } from '@libs/config';

export const pinoDefaultConfig = {
  inject: [ConfigSchema],
  useFactory: (config: ConfigSchema) => ({
    pinoHttp: {
      transport: {
        targets: [
          {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              colorize: true,
            },
          },
          ...(config.NODE_ENV === 'production'
            ? [
                {
                  target: 'pino-socket',
                  options: {
                    address: config.logstash.host,
                    port: config.logstash.port,
                    mode: 'tcp',
                    reconnect: true,
                    recovery: true,
                  },
                },
              ]
            : []),
        ],
      },
      base: { application: config.name },
    },
  }),
};
