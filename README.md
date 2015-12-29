# NYPL Digital Collections API client and JavaScript module

A command line interface and Node.js module for [The New York Public Library Digital Collections API](http://api.repo.nypl.org/), which allows you to conveniently download all captures for a Digital Collections item or collection UUID.

A valid API access token is needed to use this utility: http://api.repo.nypl.org/.

__Warning__: some Digital Collections items or collections contain __a lot__ of captures. This tool will automatically use the API's pagination to download them all (50 per page, by default). Be careful, or you'll quickly hit your rate limit!

## Standalone usage

Installation:

    npm install -g digital-collections

Usage:

    digital-collections -t API_TOKEN -s 439afdd0-c62b-012f-66d1-58d385a7bc34

The result is a JSON stream containing __all__ [captures](http://api.repo.nypl.org/#api_method_1_doc) for a given UUID.

## Node.js module

Installation:

    npm install digital-collections

Usage:

```js
var digitalCollections = require('digital-collections')

var options = {
  uuid: '439afdd0-c62b-012f-66d1-58d385a7bc34',
  token: 'abcdefghijk'
}

digitalCollections.captures(options)
  .on('data', function(data) {
    // the captures function returns a stream with all the UUID's
    // captures as JavaScript objects
    console.log(data)
  })
```

# API

## captures

Returns a stream of capture objects

**Parameters**

-   `options` **Object**
    -   `options.uuid` **String** UUID of Digital Collection item or collection
    -   `options.token` **String** Digital Collections API access token
    -   `options.perPage` **[number]** items per page, higher means less requests. Max. 500 (optional, default `50`)
