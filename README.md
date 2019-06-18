# Trello-Board-Monitoring

 **Note** : The loop of requesting cards : 1mn

## Getting Started

### Prerequisites

**Getting Application Key and User Token**
Before you use these system, please go to https://trello.com/app-key and get the application key and user token.

**Note**: APPLICATION_KEY, USER_TOKEN, MEMBER_ID, BOARD_ID will be passed into the function as a [!string][1]

### Inside .env file

APP_KEY=[!string][1]
USR_TOKEN=[!string][1]
MB_ID=[!string][1]
BOARD_ID=[!string][1]


You also need :
  -**Trello**
  -**dotEnv**
  -**neDB**
  -**cron**

**Getting Board_ID and Card_ID**

![board_id](https://user-images.githubusercontent.com/45678324/59160759-db2f8c80-8b03-11e9-830c-4df00f8de105.png)
Board_ID was underlined

![card_id](https://user-images.githubusercontent.com/45678324/59160763-dcf95000-8b03-11e9-9861-6fbec55bee20.png)
Card_ID was underlined

### Installing

```
npm install
```

## Running the tests

For Example:

```bash
node index.js
```


### And coding style tests

```bash
semistandard --fix
```
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

## Built With

* [NodeJS](https://nodejs.org/en/)

## Authors

* **Hun Vikran** 

[1]:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String