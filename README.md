# HTMLとGAS(Google Apps Script)との連携

## 機能
・HTMLとCSSでフォーム画面を制作  
・フォームに入力された内容をJavascriptの非同期通信でPOST送信  
・GASでPOSTされた内容を受信しバリデーションチェックを行う  
・バリデーションチェックを行った結果、エラーがある場合は以下の動作を行う  
　１．エラー内容を送信元に返す  
　２．受け取ったエラー内容をフォームの要素ごとに表示する  
 
・バリデーションチェックを行った結果、エラーがなければ以下の動作を行う  
　１．受信した内容をスプレッドシートに書き込む  
　２．受信した内容の確認メールを送信者に送る。  
　　　ただし送信メールの送信元は独自ドメインのメールアドレスを用いる  
　３．受信した内容の確認メールをシステム管理者に送信する。  
　４．送信元にバリデーションチェックでエラー無しのデータを送信元に返す  
　５．エラー無しのデータを受け取ったら、thanks.htmlにページ遷移する  

・json_doPost_validation.jsの内容は、実際にはGoogleスプレッドシートに  
　紐づいたコンテナバインドスクリプトとして登録されている
