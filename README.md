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

Since, we remove mediaInfo in favor of ffprobe, you should be able to use the package as is. We use @ffprobe-installer/ffprobe to install ffprobe with the correct binary. If you encounter some difficulies, make sure ffmpeg is installed.

Use `npm i` to install dependencies.

## ⚙ Configuration

The settings follow [standard-settings](https://github.com/soixantecircuits/standard-settings) format. You can change them to fit your needs:

```
{
  "server":{
    "port": 36400
  },
  "service": {
    "spacebro": {
      "host": "spacebro.space",
      "port": 3333,
      "client": {
        "name": "chokibro",
        "description": "Tool to watch a folder and send new media added in folder",
				"out": {
					"outMedia": {
						"eventName": "outMedia",
						"description": "New media added in folder tracked by chokibro",
						"type": "all"
					},
					"unlinkMedia": {
						"eventName": "unlink-media",
						"description": "Media removed in folder tracked by chokibro",
						"type": "all"
					}
        }
      },
      "channelName": "info-stream"
    }
  },
  "folder": "./assets",
  "checkIntegrity": false,
}
```

## 👋 Usage

1. Start spacebro in a terminal window: `spacebro`

2. Start chokibro: `npm run start`

By default, chokibro is listening for the assets folder and exposes it over a static file server at the ipv4 available address on the `6161` port.

3. Drag and drop a file into the assets folder. See how spacebro reports the event.


## 📦 Dependencies

- chokidar
- finalhandler
- ip
- ffprobe
- portfinder
- serve-static
- spacebro-client
- standard-settings

## 🕳 Troubleshooting

All the help you can provide to avoid falling in a trap or a black hole.

## ❤️ Contribute

Explain how to contribute to the project
