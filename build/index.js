"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const dayjs_1 = __importDefault(require("dayjs"));
const fs = __importStar(require("fs"));
const json_2_csv_1 = require("json-2-csv");
const prompts_1 = require("@clack/prompts");
dotenv.config();
const s = (0, prompts_1.spinner)();
const API_URL = 'https://dev.lunchmoney.app/v1/';
const DEFAULT_NAME = 'exported-transactions';
function makeAPIRequest(url, params = {}, apiToken) {
    const config = {
        headers: { Authorization: `Bearer ${apiToken}` }
    };
    return axios_1.default.get(url, Object.assign({ params: params }, config));
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
function getTransactions(apiKey, startDate = '2020-01-01', endDate = (0, dayjs_1.default)().format('YYYY-MM-DD'), offset = 0, limit = 100) {
    return makeAPIRequest(API_URL + 'transactions', Object.assign(Object.assign({ start_date: startDate, end_date: endDate }, (offset ? { offset } : {})), (limit ? { limit } : {})), apiKey);
}
function convertToCSV(input = [], outputFileName = DEFAULT_NAME) {
    (0, json_2_csv_1.json2csv)(input)
        .then((result) => {
        console.log('number of transactions saved: ', result.length);
        fs.writeFileSync(`${outputFileName}.csv`, result);
    })
        .catch(err => console.log('err!', err));
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    (0, prompts_1.intro)(`lunch-money-exporter`);
    const apiKey = yield (0, prompts_1.text)({
        message: 'Insert your LunchMoney API key. You can get one on https://my.lunchmoney.app/developers.',
        validate(value) {
            if (value.length === 0)
                return `The API key is required!`;
        },
    });
    const startDate = yield (0, prompts_1.text)({
        message: 'Export transactions from this (start) date...',
        placeholder: 'YYYY-MM-DD',
        validate(value) {
            const regEx = /^\d{4}-\d{2}-\d{2}$/;
            if (!value.match(regEx))
                return 'Invalid date format!';
        }
    });
    const endDate = yield (0, prompts_1.text)({
        message: '...until this (end) date.',
        placeholder: 'YYYY-MM-DD',
        initialValue: (0, dayjs_1.default)().format('YYYY-MM-DD'),
        validate(value) {
            const regEx = /^\d{4}-\d{2}-\d{2}$/;
            if (!value.match(regEx))
                return 'Invalid date format!';
        }
    });
    const fileName = yield (0, prompts_1.text)({
        message: 'What should the file be named?',
        initialValue: 'exported-transactions',
        validate(value) {
            if (value.length === 0)
                return `The file name is required!`;
        },
    });
    const saveJsonFile = yield (0, prompts_1.confirm)({
        message: 'Do you want to save it on a JSON file too?',
    });
    s.start('Getting transactions...');
    const { data } = yield getTransactions(String(apiKey), String(startDate), String(endDate));
    const { transactions } = data;
    s.stop('Transactions downloaded!');
    // a1d1fe8f9e77d424f9fd6091f0b415a7e394ba611f98d6e895
    if (saveJsonFile) {
        fs.writeFileSync(`${String(fileName)}.json`, JSON.stringify(transactions));
    }
    s.start('Converting to CSV...');
    convertToCSV(transactions, String(fileName));
    s.stop('Data converted!');
    (0, prompts_1.outro)(`You're all set! File saved in ${String(fileName)}.csv`);
}))();
