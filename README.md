# node-red-contrib-interval-switch Readme

This package provides a node emits messages periodically. The interval can be switched on or off.

## Possible Input Payloads

- `"start"` | `"on"` | `"1"` | `1` | `"true"` | `true` is a start signal
- `"stop"` | `"off"` | `"0"` | `0` | `"false"` | `false` is a stop signal
- `"toggle"` is either a start or a stop signal depending on the current state

## Configuration

- `duration`: time in seconds between output signals
- `payload`: value that is put into payload of output-signals (an empty object by default)
- `counterPath`: a property path in msg where the iteration counter should be stored (potentially modifying/overwriting the payload configured above)
- `immediate`: boolean that specifies, if the first output-signal will be emitted right upon starting or after a first "duration" period.
