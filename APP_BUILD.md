# Synonym Game App Build

The web game is the source for both the PWA and the native apps. Core game files,
vocabulary data, Firebase browser libraries, and icons are bundled locally so the
game can start without a network connection.

## Refresh native projects

```sh
npm install
npm run sync
```

## Open platform projects

```sh
npm run open:ios
npm run open:android
```

The first account login requires a network connection. After that, game progress,
mistake review data, and leaderboard submissions are stored locally while offline
and synchronized when the connection returns. AI writing help, cloud leaderboard
display, remote notifications, and the first login remain online-only.

Android builds require Java 21. On this development Mac the bundled runtime can be
selected with:

```sh
export JAVA_HOME=/Users/macbook/.local/jdk/jdk-21.0.12.1+1/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
```
