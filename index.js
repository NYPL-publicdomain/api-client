var H = require('highland')
var request = require('request')

var getRequestOptions = function (path, token) {
  var url = 'http://api.repo.nypl.org/api/v1/' + path
  var auth = 'Token token="' + token + '"'

  return {
    url: url,
    headers: {
      Authorization: auth
    }
  }
}

var getCapturesRequestOptions = function (uuid, token, perPage, page) {
  var path = 'items/' + uuid + '.json?withTitles=yes&per_page=' + perPage + '&page=' + page
  return getRequestOptions(path, token)
}

var getMODSRequestOptions = function (uuid, token) {
  return getRequestOptions('items/mods_captures/' + uuid, token)
}

var getUuidForLocalIdentifierOptions = function (fieldName, value, token) {
  return getRequestOptions('items/' + fieldName + '/' + value, token)
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
    streams.push(getCapturesRequestOptions(uuid, token, perPage, page))
  }

  return streams.map(function (options) {
    return requestStream(options)
  })
}

var getCaptures = function (body) {
  return body.nyplAPI.response.capture
}

var checkUuid = function (options) {
  if (!options.uuid) {
    throw new Error('Please supply a UUID in options.uuid')
  }

  return options.uuid
}

var checkToken = function (options) {
  var token = options.token || process.env.DIGITAL_COLLECTIONS_TOKEN

  if (!token) {
    throw new Error('Please supply an API token in options.token, or set the DIGITAL_COLLECTIONS_TOKEN environment variable')
  }

  return token
}

/**
 * Returns a stream of capture objects
 * @param {Object} options
 * @param {String} options.uuid UUID of a Collection, Sub-container or Item
 * @param {String} [options.token] Digital Collections API access token
 * @param {number} [options.perPage=50] items per page, higher means less requests. Max. 500
 */
module.exports.captures = function (options) {
  var uuid = checkUuid(options)
  var token = checkToken(options)

  if (options.perPage && options.perPage > 500 || options.perPage < 1) {
    throw new Error('options.perPage should be between 1 and 500')
  }

  var perPage = options.perPage || 100

  return requestStream(getCapturesRequestOptions(uuid, token, 1, 1))
    .map(function (body) {
      return body.nyplAPI.request.totalPages
    })
    .map(H.curry(getPageStreams, uuid, token, perPage))
    .flatten()
    .map(getCaptures)
    .flatten()
}

/**
 * Returns MODS records for capture
 * @param {Object} options
 * @param {String} options.uuid UUID of an Item
 * @param {String} [options.token] Digital Collections API access token
 */
module.exports.mods = function (options, callback) {
  let uuid
  let token

  try {
    uuid = checkUuid(options)
    token = checkToken(options)
  } catch (err) {
    callback(err)
    return
  }

  request(getMODSRequestOptions(uuid, token), (error, response, body) => {
    if (error) {
      callback(error)
      return
    }

    var parsedBody
    try {
      parsedBody = JSON.parse(body)
    } catch (parseError) {
      callback(parseError)
      return
    }

    if (parsedBody && parsedBody.nyplAPI && parsedBody.nyplAPI.response && parsedBody.nyplAPI.response.mods) {
      callback(null, parsedBody.nyplAPI.response.mods)
    } else {
      callback()
    }
  })
}

/**
 * Returns UUID for local identifier
 * @param {Object} options
 * @param {String} options.fieldName a valid local identifier.
 * @param {String} options.value value of local identifier
 * @param {String} [options.token] Digital Collections API access token
 */
module.exports.uuidForLocalIdentifier = function (options, callback) {
  let token
  try {
    token = checkToken(options)
  } catch (err) {
    callback(err)
    return
  }

  const fieldName = options.fieldName
  const value = options.value

  request(getUuidForLocalIdentifierOptions(fieldName, value, token), (error, response, body) => {
    if (error) {
      callback(error)
      return
    }

    let parsedBody
    try {
      parsedBody = JSON.parse(body)
    } catch (parseError) {
      callback(parseError)
      return
    }

    if (parsedBody && parsedBody.nyplAPI && parsedBody.nyplAPI.response) {
      callback(null, parsedBody.nyplAPI.response.uuid)
    } else {
      callback()
    }
  })
}
