import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientOptions } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchConfig {
  constructor(private configService: ConfigService) {}

  getElasticConfig(): ClientOptions {
    return {
      node: this.configService.get<string>('elasticsearch.node'),
      auth: {
        username: this.configService.get<string>('elasticsearch.username'),
        password: this.configService.get<string>('elasticsearch.password'),
      },
      tls: {
        rejectUnauthorized: false, // Only for development
      },
    };
  }

  getIndexConfig(indexName: string) {
    return {
      index: `${this.configService.get<string>('app.name')}-${indexName}-${this.configService.get<string>('app.env')}`,
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1,
        refresh_interval: '1s',
      },
    };
  }
} 