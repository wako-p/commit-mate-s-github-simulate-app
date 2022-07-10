import { Repository } from "./repository";

export class Remote {
    public get repositories(): { [name: string]: Repository } {
        return Object.freeze(this._repositories);
    }

    public get count(): number {
        return Object.keys(this._repositories).length;
    }

    private constructor(private _repositories: { [name: string]: Repository }) {}

    public static initialize(): Remote {
        return new Remote({});
    }

    public add(name: string, repository: Repository): void {
        if (this.existsRepository(name)) {
            throw new Error(`fatal: remote "${name}" already exists.`);
        }
        this._repositories[name] = repository;
    }

    public findBy(name: string): Repository {
        if (this.notExistsRepository(name)) {
            throw new Error(`fatal: remote "${name}" not exists.`);
        }
        return this._repositories[name];
    }

    private notExistsRepository(name: string): boolean {
        return !this.existsRepository(name);
    }

    private existsRepository(name: string): boolean {
        return name in this._repositories;
    }
}
