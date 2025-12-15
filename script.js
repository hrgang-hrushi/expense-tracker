(function(){
  const form = document.getElementById('expense-form');
  const tableBody = document.querySelector('#expenses-table tbody');
  const historyBody = document.getElementById('history-body');
  const STORAGE_KEY = 'framer_expenses_v1';

  // support for select + optional custom type input
  const selectType = document.getElementById('type');
  const customType = document.getElementById('type-custom');
  const dateInput = document.getElementById('date');
  const formError = document.getElementById('form-error');
  const amountInput = document.getElementById('amount');
  // chart instance handle
  let expensesChart = null;
  // chart color / glow tunables (you can tweak these)
  const CHART_COLOR_RGB = '255,255,255'; // white as rgb
  const CHART_LINE_ALPHA = 0.92;       // line opacity (0..1)
  const CHART_POINT_ALPHA = 1.0;       // point fill opacity
  const CHART_GLOW_ALPHA = 0.34;       // glow opacity
  const CHART_GLOW_BLUR = 16;          // glow blur radius
  // chart filter controls (populated after DOM load)
  const chartView = document.getElementById('chart-view');
  const chartYear = document.getElementById('chart-year');
  const chartMonth = document.getElementById('chart-month');
  const labelMonth = document.getElementById('label-month');
  const labelYear = document.getElementById('label-year');

  if (selectType && customType) {
    // hide custom input initially
    customType.style.display = 'none';
    selectType.addEventListener('change', function () {
      if (selectType.value === 'other') {
        customType.style.display = 'inline-block';
        customType.focus();
      } else {
        customType.style.display = 'none';
        customType.value = '';
      }
    });
  }

  // enforce date max to today (no future dates)
  (function setDateMax(){
    if (!dateInput) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth()+1).padStart(2,'0');
    const dd = String(today.getDate()).padStart(2,'0');
    const max = `${yyyy}-${mm}-${dd}`;
    dateInput.setAttribute('max', max);
  })();

  function setFormError(msg){
    if (!formError) return;
    // Normalize: empty/null hides the error; otherwise show the message.
    if (msg) {
      formError.textContent = msg;
      formError.classList.add('visible');
      formError.setAttribute('aria-hidden', 'false');
    } else {
      formError.textContent = '';
      formError.classList.remove('visible');
      formError.setAttribute('aria-hidden', 'true');
    }
  }

  function load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){
      return [];
    }
  }

  function save(list){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function render(){
    // Render the recent expenses grid (columns = recent items)
    renderRecent();
    // history was removed from the UI; keep renderHistory for legacy callers but it will be a no-op now
    renderHistory();
    // update chart filters and the chart itself
    populateChartFilters();
    renderChart();
  }

  // Render recent expenses as columns where each column is a recent entry
  function renderRecent(){
    const items = load() || [];
  const recentCount = 5;
    // sort by date descending (newest first). Dates are ISO yyyy-mm-dd so string compare works,
    // but we'll parse to be safe.
    const sorted = items.slice().sort((a,b)=>{
      const da = new Date(a.date + 'T00:00:00').getTime();
      const db = new Date(b.date + 'T00:00:00').getTime();
      return db - da; // newest first
    });
    const recent = sorted.slice(0, recentCount);

    const table = document.getElementById('expenses-table');
    if (!table) return;
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (thead) thead.innerHTML = '';

    // build header row with numbers aligned to columns. First header cell is empty (labels column).
    if (thead) {
      const htr = document.createElement('tr');
      const emptyTh = document.createElement('th');
      emptyTh.className = 'label-cell';
      emptyTh.textContent = '';
      htr.appendChild(emptyTh);
      for (let i=0;i<recentCount;i++){
        const th = document.createElement('th');
        // show numbers 1..9 for columns; 1 = most recent
        th.textContent = (i < recent.length) ? String(i+1) : '';
        htr.appendChild(th);
      }
      thead.appendChild(htr);
    }

    const rows = [
      { label: 'EXPENSE', val: it => (it ? Number(it.amount).toFixed(2) : '') },
      { label: 'DATE', val: it => (it ? it.date : '') },
      { label: 'TYPE', val: it => (it ? it.type : '') }
    ];

    rows.forEach(row => {
      const tr = document.createElement('tr');
      const labelTd = document.createElement('td');
      labelTd.className = 'label-cell';
      labelTd.textContent = row.label;
      tr.appendChild(labelTd);

      // populate recent columns (recent[0] is newest -> column 1)
      for (let i=0;i<recentCount;i++){
        const it = recent[i];
        const td = document.createElement('td');
        td.textContent = row.val(it);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });
  }

  function renderHistory(){
    if (!historyBody) return;
    const items = load();
    historyBody.innerHTML = '';
    if (!items || !items.length) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="6" style="opacity:.6">No expenses yet</td>';
      historyBody.appendChild(tr);
      return;
    }
    items.forEach((it, idx)=>{
      const tr = document.createElement('tr');
      // show sync indicator inside actions cell
      const synced = it.synced ? true : false;
      tr.innerHTML = `
        <td>${idx+1}</td>
        <td>${it.id}</td>
        <td>${Number(it.amount).toFixed(2)}</td>
        <td>${it.date}</td>
        <td>${it.type}</td>
        <td class="actions">
          <span class="row-sync ${synced ? 'synced' : 'local'}" title="${synced ? 'Synced to Sheet' : 'Saved locally'}"></span>
          <button class="del" data-id="${it.id}">Delete</button>
        </td>
      `;
      historyBody.appendChild(tr);
    });
  }

  // --- Chart: compute monthly totals and render with Chart.js ---
  function computeMonthlyTotals(){
    const items = load() || [];
    const map = {};
    items.forEach(it => {
      if (!it || !it.date) return;
      const key = it.date.slice(0,7); // yyyy-mm
      map[key] = (map[key] || 0) + Number(it.amount || 0);
    });
    const keys = Object.keys(map).sort();
    const labels = keys.map(k => {
      const [y,m] = k.split('-');
      const d = new Date(Number(y), Number(m)-1, 1);
      return d.toLocaleString(undefined, { month: 'short', year: 'numeric' });
    });
    const data = keys.map(k => Number(map[k].toFixed(2)));
    return { labels, data };
  }

  function renderChart(){
    try{
      if (!document.getElementById('expenses-chart')) return;
      if (typeof Chart === 'undefined') return; // Chart.js not loaded
      const ctx = document.getElementById('expenses-chart').getContext('2d');
      // determine current filter values
      const view = chartView ? chartView.value : 'year';
      const year = chartYear && chartYear.value ? chartYear.value : null;
      const month = chartMonth && chartMonth.value ? chartMonth.value : null;
      const { labels, data } = computeChartData(view, year, month);
      if (expensesChart) {
        expensesChart.data.labels = labels;
        if (expensesChart.data.datasets && expensesChart.data.datasets[0]) expensesChart.data.datasets[0].data = data;
        expensesChart.update();
        return;
      }
      expensesChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Expenses',
            data: data,
            fill: false,
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: 'rgba(' + CHART_COLOR_RGB + ',' + CHART_POINT_ALPHA + ')',
            pointBorderColor: 'rgba(' + CHART_COLOR_RGB + ',' + CHART_POINT_ALPHA + ')',
            backgroundColor: 'rgba(' + CHART_COLOR_RGB + ',' + CHART_POINT_ALPHA + ')',
            borderColor: 'rgba(' + CHART_COLOR_RGB + ',' + CHART_LINE_ALPHA + ')',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: { color: '#bfbfbf' },
              grid: { color: 'rgba(255,255,255,0.02)' }
            },
            y: {
              beginAtZero: true,
              ticks: { color: '#bfbfbf' },
              grid: { color: 'rgba(255,255,255,0.02)' }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              titleColor: '#ffffff',
              bodyColor: '#ffffff'
            }
          }
        },
        plugins: [{
          id: 'glowEffect',
          beforeDatasetDraw(chart, args, opts){
            // only apply to first dataset
            if (args.index !== 0) return;
            const ctx = chart.ctx;
            ctx.save();
            ctx.shadowColor = 'rgba(' + CHART_COLOR_RGB + ',' + CHART_GLOW_ALPHA + ')';
            ctx.shadowBlur = CHART_GLOW_BLUR;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          },
          afterDatasetDraw(chart, args, opts){
            if (args.index !== 0) return;
            chart.ctx.restore();
          }
        }]
      });
    }catch(e){ console.warn('Chart render error', e); }
  }

  // Compute chart data for different views: year (Jan-Dec), month (days), lifetime (years)
  function computeChartData(view, year, month){
    const items = load() || [];
    const toNum = v => Number(v || 0);
    if (view === 'month'){
      const y = year ? Number(year) : (new Date().getFullYear());
      const m = month ? Number(month) : (new Date().getMonth()+1);
      const days = new Date(y, m, 0).getDate();
      const labels = Array.from({length: days}, (_,i) => String(i+1));
      const data = new Array(days).fill(0);
      items.forEach(it => { if (!it.date) return; const d = new Date(it.date + 'T00:00:00'); if (d.getFullYear()===y && (d.getMonth()+1)===m){ data[d.getDate()-1] += toNum(it.amount); } });
      return { labels, data: data.map(v=>Number(v.toFixed(2))) };
    }
    if (view === 'lifetime'){
      const map = {};
      items.forEach(it => { if (!it.date) return; const y = new Date(it.date + 'T00:00:00').getFullYear(); map[y] = (map[y]||0) + toNum(it.amount); });
      const keys = Object.keys(map).map(k=>Number(k)).sort((a,b)=>a-b);
      const labels = keys.map(k => String(k));
      const data = keys.map(k => Number(map[k].toFixed(2)));
      return { labels, data };
    }
    // default: year view (Jan..Dec for selected year)
    const y = year ? Number(year) : (new Date().getFullYear());
    const labels = Array.from({length:12}, (_,i)=> new Date(y, i, 1).toLocaleString(undefined,{month:'short'}));
    const data = new Array(12).fill(0);
    items.forEach(it => { if (!it.date) return; const d = new Date(it.date + 'T00:00:00'); if (d.getFullYear()===y){ data[d.getMonth()] += toNum(it.amount); } });
    return { labels, data: data.map(v=>Number(v.toFixed(2))) };
  }

  // populate year/month selects based on stored data and current date
  function populateChartFilters(){
    if (!chartYear || !chartView) return;
    const items = load() || [];
    const years = new Set();
    items.forEach(it => { if (!it.date) return; years.add(new Date(it.date + 'T00:00:00').getFullYear()); });
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    const yearArr = Array.from(years).sort((a,b)=>b-a);
    const prev = chartYear.value;
    chartYear.innerHTML = '';
    yearArr.forEach(y => { const opt = document.createElement('option'); opt.value = String(y); opt.textContent = String(y); chartYear.appendChild(opt); });
    if (prev && Array.from(chartYear.options).some(o=>o.value===prev)) chartYear.value = prev; else chartYear.value = String(currentYear);
    if (chartMonth){
      const monthPrev = chartMonth.value;
      chartMonth.innerHTML = '';
      for (let m=1;m<=12;m++){ const opt = document.createElement('option'); opt.value = String(m); opt.textContent = new Date(2000,m-1,1).toLocaleString(undefined,{month:'short'}); chartMonth.appendChild(opt); }
      if (monthPrev) chartMonth.value = monthPrev; else chartMonth.value = String(new Date().getMonth()+1);
    }
    if (chartView.value === 'month'){
      if (labelMonth) labelMonth.style.display = '';
    } else {
      if (labelMonth) labelMonth.style.display = 'none';
    }
  }

  // wire filter change events to re-render chart in real time
  if (chartView) chartView.addEventListener('change', function(){ populateChartFilters(); renderChart(); });
  if (chartYear) chartYear.addEventListener('change', function(){ renderChart(); });
  if (chartMonth) chartMonth.addEventListener('change', function(){ renderChart(); });

  // mark a local record as synced by id and refresh views
  function markSynced(id){
    try{
      const list = load();
      let changed = false;
      for(let i=0;i<list.length;i++){
        if(list[i].id === id){
          list[i].synced = true;
          changed = true;
          break;
        }
      }
      if (changed){ save(list); render(); }
    }catch(e){ /* ignore */ }
  }

  // generate a reasonably-unique id
  function makeId(){ return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,9); }

  // add a record to local storage; accepts an optional id so client and server can share the same id
  function add(amount, date, type, id){
    const list = load();
    const record = { id: id || makeId(), amount: Number(amount), date, type };
    list.push(record);
    save(list);
    render();
  }

  function remove(id){
    let list = load();
    list = list.filter(x => x.id !== id);
    save(list);
    render();
    renderHistory();
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (!validateForm()) return;
    const amount = form.amount ? form.amount.value : (document.getElementById('amount') ? document.getElementById('amount').value : '');
    const date = form.date ? form.date.value : (document.getElementById('date') ? document.getElementById('date').value : '');

    // determine type: prefer custom input when visible/non-empty
    let typeVal = 'other';
    if (customType && customType.style.display !== 'none' && customType.value.trim()) {
      typeVal = customType.value.trim();
    } else if (form.type) {
      typeVal = form.type.value;
    } else if (selectType) {
      typeVal = selectType.value;
    }

    if(!amount || !date) return;
    // validate date is not in the future
    if (date) {
      const picked = new Date(date + 'T00:00:00');
      const now = new Date();
      const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (picked.getTime() > todayMid.getTime()){
        // show inline error and a status
        setFormError('The selected date is in the future. Expenses must be today or earlier.');
        const statusEl = document.getElementById('sync-status');
        if (statusEl) { statusEl.textContent = 'Failed: future date'; statusEl.classList.remove('ok','warn'); statusEl.classList.add('error'); statusEl.style.display='inline-block'; setTimeout(()=>statusEl.style.display='none',4000); }
        return;
      } else {
        setFormError('');
      }
    }
    // use addExpense wrapper that stores locally and posts to remote/local endpoint
    if (window.addExpense) {
      window.addExpense(amount, date, typeVal);
    } else {
      add(amount, date, typeVal);
    }
    form.reset();

    // hide/reset custom input if present
    if (customType) {
      customType.style.display = 'none';
      customType.value = '';
    }
  });

  // Submit button (right-middle) triggers the same submit behaviour
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', function(){
      // trigger form submit programmatically
      form.dispatchEvent(new Event('submit', {cancelable:true}));
      // after submission, POST to configured sheet endpoint (if set)
    });
  }

  // disable submit until form valid
  if (submitBtn) submitBtn.disabled = true;

  // validation helpers
  function validateForm(){
    const errors = [];
    const amt = amountInput ? amountInput.value : '';
    // amount must be numeric and >= 0. Allow decimals (cents) up to 2 decimal places.
    if (amt === '' || amt === null) {
      errors.push('Amount is required');
    } else if (isNaN(amt) || Number(amt) < 0) {
      errors.push('Amount must be a number 0 or greater');
    } else {
      // optional: enforce max two decimal places
      const match = String(amt).match(/^\d+(?:\.\d{1,2})?$/);
      if (!match) errors.push('Amount may have up to two decimal places (e.g. 12.50)');
    }
    const dt = dateInput ? dateInput.value : '';
    if (!dt) {
      errors.push('Date is required');
    } else {
      const picked = new Date(dt + 'T00:00:00');
      const now = new Date();
      const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (picked.getTime() > todayMid.getTime()) {
        errors.push('Date cannot be in the future');
      }
    }
    // type validation
    let typeVal = '';
    if (customType && customType.style.display !== 'none') {
      typeVal = customType.value ? customType.value.trim() : '';
      if (!typeVal) errors.push('Please enter a type');
    } else if (selectType) {
      typeVal = selectType.value;
      if (!typeVal) errors.push('Please select a type');
    }

    setFormError(errors.length ? errors[0] : '');
    if (submitBtn) submitBtn.disabled = errors.length > 0;
    return errors.length === 0;
  }

  // real-time validation listeners
  if (amountInput) amountInput.addEventListener('input', validateForm);
  if (dateInput) dateInput.addEventListener('input', validateForm);
  if (selectType) selectType.addEventListener('change', function(){ validateForm(); });
  if (customType) customType.addEventListener('input', validateForm);
  // run once on load
  validateForm();

  // nav links: scroll behavior
  const navHome = document.getElementById('nav-home');
  const navHistory = document.getElementById('nav-history');
  if (navHome) navHome.addEventListener('click', (e)=>{ e.preventDefault(); window.scrollTo({top:0, behavior:'smooth'}); });
  if (navHistory) navHistory.addEventListener('click', (e)=>{ /* default anchor scroll will work */ });

  // --- Receipt scanning (OCR) support ---
  const scanBtn = document.getElementById('scan-btn');
  const scanFile = document.getElementById('scan-file');
  const scanPreview = document.getElementById('scan-preview');
  const scanImg = document.getElementById('scan-img');
  const scanAmount = document.getElementById('scan-amount');
  const scanDate = document.getElementById('scan-date');
  const scanTime = document.getElementById('scan-time');
  const scanType = document.getElementById('scan-type');
  const scanConfirm = document.getElementById('scan-confirm');
  const scanCancel = document.getElementById('scan-cancel');

  function resetScanPreview(){
    if (scanImg) { scanImg.src = ''; scanImg.style.display = 'none'; }
    if (scanAmount) scanAmount.textContent = '\u00A0';
    if (scanDate) scanDate.textContent = '\u00A0';
    if (scanTime) scanTime.textContent = '\u00A0';
    if (scanType) scanType.textContent = '\u00A0';
    if (scanPreview) scanPreview.style.display = 'none';
    if (scanFile) scanFile.value = '';
  }

  if (scanBtn && scanFile) {
    scanBtn.addEventListener('click', ()=> scanFile.click());
    scanFile.addEventListener('change', async function(e){
      const f = this.files && this.files[0];
      if (!f) return;
      // preview image
      try{
        const url = URL.createObjectURL(f);
        if (scanImg) { scanImg.src = url; scanImg.style.display = 'block'; }
        if (scanPreview) scanPreview.style.display = 'block';
        if (scanAmount) scanAmount.textContent = 'Scanning...';
        if (scanDate) scanDate.textContent = '\u00A0';
        if (scanTime) scanTime.textContent = '\u00A0';
        if (scanType) scanType.textContent = '\u00A0';

        // perform OCR using Tesseract if available
        if (window.Tesseract && Tesseract.recognize) {
          // run two passes with different page segmentation modes (PSM)
          const modes = [6, 11]; // 6 = assume a single uniform block, 11 = sparse text
          const results = [];
          for (const mode of modes){
            try{
              const { data } = await Tesseract.recognize(f, 'eng', { logger: m => { /* optional logging */ }, tessedit_pageseg_mode: mode });
              const amtObj = (()=>{ try{ return parseAmountFromOcrData(data); }catch(e){ return null; } })();
              results.push({ mode, data, amtObj });
            }catch(err){
              console.warn('OCR pass error (psm ' + mode + ')', err);
              results.push({ mode, data: null, amtObj: null, err });
            }
          }

          // choose best result: prefer reason order keyword > word > fallback, then larger numeric
          function reasonScore(obj){ if (!obj || !obj.amtObj) return 0; const r = obj.amtObj.reason; if (r === 'keyword') return 300; if (r === 'word') return 200; if (r === 'fallback') return 100; return 50; }
          results.forEach(r => { r.score = reasonScore(r); r.amountVal = r.amtObj ? Number(r.amtObj.amount) : 0; });
          results.sort((a,b) => (b.score - a.score) || (b.amountVal - a.amountVal));
          let chosen = results[0];
          let chosenAmount = chosen && chosen.amtObj ? chosen.amtObj.amount : null;

          // final fallback: try largest numeric in full text if nothing found
          if (!chosenAmount){
            const firstText = (results[0] && results[0].data && results[0].data.text) ? results[0].data.text : '';
            chosenAmount = parseAmountFromText(firstText);
          }

          // show comparison + chosen result in the preview
          if (scanAmount){
            const comp = results.map(r => `PSM${r.mode}: ${r.amtObj ? r.amtObj.amount + ' ('+r.amtObj.reason+')' : 'not found'}`).join(' | ');
            scanAmount.innerHTML = chosenAmount ? `<div>${chosenAmount}</div><div style="font-size:12px;color:#bfbfbf;margin-top:6px">${comp}</div>` : `<div>Not found</div><div style="font-size:12px;color:#bfbfbf;margin-top:6px">${comp}</div>`;
          }

          // use the primary OCR text (from first pass) to extract date/time/type
          const primaryText = (results[0] && results[0].data && results[0].data.text) ? results[0].data.text : '';
          const dt = parseDateFromText(primaryText);
          const tm = parseTimeFromText(primaryText);
          const tp = parseTypeFromText(primaryText);
          if (chosenAmount && amountInput) amountInput.value = chosenAmount;
          if (dt && dateInput) dateInput.value = dt;
          if (tp) {
            const lowered = tp.toLowerCase();
            let matched = false;
            if (selectType) {
              for (let i=0;i<selectType.options.length;i++){
                if (selectType.options[i].value.toLowerCase() === lowered || selectType.options[i].text.toLowerCase() === lowered) {
                  selectType.value = selectType.options[i].value;
                  matched = true; break;
                }
              }
            }
            if (!matched && customType) { customType.style.display = 'inline-block'; customType.value = tp; }
          }
        } else {
          if (scanAmount) scanAmount.textContent = 'OCR not available';
        }
      }catch(err){
        console.warn('OCR error', err);
        if (scanAmount) scanAmount.textContent = 'Scan failed';
      }
    });
  }

  if (scanCancel) scanCancel.addEventListener('click', function(){ resetScanPreview(); });
  if (scanConfirm) scanConfirm.addEventListener('click', function(){
    // use currently prefilled form values to add expense
    const amount = amountInput ? amountInput.value : '';
    const date = dateInput ? dateInput.value : '';
    let typeVal = 'other';
    if (customType && customType.style.display !== 'none' && customType.value.trim()) typeVal = customType.value.trim();
    else if (selectType) typeVal = selectType.value;
    if (!amount || !date) {
      setFormError('Scanned data incomplete: amount or date missing');
      return;
    }
    if (window.addExpense) window.addExpense(amount, date, typeVal);
    else add(amount, date, typeVal);
    resetScanPreview();
    form.reset();
  });

  // OCR parsing helpers (heuristic)
  function parseAmountFromText(text){
    if (!text) return null;
    // find currency-like numbers, return the largest numeric value found
    const matches = text.match(/[\d,]+(?:\.\d{1,2})?/g);
    if (!matches) return null;
    const nums = matches.map(s => parseFloat(s.replace(/,/g, ''))).filter(n=>!isNaN(n));
    if (!nums.length) return null;
    // heuristics: choose the largest value (often total)
    const max = Math.max.apply(null, nums);
    // format to two decimals
    return max.toFixed(2);
  }

  // Improved OCR-aware amount extraction using Tesseract structured output
  // Returns an object { amount: '12.34', reason: 'keyword'|'word'|'fallback', info?: ... } or null
  function parseAmountFromOcrData(data){
    if (!data) return null;
    // helper: extract numeric values from a string
    function extractNumbers(str){
      if (!str) return [];
      const m = String(str).match(/[\d,]+(?:\.\d{1,2})?/g);
      if (!m) return [];
      return m.map(s => parseFloat(s.replace(/,/g,''))).filter(n=>!isNaN(n));
    }

    // 1) Prefer lines that contain keywords like 'total' or 'amount due'
    const preferKeywords = ['grand total','total amount','total due','total','amount due','amount','balance due','balance','subtotal','net total','amount payable','amount payable:','total:'];
    const lines = (data.lines || []).map(l => l.text || '').filter(Boolean);
    for (const kw of preferKeywords){
      for (const ln of lines){
        if (ln.toLowerCase().indexOf(kw) !== -1){
          const nums = extractNumbers(ln);
          if (nums.length) {
            // pick the largest number on that line
            const chosen = Math.max.apply(null, nums);
            return { amount: chosen.toFixed(2), reason: 'keyword', line: ln };
          }
        }
      }
    }

    // 2) If no keyword lines matched, look for words/tokens with currency symbols or decimals and high confidence
    if (Array.isArray(data.words) && data.words.length){
      // build candidates: token text, confidence
      const numericWords = data.words.map(w => ({text: (w.text||'').replace(/[^0-9.,]/g,''), conf: w.confidence||0})).filter(w=>/[0-9]/.test(w.text));
      // prefer tokens with a decimal point (likely totals) and higher confidence
      numericWords.sort((a,b)=> {
        const aDot = a.text.indexOf('.')>-1 ? 1 : 0;
        const bDot = b.text.indexOf('.')>-1 ? 1 : 0;
        if (bDot !== aDot) return bDot - aDot;
        return b.conf - a.conf;
      });
      for (const tok of numericWords){
        const nums = extractNumbers(tok.text);
        if (nums.length){
          const val = nums[0];
          if (val > 0) return { amount: Number(val.toFixed(2)).toFixed(2), reason: 'word', token: tok.text, conf: tok.conf };
        }
      }
    }

    // 3) Fallback: search whole text and pick the largest numeric value (previous heuristic)
    const fullText = data.text || lines.join('\n') || '';
    const fb = parseAmountFromText(fullText);
    if (fb) return { amount: fb, reason: 'fallback' };
    return null;
  }

  function parseDateFromText(text){
    if (!text) return null;
    // Try ISO-like YYYY-MM-DD
    let m = text.match(/(\d{4})[\-\/](\d{1,2})[\-\/](\d{1,2})/);
    if (m){
      const y=m[1],mm=String(m[2]).padStart(2,'0'),dd=String(m[3]).padStart(2,'0');
      return `${y}-${mm}-${dd}`;
    }
    // Try DD/MM/YYYY or MM/DD/YYYY (ambiguous) - prefer DD/MM if day>12
    m = text.match(/(\d{1,2})[\/](\d{1,2})[\/](\d{4})/);
    if (m){
      const a=Number(m[1]), b=Number(m[2]), y=m[3];
      let dd=a, mm=b;
      if (a<=12 && b>12) { dd=b; mm=a; } // swap if needed
      // prefer treating first as day if >12
      if (a>12) { dd=a; mm=b; }
      return `${y}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
    }
    // Month name e.g. Dec 13 2025 or 13 Dec 2025
    m = text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,-]*(\d{1,2})[\s,,-]*(\d{4})/i);
    if (m){
      const monthNames = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
      const mon = monthNames[m[1].slice(0,3).toLowerCase()];
      const dd = String(m[2]).padStart(2,'0');
      const y = m[3];
      return `${y}-${String(mon).padStart(2,'0')}-${dd}`;
    }
    return null;
  }

  function parseTimeFromText(text){
    if (!text) return null;
    let m = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    if (m) return `${String(m[1]).padStart(2,'0')}:${m[2]}`;
    // AM/PM
    m = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (m){
      let h = Number(m[1]); if (/PM/i.test(m[3]) && h<12) h+=12; if (/AM/i.test(m[3]) && h===12) h=0;
      return `${String(h).padStart(2,'0')}:${m[2]}`;
    }
    return null;
  }

  function parseTypeFromText(text){
    if (!text) return null;
    const keywords = ['food','transport','shopping','bills','movie','coffee','grocer','grocery','taxi','uber','restaurant','fuel','petrol','gas','rent','utilities'];
    const lower = text.toLowerCase();
    for (const kw of keywords){ if (lower.indexOf(kw) !== -1) return kw; }
    return null;
  }

  // Optional: POST each new entry to a configured endpoint (Google Apps Script or local /submit)
  // Set this URL to your Apps Script web app URL (see README instructions below)
  const SHEET_ENDPOINT = window.SHEET_ENDPOINT || '';

  // Wrap add to also optionally POST to the SHEET_ENDPOINT
  const originalAdd = add;
  window.addExpense = function(amount, date, type){
    // create a stable id and pass it to the local add so both client and server use the same id
    const id = makeId();
    originalAdd(amount, date, type, id);
    const payload = { id, amount: Number(amount), date, type };
    // sync status element (visible feedback)
    const statusEl = document.getElementById('sync-status');
    function setStatus(text, cls){
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.classList.remove('ok','warn','error');
      if (cls) statusEl.classList.add(cls);
      statusEl.style.display = 'inline-block';
      // auto-hide after 4s
      clearTimeout(statusEl._hideTimer);
      statusEl._hideTimer = setTimeout(()=>{ statusEl.style.display = 'none'; }, 4000);
    }
    // start syncing
    setStatus('Syncing...', 'warn');
    if (SHEET_ENDPOINT) {
      fetch(SHEET_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(res => {
        if (!res.ok) {
          console.warn('Sheet endpoint responded with non-OK status', res.status, res.statusText);
          // fallback to local /submit so data isn't lost
          fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).then(()=>{ setStatus('Saved locally', 'error'); }).catch(()=>{ setStatus('Saved locally', 'error'); });
        } else {
          // try to print response (may be JSON or text)
          res.text().then(t => {
            try{
              const parsed = JSON.parse(t);
              console.log('Sheet endpoint response:', parsed);
              if (parsed && parsed.ok) {
                if (parsed.duplicate) setStatus('Synced (duplicate)', 'ok');
                else setStatus('Synced to Sheet', 'ok');
                // mark synced locally so history shows it
                markSynced(id);
              } else {
                // not-ok payload
                setStatus('Saved locally', 'error');
              }
            }catch(e){
              console.log('Sheet endpoint response (text):', t);
              setStatus('Synced to Sheet', 'ok');
              markSynced(id);
            }
          }).catch(()=>{ setStatus('Synced to Sheet', 'ok'); });
        }
      }).catch(err => {
        console.warn('Failed to POST to sheet endpoint', err);
        // fallback to local /submit so data persists
        fetch('/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(()=>{ setStatus('Saved locally', 'error'); }).catch(()=>{ setStatus('Saved locally', 'error'); });
      });
    } else {
      // attempt local fallback POST to /submit on same server
      fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(()=>{/* ignore */});
    }
  };

  // update submit path used above: replace direct add() calls with addExpense
  // we already used add() inside submit handler above, so patch it to call addExpense instead

  document.addEventListener('click', function(e){
    if(e.target.matches('.del')){
      const id = e.target.getAttribute('data-id');
      remove(id);
    }
  });

  // update when other tabs change localStorage
  window.addEventListener('storage', function(e){ if (e.key === STORAGE_KEY) render(); });

  render();
})();