#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const { mkdirp } = require('mkdirp');
const crypto = require('crypto');

// Firebase Storage URLs
const MASTER_JSON_URL = 'https://firebasestorage.googleapis.com/v0/b/development-74af0.appspot.com/o/master.json?alt=media';
const CELLS_JSON_URL = 'https://firebasestorage.googleapis.com/v0/b/development-74af0.appspot.com/o/cells.json?alt=media';

// 目标目录
const TARGET_DIR = path.join(process.cwd(), 'public', 'master_bk');

// 最大重试次数
const MAX_RETRIES = 3;
// 重试延迟（毫秒）
const RETRY_DELAY = 2000;

/**
 * 计算数据的MD5校验和
 * @param {Buffer} data 要计算校验和的数据
 * @returns {string} MD5校验和（十六进制字符串）
 */
function calculateMD5(data) {
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * 延迟函数
 * @param {number} ms 延迟毫秒数
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 从URL下载文件，支持重试
 * @param {string} url 文件URL
 * @param {number} retries 重试次数
 * @returns {Promise<Buffer>} 文件内容
 */
async function downloadFileWithRetry(url, retries = MAX_RETRIES) {
  try {
    return await downloadFile(url);
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    console.warn(`下载失败，将在${RETRY_DELAY / 1000}秒后重试...（剩余重试次数: ${retries}）`);
    await delay(RETRY_DELAY);
    return downloadFileWithRetry(url, retries - 1);
  }
}

/**
 * 从URL下载文件
 * @param {string} url 文件URL
 * @returns {Promise<Buffer>} 文件内容
 */
async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败，状态码: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', (err) => reject(err));
    });
    
    request.on('error', (err) => reject(err));
    
    // 设置超时
    request.setTimeout(30000, () => {
      request.abort();
      reject(new Error('下载超时（30秒）'));
    });
  });
}

/**
 * 保存文件到目标路径
 * @param {Buffer} data 文件数据
 * @param {string} filePath 目标文件路径
 */
async function saveFile(data, filePath) {
  const dir = path.dirname(filePath);
  await mkdirp(dir);
  await promisify(fs.writeFile)(filePath, data);
  console.log(`文件已保存: ${filePath}`);
}

/**
 * 检查本地文件是否存在
 * @param {string} filePath 文件路径
 * @returns {Promise<boolean>} 是否存在
 */
async function fileExists(filePath) {
  try {
    await promisify(fs.access)(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 读取本地文件
 * @param {string} filePath 文件路径
 * @returns {Promise<Buffer>} 文件内容
 */
async function readFile(filePath) {
  try {
    return await promisify(fs.readFile)(filePath);
  } catch (error) {
    console.warn(`读取本地文件失败: ${filePath}`, error.message);
    return null;
  }
}

/**
 * 比较远程和本地文件
 * @param {string} fileName 文件名
 * @param {Buffer} remoteData 远程文件数据
 * @returns {Promise<boolean>} 是否需要更新
 */
async function compareWithLocalFile(fileName, remoteData) {
  const localFilePath = path.join(TARGET_DIR, fileName);
  
  // 检查本地文件是否存在
  const exists = await fileExists(localFilePath);
  if (!exists) {
    console.log(`本地文件不存在: ${localFilePath}，需要更新`);
    return true;
  }
  
  // 读取本地文件
  const localData = await readFile(localFilePath);
  if (!localData) {
    console.log(`无法读取本地文件: ${localFilePath}，需要更新`);
    return true;
  }
  
  // 计算MD5并比较
  const localMD5 = calculateMD5(localData);
  const remoteMD5 = calculateMD5(remoteData);
  
  console.log(`本地文件MD5: ${localMD5}`);
  console.log(`远程文件MD5: ${remoteMD5}`);
  
  if (localMD5 !== remoteMD5) {
    console.log(`${fileName} 文件已变更，需要更新`);
    return true;
  }
  
  console.log(`${fileName} 文件未变更，无需更新`);
  return false;
}

/**
 * 更新数据文件
 * @returns {Promise<{ masterUpdated: boolean, cellsUpdated: boolean }>} 更新状态
 */
async function updateDataFiles() {
  let masterUpdated = false;
  let cellsUpdated = false;
  
  try {
    console.log('开始检查数据文件更新...');

    // 确保目标目录存在
    await mkdirp(TARGET_DIR);

    // 下载master.json
    console.log('正在下载master.json...');
    const masterData = await downloadFileWithRetry(MASTER_JSON_URL);
    console.log(`master.json 下载完成，大小: ${masterData.length} bytes`);
    
    // 比较master.json
    masterUpdated = await compareWithLocalFile('master.json', masterData);
    if (masterUpdated) {
      await saveFile(masterData, path.join(TARGET_DIR, 'master.json'));
    }

    // 下载cells.json
    console.log('正在下载cells.json...');
    const cellsData = await downloadFileWithRetry(CELLS_JSON_URL);
    console.log(`cells.json 下载完成，大小: ${cellsData.length} bytes`);
    
    // 比较cells.json
    cellsUpdated = await compareWithLocalFile('cells.json', cellsData);
    if (cellsUpdated) {
      await saveFile(cellsData, path.join(TARGET_DIR, 'cells.json'));
    }

    const updateStatus = masterUpdated || cellsUpdated ? '有文件更新' : '所有文件均为最新';
    console.log(`数据文件检查完成! ${updateStatus}`);
    
    return {
      masterUpdated,
      cellsUpdated
    };
  } catch (error) {
    console.error('更新数据文件时出错:', error.message);
    throw error;
  }
}

// 当直接运行脚本时执行更新
if (require.main === module) {
  updateDataFiles()
    .then(({ masterUpdated, cellsUpdated }) => {
      const exitCode = masterUpdated || cellsUpdated ? 0 : 0;
      process.exit(exitCode);
    })
    .catch(error => {
      process.exit(1);
    });
}

// 导出函数以供其他模块使用
module.exports = {
  updateDataFiles
}; 