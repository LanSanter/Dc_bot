// 存储数组到JSON文件
const fs = require('fs');

function readlog(name, type) {
  if (type = 'json'){
      data =fs.readFileSync(`./log/${name}.json`, 'utf8')
      roles = data;
      return roles;
  }
  else if (type = 'txt') {
    fs.readFile(`./log/${speaker}.txt`, 'utf8', (err, data) => {
      if (err) {
        console.error(`读取${name}.txt文件出错:`, err);
        return;
      }
      roles = data;
      return roles;
    });
  }
  else {
    console.log("檔案格式錯誤");
  }
}


exports.selectMessages = (speaker, externalTextVector, callback) => {
    const readFile = readlog(speaker, 'json');
    const vectors = JSON.parse(readFile);

    const textContent = readlog(speaker, 'txt');
    const textArray = textContent.split('\n') ;
    let topMessages = [];

    for (let i = 0; i < vectors.length; i++) {
      const vector = vectors[i];
      const similarity = cosineSimilarity(vector, externalTextVector);
      topMessages.push({ index: i, similarity: similarity });
    }

    topMessages.sort((a, b) => b.similarity - a.similarity);
    const filteredMessages = topMessages.filter(msg => msg.similarity > 0.7);
    // 提取前三个相关度最高的消息的发言内容
    const topThreeIndices = filteredMessages.slice(0, 3).map((msg) => msg.index);
    const topThreeMessages = topThreeIndices.map((index) => textArray[index]);
    if (topThreeMessages.length < 3) {
      const missingCount = 3 - topThreeMessages.length;
      for (let i = 0; i < missingCount; i++) {
        topThreeMessages.push("早安");
      }
    }
    callback(null, topThreeMessages);
    
}

exports.insertMessages = (speaker, content, TextVector, callback) => {
    let jsondata = [];
    const jsonContent = fs.readFileSync(`./log/${speaker}.json`, 'utf8')
    jsondata = JSON.parse(jsonContent)

    if (!Array.isArray(jsondata)) {
      console.error('JSON 文件不包含有效的數組');
      return; 
    }
    jsondata.push(TextVector);
    const updatedJson = JSON.stringify(jsondata);
    fs.writeFileSync(`./log/${speaker}.json`, updatedJson, 'utf8');// 將更新後的 JSON 字串寫入原始的 JSON 檔案
    console.log('文字嵌入已追加到文件。');

    const text = content;
    fs.appendFile(`./log/${speaker}.txt`, text + '\n', 'utf8', (err) => {
      if (err) {
        console.error(`追加${content}内容时发生错误:`, err);
        return;
      }    
      console.log('文字内容已追加到文件。');
    })
}

exports.checkFilesExistence = (speaker) => {
  // 指定 JSON 文件和 TXT 文件的路径
  const jsonFilePath = `./log/${speaker}.json`;
  const txtFilePath = `./log/${speaker}.txt`;
  // 检查 JSON 文件是否存在
  fs.existsSync(jsonFilePath, (err) =>{
    if(err) {
      console.log(`JSON 文件不存在，創建新文件: ${jsonFilePath}`);
      fs.writeFileSync(jsonFilePath, '[]', 'utf8'); 
    }
  })

  // 检查 TXT 文件是否存在
  fs.existsSync(txtFilePath, (err) => {
    if(err) {
      console.log(`TXT 文件不存在，创建新文件: ${txtFilePath}`);
      fs.writeFileSync(txtFilePath, '', 'utf8');
    }
  }) 
}



// 计算相关度的示例函数
function cosineSimilarity(vector1, vector2) {
    const dotProduct = dot(vector1, vector2);
    const magnitude1 = magnitude(vector1);
    const magnitude2 = magnitude(vector2);
    return dotProduct / (magnitude1 * magnitude2);
  }
  
  function dot(vector1, vector2) {
    let dotProduct = 0;
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
    }
    return dotProduct;
  }
  
  function magnitude(vector) {
    let sumOfSquares = 0;
    for (let i = 0; i < vector.length; i++) {
      sumOfSquares += vector[i] * vector[i];
    }
    return Math.sqrt(sumOfSquares);
  }
  
