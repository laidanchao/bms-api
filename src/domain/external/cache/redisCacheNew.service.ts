import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import IORedis from 'ioredis';

const logger = new Logger('redis');

@Injectable()
export class RedisCacheNewService {
  private redis = null;

  constructor() {
    const options: IORedis.RedisOptions = {
      lazyConnect: true,
    };
    if (process.env.REDIS_TLS) {
      options.tls = {
        checkServerIdentity: () => undefined,
      };
    }
    this.redis = new Redis(process.env.WHOLE_REDIS_URL, options);
  }

  /**
   * 清空当前db所有缓存
   */
  public async flushDb() {
    return await this.redis.flushdb();
  }

  public async get(key: string) {
    return await this.redis.get(key);
  }

  /**
   * 增加缓存
   * @param key
   * @param value
   * @param timeout 设置缓存多久失效（秒），默认为不过期
   */
  public async set(key: string, value: any, timeout?: number) {
    if (timeout) {
      return await this.redis.set(key, value, 'EX', timeout);
    } else {
      return await this.redis.set(key, value);
    }
  }

  /**
   * 删除缓存
   * @param key
   * @param isPattern 是否模糊匹配
   */
  public async del(key: string, isPattern = false) {
    let keys;
    if (isPattern) {
      keys = await this.redis.keys(key);
    } else {
      keys = [key];
    }

    for (const key of keys) {
      await this.redis.del(key);
    }
  }

  public async keys(key) {
    return await this.redis.keys(key);
  }

  public async setNx(lockKey: string, value: string | number) {
    return await this.redis.setnx(lockKey, value);
  }

  public async expire(key: string, seconds: number) {
    return await this.redis.expire(key, seconds);
  }

  /**
   * 插入带有过期时间的key
   * @param key
   * @param value
   * @param seconds
   */
  public async setEx(key: string, value: string, seconds: number) {
    return await this.redis.psetex(key, seconds * 1000, value);
  }

  public async rPush(key: string, value) {
    return await this.redis.rpush(key, value);
  }

  /**
   * Set add
   * @param key
   * @param value
   */
  public async sAdd(key: string, value): Promise<number> {
    return await this.redis.sadd(key, value);
  }

  /**
   * Set remove value
   * @param key
   * @param value
   */
  public async sRem(key: string, value): Promise<number> {
    return await this.redis.srem(key, value);
  }

  /**
   * Set count
   * @param key
   */
  public async sCard(key: string): Promise<number> {
    return await this.redis.scard(key);
  }

  /**
   * Set get array
   * @param key
   */
  public async sMembers(key: string): Promise<any[]> {
    return await this.redis.smembers(key);
  }

  /**
   * Set has value
   * @param key
   * @param value
   */
  public async hasValue(key: string, value): Promise<number> {
    return await this.redis.sismember(key, value);
  }

  /**
   * 有序数组，添加元素
   * @param key
   * @param value
   */
  public async zAdd(key: string, value: [number, string]): Promise<number> {
    return await this.redis.zadd(key, ...value);
  }

  /**
   * 有序数组获取元素
   * @param key
   * @param member
   */
  public async zGet(key: string, member: string): Promise<number> {
    return await this.redis.zscore(key, member);
  }

  /**
   * 统计有序数组
   * @param key
   */
  public async zCount(key: string): Promise<number> {
    return await this.redis.zcard(key);
  }

  /**
   * 删除有序数组指定数据
   * @param key
   * @param member
   */
  public async zRem(key: string, member: string): Promise<number> {
    return await this.redis.zrem(key, member);
  }

  /**
   * 增加有序成员的数据
   * @param key
   * @param member
   * @param increment
   *
   * @return 返回增加后的数据
   */
  public async incrByMember(key: string, member: string, increment: number): Promise<number> {
    return await this.redis.zincrby(key, increment, member);
  }

  /**
   * 按照count 分批获取数据
   * @param key
   * @param count
   *
   * @return [err, data]|null
   */
  public async multiExec(key: string, count: number): Promise<any> {
    return await this.redis
      .multi()
      .srandmember(key, count)
      .exec(data => {
        return new Promise(resolve => resolve(data));
      });
  }

  public async hSet(key: string, field, value?) {
    if (value) {
      return await this.redis.hset(key, field, value);
    }
    return await this.redis.hset(key, field);
  }

  public async hGet(key, field?) {
    if (field) {
      return await this.redis.hget(key, field);
    }
    return await this.redis.hgetall(key);
  }

  /**
   * 订阅事件通知
   * @param subscribeKey
   */
  public async sub(subscribeKey: string[]) {
    try {
      await this.redis.subscribe(subscribeKey);
      logger.log(`subscribe: [${subscribeKey.join(',')}] success`);
    } catch (e) {
      logger.error(`subscribe: [${subscribeKey.join(',')}] error, message: ${e.message}`);
    }
  }

  /**
   * 执行推送消息
   * @param cb
   */
  public message(cb) {
    this.redis.on('message', function(channel, key) {
      if (cb) {
        cb(key, channel);
      } else {
        logger.log(channel, key);
      }
    });
  }
}
