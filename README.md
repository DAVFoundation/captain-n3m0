# Captain n3m0
[![Gitter chat](https://img.shields.io/gitter/room/nwjs/nw.js.svg?style=flat-square)](https://gitter.im/DAVFoundation/DAV-Contributors)
[![license](https://img.shields.io/github/license/DAVFoundation/captain-n3m0.svg?style=flat-square)](https://github.com/DAVFoundation/captain-n3m0/blob/master/LICENSE)

> 🚤 Autonomous boat to DAV network connector

This project lets the [code](https://github.com/DAVFoundation/n3m0) controlling the n3m0 autonomous boat communicate with the DAV network.

![boat pic](https://github.com/DAVFoundation/n3m0/blob/master/20170615_155019-crop.jpg)

## Available routes

### Create need - `/need?key={api_key}`

Send this to initiate a new charging mission. It sends a need to the network. The connector will negotiate with bidders, and sign a contract with one of them. At this point the `status` (see `/status` route) should change from `need_sent` to `ready_to_charge`.

#### Returns:
* The new mission id for the new charging mission.
* HTTP response code must be 200 or else the boat should try again in a few seconds

### Check status - `/status?key={api_key}&mission_id={id}`

Check the status of a mission/need

#### Possible statuses:

* `need_sent`
* `ready_to_charge`
* `charging`
* `charging_complete`

### Ready to charge - `/ready_to_charge?key={api_key}&mission_id={id}`

Send this once the charger is ready to receive a boat for charging.
This will change the status from `need_sent` to `ready_to_charge`.

### arrived at charging - `/begin_charging?key={api_key}&mission_id={id}`

Send this once the boat has arrived at the charging location and is ready to be taken out of the water / plugged in. This will change the status from `ready_to_charge` to `charging`.

### Finish charging - `/finish_charging?key={api_key}&mission_id={id}`

Send this once the charger has completed charging the boat.
This will change the status from `charging` to `charging_complete`.
