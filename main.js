const fs = require("fs");
const watch = require("node-watch");
const images = require("images");
const dbFile = "./eda.db";
var sqlite3 = require("sqlite3").verbose();

var db = new sqlite3.Database(dbFile);

// 壓縮圖檔
function compression(image) {
  try {
    let width = images(image).width();
    if (width > 600) {
      images(image).resize(600).save(image),
        {
          quality: 70,
        };
      console.log(`${image} resize & compression \r\n`);
    } else {
      images(image).save(image),
        {
          quality: 70,
        };
      console.log(`${image} compression \r\n`);
    }
  } catch (e) {
    console.log(e);
    console.log(`Error : ${image} not do anything \r\n`);
    return;
  }
}

// 產生小圖當縮圖
function small(image) {
  try {
    let fileName = image.split("\\")[image.split("\\").length - 1];
    console.log(fileName, image.split("\\"));
    images(image)
      .resize(150)
      .save(`C:\\WebApps\\WebSite\\Upload\\ProductImages\\small\\${fileName}`),
      {
        quality: 70,
      };
    db.run(`INSERT INTO image (id,imagename,modifytime)
                    SELECT (IFNULL(max(id),0) + 1) AS ID, '${fileName}', datetime('now', 'localtime') FROM image`);
  } catch (e) {
    console.log(e);
  }
}

watch(
  [
    "C:\\WebApps\\WebSite\\Upload\\ProductImages",
    "C:\\WebApps\\WebSite\\Upload\\EasyGo2",
  ],
  function (evt, name) {
    console.log(evt, name);
    if (evt == "update") {
      let fileExtension = name.split(".").pop();
      if (
        fileExtension == "jpg" ||
        fileExtension == "jpeg" ||
        fileExtension == "png"
      ) {
        // 同步進行會產生錯誤，所以延遲1秒後動作
        setTimeout(() => {
          try {
            if (fs.statSync(name)["size"] / 1024.0 > 300) {
              //超過 300kb 進行壓縮，最多5次，寫入 sqlite
              let sql = `SELECT count(imagename) as times FROM image WHERE imagename = '${name}'`;
              db.each(sql, function (err, row) {
                if (row.times <= 5) {
                  db.run(`INSERT INTO image (id,imagename,modifytime)
                                        SELECT (IFNULL(max(id),0) + 1) AS ID, '${name}', datetime('now', 'localtime') FROM image`);
                  compression(name);
                }
              });
            }
            small(name);
          } catch (e) {
            console.log(e);
          }
        }, 1000);
      }
    }
  }
);

console.log("開始監聽...\r\n");
