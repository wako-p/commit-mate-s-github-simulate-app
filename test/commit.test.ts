import { Commit } from "../src/commit";

describe("create", () => {
    test("引数にメッセージを指定すると生成できる。また、messageプロパティには引数の値が使用される。", () => {
        // when:
        const commit = Commit.create("message");

        // then:
        expect(commit.message).toBe("message");
    });

    test("異なるコミットIDが付与される", () => {
        // when:
        const commit1 = Commit.create("message");
        const commit2 = Commit.create("message");

        // then:
        expect(commit1.id).not.toBe(commit2.id);
    });
});
