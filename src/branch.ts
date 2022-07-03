import { Commit } from "./commit";

export class Branch {
    public get name(): string {
        return this._name;
    }

    public get history(): readonly Commit[] {
        return Object.freeze([...this._history]);
    }

    public get commitCount(): number {
        return this._history.length;
    }

    public get upstream(): Branch | undefined {
        return this._upstream;
    }

    private constructor(private readonly _name: string, private _history: Commit[], private _upstream?: Branch) {}

    public static initialize(): Branch {
        const emptyHistory: Commit[] = [];
        return new Branch("main", emptyHistory, undefined);
    }

    public static create(name: string): Branch {
        const emptyHistory: Commit[] = [];
        return new Branch(name, emptyHistory, undefined);
    }

    public commit(message: string): void {
        const addedHistory = [...this._history, Commit.create(message)];
        this._history = addedHistory;
    }

    public clone(): Branch {
        // 名前、コミット履歴、上流ブランチが全て同じブランチを作成する
        const copyedHistory = [...this._history];
        return new Branch(this._name, copyedHistory, this._upstream);
    }

    public copy(name: string): Branch {
        // コピーするときは上流ブランチを設定しない
        const copyedHistory = [...this._history];
        return new Branch(name, copyedHistory, undefined);
    }

    public setUpstream(upstream?: Branch): void {
        this._upstream = upstream;
    }

    public push(): void {
        if (this.notExistsUpstream()) {
            throw new Error(`fatal: The current branch ${this._name} has no upstream branch.`);
        }

        const copyedHistory = [...this._history];
        this._upstream?.update(copyedHistory);
    }

    private notExistsUpstream(): boolean {
        return this._upstream == undefined;
    }

    private update(history: Commit[]): void {
        this._history = history;
    }
}
