# Chokibro

Chokidar uses `spacebro` to trigger `new-media` event when a file is discover in a folder he watch.

Useful to automatically:
  - upload media to a remote service
  - create automated post-production process
  - listen for file uploads on a ftp folder
  - anything a bot could be good at

## Installation

On Linux, you'll need to :

```
sudo apt-get install avahi-daemon avahi-discover libnss-mdns libavahi-compat-libdnssd-dev curl build-essential mediainfo
```

On OSX, you will :

`brew install mediainfo`

## Usage

1. Start spacebro in a terminal window: `spacebro`

2. Start chokibro: `yarn start`

By default, chokibro is listening for the current folder and exposes it over a static file server at the ipv4 available address on the `6161` port.

3. Drag and drop a file into the folder you watch. See how spacebro reports the event.
