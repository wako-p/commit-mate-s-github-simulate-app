import { Branch } from "../src/branch";

describe("initialize", () => {
    test("mainブランチを作成できる", () => {
        // when:
        const main = Branch.initialize();

        // then:
        expect(main.name).toBe("main");
    });

    test("コミット履歴がない状態(コミット数=0)で作成される", () => {
        // when:
        const main = Branch.initialize();

        // then:
        expect(main.commitCount).toBe(0);
    });

    test("上流ブランチが設定されていない状態(undefined)で作成される", () => {
        // when:
        const main = Branch.initialize();

        // then:
        expect(main.upstream).toBe(undefined);
    });
});

describe("create", () => {
    test("引数に指定した名前のブランチを作成できる", () => {
        // when:
        const feat = Branch.create("feat");

        // then:
        expect(feat.name).toBe("feat");
    });

    test("コミット履歴がない状態(コミット数=0)で作成される", () => {
        // when:
        const feat = Branch.create("feat");

        // then:
        expect(feat.commitCount).toBe(0);
    });

    test("上流ブランチが設定されていない状態(undefined)で作成される", () => {
        // when:
        const feat = Branch.create("feat");

        // then:
        expect(feat.upstream).toBe(undefined);
    });
});

describe("commit", () => {
    test("引数にメッセージを指定してコミットできる", () => {
        // when:
        const branch = Branch.initialize();
        branch.commit("commit1");
        branch.commit("commit2");
        branch.commit("commit3");

        // then:
        expect(branch.commitCount).toBe(3);
        expect(branch.history[0].message).toBe("commit1");
        expect(branch.history[1].message).toBe("commit2");
        expect(branch.history[2].message).toBe("commit3");
    });
});

describe("clone", () => {
    test("クローン元のブランチ名と同じになる", () => {
        // given:
        const branch = Branch.initialize();

        // when:
        const clonedBranch = branch.clone();

        // then:
        expect(clonedBranch.name).toBe(branch.name);
    });

    test("クローン元のコミット履歴と同じになる", () => {
        // given:
        const branch = Branch.initialize();
        branch.commit("commit1");
        branch.commit("commit2");
        branch.commit("commit3");

        // when:
        const clonedBranch = branch.clone();

        // then:
        expect(clonedBranch.history[0].id).toBe(branch.history[0].id);
        expect(clonedBranch.history[1].id).toBe(branch.history[1].id);
        expect(clonedBranch.history[2].id).toBe(branch.history[2].id);
        expect(clonedBranch.history[0].message).toBe(branch.history[0].message);
        expect(clonedBranch.history[1].message).toBe(branch.history[1].message);
        expect(clonedBranch.history[2].message).toBe(branch.history[2].message);
    });

    test.each([undefined, Branch.create("feat1"), Branch.create("feat2"), Branch.create("feat3")])(
        "クローン元の上流ブランチと同じになる",
        (upstream?: Branch) => {
            // given:
            const branch = Branch.initialize();
            branch.setUpstream(upstream);

            // when:
            const clonedBranch = branch.clone();

            // then:
            expect(clonedBranch.upstream).toBe(branch.upstream);
        }
    );
});

describe("copy", () => {
    test("引数に指定したブランチ名になる", () => {
        // given:
        const branch = Branch.initialize();

        // when:
        const copyedBranch = branch.copy("feat");

        // then:
        expect(copyedBranch.name).toBe("feat");
    });

    test("コピー元のコミット履歴と同じになる", () => {
        // given:
        const branch = Branch.initialize();
        branch.commit("commit1");
        branch.commit("commit2");
        branch.commit("commit3");

        // when:
        const copyedBranch = branch.copy("feat");

        // then:
        expect(copyedBranch.history[0].id).toBe(branch.history[0].id);
        expect(copyedBranch.history[1].id).toBe(branch.history[1].id);
        expect(copyedBranch.history[2].id).toBe(branch.history[2].id);
        expect(copyedBranch.history[0].message).toBe(branch.history[0].message);
        expect(copyedBranch.history[1].message).toBe(branch.history[1].message);
        expect(copyedBranch.history[2].message).toBe(branch.history[2].message);
    });

    test("上流ブランチが設定されていない状態(undefined)になる", () => {
        // given:
        const branch = Branch.initialize();

        // when:
        const copyedBranch = branch.copy("feat");

        // then:
        expect(copyedBranch.upstream).toBe(undefined);
    });
});

describe("setUpstream", () => {
    test("引数に指定したブランチを上流ブランチに設定できる", () => {
        // given:
        const branch = Branch.initialize();
        const copyedBranch = branch.copy("feat");

        // when:
        copyedBranch.setUpstream(branch);

        // then:
        expect(copyedBranch.upstream?.name).toBe(branch.name);
    });
});

describe("push", () => {
    test("上流ブランチにプッシュできる", () => {
        // given:
        const main = Branch.initialize();
        main.commit("main-commit1");

        const feat = main.copy("feat");
        feat.commit("feat-commit1");
        feat.setUpstream(main);

        // when:
        feat.push();

        // then:
        const mainCommit1 = main.history[0];
        const mainCommit2 = main.history[1];
        expect(mainCommit1.message).toBe("main-commit1");
        expect(mainCommit2.message).toBe("feat-commit1");
    });

    test("上流ブランチが設定されていない場合は例外がスローされる", () => {
        // given:
        const main = Branch.initialize();
        main.commit("main-commit1");

        const feat = main.copy("feat");
        feat.commit("feat-commit1");

        // when/then:
        expect(() => {
            feat.push();
        }).toThrowError(new Error(`fatal: The current branch "feat" has no upstream branch.`));
    });
});
