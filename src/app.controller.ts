import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot(): string {
    return 'Ecommerce API is running 🚀';
  }
}

