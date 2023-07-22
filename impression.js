const openai = require('./openai_gpt');
const fs = require('fs');
let messages =[{role: "system", content: "你正在與一位情感分析師交談，他以直接、簡潔的風格進行印象關鍵詞總結。你描述了以下一句話的內容，並要求這位分析師對話的內容進行解讀，根據他對這句話的分析給出對說話者的印象關鍵詞。並將總結的關鍵詞換行輸出，並在前面加上數字"}];

function filterkeyword(text) {
    const lines = text.split('\n');
    // 對每個項目進行處理
    const processedLines = lines.map((line) => {// 使用正則表達式刪除 "."及其前面的字串
    const processedLine = line.replace(/.*\./, '');
    return processedLine.trim();
    });

    return processedLines;
}

exports.analyzeImpression = async (input) => {
    let rawinput = {role: "user", content: input};
    let keywords = await openai.openAiMessage(messages.concat([rawinput]));
    console.log(keywords);
    console.log(filterkeyword(keywords));
    return filterkeyword(keywords);
}

exports.SaveKeyword = async (speaker, keyword) => {
    const impressionResult = {};
    let textFilePath = `./impression/${speaker}.txt`;
    fs.existsSync(textFilePath, (err) =>{
        if(err) {
            console.log(`TXT文件不存在，已創建${textFilePath}`);
            fs.writeFileSync(textFilePath, '', 'utf8');
            keyword.forEach((impression) => {               
                  impressionResult[impression] = {occurrences: 1,firstAppearance: 1, lastAppearance: 1  }//第一次與最近一次的印象
              });
        }
    })
}

