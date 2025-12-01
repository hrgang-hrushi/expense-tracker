const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const PNG = require('pngjs').PNG
const pixelmatchPkg = require('pixelmatch')
const pixelmatch = pixelmatchPkg.default || pixelmatchPkg

async function capture(url, outPath, viewport){
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']})
  const page = await browser.newPage()
  await page.setViewport(viewport)
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
  // small delay to allow any animations to settle
  await new Promise((res) => setTimeout(res, 500))
  await page.screenshot({ path: outPath, fullPage: false })
  await browser.close()
}

function diffImages(imgPathA, imgPathB, outPath){
  const imgA = PNG.sync.read(fs.readFileSync(imgPathA))
  const imgB = PNG.sync.read(fs.readFileSync(imgPathB))
  const { width, height } = imgA
  const diff = new PNG({ width, height })
  const mismatched = pixelmatch(imgA.data, imgB.data, diff.data, width, height, { threshold: 0.1 })
  fs.writeFileSync(outPath, PNG.sync.write(diff))
  const total = width * height
  return (mismatched / total) * 100
}

async function run(){
  const reportDir = path.resolve(__dirname, '../../visual-qa/report')
  fs.mkdirSync(reportDir, { recursive: true })

  const framerUrl = 'https://teenbusinessnetwork.framer.website/'
  const localPorts = [5175, 5174, 5173]
  let localUrl = null
  for(const p of localPorts){
    try{
      const testUrl = `http://localhost:${p}/`
      // try opening with puppeteer quickly
      const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']})
      const page = await browser.newPage()
      page.setDefaultNavigationTimeout(3000)
      await page.goto(testUrl).then(()=>{
        localUrl = testUrl
      }).catch(()=>{});
      await browser.close()
      if(localUrl) break
    }catch(e){ }
  }
  if(!localUrl){
    console.error('Local dev server not reachable on ports 5175/5174/5173. Start it with `npm run dev` and re-run this script.')
    process.exit(1)
  }

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 1024, height: 768 },
    { name: 'mobile', width: 375, height: 812 }
  ]

  const results = []

  for(const vp of viewports){
    const expectedPath = path.join(reportDir, `expected_${vp.name}.png`)
    const actualPath = path.join(reportDir, `actual_${vp.name}.png`)
    const diffPath = path.join(reportDir, `diff_${vp.name}.png`)

    console.log('Capturing expected (Framer) at', vp.name)
    await capture(framerUrl, expectedPath, { width: vp.width, height: vp.height })
    console.log('Capturing actual (local) at', localUrl, vp.name)
    await capture(localUrl, actualPath, { width: vp.width, height: vp.height })

    console.log('Diffing...')
    const percent = diffImages(expectedPath, actualPath, diffPath)
    console.log(`${vp.name} diff: ${percent.toFixed(3)}%`)
    results.push({ viewport: vp.name, diffPercent: percent, expected: expectedPath, actual: actualPath, diff: diffPath })
  }

  fs.writeFileSync(path.join(reportDir, 'report.json'), JSON.stringify({ date: new Date().toISOString(), results }, null, 2))
  console.log('Visual QA complete. Report at', reportDir)
}

run().catch(err=>{ console.error(err); process.exit(1) })
