export interface Instructor {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  images?: string[];
  price: number;
  rating: number;
  instructor: Instructor;
  category: string;
  duration: string;
  discountPercentage?: number;
  discountedPrice?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface AppError {
  message: string;
  status: number;
}
