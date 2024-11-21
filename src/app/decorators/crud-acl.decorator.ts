import { AuthOptions } from '@nestjsx/crud/lib/interfaces';
import { CrudAuth } from '@nestjsx/crud';
import { User } from '@/app/decorators/user';

interface Ioptions<T> extends AuthOptions {
  field?: keyof T;
  props?: keyof User;
}

export const CrudAcl = <T>(options: Ioptions<T>) => {
  return CrudAuth({
    filter: user => {
      if (user.clientId) {
        return {
          [options.field]: user[options.props],
        };
      }
    },
    property: 'user',
    ...options,
  });
};
