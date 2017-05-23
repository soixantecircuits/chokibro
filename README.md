# Chokibro

Watch a folder on the system and broadcast change event in realtime to the spacebro galaxy. The spacebro server serves on http the media which has been: `add`, `change`, or `delete/unlink`

Super useful to automatically:
  - 🖼 upload media to a remote service
  - 🎥 create automated post-production process
  - 👂 listen for file uploads on a ftp folder
  - 🤖 anything a bot could be good at

It emits a message which looks like this:

```
{
    namespace: String (name-with-dash),
    src: String (URI format),
    path: String (file path)
}
```

## 🌍 Installation

On Linux, you'll need to :

```
sudo apt-get install avahi-daemon avahi-discover libnss-mdns libavahi-compat-libdnssd-dev curl build-essential mediainfo
```

On OSX, you will :

`brew install mediainfo`

Then you can `yarn`.

## ⚙ Configuration

The settings follow [standard-settings](https://github.com/soixantecircuits/standard-settings) format. You can change them to fit your needs:

```
{
  "server":{
    "port": 6161
  },
  "spacebro": {
    "address": "tigre.local",
    "port": 8888,
    "channelName": "media-stream"
  },
  "folder": "./assets"
}
```

## 👋 Usage

1. Start spacebro in a terminal window: `spacebro`

2. Start chokibro: `yarn start`

By default, chokibro is listening for the assets folder and exposes it over a static file server at the ipv4 available address on the `6161` port.

3. Drag and drop a file into the assets folder. See how spacebro reports the event.


## 📦 Dependencies

- chokidar
- finalhandler
- ip
- mediainfo-q
- portfinder
- serve-static
- spacebro-client
- standard-settings

## 🕳 Troubleshooting

All the help you can provide to avoid falling in a trap or a black hole.

## ❤️ Contribute

Explain how to contribute to the project
