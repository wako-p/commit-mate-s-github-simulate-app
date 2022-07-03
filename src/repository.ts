import { Branch } from "./branch";

export class Repository {
    public get name(): string {
        return this._name;
    }

    public get currentBranch(): Branch {
        return this._branches[this._currentBranchIndex];
    }

    private set currentBranch(value: Branch) {
        this._branches[this._currentBranchIndex] = value;
    }

    public get branchCount(): number {
        return this._branches.length;
    }

    public get branches(): readonly Branch[] {
        return Object.freeze([...this._branches]);
    }

    private constructor(
        private readonly _name: string,
        private _branches: Branch[],
        private _currentBranchIndex: number
    ) {}

    public static create(name: string): Repository {
        const main = Branch.initialize();
        const branches = [main];
        return new Repository(name, branches, 0);
    }

    public clone(): Repository {
        // クローン元のブランチを上流ブランチとするブランチを作成するために
        // 全てのブランチに対して、自身を上流ブランチとするブランチの配列を作成する
        const clonedBranches = this._branches.map((branch) => {
            const clonedBranch = branch.clone();
            clonedBranch.setUpstream(branch);
            return clonedBranch;
        });
        return new Repository(this.name, clonedBranches, this._currentBranchIndex);
    }

    public branch(branchName: string): void {
        // 既に同じブランチが存在する場合は例外をスローする
        if (this.existsBranch(branchName)) {
            throw new Error(`fatal: A branch named '${branchName}' already exists.`);
        }

        // 現在のブランチからコピーブランチを作成する
        const copyedBranch = this.currentBranch.copy(branchName);
        this._branches = [...this._branches, copyedBranch];
    }

    public switch(branchName: string): void {
        // 切り替えるブランチが存在しなければ例外をスローする
        if (this.notExistsBranch(branchName)) {
            throw new Error(`fatal: invalid reference: ${branchName}.`);
        }
        this._currentBranchIndex = this.findBranchIndexBy(branchName);
    }

    private notExistsBranch(branchName: string): boolean {
        return !this.existsBranch(branchName);
    }

    private existsBranch(branchName: string): boolean {
        return this.findBranchIndexBy(branchName) != -1 ? true : false;
    }

    private findBranchIndexBy(branchName: string): number {
        return this._branches.findIndex((branch) => branch.name == branchName);
    }

    public commit(message: string): void {
        this.currentBranch.commit(message);
    }

    public push(): void {
        // 現在のブランチのコミット履歴を現在のブランチの上流ブランチにpushする
        this.currentBranch.push();
    }
}
