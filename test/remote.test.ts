import { Remote } from "../src/remote";
import { Repository } from "../src/repository";

describe("initialize", () => {
    test("登録されているリモートリポジトリがない状態で生成される", () => {
        // when:
        const remote = Remote.initialize();

        // then:
        expect(remote.count).toBe(0);
    });
});

describe("add", () => {
    test("引数に指定した名前でリモートリポジトリを登録することができる", () => {
        // given:
        const remote = Remote.initialize();

        // when:
        const repo = Repository.create("commit-mate.net");
        remote.add("origin", repo);

        // then:
        expect(remote.repositories["origin"].name).toBe(repo.name);
    });

    test("既に登録済みの名前でリモートリポジトリを登録しようとるすると例外がスローされる", () => {
        // given:
        const remote = Remote.initialize();
        const repo1 = Repository.create("repo1");
        const repo2 = Repository.create("repo2");

        // when:
        remote.add("origin", repo1);

        // then:
        expect(() => {
            remote.add("origin", repo2);
        }).toThrowError(new Error(`fatal: remote "origin" already exists.`));
    });
});

describe("findBy", () => {
    test("引数に指定した名前のリモートリポジトリを取得できる", () => {
        // given:
        const remote = Remote.initialize();
        const repo = Repository.create("commit-mate.net");
        remote.add("origin", repo);

        // when:
        const searchedRepo = remote.findBy("origin");

        // then:
        expect(searchedRepo.name).toBe(repo.name);
    });

    test("引数に指定した名前のリモートリポジトリが見つからない場合は例外がスローされる", () => {
        // given:
        const remote = Remote.initialize();
        const repo = Repository.create("commit-mate.net");
        remote.add("origin", repo);

        // when/then:
        expect(() => {
            remote.findBy("test");
        }).toThrowError(new Error(`fatal: remote "test" not exists.`));
    });
});
