import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Dish } from './schemas/dish.schema';

@Injectable()
export class DishService {
  constructor(
    @InjectModel(Dish.name) private dishModel: Model<Dish>,
  ) {}
  private readonly logger = new Logger(DishService.name);

  async create(createDishDto: CreateDishDto): Promise<Dish>  {
    try {
      const newDish = new this.dishModel(createDishDto);
      return await newDish.save();
    } catch (error) {
      this.logger.error("Error creating dish:", error.message);
      throw new BadRequestException(`Failed to create dish: ${error.message}`);
    }
  }

  async findAll(): Promise<Dish[]>  {
    try {
      return await this.dishModel.find().exec();
    } catch (error) {
      this.logger.error("Error finding dishes:", error.message);
      throw new BadRequestException(`Failed to find dishes: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Dish>  {
    try {
      const dish = await this.dishModel.findById(id).exec();
      if (!dish) {
        throw new NotFoundException(`Dish with id ${id} not found`);
      }
      return dish;
    } catch (error) {
      this.logger.error("Error finding dish:", error.message);
      throw new BadRequestException(`Failed to find dish: ${error.message}`);
    }
  }

  async findDailyMenu(): Promise<Dish[]>  {
    try {
      return await this.dishModel.find({ checked: true }).exec();
    } catch (error) {
      this.logger.error("Error finding daily menu dishes:", error.message);
      throw new BadRequestException(`Failed to find daily menu dishes: ${error.message}`);
    }
  }

  async update(id: string, updateDishDto: UpdateDishDto): Promise<Dish> {
    try {
      const existingDish = await this.findOne(id);
      const updatedDish = await this.dishModel
        .findByIdAndUpdate(id, updateDishDto, { new: true })
        .exec();

      return updatedDish;
    } catch (error) {
      this.logger.error("Error updating dish:", error.message);
      throw new BadRequestException(`Failed to update dish: ${error.message}`);
    }
  }

  async remove(id: string): Promise<{ message: string }>  {
    try {
      const dish = await this.findOne(id);
      await this.dishModel.findByIdAndDelete(id).exec();
      return { message: `Dish with id ${id} has been successfully deleted` };

    } catch (error) {
      this.logger.error("Error removing dish:", error.message);
      throw new BadRequestException(`Failed to remove dish: ${error.message}`);
    }
  }
}
