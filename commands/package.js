/**
 * package React Native Panel Project
 *
 */
const fs = require("fs");
const path = require("path");
const {exec} = require("child_process");
const logSymbols = require("log-symbols");
const qrcode = require("qrcode-terminal");

let _arguments = {};
const reactNativeServerPort = 8002;

const parseArguments = function (argv) {
  _arguments = argv;

  const currentExecuteCommandPath = process.cwd();
  _arguments.currentExecuteCommandPath = currentExecuteCommandPath;

  if (argv._.length > 1) {
    const targetPath = argv._[1];
    _arguments.targetPath = path.join(currentExecuteCommandPath, targetPath);
  } else {
    _arguments.targetPath = currentExecuteCommandPath;
  }

  // console.log(arguments);
};

const execShell = (line) => {
  const _process = exec(line, {});
  _process.stdout.on("data", data => {
    console.log(data);
  });

  _process.stderr.on("data", data => {
    console.log(logSymbols.error, data);
  });
};

const packageJSONFileExists = function (dirPath) {
  const filePath = path.join(dirPath, "package.json");
  if (!fs.existsSync(filePath)) {
    console.log(logSymbols.error, `[Error] Package.json does not exits at: ${filePath}`);
    return false;
  }
  return true;
};

const getNetworkIP = (function () {
  var ignoreRE = /^(127\.0\.0\.1|::1|fe80(:1)?::1(%.*)?)$/i;

  var exec = require("child_process").exec;
  var cached;
  var command;
  var filterRE;

  switch (process.platform) {
    // TODO: implement for OSs without ifconfig command
    case "darwin":
      command = "ifconfig";
      filterRE = /\binet\s+([^\s]+)/g;
      // filterRE = /\binet6\s+([^\s]+)/g; // IPv6
      break;
    default:
      command = "ifconfig";
      filterRE = /\binet\b[^:]+:\s*([^\s]+)/g;
      // filterRE = /\binet6[^:]+:\s*([^\s]+)/g; // IPv6
      break;
  }

  return function (callback, bypassCache) {
    // get cached value
    if (cached && !bypassCache) {
      callback(null, cached);
      return;
    }
    // system call
    exec(command, function (error, stdout, sterr) {
      var ips = [];
      // extract IPs
      var matches = stdout.match(filterRE);
      // JS has no lookbehind REs, so we need a trick
      for (var i = 0; i < matches.length; i++) {
        ips.push(matches[i].replace(filterRE, "$1"));
      }

      // filter BS
      for (var i = 0, l = ips.length; i < l; i++) {
        if (!ignoreRE.test(ips[i])) {
          //if (!error) {
          cached = ips[i];
          //}
          callback(error, ips[i]);
          return;
        }
      }
      // nothing found
      callback(error, null);
    });
  };
})();

const getApplicationJSONConfigurationContent = function () {
  const fileName = "app.json";
  const filePath = path.join(_arguments.targetPath, fileName);
  // check file exists
  if (!fs.existsSync(filePath)) {
    console.log(logSymbols.error, `[Error] ${fileName} does not exits at: ${filePath}`);
    return false;
  }

  // read content
  try {
    const fileContentInString = fs.readFileSync(filePath, {encoding: "utf8"});
    const fileContentInJSON = JSON.parse(fileContentInString);
    return fileContentInJSON;
  } catch (error) {
    console.log(logSymbols.error, `[Error] Read ${fileName} content failed: ${filePath}`, error);
    return false;
  }
};

const generateZipPackageFileName = function () {
  const applicationConfiguration = getApplicationJSONConfigurationContent();
  if (!applicationConfiguration) {
    return false;
  }


};

/**
 * generate package command line string
 * @returns {string}
 */
const generateCommand = function () {

  const packagePaths = {
    Android: "bundle/Android",
    iOS: "bundle/iOS",
  };
  const commands = [
    // createFolders
    "mkdir -p bundle/Android",
    "mkdir -p bundle/iOS",
    // package
    `react-native bundle --entry-file index.js --bundle-output ./${packagePaths.Android}/index.mxbundle --platform android --assets-dest ./${packagePaths.Android} --dev false`,
    `react-native bundle --entry-file index.js --bundle-output ./${packagePaths.iOS}/index.mxbundle --platform ios --assets-dest ./${packagePaths.iOS} --dev false`,
    // zip files

  ];
  return commands.join(" && ");
};

const runPackageCommand = function () {
  execShell(generateCommand());
};

module.exports.command = "package";
module.exports.describe = "package project";
module.exports.handler = function (argv) {
  parseArguments(argv);
  if (!packageJSONFileExists(_arguments.targetPath)) {
    return;
  }

  runPackageCommand();
};