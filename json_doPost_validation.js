// function doGet(e) {
//   return doAction(e);
// }

function doPost(e) {
  return doAction(e);
}

// Web呼び出しへの応答
function doAction(e, debug) {
  // 応答データ作成
  let json = {};
  let errors = {};

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  const nameRegex = /^[\u30a0-\u30ff\u3040-\u309f\u3005\u3006\u4e00-\u9fcf\u3000]+$/;
  const hankakuRegex = /[\u0020-\u007E\uFF61-\uFF9F]/;
  const inquiryRegex = /^[\u30a0-\u30ff\u3040-\u309f\u3005\u3006\u4e00-\u9fcf\u3000Ａ-Ｚａ-ｚ０-９！”＃＄％＆’（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝～]+$/;
  let countRegex = 0;

  if (e.parameter.error) {
    throw new Error(e.parameter.error);
  } else {
    let keys = Object.keys(e.parameter);
    for (let i = 0; i < keys.length; i++) {
      json[keys[i]] = e.parameter[keys[i]];
    }

    // 名前のバリデーション
    if (!nameRegex.test(json.name)) {
      json.name = "全角の漢字、ひらがな、カタカナ、全角スペースを使用して入力してください";
      errors.name = "全角の漢字、ひらがな、カタカナ、全角スペースを使用して入力してください";
      countRegex++;
    }

    // 住所のバリデーション
    if (!inquiryRegex.test(json.address)) {
      json.address = "全角文字で入力してください";
      errors.address = "全角文字で入力してください";
      countRegex++;
    }

    // emailのバリデーション
    console.log(emailRegex.test(json.email));
    if (!emailRegex.test(json.email)) {
      json.email = "正しいメールアドレス形式で入力してください";
      errors.email = "正しいメールアドレス形式で入力してください";
      countRegex++;
    }

    // 問い合わせのバリデーション
    if (!inquiryRegex.test(json.inquiry)) {
      json.inquiry = "全角文字で入力してください";
      errors.inquiry = "全角文字で入力してください";
      countRegex++;
    }
  }

  // 戻り値作成
  let out = null;
  if (e.parameter.callback) {
    Logger.log("JSONP");
    const text = e.parameter.callback + "(" + (debug ? JSON.stringify(json, null, 2) : JSON.stringify(json)) + ")";
    out = ContentService.createTextOutput(text);
    out.setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else if (countRegex != 0) {
    Logger.log(errors);
    // out = ContentService.createTextOutput(debug ? JSON.stringify(json, null, 2) : JSON.stringify(json));
    out = ContentService.createTextOutput(debug ? JSON.stringify(errors, null, 2) : JSON.stringify(errors));
    out.setMimeType(ContentService.MimeType.JSON);
  } else {
    out = { v: 1 };
    out = ContentService.createTextOutput(debug ? JSON.stringify(out, null, 2) : JSON.stringify(out));
    out.setMimeType(ContentService.MimeType.JSON);

    // スプレッドシートへの書き込み
    let [result, number] = sheetWrite_(json);

    // メール送信
    sendMail_(result, number);
  }
  return out;
}

function sheetWrite_(json) {
  // スプレッドシートのIDを指定
  const spreadsheetId = "1IFlx8NMkh9ETSv7l75nBP9DJrNKW34CtRkVSlh31xmY";

  // シート名を指定
  const sheetName = "シート1";

  // 特定のスプレッドシートを取得
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

  // スプレッドシート内の特定のシートを取得
  const sheet = spreadsheet.getSheetByName(sheetName);

  let obj = [];

  obj = [json.name, json.address, json.gender, json.birthday, json.email, json.inquiry];

  let lastRow = sheet.getLastRow() + 1;

  Object.keys(obj).forEach((key, index) => {
    sheet.getRange(lastRow, index + 1).setValue(obj[key]);
  });

  return [obj, lastRow];
}

function sendMail_(result, number) {
  const [name, address, gender, birthday, email, inquiry] = result;

  //メールの件名
  const subject = "[問い合わせ番号：" + number + "] お問い合わせを受け付けました";

  //メールの本文
  const body = name + " 様。お問い合わせいただき、ありがとうございました。\n" + "以下の内容で受け付けました。\n" + "\n" + "----------------------------------\n" + "氏名：" + name + "\n" + "住所：" + address + "\n" + "性別：" + gender + "\n" + "生年月日：" + birthday + "\n" + "メールアドレス：" + email + "\n" + "お問い合わせ内容：" + inquiry + "\n" + "----------------------------------\n" + "\n" + "回答まで、２・３営業日かかる場合がございます。ご了承ください。\n" + "\n";

  //メールを送信する
  GmailApp.sendEmail(email, subject, body, {
    name: "Ryuichi mineo",
    from: "znnc59038@mineo.jp",
  });

  //管理者あてにメールを送信する
  MailApp.sendEmail({
    to: "niemand235@herb.ocn.ne.jp",
    subject: "【管理者宛】問い合わせがありました",
    body: "[問い合わせ番号：" + number + "] \n" + "問い合わせがありましたので、下記の内容でメールを自動送信しました\n" + "\n" + body,
  });
}
