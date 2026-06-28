import handler from './frontend/api/webhook/github.js';

const req = {
  method: 'POST',
  headers: {
    'x-github-event': 'push',
    'x-github-delivery': 'local-test-123'
  },
  body: {
    repository: { full_name: 'test/repo' },
    head_commit: {
      id: 'abc',
      message: 'test',
      author: { name: 'me' },
      added: [], modified: [], removed: []
    }
  }
};

const res = {
  status: (code) => {
    console.log('STATUS:', code);
    return res;
  },
  json: (data) => console.log('JSON:', data),
  send: (data) => console.log('SEND:', data)
};

handler(req, res).catch(console.error);
