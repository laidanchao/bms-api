/**
 * @des  模板使用
 * @author zhangchao  zhangchao@ftl-express.cn
 * @date 2020-08-27 18:26
 */
import { NodePlopAPI } from 'plop';

// TODO weifeng 建议移到公共的CLI上

export default function(plop: NodePlopAPI) {
  plop.setPartial('entity', '{{camelCase entityName}}');
  plop.setPartial('TEntity', '{{properCase entityName}}');
  plop.setPartial('controller', '{{> TEntity}}Controller');
  plop.setPartial('service', '{{> TEntity}}Service');
  plop.setPartial('module', '{{> TEntity}}Module');

  plop.setGenerator('module', {
    description: 'CRUD模板',
    prompts: [
      {
        type: 'input',
        name: 'entityName',
        message: '请输入module名称',
      },
      {
        type: 'input',
        name: 'path',
        message: '请输入module路径(默认在 src/modules下):',
      },
      {
        type: 'list',
        name: 'active',
        message: '你要做什么?',
        choices: [
          { name: '添加MODULE', value: 'addModule' },
          { name: '测试', value: 'test' }, // TODO weifeng 完善这个功能
        ],
      },
    ],
    actions: data => {
      let actions: any = [];

      // weifeng TODO 优化代码
      const basePath =
        data.path.length > 0 ? (data.path[0] === '/' ? data.path : `src/modules/${data.path}`) : 'src/modules';

      if (data.active === 'addModule') {
        actions = [
          {
            type: 'add',
            path: `${basePath}/{{> entity}}/{{> entity}}.module.ts`,
            templateFile: 'plop-templates/module.ts.hbs',
            stripExtensions: ['hbs'],
          },
          {
            type: 'add',
            path: `${basePath}/{{> entity}}/{{> entity}}.controller.ts`,
            templateFile: 'plop-templates/controller.ts.hbs',
            stripExtensions: ['hbs'],
          },
          {
            type: 'add',
            path: `${basePath}/{{> entity}}/{{> entity}}.service.ts`,
            templateFile: 'plop-templates/service.ts.hbs',
            stripExtensions: ['hbs'],
          },
          {
            type: 'add',
            path: `${basePath}/{{> entity}}/{{> entity}}.entity.ts`,
            templateFile: 'plop-templates/entity.ts.hbs',
            stripExtensions: ['hbs'],
          },
        ];
      }
      return actions;
    },
  });
}
