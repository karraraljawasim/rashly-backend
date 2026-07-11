import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRows } from '../../features/user/schema/user.schema';
import { Request } from 'express';

type RequestWithUser = Request & {
  user: Omit<UserRows, 'passwordHash'>;
};
export const GetUser = createParamDecorator(
  (
    data: keyof Omit<UserRows, 'passwordHash'> | undefined,
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (data) {
      return request.user[data];
    }

    return request.user;
  },
);
