import fetch from 'node-fetch';
import { Graph } from './graph';
import { Test } from './test';

/**
 * All extending classes should provide a base url in their constructors.
 *
 * Please use the protected baseUrl when constructing the endpoint URL for fetch.
 */
abstract class ThirdPartyApiClient {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * A convenience method for producing API endpoint paths using the provided baseUrl.
   *
   * e.g. fetch(this.withBaseUrl("/posts"))
   */
  withBaseUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }
}

interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

class PostsApi extends ThirdPartyApiClient {
  async iteratePosts(callback: (post: Post) => void): Promise<void> {
    const res = await fetch(this.withBaseUrl('/posts'));
    (await res.json()).forEach(callback);
  }
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: UserAddress;
  phone: string;
  website: string;
  company: UserCompany;
}
export interface UserAddress {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: UserAddressGeo;
}

export interface UserAddressGeo {
  lat: string;
  lng: string;
}

export interface UserCompany {
  name: string;
  catchPhrase: string;
  bs: string;
}

class UsersApi extends ThirdPartyApiClient {
  async iterateUsers(callback: (user: User) => void): Promise<void> {
    const res = await fetch(this.withBaseUrl('/users'));
    (await res.json()).forEach(callback);
  }
}

// A couple of convenience functions you can use to create unique entity ids.
const getUserId = (user: User) => `user:${user.id}`;
const getPostId = (post: Post) => `post:${post.id}`;

(async () => {
  // Use methods provided in the Graph class to create a graph that has the following entities:
  // - Users
  // - Posts
  // And the following relationships:
  // - User has Post
  const graph = new Graph();

  const postsApi = new PostsApi('https://jsonplaceholder.typicode.com');
  const usersApi = new UsersApi('https://jsonplaceholder.typicode.com');

  await usersApi.iterateUsers(async (user: User) => {
    graph.createEntity(getUserId(user), 'User', user);
  });

  // How to implement: following the code above, turn posts into entities
  await postsApi.iteratePosts(async (post: Post) => {
    const postId = getPostId(post);
    const createdPost = graph.createEntity(postId, 'Post', post);
    const user = graph.findEntityById(getUserId({ id: post.userId } as User));
    if (user) {
      graph.createRelationship(user, createdPost, 'HAS');
    } else {
      throw new Error(
        `Unable to find user for post (postId, userId): ${post.id}, ${post.userId}`
      );
    }
  });

  // *** TESTS, don't touch ***
  const test = new Test();
  await test.run(graph);
})();
