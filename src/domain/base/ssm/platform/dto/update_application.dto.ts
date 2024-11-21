import { PartialType } from '@nestjs/mapped-types';
import { Create_applicationDto } from '@/domain/base/ssm/platform/dto/create_application.dto';

export class Update_applicationDto extends PartialType(Create_applicationDto) {}
