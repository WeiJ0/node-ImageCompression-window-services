var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
    name:'ImagesCompression',
    description: '[EDA]常駐 nodejs 圖片壓縮監控後台上傳圖片',
    script: 'C:\\ImageCompression\\main.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.

svc.on('install',function(){
    console.log('Install complete.');
    svc.start();
});

svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});

svc.uninstall();

