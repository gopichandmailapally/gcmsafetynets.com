module.exports = {
  apps: [
    {
      name: 'gcmsafetynets-com',
      script: 'server.js',
      cwd: '/var/www/gcmsafetynets.com',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3025,
        COMPANY_NAME: 'GCM Safety Nets',
        COMPANY_UPI: 'gcmenterprises@ybl',
        PHONE: '+919912399224',
        BRAND: 'Russea™'
      }
    }
  ]
};
