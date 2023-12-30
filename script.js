'use strict';

// Assume that account objects are coming from some API
const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        '2019-11-18T21:31:17.178Z',
        '2019-12-23T07:42:02.383Z',
        '2020-01-28T09:15:04.904Z',
        '2020-04-01T10:17:24.185Z',
        '2020-05-08T14:11:59.604Z',
        '2020-05-27T17:01:17.194Z',
        '2020-07-11T23:36:17.929Z',
        '2020-07-12T10:51:36.790Z',
    ],
    currency: 'EUR',
    locale: 'en-UK', // de-DE
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2023-12-25T14:43:26.374Z',
        '2023-12-29T18:49:59.371Z',
        '2023-12-30T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
};

const account3 = {
    owner: 'Jeel Patel',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.9,
    pin: 3333,

    movementsDates: [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2022-11-25T14:43:26.374Z',
        '2023-12-29T18:49:59.371Z',
        '2023-12-30T12:01:20.894Z',
    ],
    currency: 'INR',
    locale: 'gu-IN',
};

const account4 = {
    owner: 'Maitry Makwana',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 2.0,
    pin: 4444,

    movementsDates: [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2021-12-25T14:43:26.374Z',
        '2022-12-29T18:49:59.371Z',
        '2023-12-30T12:01:20.894Z',
    ],
    currency: 'INR',
    locale: 'hi-IN',
};

const accounts = [account1, account2, account3, account4];
let currentAccount, timer;

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const currencies = new Map([
    ['USD', 'United States dollar'],
    ['EUR', 'Euro'],
    ['GBP', 'Pound sterling'],
]);

//-> Function to format the date and time
const formatMovementsDates = function (date, locale) {
    const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
    const daysPassed = calcDaysPassed(new Date(), date);

    if (daysPassed === 0) return 'Today';
    else if (daysPassed === 1) return 'Yesterday';
    else if (daysPassed <= 7) return `${daysPassed} days ago`;

    return new Intl.DateTimeFormat(locale).format(date);
};

//-> Function to format the currencies
const formatCurrencies = function (value, locale, currency) {
    // Do note that locale and currency are independent of each other
    // Locale controls the representation of the value
    // Currency controls the representation of the currency
    const options = {
        style: 'currency',
        currency: currency,
    };

    return new Intl.NumberFormat(locale, options).format(value);
};

//-> Function to implement session timer
const startLoginTimer = function () {
    let time = 10;
    let min, sec;

    const tick = function () {
        min = String(Math.trunc(time / 60)).padStart(2, 0);
        sec = String(time % 60).padStart(2, 0);

        if (time === 0) {
            clearInterval(timer);
            containerApp.style.opacity = 0;
        }

        labelTimer.textContent = `${min}:${sec}`;
        time--;
    };

    tick(); // To execute at 0th second
    const tickTimer = setInterval(tick, 1000); // Executes 1st second onwards

    return tickTimer;
};

//-> Function to display all movements associated to current account
const displayMovements = function (account, sort = false) {
    containerMovements.innerHTML = '';

    const transactions = sort ? account.movements.slice().sort((a, b) => a - b) : account.movements;

    transactions.forEach((movement, index) => {
        const movementType = movement > 0 ? 'deposit' : 'withdrawal';

        const date = new Date(account.movementsDates[index]);
        const displayDate = formatMovementsDates(date, account.locale);

        const movementsRowHTML = `
        <div class="movements__row">
            <div class="movements__type movements__type--${movementType}">(${index + 1}) ${movementType}</div>
            <div class="movements__date">${displayDate}</div>
            <div class="movements__value">${formatCurrencies(movement, account.locale, account.currency)}</div>
        </div>`;

        // The insertAdjacentHTML() method parses the specified text as HTML or XML and inserts the resulting nodes at specified node in DOM Tree
        // 'afterbegin' is used to add latest transactions on the top of the container
        containerMovements.insertAdjacentHTML('afterbegin', movementsRowHTML);
    });
};

//-> Functions that computes usernames by joining lowercase initials of the owner's names
const computeUserNames = function (accs) {
    for (const acc of accs) {
        acc.username = acc.owner
            .toLowerCase()
            .split(' ')
            .map(name => name[0])
            .join('');
    }
};
computeUserNames(accounts);

//-> Function to display total account balance
const displayBalance = function (account) {
    account.balance = account.movements.reduce((accum, mov) => (accum += mov), 0);
    labelBalance.textContent = formatCurrencies(account.balance, account.locale, account.currency);
};

//-> Function to diplay summary of deposits, withdrawal and added interest
const displaySummary = function (account) {
    const movements = account.movements;

    const incomes = movements.filter(mov => mov > 0).reduce((accum, mov) => accum + mov, 0);

    const out = Math.abs(movements.filter(mov => mov < 0).reduce((accum, mov) => accum + mov, 0));

    // Compute interest on all deposits and ignore interests below value 1
    const interest = movements
        .filter(mov => mov > 0)
        .map(deposit => (deposit * account.interestRate) / 100)
        .filter(interest => interest >= 1)
        .reduce((interest, deposit) => (interest += deposit), 0);

    labelSumIn.textContent = `${formatCurrencies(incomes, account.locale, account.currency)}`;
    labelSumOut.textContent = `${formatCurrencies(out, account.locale, account.currency)}`;
    labelSumInterest.textContent = `${formatCurrencies(interest, account.locale, account.currency)}`;
};

//-> Function to update UI
const updateUI = function (currentAccount) {
    displayMovements(currentAccount);
    displayBalance(currentAccount);
    displaySummary(currentAccount);
};

//-> Login Event Handler
btnLogin.addEventListener('click', function (e) {
    // Prevents the form from submitting and the page from reloading
    e.preventDefault();

    // Find the user with entered username
    currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);

    // Match the entered pin with the correct pin
    if (currentAccount?.pin === Number(inputLoginPin.value)) {
        // Greeting message with first name
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;

        containerApp.style.opacity = 100;
        inputLoginUsername.value = inputLoginPin.value = '';
        // The blur() method removes focus from the current element
        inputLoginUsername.blur();
        inputLoginPin.blur();

        // Displaying current date
        const currDate = new Date();
        const formattingOptions = {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        };

        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, formattingOptions).format(currDate);

        updateUI(currentAccount);

        if (timer) clearInterval(timer); // Clear existing timer
        timer = startLoginTimer(); // Start new timer and keep track of it
    }
});

//-> Transfer money Event Handler
btnTransfer.addEventListener('click', function (e) {
    e.preventDefault();

    const amount = Number(inputTransferAmount.value);
    const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);

    if (amount > 0 && receiverAcc && currentAccount.balance >= amount && receiverAcc?.username !== currentAccount.username) {
        currentAccount.movements.push(-1 * amount);
        receiverAcc?.movements.push(amount);

        const date = new Date().toISOString();
        currentAccount.movementsDates.push(date);
        receiverAcc?.movementsDates.push(date);

        updateUI(currentAccount);

        inputTransferAmount.blur();
        inputTransferTo.blur();
    }

    inputTransferAmount.value = inputTransferTo.value = '';
});

//-> Requesting loan Event Handler
btnLoan.addEventListener('click', function (e) {
    e.preventDefault();

    const amount = Math.floor(inputLoanAmount.value);

    // Loan is only approved if there is atleast one deposit of minimum 10% of requested amount
    if (amount > 0 && currentAccount.movements.some(mov => mov >= 0.1 * amount)) {
        setTimeout(() => {
            currentAccount.movements.push(amount);
            currentAccount.movementsDates.push(new Date().toISOString());
            updateUI(currentAccount);
        }, 1500);
    }

    inputLoanAmount.value = '';
    inputLoanAmount.blur();
});

//-> Terminate account Event Handler
btnClose.addEventListener('click', function (e) {
    e.preventDefault();

    if (inputCloseUsername.value === currentAccount.username && Number(inputClosePin.value) == currentAccount.pin) {
        const index = accounts.findIndex(acc => acc.username === currentAccount.username);

        containerApp.style.opacity = 0;
        accounts.splice(index, 1);
    }

    inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
//-> Sorting movements Even Handler
btnSort.addEventListener('click', function () {
    displayMovements(currentAccount, !sorted); // sort if not sorted and vice versa
    sorted = !sorted; // flip the sorted variable
});
