# NYPL Digital Collections API client and JavaScript module

A command line interface and Node.js module for [The New York Public Library Digital Collections API](http://api.repo.nypl.org/), which allows you to conveniently download all captures for a Digital Collections item or collection UUID.

A valid API access token is needed to use this utility. Visit <http://api.repo.nypl.org/> to sign up.

This module is a work in progress, and currenly only supports one of the Digital Collections API's methods.

Supported methods:

- Return **all** [captures](http://api.repo.nypl.org/#method4) for a given Collection, Sub-container or Item UUID.
- Return MODS records for Item UUID.

**Note**: The API only returns captures with [image links](http://api.repo.nypl.org/#image-links) if the captures are in the public domain.

**Warning**: some Digital Collections items or collections contain **a lot** of captures. This tool will automatically use the API's pagination to download them all (100 per page, by default). Be careful, or you'll quickly hit your rate limit!

## Standalone usage

Installation:

    npm install -g digital-collections

Usage:

    digital-collections -t API_TOKEN -s 439afdd0-c62b-012f-66d1-58d385a7bc34

The result is a JSON stream containing **all** [captures](http://api.repo.nypl.org/#method4) for a given UUID.

Instead of using the `-t` option, you can also set the `DIGITAL_COLLECTIONS_TOKEN` environment variable:

    export DIGITAL_COLLECTIONS_TOKEN=123456abcdef

## Node.js module

Installation:

    npm install digital-collections

Usage:

```js
var digitalCollections = require('digital-collections')

// Instead of using the token option, you can also set the
// `DIGITAL_COLLECTIONS_TOKEN` environment variable
var options = {
  uuid: '439afdd0-c62b-012f-66d1-58d385a7bc34',
  token: '123456abcdef'
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
    -   `options.uuid` **String** UUID of a Collection, Sub-container or Item
    -   `options.token` **[String]** Digital Collections API access token
    -   `options.perPage` **[number]** items per page, higher means less requests. Max. 500 (optional, default `50`)

## mods

Returns MODS records for capture

**Parameters**

-   `options` **Object**
    -   `options.uuid` **String** UUID of an Item
    -   `options.token` **[String]** Digital Collections API access token
-   `callback`  
