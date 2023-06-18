import * as dotenv from 'dotenv';
import axios from 'axios';
import dayjs from 'dayjs';
import * as fs from 'fs';
import { json2csv } from 'json-2-csv';

import { intro, outro, text, confirm, spinner } from '@clack/prompts';

dotenv.config();

const s = spinner();
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

function getTransactions(
  apiKey: string,
  startDate: string = '2020-01-01',
  endDate: string = dayjs().format('YYYY-MM-DD'),
  offset: number = 0,
  limit: number = 100,
) {
  return makeAPIRequest(API_URL + 'transactions', {
    start_date: startDate,
    end_date: endDate,
    ...(offset ? { offset } : {}),
    ...(limit ? { limit } : {})
  }, apiKey);
}

function convertToCSV(input: Array<object> = [], outputFileName: string = DEFAULT_NAME) {
  json2csv(input)
    .then((result) => {
      console.log('number of transactions saved: ', result.length);
      fs.writeFileSync(`${outputFileName}.csv`, result);
    })
    .catch(err => console.log('err!', err));
}

(async () => {
  intro(`lunch-money-exporter`);

  const apiKey = await text({
    message: 'Insert your LunchMoney API key. You can get one on https://my.lunchmoney.app/developers.',
    validate(value) {
      if (value.length === 0) return `The API key is required!`;
    },
  });

  const startDate = await text({
    message: 'Export transactions from this (start) date...',
    placeholder: 'YYYY-MM-DD',
    validate(value) {
      const regEx = /^\d{4}-\d{2}-\d{2}$/;
      if (!value.match(regEx)) return 'Invalid date format!';
    }
  });

  const endDate = await text({
    message: '...until this (end) date.',
    placeholder: 'YYYY-MM-DD',
    initialValue: dayjs().format('YYYY-MM-DD'),
    validate(value) {
      const regEx = /^\d{4}-\d{2}-\d{2}$/;
      if (!value.match(regEx)) return 'Invalid date format!';
    }
  });

  const fileName = await text({
    message: 'What should the file be named?',
    initialValue: 'exported-transactions',
    validate(value) {
      if (value.length === 0) return `The file name is required!`;
    },
  });

  const saveJsonFile = await confirm({
    message: 'Do you want to save it on a JSON file too?',
  });

  s.start('Getting transactions...');
  const { data } = await getTransactions(String(apiKey), String(startDate), String(endDate));
  const { transactions } = data;
  s.stop('Transactions downloaded!');

  if (saveJsonFile) {
    fs.writeFileSync(`${String(fileName)}.json`, JSON.stringify(transactions));
  }

  s.start('Converting to CSV...');
  convertToCSV(transactions, String(fileName));
  s.stop('Data converted!');

  outro(`You're all set! File saved in ${String(fileName)}.csv`);
})();

