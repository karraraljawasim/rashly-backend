import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Home.' })
  @ApiResponse({
    status: 200,
    description: 'Return "Hello World!"',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
