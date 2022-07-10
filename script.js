'use strict';

// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Shreyas Patil',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const wrongPin = document.getElementById('wrong-pin');
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

const displayMovements = (movements) => {
	containerMovements.innerHTML = '';
	movements.forEach((movement, i) => {
		const transaction = movement < 0 ? 'withdrawal' : 'deposit';
		const html = `
			<div class="movements__row">
				<div class="movements__type movements__type--${transaction}">${i + 1} ${transaction}</div>
				<div class="movements__value">${movement}€</div>
	  		</div>
		`;

		containerMovements.insertAdjacentHTML('afterbegin', html);
	})
}

const createUsernames = (accounts) => {
	accounts.forEach(account => {
		account.username = account.owner.toLowerCase().split(" ").map(name => name[0]).join('');
	});
};

const calcPrintBalance = (movements) => {
	const currBalance = movements.reduce((acc, curr) => acc + curr, 0);
	labelBalance.textContent = `${currBalance}€`
}

const displaySummary = (account) => {
	const { movements = [], interestRate = 0 } = account || {};
	// deposits
	const incomes = movements
		.filter(movement => movement > 0)
		.reduce((acc, curr) => acc + curr, 0);

	labelSumIn.textContent = `${incomes}€`;

	// withdrawals
	const outcomes = movements
		.filter(movement => movement < 0)
		.reduce((acc, curr) => acc + curr, 0);

	labelSumOut.textContent = `${Math.abs(outcomes)}€`;

	// interests earned
	const interest = movements
		.filter(movement => movement > 0)
		.map(deposit => (deposit * interestRate) / 100)
		.filter(int => int > 1)
		.reduce((acc, int) => acc + int, 0);

	labelSumInterest.textContent = `${Math.abs(interest)}€`;
}

let currentAccount;

btnLogin.addEventListener('click', (event) => {
	event.preventDefault();
	// find current logged in user
	currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value)
	if(currentAccount?.pin === +inputLoginPin.value) {
		wrongPin.classList.add('hide');
		// if user exists and pin matches, show the account info
		labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`
		displayMovements(currentAccount.movements);
		calcPrintBalance(currentAccount.movements);
		displaySummary(currentAccount);
		containerApp.style.opacity = 100;

		inputLoginUsername.value = inputLoginPin.value = '';
		inputLoginPin.blur();
	} else {
		inputLoginPin.value = '';
		wrongPin.classList.remove('hide');
	}
});

createUsernames(accounts);
