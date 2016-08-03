#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    u: 'uuid',
    t: 'token',
    o: 'output'
  }
})
var fs = require('fs')
var lion = require('./lion')
var JSONStream = require('JSONStream')
var digitalCollections = require('./')

var errors = []
var uuid = argv.u
var token = argv.t || process.env.DIGITAL_COLLECTIONS_TOKEN

if (!token || typeof (token) !== 'string') {
  errors.push('Error: please supply an NYPL API token with the -t option, or set the DIGITAL_COLLECTIONS_TOKEN environment variable')
  token = null
}

if (!uuid || typeof (uuid) !== 'string') {
  errors.push('Error: please supply a UUID with the -u option')
  uuid = null
}

if (process.stdin.isTTY && !(token && uuid)) {
  console.error(lion.join('\n') + '\n')

  console.error('NYPL Digital Collections API client - see https://github.com/nypl-publicdomain/api-client\n' +
    '\n' +
    'Usage: digital-collections -t API-TOKEN -u UUID [-o file] \n' +
    '  -u, --uuid      UUID of item or collection\n' +
    '  -t, --token     API access token, see http://api.repo.nypl.org/\n' +
    '  -o, --output    output file, default is stdout\n' +
    '\n' +
    'Go to http://digitalcollections.nypl.org/ to browse NYPL\'s Digital Collections')

  if (errors.length) {
    console.error('\n' + errors.join('\n'))
  }

  process.exit(1)
}

digitalCollections.captures({
  uuid: uuid,
  token: token
})
  .pipe(JSONStream.stringify())
  .pipe(argv.o ? fs.createWriteStream(argv.o, 'utf8') : process.stdout)
