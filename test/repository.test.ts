import { Repository } from "../src/repository";

describe("create", () => {
    test("引数にリポジトリ名を指定して生成できる", () => {
        // when:
        const remote = Repository.create("commit-mate.net");

        // then:
        expect(remote.name).toBe("commit-mate.net");
    });

    test("空のmainブランチが作成される", () => {
        // when:
        const remote = Repository.create("commit-mate.net");

        // then:
        const main = remote.branches[0];
        expect(main.name).toBe("main");
        expect(main.commitCount).toBe(0);
    });

    test("mainブランチが現在のブランチとなっている", () => {
        // when:
        const remote = Repository.create("commit-mate.net");

        // then:
        const current = remote.currentBranch;
        expect(current.name).toBe("main");
    });
});

describe("clone", () => {
    test("クローンできる", () => {
        // given:
        const remote = Repository.create("commit-mate.net");

        // when:
        const local = remote.clone();

        // then:
        expect(local.branchCount).toBe(remote.branchCount);
    });

    test("クローン先の上流ブランチにクローン元のブランチが設定されている", () => {
        // given:
        const remote = Repository.create("commit-mate.net");
        remote.branch("test1");
        remote.branch("test2");

        // when:
        const local = remote.clone();

        // then:
        expect(local.branches[0].upstream?.name).toBe(remote.branches[0].name);
        expect(local.branches[1].upstream?.name).toBe(remote.branches[1].name);
        expect(local.branches[2].upstream?.name).toBe(remote.branches[2].name);
    });

    test("クローン先の現在のブランチがクローン元の現在のブランチと同じになっている", () => {
        // given:
        const remote = Repository.create("commit-mate.net");
        remote.branch("test1"); // git branch test1
        remote.switch("test1"); // git switch test1

        // when:
        const local = remote.clone();

        // then:
        expect(local.currentBranch.name).toBe(remote.currentBranch.name);
    });
});

describe("branch", () => {
    test("引数にブランチ名を指定すると現在のブランチからコピーを作成することができる", () => {
        // given:
        const remote = Repository.create("commit-mate.net");
        remote.commit("main-commit1"); // git commit -m "main-commit1"
        remote.commit("main-commit2"); // git commit -m "main-commit2"
        remote.commit("main-commit3"); // git commit -m "main-commit3"

        // when:
        remote.branch("test"); // git branch test

        // then:
        expect(2).toBe(remote.branchCount);

        // mainブランチのアサーション
        const main = remote.branches[0];
        expect(main.name).toBe("main");

        const mainCommit1 = main.history[0];
        const mainCommit2 = main.history[1];
        const mainCommit3 = main.history[2];
        expect(mainCommit1.message).toBe("main-commit1");
        expect(mainCommit2.message).toBe("main-commit2");
        expect(mainCommit3.message).toBe("main-commit3");

        // testブランチのアサーション
        const test = remote.branches[1];
        expect(test.name).toBe("test");

        const testCommit1 = main.history[0];
        const testCommit2 = main.history[1];
        const testCommit3 = main.history[2];
        expect(testCommit1.message).toBe("main-commit1");
        expect(testCommit2.message).toBe("main-commit2");
        expect(testCommit3.message).toBe("main-commit3");
    });

    test("引数に指定したブランチ名のブランチが既に存在している場合は例外がスローされる", () => {
        // given:
        const remote = Repository.create("commit-mate.net");
        remote.branch("test");

        // when:
        // 既に存在するブランチなので例外がスローされる
        expect(() => {
            remote.branch("test");
        }).toThrowError(Error);
    });
});

describe("switch", () => {
    test("引数に指定したブランチ名のブランチを現在のブランチにすることができる", () => {
        // given:
        const remote = Repository.create("commit-mate.net");
        remote.branch("test1");
        remote.branch("test2");

        // when/then:
        expect(remote.currentBranch.name).toBe("main");

        remote.switch("test1");
        expect(remote.currentBranch.name).toBe("test1");

        remote.switch("test2");
        expect(remote.currentBranch.name).toBe("test2");

        remote.switch("main");
        expect(remote.currentBranch.name).toBe("main");
    });

    test("引数に指定したブランチ名のブランチが存在しない場合は例外がスローされる", () => {
        // given:
        const remote = Repository.create("commit-mate.net");

        // when/then:
        // 存在しないブランチなので例外がスローされる
        expect(() => {
            remote.switch("test1");
        }).toThrowError(Error);
    });
});

describe("commit", () => {
    test("引数にメッセージを指定して現在のブランチにコミットすることができる", () => {
        // given:
        const remote = Repository.create("commit-mate.net");

        // mainブランチからtest1ブランチとtest2ブランチを作成する
        remote.branch("test"); // git branch test

        // when:
        // mainブランチに3回コミットコミット
        // > git commit -m "main-commit1"
        remote.commit("main-commit1");

        // > git commit -m "main-commit2"
        remote.commit("main-commit2");

        // > git commit -m "main-commit3"
        remote.commit("main-commit3");

        // testブランチに切り替えて3回コミット
        // > git switch test
        remote.switch("test");

        // > git commit -m "tset-commit1"
        remote.commit("test-commit1");

        // > git commit -m "tset-commit2"
        remote.commit("test-commit2");

        // > git commit -m "tset-commit3"
        remote.commit("test-commit3");

        // then:
        // mainブランチへのコミットのアサーション
        const mainCommit1 = remote.branches[0].history[0];
        const mainCommit2 = remote.branches[0].history[1];
        const mainCommit3 = remote.branches[0].history[2];
        expect("main-commit1").toBe(mainCommit1.message);
        expect("main-commit2").toBe(mainCommit2.message);
        expect("main-commit3").toBe(mainCommit3.message);

        // testブランチへのコミットのアサーション
        const testCommit1 = remote.branches[1].history[0];
        const testCommit2 = remote.branches[1].history[1];
        const testCommit3 = remote.branches[1].history[2];
        expect("test-commit1").toBe(testCommit1.message);
        expect("test-commit2").toBe(testCommit2.message);
        expect("test-commit3").toBe(testCommit3.message);
    });
});

describe("push", () => {
    test("現在のブランチのコミット履歴を上流ブランチ(main)にpushできる", () => {
        // given:
        const remote = Repository.create("commit-mate.net");

        // リモートをクローンする
        const local = remote.clone();

        // ローカルのmainブランチに3回コミットする
        local.commit("local-main-commit1");
        local.commit("local-main-commit2");
        local.commit("local-main-commit3");

        // when:
        // ローカルの現在のブランチ(main)を上流ブランチ(main)にpushする
        // git push
        local.push();

        // then:
        const remoteMainCommit1 = remote.currentBranch.history[0];
        const remoteMainCommit2 = remote.currentBranch.history[1];
        const remoteMainCommit3 = remote.currentBranch.history[2];

        expect("local-main-commit1").toBe(remoteMainCommit1.message);
        expect("local-main-commit2").toBe(remoteMainCommit2.message);
        expect("local-main-commit3").toBe(remoteMainCommit3.message);
    });

    test("現在のブランチのコミット履歴を上流ブランチ(main)にpushした後にローカルのブランチにコミットしても上流ブランチには影響がない", () => {
        // given:
        const remote = Repository.create("commit-mate.net");

        // リモートをクローンする
        const local = remote.clone();

        // ローカルの現在のブランチ(main)に3回コミットする
        local.commit("main-commit1");
        local.commit("main-commit2");
        local.commit("main-commit3");

        // when:
        // ローカルの現在のブランチ(main)を上流ブランチ(main)にpushする
        // git push
        local.push();
        local.commit("main-commit4");
        local.commit("main-commit5");
        local.commit("main-commit6");

        // then:
        // リモートのmainブランチのコミット数のアサーション
        expect(3).toBe(remote.currentBranch.commitCount);

        // ローカルのmainブランチのコミット数のアサーション
        expect(6).toBe(local.currentBranch.commitCount);
    });
});
