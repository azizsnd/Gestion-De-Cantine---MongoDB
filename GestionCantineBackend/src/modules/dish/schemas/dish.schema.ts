import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

@Schema()
export class Dish extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  quantity: number;

  @Prop({ default: false })
  checked: boolean;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  @IsNotEmpty({ message: 'Le type est obligatoire.' })
  @IsIn(['Appetizers', 'Main Course', 'Desserts'], {
    message: 'Le type doit être soit Appetizers, Main Course ou Desserts.',
  })
  type: string;
}

export const DishSchema = SchemaFactory.createForClass(Dish);