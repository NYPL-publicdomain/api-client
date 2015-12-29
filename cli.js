#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    u: 'uuid',
    t: 'token',
    o: 'output'
  }
})
var fs = require('fs')
var JSONStream = require('JSONStream')
var digitalCollections = require('./')

if (!argv.t) {
  console.error('Error: please supply an NYPL API token with the -t option\n')
}

if (!argv.u) {
  console.error('Error: please supply a UUID with the -u option\n')
}

if (process.stdin.isTTY && (!argv.t || !argv.u)) {
  console.error('NYPL Digital Collections API client - see https://github.com/nypl-publicdomain/api-client\n' +
    '\n' +
    'Usage: digital-collections -t API-TOKEN -u UUID [-o file] \n' +
    '  -u, --uuid      UUID of item or collection\n' +
    '  -t, --token     API access token, see http://api.repo.nypl.org/\n' +
    '  -o, --output    output file, default is stdout\n' +
    '\n' +
    'Go to http://digitalcollections.nypl.org/ to browse NYPL\'s Digital Collections')

  process.exit(1)
}

digitalCollections.captures({
  uuid: argv.u,
  token: argv.t
})
  .pipe(JSONStream.stringify())
  .pipe(argv.o ? fs.createWriteStream(argv.o, 'utf8') : process.stdout)
