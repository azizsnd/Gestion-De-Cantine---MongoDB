import { Module } from '@nestjs/common';
import { DishService } from './dish.service';
import { DishController } from './dish.controller';
import { Dish ,DishSchema } from './schemas/dish.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [DishController],
  providers: [DishService],
  imports: [MongooseModule.forFeature([{ name: Dish.name, schema: DishSchema }])],
  exports: [DishService],
})
export class DishModule {}
