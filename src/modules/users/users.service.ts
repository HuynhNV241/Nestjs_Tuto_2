import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user. schema';
import { InjectModel } from '@nestjs/mongoose';
import { hashPassword } from 'src/helpers/util';
import aqp from 'api-query-params';
import mongoose, { Model } from 'mongoose';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) 
    private userModel: Model<User>
  ) {}
  
  async create(createUserDto: CreateUserDto) : Promise<{id: string}> {
    const {name, email, password, phone, address, image} = createUserDto;

    // check email
    const isExits = await this.isEmailExits(email);
    if (isExits) {
      throw new BadRequestException('Email already exits');
    }

    // hash password
    const hashPass = await hashPassword(createUserDto.password);
    const createdUser = new this.userModel({
      name, 
      email, 
      password: hashPass, 
      phone, 
      address, 
      image
    });
    createdUser.save();
    return {
      id: createdUser._id.toString()
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    const {filter, sort} = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    const results = await this.userModel
      .find(filter)
      .sort(sort as any)
      .skip(skip)
      .select("-password")
      .limit(pageSize)

    return { results, totalPages }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      {_id: updateUserDto._id}, 
      { $set: {...updateUserDto} }
    );
  }

  async remove(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      const result = await this.userModel.deleteOne({_id});
      if (result.deletedCount === 0) {
        throw new NotFoundException('User not found');
      }
      return { message: 'User deleted successfully' };
    } else {
      throw new BadRequestException('Invalid user ID');
    }
  }

  isEmailExits = async (email: string): Promise<boolean> => {
    const user = await this.userModel.exists({email});
    return user ? true : false;
  }

  async findByEmail(email: string){
    return await this.userModel.findOne({email});
  }

  handleRegister = async(registerDto: CreateAuthDto) => {
    const {name, email, password} = registerDto;

    // check email
    const isExits = await this.isEmailExits(email);
    if (isExits) {
      throw new BadRequestException('Email already exits');
    }

    // hash password
    const hashPass = await hashPassword(password);
    const user = new this.userModel({
      name, 
      email, 
      password: hashPass, 
      isActive: false,
      codeId: uuidv4(),
      codeExpired: dayjs().add(1, 'minute')
    });
    user.save();

    return {
      id: user._id
    }

    // send email
  }
}
