import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UserIdCheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (userId && isNaN(Number(userId))) {
      throw new BadRequestException('Invalid User ID');
    }

    next();
  }
}
