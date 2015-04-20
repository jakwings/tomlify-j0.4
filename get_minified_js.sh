#!/usr/bin/env bash

API=https://closure-compiler.appspot.com/compile
INPUT=tomlify.js
OUTPUT=dist/tomlify.min.js

#curl -s "$API" \
#    -d "compilation_level=SIMPLE_OPTIMIZATIONS" \
#    -d "output_format=text" \
#    -d "output_info=compiled_code" \
#    -d "language=ECMASCRIPT5_STRICT" \
#    --data-urlencode "js_code@$INPUT" \
#    -o "$OUTPUT"
#sed -i "1s/^\('use strict';\)\([^{]*\){/;\2{\1/" "$OUTPUT"

curl -s "$API" \
    -d "compilation_level=ADVANCED_OPTIMIZATIONS" \
    -d "js_externs=window;global;self;module.exports;define.amd;function tomlify(table, replace, space){};tomlify.toKey;tomlify.toValue;" \
    -d "output_format=text" \
    -d "output_info=compiled_code" \
    -d "language=ECMASCRIPT5_STRICT" \
    --data-urlencode "js_code@$INPUT" \
    -o "$OUTPUT"
sed -i "1s/^\('use strict';\)\([^{]*\){/;\2{\1/" "$OUTPUT"
