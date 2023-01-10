import { Injectable, NotFoundException } from '@nestjs/common';
import { DeepPartial, DeleteResult, Repository } from 'typeorm';

@Injectable()
export class AbstractService<T> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const newRecord = this.repository.create(data);
    return await this.repository.save(newRecord);
  }

  async findAll(): Promise<T[]> {
    return await this.repository.find();
  }

  async findOne(id: number): Promise<T> {
    const options: any = { id };
    const entity = await this.repository.findOne(options);
    if (!entity) throw new NotFoundException();
    return entity;
  }

  async update(id: any, data: DeepPartial<T>): Promise<T> {
    return await this.repository.save({ id, ...data });
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
