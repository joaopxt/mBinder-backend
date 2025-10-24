import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { LibraryModule } from './library/library.module';
import { PasseModule } from './passe/passe.module';
import { WantModule } from './want/want.module';
import { DeckModule } from './deck/deck.module';
import { ColecaoModule } from './colecao/colecao.module';
import { UtilsModule } from './utils/utils.module';
import { MostWantedModule } from './most-wanted/most-wanted.module';
import { BestSellersModule } from './best-sellers/best-sellers.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MetricsCronModule } from './metrics/metrics-cron.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'mysql',
        host: cfg.get<string>('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 3306),
        username: cfg.get<string>('DB_USERNAME', 'root'),
        password: cfg.get<string>('DB_PASSWORD', ''),
        database: cfg.get<string>('DB_DATABASE', 'm_trader'),
        autoLoadEntities: true,
        synchronize: true,
        // cfg.get<string>('NODE_ENV') === 'production' ? false : true,
        charset: 'utf8mb4',
      }),
    }),
    ScheduleModule.forRoot(),
    MetricsCronModule,
    LibraryModule,
    UsuarioModule,
    WantModule,
    PasseModule,
    DeckModule,
    ColecaoModule,
    UtilsModule,
    MostWantedModule,
    BestSellersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
