import fetch from 'node-fetch'
import { Graph } from './graph';

export class Test {
  private users: { id: string }[] = []
  private posts: { id: string }[] = []

  async prepareTests(): Promise<void> {
    this.users = await this.fetchResources('users')
    this.posts = await this.fetchResources('posts')
  }

  async fetchResources(resource: string): Promise<any> {
    const resp = await fetch(`https://jsonplaceholder.typicode.com/${resource}`)

    return resp.json();
  }

  async run(graph: Graph): Promise<void> {
    await this.prepareTests();

    if (!this.areEntitiesValid(graph)) {
      return;
    } else {
      console.log("SUCCESS: all entities are valid!");
    }
  
    if (!this.areRelationshipsValid(graph)) {
      return;
    } else {
      console.log("SUCCESS: all relationships are valid!");
    }

    console.log("GREAT SUCCESS: all tests passed!");
  }

  areEntitiesValid(graph: Graph): boolean {
    for (const user of this.users || []) {
      const userEntity = graph.findEntityById(`user:${user.id}`)
      if (!userEntity) {
        console.error(`ERROR: Could not find entity with id: user:${user.id}`);

        return false;
      }
    }

    for (const post of this.posts || []) {
      const postEntity = graph.findEntityById(`post:${post.id}`);
      if (!postEntity) {
        console.error(`ERROR: Could not find entity with id: post:${post.id}`);

        return false;
      }
    }
    
    return true;
  }

  areRelationshipsValid(graph: Graph): boolean {
    const relationships = graph.listRelationships();

    // Verify that from and to entities are found in graph
    for (const relationship of relationships) {
      const { from, to } = relationship;

      const fromEntity = graph.findEntityById(from);
      if (!fromEntity) {
        console.error(`ERROR: Could not find (from) entity from relationship with id: ${from}`);

        return false;
      }

      if (fromEntity.type !== "User") {
        console.log("ERROR: Invalid from type for relationship, should be User but is Post");
      }

      const toEntity = graph.findEntityById(to);
      if (!toEntity) {
        console.error(`ERROR: Could not find (to) entity from relationship with id: ${to}`);

        return false;
      }

      if (toEntity.type !== "Post") {
        console.log("ERROR: Invalid to type for relationship, should be Post but is User");
      }

    }

    return true;
  }
}