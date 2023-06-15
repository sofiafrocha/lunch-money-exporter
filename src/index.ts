import * as dotenv from 'dotenv';
import axios from 'axios';
import dayjs from 'dayjs';
import * as fs from 'fs';
import { json2csv } from 'json-2-csv';

dotenv.config();

const API_URL = 'https://dev.lunchmoney.app/v1/';
const DEFAULT_NAME = 'exported-transactions';

function makeAPIRequest(url: string, params: object = {}) {
  const config = {
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` }
  }
  return axios.get(url, {
    params: params,
    ...config,
  });
}
/*
function getAccountInfo() {
  return makeRequest(API_URL + 'me');
}
*/

function getTransactions(offset: number = 0, limit: number = 100, startDate: string = '2020-01-01', endDate: string = dayjs().format('YYYY-MM-DD')) {

  return makeAPIRequest(API_URL + 'transactions', {
    start_date: startDate,
    end_date: endDate,
    ...(offset ? { offset } : {}),
    ...(limit ? { limit } : {})
  });
}

function convertToCSV(input: Array<object> = [], outputFileName: string = `${DEFAULT_NAME}.csv`) {
  json2csv(input)
    .then((result) => {
      console.log('number of transactions saved: ', result.length);
      fs.writeFileSync(outputFileName, result);
    })
    .catch(err => console.log('err!', err));
}

(async () => {
  const { data } = await getTransactions();
  const { transactions } = data;

  fs.writeFileSync(`${DEFAULT_NAME}.json`, JSON.stringify(transactions));
  convertToCSV(transactions);
})();

