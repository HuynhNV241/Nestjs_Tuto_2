import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty()
  name!: string;
  
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  password!: string;
  
  @IsOptional()
  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  image!: string;
}
