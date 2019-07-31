/* global Vue */

/* implementation of endsWith() from https://stackoverflow.com/a/2548133 */
if (typeof String.prototype.endsWith !== 'function') {
  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}

/* uuid() is from https://stackoverflow.com/a/30609091 */
function uuid() {
    function randomDigit() {
        if (crypto && crypto.getRandomValues) {
            var rands = new Uint8Array(1);
            crypto.getRandomValues(rands);
            return (rands[0] % 16).toString(16);
        } else {
            return ((Math.random() * 16) | 0).toString(16);
        }
    }
    var crypto = window.crypto || window.msCrypto;
    return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, randomDigit);
}

/* macaddr() is from https://stackoverflow.com/a/24621956 */
function macaddr() {
  return '52:54:XX:XX:XX:XX'.replace(/X/g, function() {
    return '0123456789ABCDEF'.charAt(Math.floor(Math.random() * 16));
  });
}

function isValidIp(ipstr, expectCidr) {
  if (!expectCidr) {
    /* regex from https://stackoverflow.com/a/27434991 */
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipstr)) {
      return true;
    } else {
      return false;
    }
  } else {
    var ipCidr = /([0-9\.]+)\/?(\d+)?/.exec(ipstr);
    if (ipCidr.length != 3 || parseInt(ipCidr[2], 10) > 31 || parseInt(ipCidr[2], 10) <= 0) {
      return false;
    } else {
      return isValidIp(ipCidr[1], false);
    }
  }
}

var defaultDisk = {
  diskBus: 'ide',
  diskFile: '',
  diskCache: 'none',
  diskCdrom: false,
  format: ''
};

var defaultNetworkpfrule = {
  proto: 'tcp',
  hostaddr: '127.0.0.1',
  hostport: '8080',
  guestport: '80'
};

new Vue({
  el: '#app',
  data: {
    flags: 'Press the button above to generate the flags.',
    /* defaults */
    qemuCmd: '/usr/bin/qemu-system-x86_64',
    cmdWarning: false,
    sysType: 'x86_64',
    kvmImplicit: false,
    enableKvm: true,

    machineType: 'virt-2.8',
    cpuType: 'host',
    numCpus: 4,

    memoryAmount: 2048,
    memorySize: 'm',
    memoryBalloon: false,

    attachKeyboard: true,
    attachMouse: false,
    attachTablet: true,
    graphicsCard: 'cirrus',

    diskWarning: false,
    disks: [Object.assign({}, defaultDisk)],
    numDisks: 1,

    networkDevice: 'e1000-82545em',
    networkMac: macaddr(),
    macWarning: false,
    networkType: 'user',
    networkHostname: 'qemuguest',
    networkPfrules: [Object.assign({}, defaultNetworkpfrule)],
    numNetworkpfules: 1,
    networkIP: '10.22.22.1',
    bridgeName: 'br0',
    helperName: '/usr/lib/qemu/qemu-bridge-helper',
    ipWarning: false,

    displayOption: 'sdl',
    vncOption: '0.0.0.0:1',
    vncWarning: false,

    serialOption: 'none',

    name: '',
    uuid: uuid(),

    preventUsage: false
  },
  methods: {
    generateFlags: function() {
      /* reset preventusage */
      this.preventUsage = false;
      this.validateDisk();
      this.validateMac();
      this.validateVNC();
      if (this.preventUsage) {
        this.flags = 'Please check that there are no errors above and try again.';
        return;
      }
      var flags = [this.qemuCmd];

      /* kvm enable or not */
      if (this.enableKvm && !this.kvmImplicit) flags.push('-enable-kvm');

      /* machine */
      if (this.sysType == 'aarch64') flags.push('-M ' + this.machineType);

      /* cpu */
      flags.push('-cpu ' + this.cpuType);

      /* number of cpu's */
      flags.push('-smp cores=' + this.numCpus + ',threads=1,sockets=1');

      /* memory size*/
      if (this.memorySize != 'm') flags.push('-m ' + this.memoryAmount + 'G');
      else flags.push('-m ' + this.memoryAmount);
      if (this.memoryBalloon) flags.push('-device virtio-balloon-device,automatic=true');

      /* devices */
      if (this.attachKeyboard || this.attachMouse || this.attachTablet)
        flags.push('-usb');
      if (this.attachKeyboard) flags.push('-device usb-kbd');
      if (this.attachMouse) flags.push('-device usb-mouse');
      if (this.attachTablet) flags.push('-device usb-tablet');
      flags.push('-vga ' + this.graphicsCard);

      /* disks */
      var ideDisks = [], scsiDisks = [], virtioDisks = [], sataDisks = [];
      for (var i = 0; i < this.disks.length; i++) {
        if (this.disks[i].diskBus == 'ide') ideDisks.push(this.disks[i]);
        if (this.disks[i].diskBus == 'scsi') scsiDisks.push(this.disks[i]);
        if (this.disks[i].diskBus == 'virtio') virtioDisks.push(this.disks[i]);
        if (this.disks[i].diskBus == 'sata') sataDisks.push(i);

        flags.push('-drive file=' + this.disks[i].diskFile.replace(',', ',,') +
          ',id=disk' + i +
          ',if=' + (this.disks[i].diskBus == 'sata' ? 'none' : this.disks[i].diskBus) +
          ',index=' + i +
          ',media=' + (this.disks[i].diskCdrom ? 'cdrom' : 'disk') +
          ',cache=' + this.disks[i].diskCache +
          (this.disks[i].diskFile.endsWith('qcow2') ? '' : ',format=raw')
        );
      }

      if (sataDisks.length > 0) {
        /* add the ahci bus */
        flags.push('-device ahci,id=ahci');
        for (var i = 0; i < sataDisks.length; i++) {
          flags.push('-device ide-drive,drive=disk' + sataDisks[i] + ',bus=ahci.' + i);
        }
      }

      /* network */
      flags.push('-device ' + this.networkDevice + ',netdev=net1,mac=' + this.networkMac);
      if (this.networkType == 'user') {
        var itm, str;
        str = '-netdev user,id=net1,hostname=' + this.networkHostname;

        for (var i = 0; i < this.networkPfrules.length; i++) {
          itm = this.networkPfrules[i];
          str += ',hostfwd=' + itm.proto + ':' + itm.hostaddr + ':' + itm.hostport + '-' + ':' + itm.guestport;
        }

        flags.push(str);
      } else if (this.networkType == 'bridge') {
        flags.push('-netdev bridge,id=net1,br=' + this.bridgeName + ',helper=' + this.helperName);
      }

      /* graphics */
      if (this.displayOption == 'disable') flags.push('-nographic');
      else if (this.displayOption == 'vnc') flags.push('-vnc ' + this.vncOption);
      else flags.push('-display ' + this.displayOption);

      /* serial */
      flags.push('-serial ' + this.serialOption);

      /* name and uuid */
      if (this.name.length > 0) flags.push('-name ' + this.name);
      if (this.uuid.length > 0) flags.push('-uuid ' + this.uuid);

      /* done */
      this.flags = flags.join(' ');
    },
    checkType: function() {
      if (this.qemuCmd.indexOf('x86_64') >= 0) {
        /* enable the x86_64 cpus */
        this.sysType = 'x86_64';
        this.cmdWarning = false;
      } else if (this.qemuCmd.indexOf('aarch64') >= 0) {
        /* enable machine and aarch64 cpus */
        this.sysType = 'aarch64';
        this.cmdWarning = false;
      } else if (this.qemuCmd.indexOf('kvm') >= 0) {
        /* the command is probably something like /usr/bin/kvm */
        this.kvmImplicit = true;
        this.enableKvm = true;
        this.cmdWarning = false;
        this.sysType = 'x86_64';
        this.cmdWarning = 'Warning: Assuming kvm is using x86_64, but this could be wrong!';
      } else {
        this.sysType = 'x86_64';
        this.cmdWarning = 'Warning: Unrecognized QEMU command. Assuming x86_64, but this could be wrong!';
      }
    },
    updateDiskNum: function() {
      if (this.numDisks > this.disks.length) {
        for (var i = this.disks.length; i < this.numDisks; i++) {
          this.disks.push(Object.assign({}, defaultDisk));
        }
      } else if (this.numDisks < this.disks.length) {
        for (var i = this.disks.length; i > this.numDisks; i--) {
          this.disks.pop();
        }
      }
      this.validateDisk();
    },
    validateDisk: function() {
      var errorStr = [], warningStr = '';

      for (var i = 0; i < this.disks.length; i++) {
        if (this.disks[i].diskFile.length == 0) {
          errorStr.push('Error: disk ' + i + ' has no filename');
        } else if (this.disks[i].diskFile[0] != '/') {
          warningStr = 'Warning: absolute paths are recommended for disk images';
        }
      }

      if (errorStr.length != 0) this.preventUsage = true;
      this.diskWarning = (errorStr.length > 0 ? errorStr.join('; ') : '') + ((errorStr.length > 0) && (warningStr.length > 0) ? '; ' : '') + warningStr;
    },
    validateMac: function() {
      /* regex is modified form of regex from https://stackoverflow.com/a/12010778 */
      if (/^([0-9A-F]{2}:){5}([0-9A-F]{2})$/.test(this.networkMac)) {
        this.macWarning = false;
      } else {
        this.preventUsage = true;
        this.macWarning = 'Error: Invalid MAC address! Please use the format XX:XX:XX:XX:XX:XX.';
      }
    },
    genMAC: function() {
      this.networkMac = macaddr();
    },
    updateNetworkpfrulesNum: function() {
      if (this.numNetworkpfules > this.networkPfrules.length) {
        for (var i = this.networkPfrules.length; i < this.numNetworkpfules; i++) {
          this.networkPfrules.push(Object.assign({}, defaultNetworkpfrule));
        }
      } else if (this.numNetworkpfules < this.networkPfrules.length) {
        for (var i = this.networkPfrules.length; i > this.numNetworkpfules; i--) {
          this.networkPfrules.pop();
        }
      }
      this.validateNetworkpfrules();
    },
    validateNetworkpfrules: function() {
      var objt = {};
      var itm, key;

      this.ipWarning = 'Error: ';

      for (var i = 0; i < this.networkPfrules.length; i++) {
        itm = this.networkPfrules[i];
        if (!isValidIp(itm.hostaddr, false)) {
          this.ipWarning += 'Rule ' + i + ' has invalid IP address; ';
          continue;
        } else if (parseInt(itm.hostport, 10) < 0 || parseInt(itm.hostport, 10) > 65535 ||
          parseInt(itm.guestport, 10) < 0 || parseInt(itm.guestport, 10) > 65535) {
          this.ipWarning += 'Rule ' + i + ' has invalid port number; ';
          continue;
        }

        key = itm.proto + itm.hostaddr + ':' + itm.hostport + ' -> ' + itm.guestport;

        if (key in objt) {
          this.ipWarning += 'Rule ' + i + ' duplicates rule ' + objt[key] + '; ';
          continue;
        }

        objt[key] = i;
      }

      if (this.ipWarning.length == 7) { /* strlen('Error: ') = 7 */
        this.ipWarning = false;
      } else {
        this.preventUsage = true;
      }
    },
    validateVNC: function() {
      var VNCOptions = /([\d.]+):([\d]+)/g.exec(this.vncOption);

      if (!VNCOptions || VNCOptions.length != 3) {
        this.vncWarning = 'Error: check your syntax for the VNC host; it should match the format 127.0.0.1:1.';
        this.preventUsage = true;
      } else if (parseInt(VNCOptions[2], 10) > 1000) {
        this.vncWarning = 'Warning: The host specifier is expecting a VNC display, not a port. ' + VNCOptions[2] + ' is unusually high!';
      }
    },
    genUUID: function() {
      this.uuid = uuid();
    },
    
  }
});
