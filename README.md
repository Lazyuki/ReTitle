# ReTitle: Browser Extension for Chrome and Firefox

Rename tab titles easily

Get ReTitle on Chrome: https://chrome.google.com/webstore/detail/tab-retitle/hilgambgdpjgljhjdaccadahckpdiapo

Get ReTitle on Firefox: https://addons.mozilla.org/en-US/firefox/addon/tab-retitle/

#### Develop

1. Fork and clone this repo.
1. `npm i`
1. `npm run dev`
1. Load the folder created by webpack `dist_chrome` or `dist_firefox` on your browser (unpacked).

#### Build

1. `npm ci`
1. `npm run build`

#### Deploy

1. Publish the files created in `zip`, `ReTitle-<vesion>.chrome.zip` and `ReTitle-<vesion>.firefox.zip` to the respective extension stores.
