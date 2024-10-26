import { ConfigSchema } from '@libs/config';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Train, WagonInfoWithSeats } from './tcompany.types';

@Injectable()
export class TCompanyService {
  private readonly logger = new Logger(TCompanyService.name);

  private readonly fio: string = 'meow meow muur';
  private readonly email: string = 'meow@gmail.com';
  private readonly password: string = 'dotmeow-root';
  private readonly team: string = '.MEOW(dotMEOW)';

  constructor(
    private readonly config: ConfigSchema,
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheStore,
    private readonly httpService: HttpService,
  ) {}

  public async getTCompanyAccountInfo(): Promise<{
    isRegistered: boolean;
    userData: {
      fio: string;
      email: string;
      password: string;
      team: string;
    };
  } | null> {
    const tcompanyAccountInfo = await this.cacheManager.get<{
      isRegistered: boolean;
      userData: {
        fio: string;
        email: string;
        password: string;
        team: string;
      };
    }>('tcompany.account.info');

    return tcompanyAccountInfo || null;
  }

  public async setTCompanyAccountInfo(accountData: {
    isRegistered: boolean;
    userData: {
      fio: string;
      email: string;
      password: string;
      team: string;
    };
  }) {
    await this.cacheManager.set('tcompany.account.info', accountData, {
      ttl: Infinity,
    });
  }

  public async getTCompanyAuthToken(): Promise<{ token: string }> {
    const authToken = await this.cacheManager.get<{ token: string }>(
      'tcompany.account.token',
    );

    if (!authToken) {
      return await this.loginInTCompanyAccount({
        email: this.email,
        password: this.password,
      });
    }

    return authToken;
  }

  public async setTCompanyAuthToken(tokenData: { token: string }) {
    await this.cacheManager.set('tcompany.account.token', tokenData, {
      ttl: 82800,
    });
  }

  public async registerTCompanyAccount(regData: {
    fio: string;
    email: string;
    password: string;
    team: string;
  }) {
    const url = `${this.config.tcompany.host}/api/auth/register`;

    const { data } = await firstValueFrom(
      this.httpService.post<{ token: string }>(url, regData).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data);
          throw 'An error happened in Registration TCompany account!';
        }),
      ),
    );

    await this.setTCompanyAccountInfo({
      isRegistered: true,
      userData: regData,
    });

    await this.setTCompanyAuthToken({ token: data.token });

    return data;
  }

  public async loginInTCompanyAccount(loginData: {
    email: string;
    password: string;
  }) {
    const userData = await this.getTCompanyAccountInfo();

    if (!userData) {
      return await this.registerTCompanyAccount({
        email: loginData.email,
        password: loginData.password,
        fio: this.fio,
        team: this.team,
      });
    }

    const url = `${this.config.tcompany.host}/api/auth/login`;

    const { data } = await firstValueFrom(
      this.httpService.post<{ token: string }>(url, loginData).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data);
          throw 'An error happened in login TCompany account!';
        }),
      ),
    );

    return data;
  }

  public async getTrainsInfo(query: { startPoint: string; endPoint: string }) {
    const { token: authToken } = await this.getTCompanyAuthToken();

    const url = new URL(`${this.config.tcompany.host}/api/info/trains`);

    url.searchParams.set('start_point', query.startPoint);
    url.searchParams.set('end_point', query.endPoint);

    const { data } = await firstValueFrom(
      this.httpService
        .get<Train[]>(url.toString(), {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened in login TCompany account!';
          }),
        ),
    );

    return data;
  }

  public async getWagonInfoByTrainId(trainId: number) {
    const { token: authToken } = await this.getTCompanyAuthToken();

    const url = new URL(`${this.config.tcompany.host}/api/info/wagons`);

    url.searchParams.set('trainId', String(trainId));

    const { data } = await firstValueFrom(
      this.httpService
        .get<WagonInfoWithSeats[]>(url.toString(), {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened in login TCompany account!';
          }),
        ),
    );

    return data;
  }

  public async book({
    trainId,
    wagonId,
    seatId,
  }: {
    trainId: number;
    wagonId: number;
    seatId: number;
  }) {
    const url = `${this.config.tcompany.host}/api/order`;

    const { data } = await firstValueFrom(
      this.httpService
        .post(url, {
          train_id: trainId,
          wagon_id: wagonId,
          seat_ids: seatId,
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              'An error happened in booking!',
              error.response.data,
            );
            throw 'An error happened in booking!';
          }),
        ),
    );

    return data;
  }
}
