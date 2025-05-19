<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## File Structure

src/
├── auth/
├── users/
├── products/
├── categories/
├── cart/
├── orders/
├── payments/
├── shipping/
├── reviews/
├── wishlist/
├── admin/
├── notifications/
├── discounts/
├── analytics/
├── common/ # shared utilities, pipes, filters
├── database/ # TypeORM/Prisma setup and migrations
└── main.ts

## E-Commerce Backend Modules (NestJS + PostgreSQL)

This backend is modularized using NestJS to support scalability and maintainability. Below is a breakdown of the core and optional modules used in this application.

🧩 1. Auth Module
Handles user authentication and authorization.

JWT-based login & registration

Password hashing with bcrypt

Role-based access control

Guards & token validation

👤 2. User Module
Manages user profiles and roles.

View and update profile

Admin-level user management

Role assignment

📦 3. Product Module
Manages product catalog and inventory.

CRUD for products

Upload & manage images

Price, stock, and description handling

🗂️ 4. Category Module
Organizes products into hierarchical categories.

CRUD for categories

Parent-child relationships

Product categorization

🛒 5. Cart Module
Handles user shopping cart operations.

Add, update, remove items

Session-based or user-specific carts

Quantity and price tracking

📦 6. Order Module
Processes and tracks customer orders.

Order creation from cart

Order status tracking

Return and cancellation management

💳 7. Payment Module
Integrates payment gateways and records transactions.

Integration with Stripe, PayPal, etc.

Payment confirmation and tracking

Refund handling

🚚 8. Shipping Module
Manages shipping details and delivery tracking.

Shipping address management

Shipping methods

Order shipment status

⭐ 9. Review Module
Allows users to review and rate products.

Post, edit, delete reviews

Star-based rating system

Admin moderation

🧑‍💼 10. Admin Module
Provides administrative controls over the platform.

Dashboard & metrics

Full CRUD over all entities

System-wide settings

🔔 11. Notification Module
Sends user notifications via email or in-app.

Order confirmations

Shipping updates

Password reset links

💝 12. Wishlist Module
Allows users to save favorite products.

Add/remove from wishlist

Fetch user's saved items

🏷️ 13. Discount Module
Manages coupons and promotional codes.

Create and apply discount codes

Usage limits and expiry dates

📊 14. Analytics Module (Optional)
Tracks platform statistics and user behavior.

Sales metrics and charts

Customer engagement data

🧪 15. Testing Module
Provides testing infrastructure using Jest.

Unit and integration tests

Test mocks and coverage

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author: [Ayush Sharma](mailto:arksharma06@yahoo.com), [Saurabh Shukla](mailto:saurabhshukla6392@gmail.com)
- Website: [Saurabh Portfolio](https://profile-brown-two.vercel.app/)
- LinkedIn: [Saurabh Shukla](https://linkedin.com/in/saurabh-shukla11), [Ayush Sharma](https://linkedin.com/in/ayush0703)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
