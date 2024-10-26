import { ConfigSchema } from '@libs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TCompanyService {
  constructor(private readonly config: ConfigSchema) {}


}
