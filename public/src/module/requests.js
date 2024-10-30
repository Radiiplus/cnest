import { showToast } from './toast.js';

let sock;
const MAX_RETRY = 3600000; 
const STORAGE_KEY = 'failedRequests'; 
let queue = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

export const init = () => {
  return new Promise((res, rej) => {
    if (typeof io === 'undefined') {
      throw new Error('Socket.IO client not found.');
    }

    sock = io();

    sock.on('connect', () => {
      res(sock);
      retry();
    });

    sock.on('connect_error', (err) => {
      rej(err);
      showToast('Network connection error. Retrying...', 5000);
    });

    sock.on('response', (data) => {
      eventManager.emit('socketResponse', data);
    });
  });
};

const sure = async () => {
  if (!sock) {
    await init();
  }
};

export const fetch = async (url, params = {}, successKey = 'success', reasonKeys = {}, method = 'POST', useSock = false) => {
  if (useSock) {
    const sockInst = await getSock();
    return new Promise((resolve) => {
      sockInst.emit(url, params, (response) => {
        resolve(response);
      });
    });
  }

  if (!Object.values(params).some(Boolean) && method === 'POST') return;

  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(method !== 'GET' && { body: JSON.stringify(params) }),
    };

    const query = method === 'GET' ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await fetch(`${url}${query}`, opts);

    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || 'An error occurred. Please try again.' };
    }

    const result = await res.json();
    const isSuccess = result[successKey];

    if (!isSuccess) {
      return { error: result[reasonKeys.error] || 'Something went wrong.' };
    }

    return {
      success: isSuccess,
      message: result[reasonKeys.message],
      data: result,
    };
  } catch (err) {
    console.error('Request error', err);
    handleFail({ url, params, successKey, reasonKeys, method });
    return { error: 'Network error. Request queued for retry.' };
  }
};

const retry = () => {
  if (navigator.onLine) {
    const now = Date.now();
    
    queue = queue.filter(async (req) => {
      const { timestamp, url, params, successKey, reasonKeys, method } = req;

      if (now - timestamp > MAX_RETRY) {
        return false;
      }

      const response = await fetch(url, params, successKey, reasonKeys, method);
      
      return !!response.error;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  }
};

const handleFail = (req) => {
  req.timestamp = Date.now();
  queue.push(req);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  showToast('Offline! Reconnecting.', 5000);
};

window.addEventListener('online', retry);

export const getSock = async () => {
  await sure();
  return sock;
};