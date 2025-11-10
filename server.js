const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

const app = express();
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('generator');
});

app.get('/reader', (req, res) => {
  res.render('reader');
});

app.post('/generate', (req, res) => {
  const material = req.body.material || '';
  let protocolName = req.body.protocolName || '';
  console.log('Received protocolName:', protocolName);
  protocolName = protocolName.trim();
  if (!protocolName) {
    protocolName = '123';
  }
  console.log('Using protocolName:', protocolName);
  const lines = material.split('\n').filter(line => line.trim());
  
  const protocol = `Протокол «**${protocolName}**»

Мое подсознание,

Эти инструкции установят протокол «**${protocolName}**». С этого момента прошу использовать эту версию опротокола.

Протокол будет запускаться и выполнять свою работу путем произнесения ключевой фразы «**${protocolName}** СТАРТ».

Ты выделишь отдельную область подсознания, в которой будет происходить работа, и сделаешь так, чтобы эта работа не мешало моему нормальному функционированию и благополучию.

В пункте «Материал для обработки» будет передан материал, к которому ты должно применить все процедуры, описанные в обработчике «Процедура обработки». Ты применишь ВСЕ инструкции, которые задекларированы в обработчике «Процедура обработки» к данному материалу без исключения и проведешь полную процедуру, описанную в обработчике, к этому материалу.

Материал для обработки:

${lines.map(line => line.trim()).join('\n\n')}

---

А также любого рода мысли, образы, страхи, боль, фантазии, раздражение, ненависть, жалость, злость и другие реакции, которые возникли при зачитывании этого материала, и поместишь найденный материал в этот пункт для дальнейшей обработки.

Данный механизм обработки деактивируется автоматически после того, как весь переданный материал будет обработан тобой.

Ты будешь делать всю процедуру максимально мягко, регулируя ресурсы на работу так, чтобы не допускать перегрузок. На осознанный уровень ты выведешь все необходимые инсайты, знания и опыт.

Всю работу по этой процедуре ты проведешь в течении 3 суток или менее с момента запуска обработки, вне зависимости от того, в каком состоянии я нахожусь. В конце процедуры ты расформируешь область подсознания, выделенную для работы, и вернешь всю выделенную энергию мне и ее владельцам.

Мое подсознание, я благодарю тебя за эту работу, и признателен тебе и уважаю тебя за то, что ты делаешь.`;

  const fileName = `Протокол_${protocolName}.md`;
  const encodedFileName = encodeURIComponent(fileName);
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}`);
  res.send(protocol);
});

function extractProtocolName(content) {
  const match = content.match(/Протокол\s*«\*\*([^*]+)\*\*»/);
  return match ? match[1] : null;
}

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    let content = '';
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext === '.md' || ext === '.txt') {
      content = fs.readFileSync(req.file.path, 'utf-8');
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: req.file.path });
      content = result.value;
    } else {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    fs.unlinkSync(req.file.path);

    const html = marked.parse(content);
    const protocolName = extractProtocolName(content);
    res.json({ html, protocolName });
  } catch (error) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Error processing file' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

