import * as dotenv from 'dotenv';
import axios from 'axios';
import dayjs from 'dayjs';
import * as fs from 'fs';

dotenv.config();

const API_URL = 'https://dev.lunchmoney.app/v1/';

function makeRequest(url: string, params: object = {}) {
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
  console.log('getting transactions on offset', offset);
  return makeRequest(API_URL + 'transactions', {
    start_date: startDate,
    end_date: endDate,
    ...(offset ? { offset } : {}),
    ...(limit ? { limit } : {})
  });
}

(async () => {
  const { data } = await getTransactions();
  const { transactions } = data;

  fs.writeFileSync('beep-beep-transactions.json', JSON.stringify(transactions));
})();

