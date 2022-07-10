import { Branch } from "./branch";
import { Remote } from "./remote";

export class Repository {
    public get name(): string {
        return this._name;
    }

    public get remote(): Remote {
        return this._remote;
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
        private readonly _remote: Remote,
        private _branches: Branch[],
        private _currentBranchIndex: number
    ) {}

    public static create(name: string): Repository {
        const remote = Remote.initialize();
        const main = Branch.initialize();
        const branches = [main];
        return new Repository(name, remote, branches, 0);
    }

    public clone(): Repository {
        // originとして自身を登録する
        const remote = Remote.initialize();
        remote.add("origin", this);

        // クローン元のブランチを上流ブランチとするブランチを作成するために
        // 全てのブランチに対して、自身を上流ブランチとするブランチの配列を作成する
        const clonedBranches = this._branches.map((branch) => {
            const clonedBranch = branch.clone();
            clonedBranch.setUpstream(branch);
            return clonedBranch;
        });

        return new Repository(this.name, remote, clonedBranches, this._currentBranchIndex);
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

    public push(): void;
    public push(option: string, remote: string, branch: string): void;
    public push(option?: string, remote?: string, branch?: string): void {
        if (option != undefined && remote != undefined && branch != undefined) {
            // オプションのチェック
            if (option != "-u" && option != "--set-upstream") {
                throw new Error();
            }

            // リモートに引数で指定されたブランチがなければ作成する
            const remoteRepository = this._remote.findBy(remote);
            if (remoteRepository.notExistsBranch(branch)) {
                remoteRepository.branch(branch);
            }

            // ローカルのブランチの上流ブランチとしてリモートのブランチを設定する
            const remoteBranch = remoteRepository.findBy(branch);
            const localBranch = this.findBy(branch);
            localBranch.setUpstream(remoteBranch);

            // ローカルのブランチをpushする
            localBranch.push();
        } else {
            // 現在のブランチをpushする
            this.currentBranch.push();
        }
    }

    public findBy(branchName: string): Branch {
        if (this.notExistsBranch(branchName)) {
            throw new Error(`branch "${branchName}" not exists.`);
        }

        const branchIndex = this.findBranchIndexBy(branchName);
        return this._branches[branchIndex];
    }
}
