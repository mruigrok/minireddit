import { MikroORM } from '@mikro-orm/core';
import mikroOrmConfig from '../mikro-orm.config';
import { Post } from '../entities/Post';

export const createPost = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();
  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();
  const post = orm.em.create(Post, {
    title: 'Hello this is a new post',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  await orm.em.persistAndFlush(post);
};