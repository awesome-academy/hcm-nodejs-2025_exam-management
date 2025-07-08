import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiResponseData = <TModel extends Type<unknown>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: {
          data: { $ref: getSchemaPath(model) },
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Server Response Success' },
          error: { type: 'string', nullable: true, example: null },
        },
      },
    }),
  );
};

export const ApiResponseDataArray = <TModel extends Type<unknown>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Server Response Success' },
          error: { type: 'string', nullable: true, example: null },
        },
      },
    }),
  );
};
