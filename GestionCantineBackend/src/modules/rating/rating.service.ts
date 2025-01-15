import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { Rating } from './schemas/rating.schema';
import { UserService } from '../user/user.service';
import { DishService } from '../dish/dish.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; 

@Injectable()
export class RatingService {

  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
    private readonly userService: UserService,
    private readonly dishService: DishService,

  ) { }
  private readonly logger = new Logger(RatingService.name);

  async create(createRatingDto: CreateRatingDto): Promise<Rating> {
    try {
      const user = await this.userService.findOne(createRatingDto.idUser);
      const dish = await this.dishService.findOne(createRatingDto.idDish);
      const newRating = new this.ratingModel({
        ...createRatingDto,
        idUser: user._id,
        idDish: dish._id,
      });

      return await newRating.save();
    } catch (error) {
      this.logger.error("Error creating rating:", error.message);
      throw new BadRequestException(`Failed to create rating: ${error.message}`);
    }
  }

  async findAll():Promise<Rating[]> {
    try {
      return await this.ratingModel
      .find()
      .populate('idUser', 'userName')
      .populate('idDish', 'name') 
      .exec();
    } catch (error) {
      this.logger.error("Error finding ratings:", error.message);
      throw new BadRequestException(`Failed to find ratings: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Rating> {
    try {
      const rating = await this.ratingModel
        .findById(id)
        .populate('idUser', 'userName') 
        .populate('idDish', 'name') 
        .exec();
  
      if (!rating) {
        throw new NotFoundException(`Rating with id ${id} not found`);
      }
  
      return rating;
    } catch (error) {
      this.logger.error("Error finding rating:", error.message);
      throw new BadRequestException(`Failed to find rating: ${error.message}`);
    }
  }
  async findByDishId(idDish: string): Promise<Rating[]> {
    try {
      const ratings = await this.ratingModel
        .find({ idDish: new Types.ObjectId(idDish) })
        .populate('idUser', 'id userName')
        .exec();

      if (!ratings || ratings.length === 0) {
        throw new NotFoundException(`No ratings found for dish with id ${idDish}`);
      }

      return ratings;
    } catch (error) {
      this.logger.error('Error finding ratings by dish ID:', error.message);
      throw new BadRequestException(`Failed to find ratings by dish ID: ${error.message}`);
    }
  }
  async getAverageRatingForDish(idDish: string): Promise<number> {
    try {
      const result = await this.ratingModel
        .aggregate([
          { $match: { idDish: new Types.ObjectId(idDish) } }, 
          { $group: { _id: null, averageRating: { $avg: '$nbStars' } } }, 
        ])
        .exec();
  
      if (!result || result.length === 0) {
        return 0;
      }
  
      return parseFloat(result[0].averageRating.toFixed(2));
    } catch (error) {
      this.logger.error("Error calculating average rating for dish:", error.message);
      throw new BadRequestException(`Failed to calculate average rating: ${error.message}`);
    }
  }

  async getTopFeedbacks(limit: number = 4): Promise<Rating[]> {
    try {
      const topFeedbacks = await this.ratingModel
        .find()
        .sort({ nbStars: -1 }) 
        .limit(limit)
        .populate('idUser', 'userName') 
        .populate('idDish', 'name') 
        .exec();
  
      if (!topFeedbacks || topFeedbacks.length === 0) {
        throw new NotFoundException('No feedbacks found');
      }
  
      return topFeedbacks;
    } catch (error) {
      this.logger.error('Error fetching top feedbacks:', error.message);
      throw new BadRequestException(`Failed to fetch top feedbacks: ${error.message}`);
    }
  }
  async update(id: string, updateRatingDto: UpdateRatingDto):Promise<Rating> {
    try {
      const existingRating = await this.findOne(id);
      const updatedRating = await this.ratingModel
        .findByIdAndUpdate(id, updateRatingDto, { new: true })
        .populate('idUser', 'userName') // Populate user details
        .populate('idDish', 'name') // Populate dish details
        .exec();
      return updatedRating;
    } catch (error) {
      this.logger.error("Error updating rating:", error.message);
      throw new BadRequestException(`Failed to update rating: ${error.message}`);
    }
  }

  async remove(id: string):  Promise<{ message: string }> {
    try {
      const rating = await this.findOne(id);
      await this.ratingModel.findByIdAndDelete(id).exec();     
      return { message: `Rating with id ${id} has been successfully deleted` }
    } catch (error) {
      this.logger.error("Error removing rating:", error.message);
      throw new BadRequestException(`Failed to remove rating: ${error.message}`);
    }
  }
}
