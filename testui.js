const impression = require('./impression');
const readline = require('readline');

// 创建readline接口实例
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 监听'line'事件，表示用户输入了一行文本
rl.on('line', async (input) => {
  // 在这里处理用户输入的内容
  if(input == 'close'){
    rl.close();
  }  
  impression.analyzeImpression(input);
  
});

// 监听'close'事件，表示readline接口已关闭
rl.on('close', () => {
  // 在这里进行程序的清理和退出操作
  process.exit(0);
});