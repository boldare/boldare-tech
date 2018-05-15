---
title: How does Slack talk to Spotify?
subTitle: A couple of findings from a curious developer
tags: ["Slack", "Spotify", "HTTP", "port 4381"]
cover: spotify_slack.png
postAuthor: Maciej Papież
---

# How it all started
We're using Slack extensively here at @xsolve, it seems that everyone does. Recently,
I've noticed that if you paste a Spotify link to Slack, it gets converted to a Spotify
widget. What's more, you can control your fully-local, desktop Spotify app from there!
How come?! Let me show you the steps that I took in order to find the true answer.

# Take the wrong path
A fellow suggested that the Spotify widget in Slack exploits the concept of custom
protocol handlers (see [here](https://www.google.pl/search?q=web+protocol+handler)).

Let's check it then! I've found an example of Spotify-protocol string (spotify://track:2wXBasaRrlX9gRTV5qPAbb),
typed it into Firefox address bar and... it launched a second Spotify application.
It didn't connect with already running instance at all, just spawned a new one.

That's not what I was looking for!

# Find the widget
Another fellow suggested that it might be useful to play around with Spotify's [play button](https://developer.spotify.com/technologies/widgets/spotify-play-button/),
which could potentially work similarly as Slack's widget (they indeed look similar).

I've found a demo button [here](https://beta.developer.spotify.com/documentation/widgets/generate/play-button/)
and verified that it is also able to control the running desktop application! Hey,
we're in a normal browser here, so let's launch developer tools!

After you play Carly Rae Jepsen's _Run Away With Me_, you can notice a couple of entries
in the network log! Hooray!

![Interesting items in the network log](./connections.png)

What's the `127.0.0.1:4381` host? Let's take a closer look at one of the requests :)

![More details on the request](./single_request.png)

As you may have noticed, this request is received by the local Spotify webserver.
More precisely:
- the app exposes HTTP port 4381,
- request path is `/play.json`,
- request parameters contain data about the song/album to be launched and some
additional security-related parameters (CSRF, oauth).

We found it!

# More info to extract

If you were curious about the data the app returns to the widget, take a look at
this JSON snippet.

```JSON
{
  "version": 9,
  "client_version": "1.0.72.117.g6bd7cc73",
  "playing": true,
  "shuffle": true,
  "repeat": false,
  "play_enabled": true,
  "prev_enabled": false,
  "next_enabled": true,
  "track": {
    "track_resource": {
      "name": "Gimmie Love",
      "uri": "spotify:track:7EuqHdQIytRDtD0eYo98Cg",
      "location": {
        "og": "https://open.spotify.com/track/7EuqHdQIytRDtD0eYo98Cg"
      }
    },
    "artist_resource": {
      "name": "Carly Rae Jepsen",
      "uri": "spotify:artist:6sFIWsNpZYqfjUpaCgueju",
      "location": {
        "og": "https://open.spotify.com/artist/6sFIWsNpZYqfjUpaCgueju"
      }
    },
    "album_resource": {
      "name": "Emotion (Deluxe)",
      "uri": "spotify:album:1DFixLWuPkv3KT3TnV35m3",
      "location": {
        "og": "https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3"
      }
    },
    "length": 202,
    "track_type": "normal"
  },
  "context": {},
  "playing_position": 0.538,
  "server_time": 1522760080,
  "volume": 0.60999465,
  "online": true,
  "open_graph_state": {
    "private_session": false
  },
  "running": true
}
```

There's a multitude of interesting data, such as the track we've been currently listening,
volume set, some player settings and the version of the application.

I hope you liked this quick investigation!
