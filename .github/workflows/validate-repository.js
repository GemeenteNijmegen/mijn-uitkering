const fs = require('fs');
let problems = 0;
function check(fn, message){
  const r = fn();
  problems += r ? 0 : 1;
  console.log(`${r ? '✅' : '❗️'}  ${message}`);
}
check(() => process.env.PROJEN_GITHUB_TOKEN, 'PROJEN_GITHUB_TOKEN');
check(() => fs.existsSync('./.github/workflows/release.yml'), 'Release workflow');
process.exit(problems);