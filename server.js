const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const API_KEY = process.env.LEGI_KEY;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/bill', async (req, res) => {
  try {
    const searchUrl = `https://api.legiscan.com/?key=${API_KEY}&op=search&state=PA&bill=HB123`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.status === 'ERROR') return res.status(400).json(searchData);

    const results = searchData.searchresult;
    const bills = Object.keys(results)
      .filter(k => k !== 'summary')
      .map(k => results[k])
      .sort((a, b) => b.session_id - a.session_id);

    const billId = bills[0].bill_id;

    const billUrl = `https://api.legiscan.com/?key=${API_KEY}&op=getBill&id=${billId}`;
    const billRes = await fetch(billUrl);
    const billData = await billRes.json();

    res.json({ bill: billData.bill, allResults: bills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000);
