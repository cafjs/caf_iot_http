# Caf.js

Co-design cloud assistants with your web app and IoT devices.

See https://www.cafjs.com

## IoT Library for HTTP-based Services

A library to access external http services

It runs in the device not in the cloud.

## API

    lib/proxy_iot_http.js

## Configuration Example

### iot.json

```
    {
            "module": "caf_iot_http#plug_iot",
            "name": "http",
            "description": "Access external http services.",
            "env" : {
                "maxRetries" : "$._.env.maxRetries",
                "retryDelay" : "$._.env.retryDelay",
                "cloudSync" : "process.env.CLOUD_SYNC||false"
            },
            "components" : [
                {
                    "module": "caf_iot_http#proxy_iot",
                    "name": "proxy",
                    "description": "Proxy to access external http services",
                    "env" : {
                    }
                }
            ]
    }
```

where `cloudSync` set to `false` avoids a cloud roundtrip while processing http
stream events.
