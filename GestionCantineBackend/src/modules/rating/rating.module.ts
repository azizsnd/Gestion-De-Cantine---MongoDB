import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { Rating,RatingSchema } from './schemas/rating.schema';
import { UserModule } from '../user/user.module';
import { DishModule } from '../dish/dish.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [RatingController],
  providers: [RatingService],
  imports: [
    MongooseModule.forFeature([{ name: Rating.name, schema: RatingSchema }]),
    UserModule,
    DishModule
  ],

})
export class RatingModule {}
