import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelDto } from '@/domain/cam/channel/dto/create-channel.dto';

export class UpdateChannelDto extends PartialType(CreateChannelDto) {}
