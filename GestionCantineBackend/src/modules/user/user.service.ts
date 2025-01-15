import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({ 
        userName: createUserDto.userName 
      });

      if (existingUser) {
        throw new BadRequestException(
          'User with this userName already exists',
        );
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
      createUserDto.password = hashedPassword;

      const newUser = new this.userModel(createUserDto);
      return newUser.save();
    } catch (error) {
      this.logger.error("Error creating user:", error.message);
      throw new BadRequestException(`Failed to create user: ${error.message}`);
    }
  }

  async findAll(): Promise<User[]>{
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      this.logger.error("Error finding users:", error.message);
      throw new BadRequestException(`Failed to find users: ${error.message}`);
    }
  }

  async findOne(id: string) : Promise<User> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) throw new NotFoundException(`User with id ${id} not found`);
      return user;
    } catch (error) {
      this.logger.error("Error finding user:", error.message);
      throw new BadRequestException(`Failed to find user: ${error.message}`);
    }
  }

  async findUserName(userName: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ userName: userName }).exec();
      if (!user)
        throw new NotFoundException(`User with userName ${userName} not found`);
      return user;
    } catch (error) {
      this.logger.error("Error finding user:", error.message);
      throw new BadRequestException(`Failed to find user: ${error.message}`);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      if ('password' in updateUserDto || 'role' in updateUserDto) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            message: 'Updating password or role is not allowed. ',
          },
          HttpStatus.CONFLICT,
        );
      }
      const existingUser = await this.findOne(id);

      if (updateUserDto.userName) {
        const otherUser = await this.userModel.findOne({
          userName: updateUserDto.userName,
          _id: { $ne: id }, 
        });

      if (otherUser) {
          throw new HttpException(
            {
              status: HttpStatus.CONFLICT,
              message: 'User with this userName already exists. ',
            },
            HttpStatus.CONFLICT,
          );
        }
      }
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return updatedUser;

    } catch (error) {
      this.logger.error("Error updating user:", error.message);
      throw new BadRequestException(`Failed to update user: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const user = await this.findOne(id);
      await this.userModel.findByIdAndDelete(id).exec();
    } catch (error) {
      this.logger.error("Error removing user:", error.message);
      throw new BadRequestException(`Failed to remove user: ${error.message}`);
    }
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<string>{
    try {
      const user = await this.findOne(id);
      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword, user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }
      if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
        throw new BadRequestException('New password and confirm password do not match',);
      }
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(
        changePasswordDto.newPassword,
        saltRounds,
      );
      user.password = hashedNewPassword;
      await user.save();
      return 'Password successfully updated';
    } catch (error) {
      this.logger.error("Error changing password:", error.message);
      throw new BadRequestException(`Failed to change password: ${error.message}`);
    }
  }
}
