import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrderModule } from './orders/order.module';
import { ShippingModule } from './shipping/shipping.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CouponsModule } from './coupons/coupons.module';
import { NotificationModule } from './notification/notification.module';
import { CartModule } from './cart/cart.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'users',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
  }),
    AuthModule, UsersModule, OrderModule, ShippingModule, ReviewsModule, PaymentsModule, ProductsModule, CategoriesModule, WishlistModule, CouponsModule, NotificationModule, CartModule],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})


export class AppModule {}
