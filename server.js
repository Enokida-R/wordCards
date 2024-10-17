
const express = require('express');
const app = express();
const fs = require('fs');
const csv = require('csv-parser'); // csv-parserを正しく読み込む
const path = require('path');

app.use(express.static(path.join(__dirname, 'view')));
app.use(express.static('public'));

app.get('/data', (req, res) => {
    const results = [];

    // CSVファイルを読み込み
    fs.createReadStream('test.csv')
    .pipe(csv()) // ここでcsv()を関数として呼び出す必要がある
    .on('data', (data) => results.push(data))
    .on('end', () => {
        // データをクライアントに送信
        res.json(results);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'index.html'));
});

app.use(express.json());

const CSVFilePath = path.join(__dirname, 'test.csv');

const addWordToCSV = (word, meaning) => {
    const nweEntry = `${word},${meaning}\n`;
    fs.appendFile(CSVFilePath, nweEntry, (err) => {
        if (err) {
            console.log('追加に失敗しました',err);
        } else {
            console.log('追加されました。');
        }
    });
};

app.post('/add-word', (req, res) => {
    const { word, meaning } = req.body;

    // 受け取ったデータをコンソールに表示
    console.log('新しい単語:', word);
    console.log('意味:', meaning);

    if (word && meaning) {
        addWordToCSV(word, meaning);

        res.json({success: true});
    } else {
        res.status(400).json({ success: false, message: '単語と意味が必要です' });
    }
});

const upDataInCSV = (oldWord, oldMeaning, newWord, newMeaning) => {
    fs.readFile(CSVFilePath, 'utf8', (err, data) => {
        if (err) {
            console.log('ファイル読み込みエラー:', err);
            return;
        }

        const lines = data.split('\n');
        const updatedLines = lines.map(line => {
            const [word, meaning] = line.split(',');

            // 該当の単語があれば修正
            if (word === oldWord) {
                return `${newWord},${newMeaning}`;
            } else if (meaning === oldMeaning){
                return `${newWord}, ${newMeaning}`;
            }

            return line;
        });

        // 修正された内容でファイルを上書き
        fs.writeFile(CSVFilePath, updatedLines.join('\n'), (err) => {
            if (err) {
                console.log('ファイル書き込みエラー:', err);
            } else {
                console.log('単語が修正されました');
            }
        });
    });

};

app.post('/correction', (req, res) => {
    const { oldWord, oldMeaning,  word, meaning } = req.body;

    console.log('修正単語', word);
    console.log('修正意味', meaning);

    if (word && meaning) {
        upDataInCSV(oldWord, oldMeaning, word, meaning);

        res.json({success: true});
    } else {
        res.status(400).json({ success :false});
    }
});

app.get('/data-test', (req, res) => {
    const results =[];

    //CSVファイルの読み込み
    fs.createReadStream(CSVFilePath)
    .pipe(require('csv-parser')())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        //データをクライアントに送信
        res.json(results);
    });
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});