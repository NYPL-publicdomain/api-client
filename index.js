var H = require('highland')
var request = require('request')

var getRequestOptions = function (uuid, token, perPage, page) {
  var url = 'http://api.repo.nypl.org/api/v1/items/' + uuid + '.json?withTitles=yes&per_page=' + perPage + '&page=' + page
  var auth = 'Token token="' + token + '"'

  return {
    url: url,
    headers: {
      Authorization: auth
    }
  }
}

var requestStream = function (options) {
  return H(request(options))
    .stopOnError(function (err) {
      console.error(err)
    })
    .split()
    .map(JSON.parse)
}

var getPageStreams = function (uuid, token, perPage, items) {
  var count = Math.ceil(items / perPage)

  var streams = []
  for (var page = 1; page <= count; page++) {
    streams.push(getRequestOptions(uuid, token, perPage, page))
  }

  return streams.map(function(options) {
    return requestStream(options)
  })
}

var getCaptures = function (body) {
  return body.nyplAPI.response.capture
}

/**
 * Returns a stream of capture objects
 * @param {Object} options
 * @param {String} options.uuid UUID of a Collection, Sub-container or Item
 * @param {String} [options.token] Digital Collections API access token
 * @param {number} [options.perPage=50] items per page, higher means less requests. Max. 500
 */
module.exports.captures = function (options) {
  if (!options.uuid) {
    throw new Error('Please supply a UUID in options.uuid')
  }

  var token = options.token || process.env.DIGITAL_COLLECTIONS_TOKEN

  if (!token) {
    throw new Error('Please supply an API token in options.token, or set the DIGITAL_COLLECTIONS_TOKEN environment variable')
  }

  if (options.perPage && options.perPage > 500 || options.perPage < 1) {
    throw new Error('options.perPage should be between 1 and 500')
  }

  var perPage = options.perPage || 100

  return requestStream(getRequestOptions(options.uuid, options.token, 1, 1))
    .map(function(body) {
      return body.nyplAPI.request.totalPages;
    })
    .map(H.curry(getPageStreams, options.uuid, options.token, perPage))
    .flatten()
    .map(getCaptures)
    .flatten()
}
