import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Rating extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Dish', required: true })
  idDish: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  idUser: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })  nbStars: number;

  @Prop({ required: true })
  feedback: string;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);