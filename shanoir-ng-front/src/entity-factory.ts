const { exec } = require('child_process');

let command = "find ./src/app -name '*.ts' -exec grep -E 'export class(.*)extends(.*)[ ,]Entity[ {,]' {} \\;";
exec(command, (error, stdout, stderr) => {
    console.log(error, stdout, stderr);
    let rows = stdout.trim().split('\n');
    rows = rows.map(row => {
        return row.replace('export class ', '').trim().split(' ')[0];
    });
    console.log(rows);
    rows.forEach(type => {
        console.log("case '" + type + "' : return new " + type + "();")
    });
});