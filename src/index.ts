import * as dotenv from 'dotenv';
import axios from 'axios';
import dayjs from 'dayjs';
import * as fs from 'fs';
import { json2csv } from 'json-2-csv';

import { intro, outro, text, confirm } from '@clack/prompts';

dotenv.config();

const API_URL = 'https://dev.lunchmoney.app/v1/';
const DEFAULT_NAME = 'exported-transactions';

function makeAPIRequest(url: string, params: object = {}, apiToken: string) {
  const config = {
    headers: { Authorization: `Bearer ${apiToken}` }
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

function getTransactionProperties(transactions = []) {
  const [firstTransaction] = transactions;
  return Object.keys(firstTransaction);
}
*/

function getTransactions(apiKey: string, offset: number = 0, limit: number = 100, startDate: string = '2020-01-01', endDate: string = dayjs().format('YYYY-MM-DD')) {

  return makeAPIRequest(API_URL + 'transactions', {
    start_date: startDate,
    end_date: endDate,
    ...(offset ? { offset } : {}),
    ...(limit ? { limit } : {})
  }, apiKey);
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
  /*
  const { data } = await getTransactions();
  const { transactions } = data;

  fs.writeFileSync(`${DEFAULT_NAME}.json`, JSON.stringify(transactions));
  convertToCSV(transactions);
  */

  intro(`create-my-app`);
  const apiKey = await text({
    message: 'Add your API key. You can get it on https://my.lunchmoney.app/developers!',
    validate(value) {
      if (value.length === 0) return `Value is required!`;
    },
  });

  const saveJsonFile = await confirm({
    message: 'Do you want to save it on a JSON file too?',
  });

  const { data } = await getTransactions(String(apiKey));
  const { transactions } = data;

  if (saveJsonFile) {
    fs.writeFileSync(`${DEFAULT_NAME}.json`, JSON.stringify(transactions));
  }
  convertToCSV(transactions);

  outro(`You're all set!`);
})();

