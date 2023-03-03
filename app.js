/**
 * Name: Isaac Xu, Jieyi Xu
 * Date: December 5, 2021
 * Section: CSE 154 AE
 *
 * This is the app.js of final project
 * that implements to help build the
 * functionality, like transcation or
 * search product, of pokezon website
 */
"use strict";

const express = require("express");
const app = express();
const multer = require("multer");
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const INVALID_PARAM_ERROR = 400;
const INVALID_PARAM_ERROR_MSG = 'Missing one or more of the required params.';
const SERVER_ERROR = 500;
const SERVER_ERROR_MSG = 'An error occurred on the server. Try again later.';
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const codeLength = 6;
const cookieParser = require('cookie-parser');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());
app.use(cookieParser());

/**
 * This endpoint handles the get request from user
 * by sending them information of products. If the
 * user request a specific production, it will only
 * return data of that product
 */
app.get('/pokezon/pokemon', async function(req, res) {
  try {
    let search = req.query['search'];
    let db = await getDBConnection();
    if (search === undefined) {
      let string = 'SELECT * FROM product;';
      let results = await db.all(string);
      await db.close();
      res.type('json').send(results);
    } else {
      let string = 'SELECT * FROM product WHERE pokemon_name LIKE ?' +
                    'OR move1 LIKE ? OR move2 LIKE ? OR move3 LIKE ?' +
                    'OR move4 LIKE ?;';
      let param = '%' + search + '%';
      let results = await db.all(string, [param, param, param, param, param]);
      await db.close();
      res.type('json').send(results);
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * This endpoint handles the get request from the user by sending
 * them data of the product they selected.
 */
app.get('/pokezon/product/:id', async function(req, res) {
  try {
    let productID = req.params.id;
    let string = "SELECT * FROM product WHERE ID = ?;";
    let db = await getDBConnection();
    let results = await db.get(string, productID);
    await db.close();
    if (results.length === 0) {
      res.type('text');
      res.status(INVALID_PARAM_ERROR).send("The given product does not exist!");
    } else {
      res.type('json').send(results);
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * This endpoint handles the get request from the user by
 * sending them data of products that matches their given
 * condition
 */
app.get('/pokezon/filter/:type', async function(req, res) {
  try {
    let type = req.params.type;
    let string = "SELECT * FROM product WHERE type = ?;";
    let db = await getDBConnection();
    let results = await db.all(string, type);
    await db.close();
    if (results.length === 0) {
      res.type('text');
      res.status(INVALID_PARAM_ERROR).send('We do not sell this type of pokemon!');
    } else {
      res.type('json').send(results);
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * This endpoint would handle get request from the user
 * by sending them data about feedback of the given item
 */
app.get('/pokezon/allfeedback/:id', async function(req, res) {
  try {
    let id = req.params.id;
    let avgScore = await getAvg(id);
    let reviews = await getReviews(id);
    let result = {};
    result['avg_score'] = avgScore;
    result['reviews'] = reviews;
    res.type('json').send(result);
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * This endpoint would handle the post request from
 * the user by handling their new transcation
 */
app.post('/pokezon/prevtranscations', async function(req, res) {
  try {
    res.type('text');
    let id = req.cookies['sessionid'];
    if (id) {
      let user = req.body.userId;
      if (!user) {
        res.status(INVALID_PARAM_ERROR).send(INVALID_PARAM_ERROR_MSG);
      } else {
        let string = "SELECT transcation_id, username, item_id " +
                     "FROM transcation, user WHERE " +
                     "user.ID = ?;";
        let db = await getDBConnection();
        let results = await db.all(string, user);
        await db.close();
        res.type('json').send(results);
      }
    } else {
      res.type('text');
      res.send('user has logged out');
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * This endpoint would help process user's login
 * request. This endpoint is borrow from the section slides
 */
app.post('/pokezon/login', async function(req, res) {
  try {
    let username = req.body.username;
    let password = req.body.password;
    res.type('text');
    if (!username || !password) {
      res.status(INVALID_PARAM_ERROR).send(INVALID_PARAM_ERROR_MSG);
    } else if (!(await checkCredentials(username, password))) {
      res.status(INVALID_PARAM_ERROR).send('Invalid credentials.');
    } else {
      let id = await getSessionId();
      await setSessionId(id, username);
      res.cookie('sessionid', id, {expires: new Date(Date.now() + 180 * 60 * 1000)});
      let user = await getUserId(username);
      res.type('json').send(user);
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * Logs a user out by expiring their cookie.
 * This endpoint is borrowed from the last section
 * slides
 */
app.post('/logout', function(req, res) {
  res.type('text');
  let id = req.cookies['sessionid'];
  if (id) {
    res.clearCookie('sessionid');
    res.send('Successfully logged out!');
  } else {
    res.send('Already logged out.');
  }
});

/**
 * This endpoint would handle the transaction made by the
 * user
 */
app.post('/pokezon/transcation', async function(req, res) {
  try {
    res.type('text');
    let data = userData(req.body.id, req.body.amount, req.body.balance, req.body.username);
    if (!data.id || !data.amount || !data.balance || !data.username) {
      res.status(INVALID_PARAM_ERROR).send(INVALID_PARAM_ERROR_MSG);
    } else {
      let cookieId = req.cookies['sessionid'];
      if (cookieId) {
        let result = await getProduct(data.id);
        if (result.length === 0) {
          res.status(INVALID_PARAM_ERROR).send('product does not exist!');
        } else {
          if ((data.balance - result.price) > 0) {
            await updateDB(data.balance - result.price, data.amount - 1, data.username, data.id);
            let code = await genCode(data.id, data.username);
            res.send(code);
          } else {
            res.status(INVALID_PARAM_ERROR).send('Not enough balance!');
          }
        }
      } else {
        res.send('user has to be logged in!');
      }
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * This endpoint would handle the user's post request by
 * sending them their current balance
 */
app.post('/pokezon/balance', async function(req, res) {
  try {
    res.type('text');
    let id = req.body.userId;
    if (!id) {
      res.status(INVALID_PARAM_ERROR).send(INVALID_PARAM_ERROR_MSG);
    } else {
      let cookieId = req.cookies['sessionid'];
      if (cookieId) {
        let string = "SELECT balance from user WHERE ID = ?;";
        let db = await getDBConnection();
        let result = await db.get(string, id);
        await db.close();
        res.type('json').send(result);
      } else {
        res.send('user has to be logged in!');
      }
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * This endpoint would help create a new user
 */
app.post('/pokezon/newuser', async function(req, res) {
  try {
    let username = req.body.username;
    let password = req.body.password;
    if (!username || !password) {
      res.type('text');
      res.status(INVALID_PARAM_ERROR).send(INVALID_PARAM_ERROR_MSG);
    } else {
      let db = await getDBConnection();
      let string = 'INSERT INTO user (username, password, balance) VALUES (?, ?, 100)';
      await db.run(string, [username, password]);
      await db.close();
      res.type('text');
      res.send('successfully added');
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * This endpoint would handle the post request of user's latest feedback
 * to a certain product
 */
app.post('/feedback', async function(req, res) {
  try {
    res.type('text');
    let productID = req.body.productId;
    let score = req.body.score;
    let review = req.body.review;
    if (!score || !review || !productID) {
      res.status(INVALID_PARAM_ERROR).send(INVALID_PARAM_ERROR_MSG);
    } else {
      if (req.cookies['sessionid']) {
        let string = "SELECT * from feedback WHERE product_id = ?;";
        let db = await getDBConnection();
        let result = await db.all(string, productID);
        await db.close();
        if (result.length === 0) {
          await addNew(productID, score);
        } else {
          await updateFeedback(productID, score);
        }
        await addReviews(review, productID);
        res.send('success!');
      } else {
        res.send("please log in");
      }
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * Sets the session id in the database to the given one for the given user.
 * This helper function is borrowed from the section slides
 * @param {string} id - The Session id to set
 * @param {string} user - The username of the person to set the id for
 */
async function setSessionId(id, user) {
  let query = 'UPDATE user SET sessionid = ? WHERE username = ?';
  let db = await getDBConnection();
  await db.all(query, [id, user]);
  await db.close();
}

/**
 * This function would merge multiple userdata
 * @param {Integer} id userid
 * @param {Integer} amount amount of the product in stock
 * @param {Integer} balance user's current balance
 * @param {String} username represents the username
 * @returns {JSONObject} a json object contains user data
 */
function userData(id, amount, balance, username) {
  let data = {};
  data['id'] = id;
  data['amount'] = amount;
  data['balance'] = balance;
  data['username'] = username;
  return data;
}

/**
 * This function would take in the username and return the
 * user data
 * @param {string} username represents the username of the user
 * @returns {JSONObject} a json object that has the usernam and id
 */
async function getUserId(username) {
  let query = 'SELECT ID FROM user WHERE username = ?;';
  let db = await getDBConnection();
  let results = await db.get(query, username);
  await db.close();
  let user = {};
  user['id'] = results.ID;
  user['name'] = username;
  return user;
}

/**
 * This function would check if the user's login data is valid or not
 * @param {string} user - The username to check
 * @param {string} pass - The password to check
 * @returns {boolean} - True if the credentials match for a user, false otherwise.
 */
async function checkCredentials(user, pass) {
  let query = 'SELECT username FROM user WHERE username = ? AND password = ?;';
  let db = await getDBConnection();
  let results = await db.all(query, [user, pass]);
  await db.close();
  return (results.length > 0);
}

/**
 * This function would take in the given product and return
 * the average score of that product to users
 * @param {integer} id represents the product
 * @returns {integer/string} if the given product is not on
 * the database the string "no score" would be returned or
 * return the average score of the item the otherwise
 */
async function getAvg(id) {
  let string = "SELECT avg_score FROM feedback WHERE product_id = ?";
  let db = await getDBConnection();
  let result = await db.get(string, id);
  await db.close();
  if (result === undefined) {
    return "no score";
  }
  return result.avg_score;
}

/**
 * The function would take in the given product and
 * return the reviews of that product
 * @param {Integer} id represents the product
 * @returns {JSONList/String} if the given product does
 * not exist in the database, the string "no review" would
 * be returned or the list of review would be returned the
 * otherwise
 */
async function getReviews(id) {
  let string = "SELECT review FROM text_review WHERE product_id = ?";
  let db = await getDBConnection();
  let result = await db.all(string, id);
  await db.close();
  if (result.length === 0) {
    return "no review";
  }
  return result;
}

/**
 * This function would help add a new feedback to the database
 * @param {Integer} productID represents the product id
 * @param {Integer} score the score of the product
 */
async function addNew(productID, score) {
  let string = 'INSERT INTO feedback(product_id, counts, avg_score) VALUES (?, 1, ?);';
  let db = await getDBConnection();
  await db.all(string, [productID, score]);
  await db.close();
}

/**
 * This function would help get the given product's feedback
 * @param {Integer} productID represents the product id
 * @returns {JSONObject} a json object that includes the feedback data
 */
async function getData(productID) {
  let string = 'SELECT * FROM feedback WHERE product_id = ?;';
  let db = await getDBConnection();
  let result = await db.get(string, productID);
  await db.close();
  return result;
}

/**
 * This function would help update the feedback of the product
 * @param {Integer} productID represents the product id
 * @param {Integer} score the score of the product
 */
async function updateFeedback(productID, score) {
  let data = await getData(productID);
  let count = data.counts + 1;
  let avgScore = data.avg_score;
  let totalScore = count * avgScore;
  let newAvg = (totalScore + score) / (count + 1);
  newAvg = newAvg.toFixed(1);
  let string = 'UPDATE feedback SET counts = ?, avg_score = ? WHERE product_id = ?;';
  let db = await getDBConnection();
  await db.get(string, [count, newAvg, productID]);
  await db.close();
}

/**
 * This function would help add a new review of the product to
 * the database
 * @param {String} review the review of the product
 * @param {Integer} id represents the product id
 */
async function addReviews(review, id) {
  let string = 'INSERT INTO text_review(product_id, review) VALUES (?, ?);';
  let db = await getDBConnection();
  await db.all(string, [id, review]);
  await db.close();
}

/**
 * this function would get and return the given product
 * data
 * @param {Integer} id represents the product id
 * @returns {JSONObject} a json object that includes the product data
 */
async function getProduct(id) {
  let string = "SELECT * from product WHERE ID = ?;";
  let db = await getDBConnection();
  let results = db.get(string, id);
  await db.close();
  return results;
}

/**
 * This function would help update the data base after
 * the user made a new transaction
 * @param {integer} newBalance the new balance of the user
 * @param {integer} amount the amount of the product left
 * @param {String} username the user's username
 * @param {integer} id the product's id
 */
async function updateDB(newBalance, amount, username, id) {
  await updateUser(username, newBalance);
  await updateProduct(amount, id);
}

/**
 * This function would help update user's data
 * after a new transaction
 * @param {String} username the user's username
 * @param {integer} newBalance the new balance of the user
 */
async function updateUser(username, newBalance) {
  let string = "UPDATE user SET balance = ? WHERE username = ?;";
  let db = await getDBConnection();
  await db.get(string, [newBalance, username]);
  await db.close();
}

/**
 * This function would help update the product data after
 * a new transaction
 * @param {integer} amount the amount of the product left
 * @param {integer} id the product's id
 */
async function updateProduct(amount, id) {
  let string = "UPDATE product SET amount = ? WHERE id = ?;";
  let db = await getDBConnection();
  await db.all(string, [amount, id]);
  await db.close();
}

/**
 * This function would help generate a new transaction code
 * for the new transaction
 * @param {Integer} id the products id
 * @param {String} username the user's username
 * @returns {string} the comfirmation code of the new product
 */
async function genCode(id, username) {
  let result = '';
  for (let i = 0; i < codeLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  let string = "INSERT INTO transcation (transcation_id, item_id, buyer_name) VALUES (?, ?, ?);";
  let db = await getDBConnection();
  await db.get(string, [result, id, username]);
  await db.close();
  return result;
}

/**
 * This function would create the connection
 * to the sql database that contains information
 * of all user's yips
 * @returns {sqliteDatabase} the connection of sql database
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'ecommerce.db',
    driver: sqlite3.Database
  });
  return db;
}

/**
 * Generates an unused sessionid and returns it to the user.
 * @returns {string} - The random session id.
 */
async function getSessionId() {
  let query = 'SELECT sessionid FROM user WHERE sessionid = ?';
  let id;
  let db = await getDBConnection();
  do {
    id = Math.random().toString(36)
      .substring(2, 15) + Math.random().toString(36)
      .substring(2, 15);
  } while (((await db.all(query, id)).length) > 0);
  await db.close();
  return id;
}

app.use(express.static('public'));
const PORT = process.env.PORT || 8080;
app.listen(PORT);
