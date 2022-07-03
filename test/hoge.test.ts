import { Hoge } from "../src/hoge";

describe("Hoge", () => {
    describe("add", () => {
        test.each([[1, 1, 2]])(
            "加算できる",
            (x: number, y: number, expected: number) => {
                const hoge = new Hoge();
                const actual = hoge.add(x, y);

                expect(expected).toBe(actual);
            }
        );
    });
});
