import axios from 'axios';

const client = axios.create({
  baseURL: process.env.REACT_APP_OPENHANDS_API_URL || 'http://localhost:3000',
  timeout: 5000,
});

export default {
  setBase(url) {
    client.defaults.baseURL = url;
  },
  async get(path) {
    const res = await client.get(path);
    return res.data;
  },
  async post(path, body) {
    const res = await client.post(path, body);
    return res.data;
  }
};