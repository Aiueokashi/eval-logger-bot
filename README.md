[replit]:https://repl.it<br>
[djs]:https://discord.js.org/#/docs/main/stable/general/welcome<br>
[akairo]:https://discord-akairo.github.io/#/
[![Run on Repl.it](https://repl.it/badge/github/Aiueokashi/eval-logger-bot)](https://repl.it/github/Aiueokashi/eval-logger-bot)
![MyBadge](https://img.shields.io/badge/まだ-制作途中-orange)
![MyBadge2](https://img.shields.io/badge/Under-Constructing-yellow)
# eval-logger-bot
Evaluate code&amp;Logger discord bot Create with discord-akairo <br>
# eval機能とlog機能をくっつけたbot
随時更新するよ<br>
listenerの使い方がわからない:cry:誰かおちえて
## [repl.it][replit]で動かすためのコードです！
# :warning:作りかけ！

# 機能↓
- [ ] Prefix変更コマンド
- [x] Eval
- [x] EvalModeChannel
- [ ] ModerationCommands
- [ ] Logger
- [ ] userInfo,serverInfo
<br><br>
# :warning:作りかけ！
# コマンドとか使い方とか
## A.使い方
`.env`ファイルの中に書いてある項目を埋めれば使えます。<br><br>
.envに必要なもの:<br>
①DiscordのBotToken<br>
②オーナーの(あなたの)discordのID(2人以上の時はカンマ(,)で区切ってね)<br>
## B.コマンド
指定した`prefix`をコマンドの前につけるか、botをメンションした後にコマンドを打つとbotが反応します。<br>
コマンドを打ち間違えてスペルミスなどをした場合は、編集して正しいコマンドに直せば実行されます。<br>
表には引数をわかりやすくするため、「<>」がついていますが、実際に使用する時は外してください
| 誰でも使えるコマンド | 説明 | 短縮コマンド |
| --- | --- | --- |
|マダ|ナイ|ヨ|

|サーバーオーナー用コマンド|説明|短縮|
|---|---|---|
|prefix \<value>|サーバーのprefixを変更|-|
|ban \<value>|指定したuserをban(IDかメンション)|-|
  
|botオーナー用コマンド|説明|短縮|
|---|---|---|
|eval \<code>|codeの中身が実際に実行される。<br>:warning:サーバーやプログラムに変更が加えられる:warning:<br>(動くのは[Discord.js][djs]と[discord-akairo][akairo]書式のみ)チャンネルに実行した際の詳細が表示されない|-|
|eval2 \<code>|codeの中身を実行する(チャンネルに実行時間や関数など詳細が表示されたコードブロックが送信される)|-|
|evalmode \<on\|off>|onにしたチャンネルに送信されたものが全て実行される(チャンネルをコマンドプロンプト化する)(オーナーとこのbot以外のユーザーからのメッセージは削除され、実行されない)|-|
# :warning:作りかけ！
