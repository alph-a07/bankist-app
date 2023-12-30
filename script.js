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
    locale: 'pt-PT', // de-DE
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
        '2020-04-10T14:43:26.374Z',
        '2020-06-25T18:49:59.371Z',
        '2020-07-26T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
};

const accounts = [account1, account2];
let currentAccount;

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

//-> Function to display all movements associated to current account
const displayMovements = function (account, sort = false) {
    containerMovements.innerHTML = '';

    const transactions = sort ? account.movements.slice().sort((a, b) => a - b) : account.movements;

    transactions.forEach((movement, index) => {
        const movementType = movement > 0 ? 'deposit' : 'withdrawal';

        const date = new Date(account.movementsDates[index]);
        const day = `${date.getDate()}`.padStart(2, 0);
        const month = `${date.getMonth() + 1}`.padStart(2, 0);
        const year = date.getFullYear();
        const displayDate = `${day}/${month}/${year}`;

        const movementsRowHTML = `
        <div class="movements__row">
            <div class="movements__type movements__type--${movementType}">(${index + 1}) ${movementType}</div>
            <div class="movements__date">${displayDate}</div>
            <div class="movements__value">${movement.toFixed(2)} €</div>
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
            .map((name) => name[0])
            .join('');
    }
};
computeUserNames(accounts);

//-> Function to display total account balance
const displayBalance = function (account) {
    account.balance = account.movements.reduce((accum, mov) => (accum += mov), 0);
    labelBalance.textContent = `${account.balance.toFixed(2)}€`;
};

//-> Function to diplay summary of deposits, withdrawal and added interest
const displaySummary = function (account) {
    const movements = account.movements;

    const incomes = movements.filter((mov) => mov > 0).reduce((accum, mov) => accum + mov, 0);

    const out = Math.abs(movements.filter((mov) => mov < 0).reduce((accum, mov) => accum + mov, 0));

    // Compute interest on all deposits and ignore interests below value 1
    const interest = movements
        .filter((mov) => mov > 0)
        .map((deposit) => (deposit * account.interestRate) / 100)
        .filter((interest) => interest >= 1)
        .reduce((interest, deposit) => (interest += deposit), 0);

    labelSumIn.textContent = `${incomes.toFixed(2)}€`;
    labelSumOut.textContent = `${out.toFixed(2)}€`;
    labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

//-> Function to update UI
const updateUI = function (currentAccount) {
    displayMovements(currentAccount);
    displayBalance(currentAccount);
    displaySummary(currentAccount);
};

// containerApp.style.opacity = 100;
// currentAccount = account1;
// updateUI(currentAccount);

//-> Login Event Handler
btnLogin.addEventListener('click', function (e) {
    // Prevents the form from submitting and the page from reloading
    e.preventDefault();

    // Find the user with entered username
    currentAccount = accounts.find((acc) => acc.username === inputLoginUsername.value);

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
        const day = `${currDate.getDate()}`.padStart(2, 0);
        const month = `${currDate.getMonth() + 1}`.padStart(2, 0);
        const year = currDate.getFullYear();
        const hour = `${currDate.getHours()}`.padStart(2, 0);
        const minutes = `${currDate.getMinutes()}`.padStart(2, 0);

        labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minutes}`;

        updateUI(currentAccount);
    }
});

//-> Transfer money Event Handler
btnTransfer.addEventListener('click', function (e) {
    e.preventDefault();

    const amount = Number(inputTransferAmount.value);
    const receiverAcc = accounts.find((acc) => acc.username === inputTransferTo.value);

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
    if (amount > 0 && currentAccount.movements.some((mov) => mov >= 0.1 * amount)) {
        currentAccount.movements.push(amount);
        currentAccount.movementsDates.push(new Date().toISOString());
        updateUI(currentAccount);
    }

    inputLoanAmount.value = '';
    inputLoanAmount.blur();
});

//-> Terminate account Event Handler
btnClose.addEventListener('click', function (e) {
    e.preventDefault();

    if (inputCloseUsername.value === currentAccount.username && Number(inputClosePin.value) == currentAccount.pin) {
        const index = accounts.findIndex((acc) => acc.username === currentAccount.username);

        containerApp.style.opacity = 0;
        accounts.splice(index, 1);
    }

    inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
//-> Sorting movements Even Handler
btnSort.addEventListener('click', function () {
    displayMovements(currentAccount.movements, !sorted); // sort if not sorted and vice versa
    sorted = !sorted; // flip the sorted variable
});
