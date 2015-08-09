#!/bin/bash
LOG=""
if [ -n "${MICROSERVICES_DEBUG}" ]; then
    node microservices.js &
else
    LOG="--seneca.log.quiet"
    node microservices.js >/dev/null 2>&1 &
fi
MICROSERVICES_PID=$!
trap 'kill $MICROSERVICES_PID' EXIT
sleep 2
for file in `ls test/*.js`; do
    node $file ${LOG} | tap-spec
done
for file in `ls test/microservices/*.js`; do
    node $file ${LOG} | tap-spec
done
