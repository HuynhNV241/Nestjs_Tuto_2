import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { MenusModule } from './modules/menus/menus.module';
import { LikesModule } from './modules/likes/likes.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { MenuItemOptionsModule } from './modules/menu-item-options/menu-item-options.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OrderDetailModule } from './modules/order-detail/order-detail.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    RestaurantsModule,
    MenusModule,
    LikesModule,
    MenuItemsModule,
    MenuItemOptionsModule,
    OrdersModule,
    OrderDetailModule,
    ReviewsModule,
    ConfigModule.forRoot({isGlobal: true,}),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  }
  ],
})
export class AppModule {}
