import { Post } from '../entities/Post';

export const createPost = async () => {
  await Post.create({ 
    title: `This is random ${Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)}`
  }).save();
};