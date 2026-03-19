import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { User } from './schemas/user. schema';
import { InjectModel } from '@nestjs/mongoose';
import { hashPassword } from 'src/helpers/util';
import aqp from 'api-query-params';

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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  isEmailExits = async (email: string): Promise<boolean> => {
    const user = await this.userModel.exists({email});
    return user ? true : false;
  }
}
