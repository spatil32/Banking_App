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
const loginError = document.getElementById('wrong-pin');
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const invalidLoan = document.getElementById('invalid-loan');

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
const notEnoughBalance = document.getElementById('not_enough_balance');

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const displayMovements = (movements, sort = false) => {
	const movementsCpy = sort ? movements.slice().sort((a, b) => a - b) : movements;
	containerMovements.innerHTML = '';
	movementsCpy.forEach((movement, i) => {
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

const calcPrintBalance = (account) => {
	account.balance = account.movements.reduce((acc, curr) => acc + curr, 0);
	labelBalance.textContent = `${account.balance}€`
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

const updateUI = (account) => {
	displayMovements(account.movements);
	calcPrintBalance(account);
	displaySummary(account);
}

let currentAccount;

btnLogin.addEventListener('click', (event) => {
	event.preventDefault();
	// find current logged in user
	currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value)
	if(currentAccount?.pin === +inputLoginPin.value) {
		loginError.classList.add('hide');
		// if user exists and pin matches, show the account info
		labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`
		displayMovements(currentAccount.movements);
		calcPrintBalance(currentAccount);
		displaySummary(currentAccount);
		containerApp.style.opacity = 100;

		inputLoginUsername.value = inputLoginPin.value = '';
		inputLoginPin.blur();
	} 
	else if(!currentAccount) {
		loginError.textContent = 'No User found! Try again...';
		inputLoginUsername.value = inputLoginPin.value = '';

		loginError.classList.remove('hide');
	}
	else {
		loginError.textContent = 'Wrong Password! Please try again...'
		inputLoginPin.value = '';
		loginError.classList.remove('hide');
	}
});

btnTransfer.addEventListener('click', (event) => {
	event.preventDefault();
	const amount = Number(inputTransferAmount.value);
	const accountToTransfer = accounts.find(account => account.username === inputTransferTo.value);
	
	if(amount > 0 && accountToTransfer && currentAccount.balance >= amount && accountToTransfer?.username !== currentAccount.username) {
		notEnoughBalance.classList.add('hide');
		currentAccount.movements.push(-amount);
		accountToTransfer.movements.push(amount);

		inputTransferAmount.value = inputTransferTo.value = '';
		updateUI(currentAccount);
	} else {
		inputTransferAmount.value = '';
		notEnoughBalance.classList.remove('hide');
	}
});

btnClose.addEventListener('click', (event) => {
	event.preventDefault();
	const accountToClose = inputCloseUsername.value;
	const accountPinToClose = Number(inputClosePin.value);
	
	if(accountToClose === currentAccount.username && accountPinToClose === currentAccount.pin) {
		const accountIndex = accounts.findIndex(account => account.username === currentAccount.username && account.pin === currentAccount.pin);
		accounts.splice(accountIndex, 1);
		containerApp.style.opacity = 0;
	}

	inputCloseUsername.value = inputClosePin.value = '';
});

btnLoan.addEventListener('click', (event) => {
	event.preventDefault();
	const amount = Number(inputLoanAmount.value);
	if(amount > 0 && currentAccount.movements.some(movement => movement >= amount * 0.1)) {
		invalidLoan.classList.add('hide');

		currentAccount.movements.push(amount);
		updateUI(currentAccount);
	} else {
		invalidLoan.textContent = `Cannot take loan of ${inputLoanAmount}! Try different amount...`;
		invalidLoan.classList.remove('hide');
	}
	inputLoanAmount.value = '';
});

let sorted = false;
btnSort.addEventListener('click', (event) => {
	event.preventDefault();
	displayMovements(currentAccount.movements, !sorted);
	sorted = !sorted;
})
createUsernames(accounts);
