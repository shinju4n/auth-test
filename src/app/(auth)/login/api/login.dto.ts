import { User } from "@/domains/user/types/user.type";

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  message: string;
  user: User;
};
