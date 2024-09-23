module.exports = {
  apps: [{
    name: 'my-express-app',
    script: 'Server/app.js',  // 올바른 상대 경로로 수정
    watch: '.'
  }, {
    script: './Server/service-worker/',  // 올바른 상대 경로로 수정
    watch: ['./Server/service-worker']
  }],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
