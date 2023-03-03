/**
 * Name: Isaac Xu, Jieyi Xu
 * Date: Dec 2
 * Section: CSE 154 AE
 *
 * This is the front end js file that controls the functionality of the webpage.
 * It let users to have ability to login, view items in homepage, purchase the
 * item, review the item, search and filter, and see previous purchase, and create
 * new account
 *
 * source of all pokemon images: https://www.pokemon.com/us/pokedex/:pokemonNameAllLowerCase
 * source of pokemon type icons: https://pngset.com/download-free-png-iafre
 */

"use strict";

(function() {
  let userID;
  const BASE = '/pokezon/';
  window.addEventListener("load", init);

  /**
   * enables all the buttons, underlined elements, and forms on the page
   */
  function init() {
    populateHome();
    id('login').addEventListener('submit', function(value) {
      value.preventDefault();
      login();
    });
    id('prev').addEventListener('click', viewPrev);
    id('back-from-done').addEventListener('click', back);
    id('select-type').addEventListener('click', productFilter);
    id('review-form').addEventListener('submit', function(e) {
      e.preventDefault();
      review();
    });
    id('login-page').querySelector('.u')
      .addEventListener('click', addNewUser);
    id('transaction').querySelector('.u')
      .addEventListener('click', function() {
        id('transaction').classList.add('hidden');
        id('terms-page').classList.remove('hidden');
      });
    id('back-to-checkout').addEventListener('click', function() {
      id('transaction').classList.remove('hidden');
      id('terms-page').classList.add('hidden');
    });
    id('search-term').addEventListener('input', enable);
    id('search-btn').addEventListener('click', search);
    id('toggle').addEventListener('click', toggle);
  }

  /**
   * toggle between two layouts of the homepage
   */
  function toggle() {
    if (qs('.pokecard').classList.contains('other-mode')) {
      for (let i = 0; i < 25; i++) {
        qsa('.pokecard')[i].classList.remove('other-mode');
      }
    } else {
      for (let i = 0; i < 25; i++) {
        qsa('.pokecard')[i].classList.add('other-mode');
      }
    }
  }

  /**
   * enables the search button when there is valid input in the input box, disable
   * it when there isn't
   */
  function enable() {
    if (this.value.trim().length !== 0) {
      id('search-btn').disabled = false;
    } else {
      id('search-btn').disabled = true;
    }
  }

  /**
   * called when the search button is clicked, hide all views except the home view,
   * get what the user has input into the search box and make a fetch request base
   * on the input.
   */
  function search() {
    let cont = id('search-term').value;
    let url = BASE + 'pokemon?search=' + cont;
    fetch(url)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(lookUp)
      .catch(handleError);
  }

  /**
   * hide every yip displayed to the home page execpt thos that contains the string
   * that the user searched for.
   * @param {Object} res json object that contains id of all the yips that contains the
   * string that's being searched
   */
  function lookUp(res) {
    let button = gen('button');
    button.textContent = '< Back to Home';
    id('search-page').appendChild(button);
    id('search-page').classList.remove('hidden');
    id('search-page').innerHTML = '';
    id('poke').classList.add('hidden');
    id('home').classList.add('hidden');
    id('home').querySelector('div').innerHTML = '';
    for (let i = 0; i < res.length; i++) {
      let div = gen('div');
      id('search-page').appendChild(div);
      genOneCard(res[i], div, res[i].ID - 2);
    }
    button.addEventListener('click', bkFmSh);
  }

  /**
   * called when back to home button on search page is clicked. hides the search page and
   * display the home page. clear the content in the search bar.
   */
  function bkFmSh() {
    id('search-page').classList.add('hidden');
    id('home').classList.remove('hidden');
    populateHome();
    id('search-term').value = '';
  }

  /**
   * called when the create new account element is clicked. Take user to the
   * new user page.
   */
  function addNewUser() {
    id('login-page').classList.add('hidden');
    id('newuser').classList.remove('hidden');
    id('newuser-form').addEventListener('submit', function(e) {
      e.preventDefault();
      addNew();
    });
  }

  /**
   * make a POST request based on the username and password the user put.
   */
  function addNew() {
    let name = id('newname').value;
    let pw = id('newpassword').value;
    let data = new FormData();
    data.append('username', name);
    data.append('password', pw);
    let url = BASE + 'newuser';
    fetch(url, {method: 'POST', body: data})
      .then(statusCheck)
      .then(res => res.text())
      .then(newUser)
      .catch(handleError);
  }

  /**
   * let the user know that the account has been created, and take them back to the
   * login page in 5 seconds
   */
  function newUser() {
    let suc = id('newuser-form').querySelector('p');
    suc.textContent = 'succefully created! Going back to login page...';
    id('newuser-form').querySelector('button').disabled = true;
    setTimeout(goback, 5000);
  }

  /**
   * take user back to the login page. clear everything in the new user form
   */
  function goback() {
    id('newuser').classList.add('hidden');
    id('login-page').classList.remove('hidden');
    id('newuser-form').querySelector('button').disabled = false;
    id('newuser-form').querySelector('p').textContent = '';

  }

  /**
   * take user back to the home page from the review page
   */
  function back() {
    id('review-form').querySelector('p').textContent = '';
    id('review-form').querySelector('button').disabled = false;
    id('confirmed').classList.add('hidden');
    id('home').innerHTML = '';
    populateHome();
    id('home').classList.remove('hidden');
  }

  /**
   * called when a user has posted a review. make a POST request based on it. disable the
   * submit review button, and show the user that the review is posted.
   */
  function review() {
    let score = id('score').value;
    let ourreview = id('review').value;
    let prodid = id('poke').querySelector('div').id;
    let data = new FormData();
    data.append('productId', prodid);
    data.append('score', score);
    data.append('review', ourreview);
    fetch('/feedback', {method: 'POST', body: data})
      .then(statusCheck)
      .then(res => res.text())
      .then(function() {
        id('review-form').querySelector('p').textContent = 'Thank you for your review!';
        id('review-form').querySelector('button').disabled = true;
      })
      .catch(handleError);
  }

  /**
   * make a POST request based on the username and password the user entered
   * in the login page
   */
  function login() {
    let name = id('name').value;
    let pw = id('password').value;
    let url = BASE + 'login';
    let data = new FormData();
    data.append('username', name);
    data.append('password', pw);
    fetch(url, {method: 'POST', body: data})
      .then(statusCheck)
      .then(res => res.json())
      .then(checkUser)
      .catch(handleError);
  }

  /**
   * take the user to the homepage and display their username on the top left.
   * @param {Object} user the information about the logged in user.
   */
  function checkUser(user) {
    id('login-page').classList.add('hidden');
    qs('header').classList.remove('hidden');
    id('home').classList.remove('hidden');
    id('trainer-name').textContent = 'Welcome, Pokemon Trainer: ' + user.name;
    userID = parseInt(user.id);
  }

  /**
   * called when the Go button by the filter is clicked. hide all pokecard that does
   *  not have the same type as selected.
   */
  function productFilter() {
    let value = id('poketype').value;
    let productArr = qsa(".pokecard");
    if (value !== 'all') {
      for (let i = 0; i < productArr.length; i++) {
        if (!productArr[i].classList.contains(value)) {
          productArr[i].classList.add('hidden');
        } else {
          productArr[i].classList.remove('hidden');
        }
      }
    } else {
      for (let i = 0; i < productArr.length; i++) {
        productArr[i].classList.remove('hidden');
      }
    }
  }

  /**
   * this funciton makes a API call for information about all the items
   */
  function populateHome() {
    let url = BASE + 'pokemon';
    fetch(url)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(populate)
      .catch(handleError);
  }

  /**
   * populates the homepage with all the items
   * @param {Object} res json object of all items
   */
  function populate(res) {
    let div = gen('div');
    div.id = "poke-container";
    id('home').appendChild(div);
    for (let i = 0; i < 25; i++) {
      let thisPoke = res[i];
      genOneCard(thisPoke, div, i);

    }
  }

  /**
   * create one card about the item and append it to the element in the home page
   * @param {Object} thisPoke the JSON Object that contains all the info about the
   * Item
   * @param {Element} div the container to append the card to
   * @param {int} i the integer that represents the id of the card - 2
   */
  function genOneCard(thisPoke, div, i) {
    let name = thisPoke['pokemon_name'];
    let type = thisPoke.type.toLowerCase();
    let card = gen('article');
    card.classList.add('pokecard');
    card.classList.add(type);
    card.addEventListener('click', viewOneCard);
    card.id = i + 2;
    div.appendChild(card);
    let img = gen('img');
    img.src = 'img/' + name + '.png';
    img.alt = '' + name;
    img.classList.add('pokepic');
    card.appendChild(img);
    let pokename = gen('h3');
    pokename.textContent = name;
    pokename.classList.add('pokename');
    card.appendChild(pokename);
    let poketype = gen('img');
    poketype.classList.add('poketype');
    poketype.src = 'img/' + type + '.png';
    poketype.alt = type;
    card.appendChild(poketype);
  }

  /**
   * called when a card in the homepage is clicked. make a fetch call based on
   * the card's clicked
   */
  function viewOneCard() {
    let id = this.id;
    let url = BASE + 'product/' + id;
    fetch(url)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(function(res) {
        viewItem(res, id);
      })
      .catch(handleError);
  }

  /**
   * take user to the item detail page and display all the information about the item
   * @param {Object} res json object with all info about the item being clicked
   * @param {*} ourId the id of the card clicked
   */
  function viewItem(res, ourId) {
    clearing();
    let thisPoke = gen('div');
    thisPoke.classList.add('thisPoke');
    thisPoke.id = ourId;
    id('poke').appendChild(thisPoke);
    let pokemon = gen('div');
    let thisItem = res;
    let name = thisItem['pokemon_name'];
    let nametag = gen('h2');
    nametag.textContent = name;
    thisPoke.appendChild(pokemon);
    nametag.classList.add('nameTag');
    pokemon.appendChild(nametag);
    let img = gen('img');
    img.src = 'img/' + name + '.png';
    img.alt = name;
    pokemon.appendChild(img);
    pokeMoves(thisItem, thisPoke);
    pokeProperties(thisItem, thisPoke);
  }

  /**
   * reset the item detail page, take user to it, clear everything in the search bar,
   * add a button for the user to click to go back to home page
   */
  function clearing() {
    id('poke').innerHTML = '';
    id('search-term').value = '';
    id('home').classList.add('hidden');
    id('search-page').classList.add('hidden');
    id('poke').classList.remove('hidden');
    let backBtn = gen('button');
    backBtn.textContent = 'Back to home page';
    id('poke').appendChild(backBtn);
    backBtn.addEventListener('click', backHome);
  }

  /**
   * add the pokemon's type, price, amount left to the detail page
   * @param {Object} thisItem the Json object that has all info about the pokemon
   * @param {Element} thisPoke the container to put all the informaitn to
   */
  function pokeProperties(thisItem, thisPoke) {
    let properties = gen('div');
    thisPoke.appendChild(properties);
    let img = gen('img');
    img.src = 'img/' + thisItem.type.toLowerCase() + '.png';
    img.alt = thisItem.type;
    properties.appendChild(img);
    let pricebox = gen('article');
    pricebox.classList.add('pricebox');
    let itemprice = thisItem.price;
    let price = gen('p');
    price.textContent = itemprice + '.00 Pokecoin';
    price.classList.add('price');
    let pricep = gen('p');
    pricep.textContent = 'price: ';
    pricep.classList.add('pricep');
    pricebox.appendChild(pricep);
    pricebox.appendChild(price);
    properties.appendChild(pricebox);
    let left = gen('p');
    properties.appendChild(left);
    addString(thisItem, left);
    pokeOtherProperties(thisItem, properties, price.textContent, thisItem.amount);
  }

  /**
   * shows different message depending on the amount left.
   * @param {Object} thisItem the json object that contains all info about the item
   * @param {Element} left the HTML element that the text should be displayed by
   */
  function addString(thisItem, left) {
    if (thisItem.amount === 0) {
      left.textContent = "0 left! It will back in stock soon!";
      left.classList.add('not-much');
    } else if (thisItem.amount < 5) {
      left.textContent = 'Only ' + thisItem.amount + ' left in stock, order soon!';
      left.classList.add('not-much');
    } else {
      left.textContent = 'Still ' + thisItem.amount + ' left in stock.';
      left.classList.add('planty');
    }
  }

  /**
   * add the shiny,purchase button and the review button to the page.
   * @param {Object} thisItem the JSON that contians all info about the item
   * @param {Element} properties the element to append the info to
   * @param {int} price the price of item
   * @param {int} amount the amount of item left in stock
   */
  function pokeOtherProperties(thisItem, properties, price, amount) {
    let thisShiny = thisItem.shiny;
    let shiny = gen('p');
    properties.appendChild(shiny);
    if (thisShiny === 'T') {
      shiny.textContent = 'Item comes with shiny!';
    } else {
      shiny.textContent = 'Item does not come with shiny!';
    }
    properties.appendChild(shiny);
    let purchase = gen('button');
    purchase.id = 'purchase-' + thisItem['pokemon_name'] + '-' + price;
    purchase.textContent = 'Purchase this Item!';
    purchase.addEventListener('click', purchaseOne);
    properties.appendChild(purchase);
    let ourreview = gen('button');
    ourreview.textContent = 'See All Reviews';
    ourreview.addEventListener('click', viewReview);
    properties.appendChild(ourreview);
    if (amount <= 0) {
      purchase.disabled = true;
    }
  }

  /**
   * make a fetch call basedon the id of item
   */
  function viewReview() {
    let pokeid = this.parentNode.parentNode.id;
    let url = BASE + 'allfeedback/' + pokeid;
    fetch(url)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(seeReview)
      .catch(handleError);
  }

  /**
   * add information about user review to the review page and take user to that page
   * @param {Object} res information about the feedback detail about the item
   */
  function seeReview(res) {
    id('poke').classList.add('hidden');
    id('review-page').classList.remove('hidden');
    let backBtn = gen('button');
    id('review-page').appendChild(backBtn);
    let reviews = gen('div');
    id('review-page').appendChild(reviews);
    backBtn.textContent = '< Back to Item detail';
    backBtn.addEventListener('click', backToItem);
    if (resOK(res)) {
      let score = gen('h2');
      score.id = 'item-score';
      reviews.appendChild(score);
      score.textContent = 'Average Score: ' + res['avg_score'];
      for (let i = 0; i < res.reviews.length; i++) {
        let ourreview = gen('p');
        reviews.appendChild(ourreview);
        ourreview.textContent = 'Customer Review: ' + res.reviews[i].review;
      }
    } else {
      let message = gen('p');
      message.textContent = 'This product has not been purchased yet!';
      reviews.appendChild(message);
    }
  }

  /**
   * determain whether there is a review or not for the item
   * @param {Object} res the info about the feedback of the object
   * @returns {boolean} if there is a score and review or no
   */
  function resOK(res) {
    let avgScore = res['avg_score'];
    let reviews = res.reviews;
    let edgecase1 = "no score";
    let edgecase2 = "no review";
    return !((avgScore === edgecase1) || (reviews === edgecase2));
  }

  /**
   * takes user back to the item page and clear the review page
   */
  function backToItem() {
    id('review-page').innerHTML = '';
    id('poke').classList.remove('hidden');
    id('review-page').classList.add('hidden');
  }

  /**
   * called when the purchase item button on the item detial page is clicked.
   * take user to the confirmation page. add the item's info to the confirmation
   * page.
   */
  function purchaseOne() {
    id('confirm-page').innerHTML = '';
    let thisId = this.id;
    let pokeName = thisId.split('-')[1];
    id('poke').classList.add('hidden');
    id('confirm').classList.remove('hidden');
    let backBtn = gen('button');
    id('confirm-page').appendChild(backBtn);
    backBtn.textContent = '< Back';
    backBtn.addEventListener('click', backToPoke);
    let item = gen('div');
    id('confirm-page').appendChild(item);
    item.classList.add('checkout-item');
    let img = gen('img');
    img.src = 'img/' + pokeName + '.png';
    img.alt = pokeName;
    img.classList.add('checkout-pic');
    item.appendChild(img);
    let name = gen('h2');
    name.classList.add('checkout-text');
    name.textContent = pokeName;
    item.appendChild(name);
    let p = gen('h2');
    p.textContent = thisId.split('-')[2];
    p.classList.add('checkout-text');
    item.appendChild(p);
    addButton();
  }

  /**
   * add the proceed button to the confirmation page
   */
  function addButton() {
    let proceed = gen('button');
    proceed.textContent = 'Proceed to Checkout';
    id('confirm-page').appendChild(proceed);
    proceed.addEventListener('click', toTransaction);
  }

  /**
   * take user to the transction page.
   */
  function toTransaction() {
    id('confirm').classList.add('hidden');
    id('transaction').classList.remove('hidden');
    id('paymenttype').addEventListener('change', update);
    id('checkout-form').addEventListener('submit', function(e) {
      e.preventDefault();
      checkedOut();
    });
  }

  /**
   * called when the form is submitted, make a fetch call for doing transaction .
   */
  function checkedOut() {
    id('paymenttype').value = 'Choose payment method';
    let data = new FormData();
    let itemId = id('poke').querySelector('div').id;
    let alldivs = id('poke').querySelector('div')
      .querySelectorAll('div');
    let amount = alldivs[2].querySelectorAll('p')[2].textContent.split(' ')[1];
    let balance = id('balance').textContent.split(' ')[3];
    let un1 = qs('header').querySelector('div')
      .querySelector('p').textContent;
    let un = un1.split(' ')[3];
    data.append('id', itemId);
    data.append('amount', amount);
    data.append('balance', balance);
    data.append('username', un);
    id('balance').innerHTML = '';
    let url = BASE + 'transcation';
    fetch(url, {method: 'POST', body: data})
      .then(statusCheck)
      .then(resp => resp.text())
      .then(makeTransaction)
      .catch(handleError);
  }

  /**
   * take user to the review page
   */
  function makeTransaction() {
    id('transaction').classList.add('hidden');
    id('confirmed').classList.remove('hidden');
  }

  /**
   * enables the comfirm button on page and show the balance in wallet if the payment
   * mthod is wallet, disable if not.
   * @param {Element} e the selectelementin the HTML page about the payment
   * method
   */
  function update(e) {
    if (e.target.value === 'wallet') {
      let data = new FormData();
      data.append('userId', userID);
      let url = BASE + 'balance';
      fetch(url, {method: 'POST', body: data})
        .then(statusCheck)
        .then(resp => resp.json())
        .then(function(res) {
          id('balance').textContent = 'Your current balance: ' + res.balance + ' pokecoin!';
          id('checkout-btn').disabled = false;
        })
        .catch(handleError);
    } else {
      id('balance').innerHTML = '';
      id('checkout-btn').disabled = true;
    }
  }

  /**
   * take the user back to the item detail page
   */
  function backToPoke() {
    id('confirm-page').innerHTML = '';
    id('poke').classList.remove('hidden');
    id('confirm').classList.add('hidden');
  }

  /**
   * add all mvoes of the Item to the item detail page
   * @param {Object} thisItem info about the item
   * @param {Element} thisPoke Element to put all the info to
   */
  function pokeMoves(thisItem, thisPoke) {
    let moves = gen('div');
    moves.classList.add('movebox');
    for (let i = 0; i < 4; i++) {
      let thismove = gen('article');
      thismove.classList.add('onemove');
      let movecount = gen('p');
      let move = gen('p');
      let j = i + 1;
      movecount.textContent = 'Move' + j + ':';
      movecount.classList.add('movenumber');
      let count = 'move' + j;
      move.textContent = thisItem[count];
      move.classList.add('move');
      moves.appendChild(thismove);
      thismove.appendChild(movecount);
      thismove.appendChild(move);
    }
    thisPoke.appendChild(moves);
  }

  /**
   * take the user back to home view
   */
  function backHome() {
    id('poke').classList.add('hidden');
    id('poke').innerHTML = '';
    id('home').classList.remove('hidden');
    id('home').innerHTML = '';
    populateHome();
  }

  /**
   * make a fetch call based on the user's id.
   */
  function viewPrev() {
    let backBtn = gen('button');
    backBtn.textContent = '< Back to home';
    backBtn.addEventListener('click', backToHome);
    id('prevs').appendChild(backBtn);
    let dataFrame = new FormData();
    dataFrame.append("userId", userID);
    fetch(BASE + "prevtranscations", {method: "POST", body: dataFrame})
      .then(statusCheck)
      .then(resp => resp.json())
      .then(postPrev)
      .catch(handleError);
  }

  /**
   * take user back to home page
   */
  function backToHome() {
    id('prevs').classList.add('hidden');
    id('home').classList.remove('hidden');
  }

  /**
   * take user to the previous transaction page, generate a container for all the
   * previous transactions and put it to the previous transaction page
   * @param {JSON} prevs info about all the previous purchases
   */
  async function postPrev(prevs) {
    id("home").classList.add('hidden');
    id("poke").classList.add('hidden');
    id("confirm").classList.add('hidden');
    id("transaction").classList.add('hidden');
    id("prevs").classList.remove('hidden');
    let container = gen("section");
    for (let i = 0; i < prevs.length; i++) {
      await genPastTrade(prevs[i], container);
    }
    id("prevs").appendChild(container);
  }

  /**
   * generate a box for one transaction
   * @param {Object} transaction information about one transaction
   * @param {Element} container the container to place all tranction
   */
  async function genPastTrade(transaction, container) {
    let history = gen('div');
    let itemId = transaction.item_id;
    let itemData = await getItemData(itemId);
    let productName = itemData.name;
    let price = itemData.price;
    let id = gen('p');
    id.textContent = "transaction number: " + itemId;
    let name = gen('p');
    name.textContent = 'pokemon: ' + productName;
    let value = gen('p');
    value.textContent = 'price: ' + price;
    history.classList.add('history');
    history.appendChild(id);
    history.appendChild(name);
    history.appendChild(value);
    container.appendChild(history);
  }

  /**
   * retures the name and price of the designated item
   * @param {int} itemId the id of the item
   * @returns {Object} the name and price o the item
   */
  async function getItemData(itemId) {
    let res = await fetch(BASE + "product/" + itemId);
    await statusCheck(res);
    res = await res.json();
    let result = {};
    result['name'] = res['pokemon_name'];
    result['price'] = res['price'];
    return result;
  }

  /**
   * this checks the status of the fetching process.
   * @param {Promise} res the promise given after the fetch call
   * @returns {Promise} the fetched promise
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * this displays the error message for the user when there is an error occuring
   */
  function handleError() {
    id('home').classList.add('hidden');
    id('login-page').classList.add('hidden');
    id('poke').classList.add('hidden');
    id('confirm').classList.add('hidden');
    id('prevs').classList.add('hidden');
    id('terms-page').classList.add('hidden');
    id('newuser').classList.add('hidden');
    id('search-page').classList.add('hidden');
    id('error').classList.remove('hidden');
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} selector - CSS query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();