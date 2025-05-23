import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { AdminModule } from './admin/admin.module';

// Import all entities
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { ProductImage } from './products/entities/product-image.entity';
import { ProductVariant } from './products/entities/product-variant.entity';
import { ProductAttribute } from './products/entities/product-attribute.entity';
import { ProductTag } from './products/entities/product-tag.entity';
import { Category } from './categories/entities/category.entity';
import { Review } from './reviews/entities/review.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Cart } from './cart/entities/cart.entity';
import { CartItem } from './cart/entities/cart-item.entities';
import { Wishlist } from './wishlist/entities/wishlist.entity';
import { ShippingAddress } from './shipping/entities/shipping-address.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'ecommerce'),
        entities: [
          User,
          Product,
          ProductImage,
          ProductVariant,
          ProductAttribute,
          ProductTag,
          Category,
          Review,
          Order,
          OrderItem,
          Cart,
          CartItem,
          Wishlist,
          ShippingAddress,
        ],
        synchronize: true, // Set to false in production
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    AdminModule,
    OrderModule,
    ShippingModule,
    ReviewsModule,
    PaymentsModule,
    ProductsModule,
    CategoriesModule,
    WishlistModule,
    CouponsModule,
    NotificationModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
