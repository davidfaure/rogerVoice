
# Rogervoice Technical test

Create a small React app that allows to communicate over SIP and WebRTC.


## IMPORTANT

Please note that I've made this test in 2 sections.

**Master branch:** Basic react App with SIP account, JsSIP, WebRTC for audio call and video call.
**Develop branch:** React app with WebRTC and socket.io, video & audio call, chat app.
# Master Branch

On master branch I've used JsSIP and WebRTC to realize the test.
## Installation

Clone the project

```bash
git clone https://github.com/davidfaure/rogerVoice
```

Go to the project directory

```bash
cd rogerVoice
```

Install dependencies

```bash
npm install
```

Start the server

```bash
npm start
```
    
## Tech Stack

**Client:** React, JsSIP, WebRTC


## Develop Branch

On develop branch I've used socket.io and WebRTC to realize the test.
## Installation

Clone the project if not already done

```bash
git clone https://github.com/davidfaure/rogerVoice
```

Go to the project directory

```bash
cd rogerVoice
```

Pull the develop branch

```bash
git pull
```

Go to the develop branch

```bash
git checkout develop
```

Install dependencies

```bash
npm install
```

Start the server and the client at same time

```bash
npm run dev
```

if it's not working :

Open a first terminal tab and run :

```bash
npm run serverNode
```

Open a second terminal tab and run :

```bash
npm start
```
## Tech

**Client:** React, socket.io, WebRTC

**Server:** nodeJs, socket.io

**Test:** Jest
## Running Tests

To run tests, run the following command

```bash
  npm run test
```


## Authors

David Faure - [Portfolio](https://davidfaure.io/)

David Faure - [GitHub](https://github.com/davidfaure/)

