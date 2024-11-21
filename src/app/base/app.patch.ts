// 数据类型自动转换为float
import { types } from 'pg';
types.setTypeParser(1700, value => {
  if (value === null) {
    return value;
  }
  return parseFloat(value);
});

// CRUD
import { CrudConfigService } from '@nestjsx/crud';
CrudConfigService.load({
  query: {
    alwaysPaginate: true,
    maxLimit: 1000,
  },
  routes: {
    createOneBase: {
      returnShallow: true,
    },
    replaceOneBase: {
      returnShallow: true,
    },
    updateOneBase: {
      returnShallow: true,
    },
    exclude: ['updateOneBase'], // 禁用httpMethod, put or patch
  },
  // crudAcl就不用写了
  auth: {
    property: 'user',
  },
});

