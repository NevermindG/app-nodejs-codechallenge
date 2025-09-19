type Factory<T> = () => T;
export class Container {
  private registry = new Map<string, Factory<any>>();
  private singletons = new Map<string, any>();
  register<T>(token: string, factory: Factory<T>, singleton = true) {
    if (singleton) {
      this.registry.set(token, () => {
        if (!this.singletons.has(token)) this.singletons.set(token, factory());
        return this.singletons.get(token);
      });
    } else {
      this.registry.set(token, factory);
    }
  }
  resolve<T>(token: string): T {
    const f = this.registry.get(token);
    if (!f) throw new Error(`Dependency ${token} not registered`);
    return f();
  }
}
export const TOKENS = {
  Repo: 'Repo',
  Bus: 'Bus',
  Service: 'Service'
};
