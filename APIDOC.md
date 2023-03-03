# pokezon API documentation
The pokezon API provides information about product data, user data, or
transaction data to users and be able to handle different events based
on the incoming request

# get all products data or a specific one

**Request Format** /pokezon/pokemon

**Query Parameter:** search(optional)

**Request Type:** GET

**Returned Data Format:** JSON Array

**Description:** Return data of every product if the optional search
parameter is not included or specific product data based on the search
keyword. The search will be based on pokemon_name, move1, move2, move3,
and move4 columns.

**Example Request:** /pokezon/pokemon or /pokezon/pokemon?search=ps

**Example Response:**
```json array
[
  {
    "ID": 2,
    "pokemon_name": "Greninja",
    "move1": "Spike",
    "move2": "Toxic Spike",
    "move3": "Taunt",
    "move4": "Ice Beam",
    "shiny": "T",
    "type": "Dragon",
    "amount": 83,
    "price": 5
  },
  {
    "ID": 3,
    "pokemon_name": "Lucario",
    "move1": "Sword Dance",
    "move2": "Meteor Smash",
    "move3": "Close Combat",
    "move4": "Bullet Punch",
    "shiny": "T",
    "type": "Iron",
    "amount": 3,
    "price": 5
  },
  ...
]
```
or
```json array
[
  {
    "ID": 9,
    "pokemon_name": "Gardevoir",
    "move1": "Psyshock",
    "move2": "Moonblast",
    "move3": "Will-O-Wisp",
    "move4": "Healing Wish",
    "shiny": "T",
    "type": "Psychic",
    "amount": 0,
    "price": 5
  },
  {
    "ID": 24,
    "pokemon_name": "Mewtwo",
    "move1": "Psystrike",
    "move2": "Ice Beam",
    "move3": "Fire Blast",
    "move4": "Nasty Plot",
    "shiny": "T",
    "type": "Psychic",
    "amount": 2,
    "price": 10
  }
]
```

**Error Handling**
- Possible 500(server error) errors (all in plain text):
    - if the server unable to return the data of product, the error message
`An error occurred on the server. Try again later.` instead

# get a specific product

**Request Format:** /pokezon/product/:id

**Query Parameter:** none

**Request Type:** GET

**Returned Data Format:** JSON

**Description:** returns a JSON of the product data

**Example Request:** /pokezon/product/2

**Example Response:**
```json
{
  "ID": 2,
  "pokemon_name": "Greninja",
  "move1": "Spike",
  "move2": "Toxic Spike",
  "move3": "Taunt",
  "move4": "Ice Beam",
  "shiny": "T",
  "type": "Dragon",
  "amount": 83,
  "price": 5
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - if the product passed in is not existed, returns the error with the message:
  `The given product does not exist!`
- Possible 500 (server error) errors (all plain text):
  - If the server is unable to return the information about the product data, returns the error message: `An error occurred on the server. Try again later.` instead

# get a pokemon of a certain type

**Request Format:** /pokezon/filter/:type

**Query Parameter:** none

**Request Type:** GET

**Returned Data Format:** JSON Arrary

**Description:** returns data of pokemon that have the same type

**Example Request:** /pokezon/filter/Grass

**Example Response:**
```json array
[
  {
    "ID": 14,
    "pokemon_name": "Bulbasaur",
    "move1": "Razor Leaf",
    "move2": "Seed Bomb",
    "move3": "Sunny Day",
    "move4": "Toxic",
    "shiny": "T",
    "type": "Grass",
    "amount": 2,
    "price": 5
  }
]
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - if the product passed in is not existed, returns the error with the message:
  `We do not sell this type of pokemon!`
- Possible 500 (server error) errors (all plain text):
  - If the server is unable to return the information about the product data, returns the error message: `An error occurred on the server. Try again later.` instead

# get all feedbacks of a certain product

**Request Format:** /pokezon/allfeedback/:id

**Query Parameter:** none

**Request Type:** GET

**Returned Data Format:** JSON

**Description:** send user the feedback data of the product

**Example Request:** /pokezon/allfeedback/2

**Example Response:**
```json
{
  "avg_score": 1.51,
  "reviews": [
    {
      "review": "good item"
    },
    {
      "review": "haha"
    },
    {
      "review": "haha"
    },
    {
      "review": "wrerw234"
    },
    {
      "review": "haha"
    },
    {
      "review": "654"
    },
    {
      "review": "wrerw234"
    },
    {
      "review": "haha"
    },
    {
      "review": "haha"
    },
    {
      "review": "haha"
    }
  ]
}
```
**Error Handling:**
- Possible 500 (server error) errors (all plain text):
  - If the server is unable to return the review data, returns the error message: `An error occurred on the server. Try again later.` instead


# Get previous transactions

**Request Format:** /pokezon/prevtranscations endpoint with POST parameter user id

**Request Type:** POST

**Returned Data Format:** json

**Description:** Given a valid `userId` to send, the previous transactions
of the user would be returned

**Example Request:** /pokezon/prevtranscations

**Example Response:**
```json
[
  {
    "transcation_id": "dwLlZV",
    "username": "me",
    "item_id": 2
  },
  {
    "transcation_id": "weYpjE",
    "username": "me",
    "item_id": 2
  },
  {
    "transcation_id": "nIqF0H",
    "username": "me",
    "item_id": 6
  },
  ...
]
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - if missing the id, returns the error with the message:
  `Missing one or more of the required params.`
- Possible 500 (server error) errors (all plain text):
  - If the server is unable to return the information about the previous transaction data, returns the error message: `An error occurred on the server. Try again later.` instead


# login user

**Request Format:** /pokezon/login with POST parameter username and password

**Request Type:** POST

**Return Data Format:** json

**Description:** given a valid `username` and `password` to send, the user information would be returned

**Example Request:** /pokezon/login

**Example Response:**
{
  "id": 1,
  "name": "Isaac"
}

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - if missing the username or passward, returns the error with the message:
  `Missing one or more of the required params.`
- Possible 400 (invalid request) errors (all plain text):
  - if the given username or password is invalid, returns the error with the message:
  `Invalid credentials.`
- Possible 500 (server error) errors (all plain text):
  - If the server is unable to return the information about the user transaction data, returns the error message: `An error occurred on the server. Try again later.` instead


# logout user

**Request Format:** /logout

**Request Type:** POST

**Return Data Format:** Text

**Description:** logout user if the user haven't been logged out

**Example Request:** /logout

**Example Response:**
`Successfully logged out!`


# handle transaction

**Request Format:** /pokezon/transcation

**Request Type:** POST

**Return Data Foramt:** Text

**Description:** give a valid `id`, `amount`, `balance`, and `username` and handle user's transaction.

**Example Request:** /pokezon/transcation

**Example Response:**
`2et3af`

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - if missing the id, amount, balance, or username, returns the error with the message:
  `Missing one or more of the required params.`
- Possible 400 (invalid request) errors (all plain text):
  - if the given id does not exist, returns the error with the message:
  `product does not exist!`
- Possible 500 (server error) errors (all plain text):
  - If the server is unable to return the information about the comfirmation code, returns the error message: `An error occurred on the server. Try again later.` instead


# check current balance

**Request Format:** /pokezon/balance

**Request Type:** POST

**Return Data Format:** json

**Description:** give a valid `userId` to send and return user the their current balance on their accounts

**Example Request:** /pokezon/balance

**Example Response:**
`150`

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - if missing the userId, returns the error with the message:
  `Missing one or more of the required params.`
- Possible 500 (server error) errors (all plain text):
  - If the server is unable to return the information about the balance data, returns the error message: `An error occurred on the server. Try again later.` instead


# create a new user

**Request Format:** /pokezon/newuser

**Request Type:** POST

**Return Data Format:** Text

**Description:** give a valid `username` and `password` to send and return the new user status

**Example Request:** /pokezon/newuser

**Example Response:**
`successfully added`

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - if missing the username or password, returns the error with the message:
  `Missing one or more of the required params.`
- Possible 500 (server error) errors (all plain text):
  - If the server is unable to return the information about the new user status, returns the error message: `An error occurred on the server. Try again later.` instead

# update feedback of a certain product

**Request Format:** /feedback

**Request Type:** POST

**Return Data Format:** Text

**Descirption:** give a valid `productId`, `score`, `review` to send and return the status of the new feedback

**Example Request:** /feedback

**Example Response:**
`success!`

- Possible 400 (invalid request) errors (all plain text):
  - if missing the productId or score, review the error with the message:
  `Missing one or more of the required params.`
- Possible 500 (server error) errors (all plain text):
  - If the server is unable to return the information about the new feedback status, returns the error message: `An error occurred on the server. Try again later.` instead