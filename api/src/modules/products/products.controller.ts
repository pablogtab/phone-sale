import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { SearchProductQueryDto } from './dto/search-product-query.dto';
import { Order } from '@/database/entities';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('price')
  findPrice(@Body() data: { productId: number; orderType: Order['type'] }) {
    return this.productsService.findProductPrice(
      data.productId,
      data.orderType,
    );
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CreateProductDto,
  ) {
    return this.productsService.editProduct(data, id);
  }

  @Post('')
  create(@Body() data: CreateProductDto) {
    return this.productsService.createProduct(data);
  }

  @Get('search')
  search(@Query() query: SearchProductQueryDto) {
    return this.productsService.search(query);
  }

  @Get(':id')
  findOneById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findProductById(id);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }
}
