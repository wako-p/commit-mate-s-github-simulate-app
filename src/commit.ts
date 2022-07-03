export class Commit {
    private readonly _id: string;

    public get id(): string {
        return this._id;
    }

    public get message(): string {
        return this._message;
    }

    private constructor(private readonly _message: string) {
        this._id = Commit.generateId();
    }

    private static generateId(): string {
        return Math.random().toString(32).substring(2);
    }

    public static create(message: string): Commit {
        return new Commit(message);
    }
}
