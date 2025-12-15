const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 5000;
const root = path.join(__dirname);

const mime = {
  '.html':'text/html',
  '.css':'text/css',
  '.js':'application/javascript',
  '.json':'application/json',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.svg':'image/svg+xml',
  '.ico':'image/x-icon'
};

http.createServer((req,res)=>{
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  // Basic CORS headers to allow cross-origin POSTs if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204; res.end(); return;
  }

  try{
    // Handle API POST to /submit for saving entries (local fallback)
    if (req.method === 'POST' && req.url && req.url.startsWith('/submit')) {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        try{
          const obj = JSON.parse(body || '{}');
          const when = new Date().toISOString();
          const id = Date.now().toString(36);
          const line = `${id},"${when}","${String(obj.amount || '')}","${String(obj.date || '')}","${String(obj.type || '')}"\n`;
          const csvPath = path.join(root, 'submissions.csv');
          fs.appendFile(csvPath, line, (err)=>{
            if (err) {
              console.error('Failed to append submission', err);
              res.statusCode = 500; res.end('Failed'); return;
            }
            res.setHeader('Content-Type','application/json; charset=utf-8');
            res.end(JSON.stringify({ok:true}));
          });
        }catch(e){ console.error('Bad POST to /submit', e); res.statusCode=400; res.end('Bad Request'); }
      });
      return;
    }

    // (scan/expenses API removed per revert request)

    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if(reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(root, reqPath);
    if(!filePath.startsWith(root)){
      console.warn(`[${now}] Forbidden access attempt: ${filePath}`);
      res.statusCode = 403; res.end('Forbidden'); return;
    }
    fs.stat(filePath, (err, stat)=>{
      if(err){
        console.warn(`[${now}] Not found: ${filePath}`);
        res.statusCode = 404; res.end('Not found'); return;
      }
      // If path is a directory, try to serve index.html inside it
      if (stat.isDirectory()) {
        const indexPath = path.join(filePath, 'index.html');
        fs.stat(indexPath, (ie, istat)=>{
          if (ie || !istat.isFile()){
            console.warn(`[${now}] Not found (index): ${indexPath}`);
            res.statusCode = 404; res.end('Not found'); return;
          }
          const ext = path.extname(indexPath).toLowerCase();
          const type = mime[ext] || 'application/octet-stream';
          res.setHeader('Content-Type', type+';charset=utf-8');
          fs.createReadStream(indexPath).pipe(res);
        });
        return;
      }
      if(!stat.isFile()){
        console.warn(`[${now}] Not found: ${filePath}`);
        res.statusCode = 404; res.end('Not found'); return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const type = mime[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', type+';charset=utf-8');
      const stream = fs.createReadStream(filePath);
      stream.on('error', (e)=>{
        console.error(`[${now}] Stream error for ${filePath}:`, e.message);
        res.statusCode = 500; res.end('Server error');
      });
      stream.pipe(res);
    });
  }catch(e){ console.error('Unhandled server error', e); res.statusCode=500; res.end('Server error'); }
}).listen(port, ()=>{
  console.log(`Server running at http://localhost:${port}/`);
});