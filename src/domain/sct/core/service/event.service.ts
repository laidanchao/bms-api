import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Event } from '@/domain/sct/core/entity/event.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, IsNull } from 'typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { EventRepository } from '@/domain/sct/core/repository/event.repository';
import AsyncLock from 'async-lock';
import { Cacheable, CacheClear } from 'type-cacheable';
import { CacheTtlSeconds } from '@/domain/external/cache/cache.service';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';
import { ParcelStatus, Transporter } from '@/domain/utils/Enums';

@Injectable()
export class EventService extends TypeOrmCrudService<Event> {
  private asyncLock;

  constructor(
    @InjectRepository(EventRepository) private trackingEventRepo: EventRepository,
    private redisCacheNewService: RedisCacheNewService,
  ) {
    super(trackingEventRepo);
    this.asyncLock = new AsyncLock();
  }

  async replaceOne(req: CrudRequest, dto: DeepPartial<Event>): Promise<Event> {
    const result = super.replaceOne(req, dto);
    await this.deleteCachePattern();
    return result;
  }

  async deleteOne(req: CrudRequest): Promise<void | Event> {
    const result = super.deleteOne(req);
    await this.deleteCachePattern();
    return result;
  }

  @Cacheable({ cacheKey: args => `TRACKING_EVENT_${args[0]}`, ttlSeconds: CacheTtlSeconds.ONE_DAY })
  public async findByEvent(event) {
    return await this.find({ where: { event } });
  }

  @Cacheable({ cacheKey: args => `TRACKING_EVENT_${args[0]}_${args[1]}`, ttlSeconds: CacheTtlSeconds.ONE_DAY })
  public async findByEventAndTransporter(event, transporter) {
    return await this.findOne({
      where: [
        { event, transporter },
        { event, transporter: IsNull() },
        { event, transporter: '' },
      ],
      order: {
        transporter: 'DESC',
      },
    });
  }

  public async findByEventAndTransporterNew(event, transporter) {
    const key = `TRACKING_EVENT_${event}_${transporter}`;
    let sctEvent = await this.redisCacheNewService.get(key);
    if (sctEvent) {
      return JSON.parse(sctEvent);
    } else {
      sctEvent = await this.findOne({
        where: [
          { event, transporter },
          { event, transporter: IsNull() },
          { event, transporter: '' },
        ],
        order: {
          transporter: 'DESC',
        },
      });
      await this.redisCacheNewService.set(key, JSON.stringify(sctEvent));
      return sctEvent;
    }
  }

  public async saveUnresolvedTrackingEvents(newEvents: { event; description }[], transporter: string) {
    let entities;
    // 顺丰、FEDEX、MR不保存描述
    if (
      [Transporter.SF.toString(), Transporter.FEDEX.toString(), Transporter.MONDIAL_RELAY.toString()].includes(
        transporter,
      )
    ) {
      entities = newEvents.map(m => {
        return Event.create({
          event: m.event,
          transporter: transporter,
          parcelStatus: ParcelStatus.UNKNOWN,
        });
      });
    } else {
      entities = newEvents.map(m => {
        return Event.create({
          event: m.event,
          transporter: transporter,
          zh: m.description,
          en: m.description,
          fr: m.description,
          parcelStatus: ParcelStatus.UNKNOWN,
        });
      });
    }

    await this.trackingEventRepo.createOrIgnore(entities);
    await this.deleteCachePattern();
    return entities;
  }

  @CacheClear({ cacheKey: args => `TRACKING_EVENT_${args[0]}` })
  public async updateTransporter(event, transporter) {
    return this.repo.update({ event }, { transporter });
  }

  @Cacheable({ cacheKey: args => `TRACKING_EVENT_${args[0]}`, ttlSeconds: CacheTtlSeconds.ONE_DAY })
  public async findTrackingEventWithLock(event) {
    return await this.asyncLock.acquire(event, () => {
      return this.findByEvent(event);
    });
  }

  @Cacheable({ cacheKey: args => `TRACKING_EVENT_${args[0]}_${args[1]}`, ttlSeconds: CacheTtlSeconds.ONE_DAY })
  public async findTrackingEventByTransporterWithLock(event, transporter) {
    return await this.asyncLock.acquire(`${event}_${transporter}`, () => {
      return this.findByEventAndTransporter(event, transporter);
    });
  }

  /**
   * 根据派送商获取event列表
   * @param transporter
   */
  async findByTransporter(transporter: string): Promise<Event[]> {
    return this.repo.find({
      where: [{ transporter: transporter }, { transporter: IsNull() }, { transporter: '' }],
    });
  }

  /**
   * 模糊匹配删除缓存
   * @private
   */
  private async deleteCachePattern() {
    await this.redisCacheNewService.del(`TRACKING_EVENT_*`, true);
  }
}
