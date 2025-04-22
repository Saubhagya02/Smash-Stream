const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 8000;

app.use(express.static(path.join(__dirname, '/')));

app.get('/video/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'videos', req.params.filename);

  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.error(err);
      return res.sendStatus(404);
    }

    const range = req.headers.range;
    if (!range) {
      return res.status(416).send('Requires Range header');
    }

    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, stats.size - 1);
    const contentLength = end - start + 1;

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${stats.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(res);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
