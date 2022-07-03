# 概要

`commit-mate.net/pages/tutorial.vue`のコンポーネント側のコードをシンプルに保つために、  
GitHub をシュミュレーションする側のコードをクラスとして抽出したサンプルコードです。

# 使い方

## リポジトリの作成

新しくリポジトリを作成します。  
作成した直後のリポジトリには main ブランチのみが存在しており、現在のブランチは main ブランチとなります。

```ts
const remote = Repository.create("commit-mate.net");
```

## リポジトリのクローン

リポジトリをクローンします。  
`git clone [xxx]`コマンドに相当する操作です。

```ts
const remote = Repository.create("commit-mate.net");

// git clone [xxx]
const local = remote.clone();
```

## ブランチの作成

リポジトリに現在のブランチからコピーした、新しいブランチを作成します。  
`git branch [ブランチ名]`コマンドに相当する操作です。  
また、引数に既に存在しているブランチ名を指定すると例外がスローされます。

```ts
const remote = Repository.create("commit-mate.net");
const local = remote.clone();

// mainブランチからtestブランチを作成
local.branch("test");
```

## ブランチの切り替え

リポジトリの現在のブランチを切り替えます。  
`git switch [ブランチ名]`コマンドに相当する操作です。  
また、引数に存在しないブランチ名を指定すると例外がスローされます。

```ts
const remote = Repository.create("commit-mate.net");
const local = remote.clone();

// 1. mainブランチからtestブランチを作成
local.branch("test");

// 2. 現在のブランチをmainブランチからtestブランチに切り替え
local.switch("test");
```

## コミット

リポジトリの現在のブランチに対してコミットします。  
`git commit -m [コミットメッセージ]`コマンドに相当する操作です。

```ts
const remote = Repository.create("commit-mate.net");
const local = remote.clone();

// 1. mainブランチからtestブランチを作成
local.branch("test");

// 2. 現在のブランチ(mainブランチ)からtestブランチに切り替え
local.switch("test");

// 3. 現在のブランチ(testブランチ)に3回コミット
local.commit("test-commit1"); // git commit -m "test-commit1"
local.commit("test-commit2"); // git commit -m "test-commit2"
local.commit("test-commit3"); // git commit -m "test-commit3"
```

## プッシュ

リポジトリの現在のブランチの変更を上流ブランチにプッシュします。  
`git push`コマンドに相当する操作です。

```ts
const remote = Repository.create("commit-mate.net");
const local = remote.clone();

// 1. 現在のブランチ(mainブランチ)に3回コミット
local.commit("main-commit1");
local.commit("main-commit2");
local.commit("main-commit3");

// 2. 現在のブランチ(mainブランチ)の変更を上流ブランチ(remoteのmainブランチ)にpush
local.push();
```
