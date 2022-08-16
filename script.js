'use strict';

// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-07-26T17:01:17.194Z",
    "2020-07-28T23:36:17.929Z",
    "2020-08-01T10:51:36.790Z",
  ],

  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: 'Shreyas Patil',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2022-06-25T16:33:06.386Z",
    "2022-07-05T14:43:26.374Z",
    "2022-08-06T18:49:59.371Z",
    "2022-08-07T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,

  movementsDates: [
    "2010-11-01T13:15:33.035Z",
    "2010-11-30T09:48:16.867Z",
    "2010-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,

  movementsDates: [
    "2019-02-01T13:15:33.035Z",
    "2019-04-30T09:48:16.867Z",
    "2019-06-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
  ],
  currency: "USD",
  locale: "en-US",
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

let currentAccount, timer;

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const calNumberOfDaysPassed = (date1, date2) => Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));

const formatMovementsDate = (date, locale) => {
	const noOfDays = calNumberOfDaysPassed(new Date(), date);

	if(noOfDays === 0) return 'Today';
	
	if(noOfDays === 1) return 'Yesterday';
	
	if(noOfDays <= 7) return `${noOfDays} days ago`;

	return new Intl.DateTimeFormat(locale).format(date);
}

const formatBalance = (locale, currency, balance) => new Intl.NumberFormat(locale, {
	style: 'currency',
	currency
}).format(balance);

const sessionTimeout = () => {
	let timeout = 10;
	const tick = function() {
		const min = `${Math.trunc(timeout / 60)}`.padStart(2, 0);
		const sec = String(timeout % 60).padStart(2, 0);
		labelTimer.textContent = `${min}:${sec}`;

		if(timeout === 0) {
			clearInterval(timer);
			labelWelcome.textContent = 'Log in to get started...';
			containerApp.style.opacity = 0;
		}

		timeout--;
	};

	tick();
	timer = setInterval(tick, 1000);

	return timer;
}

const displayMovements = (account, sort = false) => {
	const movementsCpy = sort ? account.movements.slice().sort((a, b) => a - b) : account.movements;
	containerMovements.innerHTML = '';
	movementsCpy.forEach((movement, i) => {
		const movementDate = new Date(account.movementsDates[i]);
		const formattedDate = formatMovementsDate(movementDate, account.locale);
		const transaction = movement < 0 ? 'withdrawal' : 'deposit';
		const formattedMov = formatBalance(account.locale, account.currency, movement);

		const html = `
			<div class="movements__row">
				<div class="movements__type movements__type--${transaction}">${i + 1} ${transaction}</div>
				<div class="movements_date">${formattedDate}</div>
				<div class="movements__value">${formattedMov}</div>
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
	labelBalance.textContent = formatBalance(account.locale, account.currency, account.balance);
}

const displaySummary = (account) => {
	const { movements = [], interestRate = 0 } = account || {};
	// deposits
	const incomes = movements
		.filter(movement => movement > 0)
		.reduce((acc, curr) => acc + curr, 0);

	labelSumIn.textContent = formatBalance(account.locale, account.currency, incomes);

	// withdrawals
	const outcomes = movements
		.filter(movement => movement < 0)
		.reduce((acc, curr) => acc + curr, 0);

	labelSumOut.textContent = formatBalance(account.locale, account.currency, outcomes);

	// interests earned
	const interest = movements
		.filter(movement => movement > 0)
		.map(deposit => (deposit * interestRate) / 100)
		.filter(int => int > 1)
		.reduce((acc, int) => acc + int, 0);

	labelSumInterest.textContent = formatBalance(account.locale, account.currency, interest);
}

const updateUI = (account) => {
	displayMovements(account);
	calcPrintBalance(account);
	displaySummary(account);
}

btnLogin.addEventListener('click', (event) => {
	event.preventDefault();
	// find current logged in user
	currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value)
	if(currentAccount?.pin === +inputLoginPin.value) {
		loginError.classList.add('hide');
		// if user exists and pin matches, show the account info
		labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`
		containerApp.style.opacity = 100;

		// show balance date
		const today = new Date();
		const intlConfig = {
			hour: 'numeric',
			minute: 'numeric',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			weekday: 'long',
		};

		const date = new Intl.DateTimeFormat(currentAccount.locale, intlConfig).format(today);
		labelDate.textContent = date;

		inputLoginUsername.value = inputLoginPin.value = '';
		inputLoginPin.blur();

		if(timer) {
			clearInterval(timer);
		};

		timer = sessionTimeout();

		updateUI(currentAccount);
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
	const amount = +inputTransferAmount.value;
	const accountToTransfer = accounts.find(account => account.username === inputTransferTo.value);
	
	if(amount > 0 && accountToTransfer && currentAccount.balance >= amount && accountToTransfer?.username !== currentAccount.username) {
		notEnoughBalance.classList.add('hide');
		currentAccount.movements.push(-amount);
		accountToTransfer.movements.push(amount);

		currentAccount.movementsDates.push(new Date().toISOString());
		accountToTransfer.movementsDates.push(new Date().toISOString());

		inputTransferAmount.value = inputTransferTo.value = '';
		updateUI(currentAccount);

		// Reset session timeout
		clearInterval(timer);
		timer = sessionTimeout(timer);
	} else {
		inputTransferAmount.value = '';
		notEnoughBalance.classList.remove('hide');
	}
});

btnClose.addEventListener('click', (event) => {
	event.preventDefault();
	const accountToClose = inputCloseUsername.value;
	const accountPinToClose = +inputClosePin.value;
	
	if(accountToClose === currentAccount.username && accountPinToClose === currentAccount.pin) {
		const accountIndex = accounts.findIndex(account => account.username === currentAccount.username && account.pin === currentAccount.pin);
		accounts.splice(accountIndex, 1);
		containerApp.style.opacity = 0;
	}

	inputCloseUsername.value = inputClosePin.value = '';
});

btnLoan.addEventListener('click', (event) => {
	event.preventDefault();
	const amount = Math.floor(inputLoanAmount.value);
	if(amount > 0 && currentAccount.movements.some(movement => movement >= amount * 0.1)) {
		invalidLoan.classList.add('hide');

		setTimeout(() => {
			currentAccount.movements.push(amount);
			currentAccount.movementsDates.push(new Date().toISOString());
			updateUI(currentAccount);
			
			// Reset session timeout
			clearInterval(timer);
			timer = sessionTimeout(timer);
		}, 2500);
	} else {
		invalidLoan.textContent = `Cannot take loan of ${inputLoanAmount}! Try different amount...`;
		invalidLoan.classList.remove('hide');
	}
	inputLoanAmount.value = '';
});

let sorted = false;
btnSort.addEventListener('click', (event) => {
	event.preventDefault();
	displayMovements(currentAccount, !sorted);
	sorted = !sorted;
});

createUsernames(accounts);


// Modal window

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');

const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');

const allTopLinksParent = document.querySelector('.nav__links');
const allTopLinks = document.querySelectorAll('.nav__link');

const operationTabs = document.querySelectorAll('.operations__tab');
const tabContainer= document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

btnScrollTo.addEventListener('click', () => {
	section1.scrollIntoView({ behavior: 'smooth' })
});

allTopLinksParent.addEventListener('click', function (e) {
	e.preventDefault();

	if(e.target.classList.contains('nav__link')) {
		const id = e.target.getAttribute('href');
		if(id === '#') return;
		document.querySelector(id).scrollIntoView({ behavior: 'smooth' })
	}
})

tabContainer.addEventListener('click', function(e) {
	const clicked = e.target.closest('.operations__tab');
	
	if(!clicked) return;

	operationTabs.forEach(tab => tab.classList.remove('operations__tab--active'));
	tabsContent.forEach(tab => tab.classList.remove('operations__content--active'));
	clicked.classList.add('operations__tab--active');

	document.querySelector(`.operations__content--${clicked.dataset.tab}`).classList.add('operations__content--active');
})

const nav = document.querySelector('.nav');

function fadeInOut(e) {
	if(e.target.classList.contains('nav__link')) {
		const link = e.target;
		const siblings = link.closest('.nav').querySelectorAll('.nav__link');
		const logo = link.closest('.nav').querySelector('img');

		siblings.forEach(sibling => {
			if(sibling !== link) sibling.style.opacity = this;
		})
		logo.style.opacity = this;
	}
}
nav.addEventListener('mouseover', fadeInOut.bind(0.5))

nav.addEventListener('mouseout', fadeInOut.bind(1))

// const initialPos = section1.getBoundingClientRect();

// window.addEventListener('scroll', function(e) {
// 	if(window.scrollY > initialPos.top) {
// 		nav.classList.add('sticky');
// 	}
// 	else {
// 		nav.classList.remove('sticky');
// 	}
// })

// sticky header
const stickyNav = function(entries) {
	const [entry] = entries;
	
	if(!entry.isIntersecting) {
		nav.classList.add('sticky');
	} else {
		nav.classList.remove('sticky');
	}	
}

const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height;

const observer = new IntersectionObserver(stickyNav, {
	root: null,
	threshold: 0,
	rootMargin: `-${navHeight}px`,
});

observer.observe(header);

// reveal sections
const allSections = document.querySelectorAll('.section');

const revealSections = function(entries, observer) {
	const [entry] = entries;
	
	if(!entry.isIntersecting) return;
	entry.target.classList.remove('section--hidden');

	observer.unobserve(entry.target);
}

const sectionObserver = new IntersectionObserver(revealSections, {
	root: null,
	threshold: 0.15,
	rootMargin: ' 200px'
});

allSections.forEach(section => {
	sectionObserver.observe(section);
	section.classList.add('section--hidden');
})

// lazy loading images
const imgTargets = document.querySelectorAll('img[data-src]');

const loadImg = function (entries, observer) {
	const [entry] = entries;
	if(!entry.isIntersecting) return;
	entry.target.src = entry.target.dataset.src;

	entry.target.addEventListener('load', function() {
		entry.target.classList.remove('lazy-img');
	});

	observer.unobserve(entry.target);
};

const imageObserver = new IntersectionObserver(loadImg, {
	root: null,
	threshold: 0
});

imgTargets.forEach(img => imageObserver.observe(img));

// sliders
const slider = function() {
	const slides = document.querySelectorAll('.slide');
	const btnLeft = document.querySelector('.slider__btn--left');
	const btnRight = document.querySelector('.slider__btn--right');
	const dotContainer = document.querySelector('.dots');

	let currentSlide = 0;
	const maxSlides = slides.length;

	const createDots = function() {
		slides.forEach(function(_, i) { dotContainer.insertAdjacentHTML('beforeend', `<button class="dots__dot" data-slide="${i}">
		</button>`) })
	}

	const highlightDot = function(currSlide) {
		const dots = document.querySelectorAll('.dots__dot');
		dots.forEach(dot => dot.classList.remove('dots__dot--active'));
		document.querySelector(`.dots__dot[data-slide="${currSlide}"]`).classList.add('dots__dot--active');
	};

	const gotoSlide = function(currSlide) {
		slides.forEach((slide, index) => slide.style.transform = `translateX(${100 * (index - currSlide)}%)`)
	}

	const init = function() {
		createDots();
		gotoSlide(0);
		highlightDot(0);
	}


	const nextSlide = function() {
		if(currentSlide === maxSlides - 1) {
			currentSlide = 0;
		} else {
			currentSlide++;
		}
		gotoSlide(currentSlide);
		highlightDot(currentSlide);
	}


	const prevSlide = function() {
		if(currentSlide === 0) {
			currentSlide = maxSlides - 1;
		} else {
			currentSlide--;
		}
		gotoSlide(currentSlide);
		highlightDot(currentSlide);
	}

	btnRight.addEventListener('click', nextSlide);
	btnLeft.addEventListener('click', prevSlide);

	document.addEventListener('keydown', function(e) {
		e.key === 'ArrowRight' && nextSlide();
		e.key === 'ArrowLeft' && prevSlide();
	});

	dotContainer.addEventListener('click', function(e) {
		if(e.target.classList.contains('dots__dot')) {
			const { slide } = e.target.dataset;
			gotoSlide(slide);
			highlightDot(slide);
		}
	});

	init();
};

slider();


// define views
const landingPage = document.querySelector('.registration_pending');
const successfulRegistration = document.querySelector('.successful_registration');
const nextStep = document.querySelector('.next-step');
const alreadyMember = document.querySelector('.already-a-member');

landingPage.classList.remove('show-ui');
successfulRegistration.classList.add('hide-ui');

const showLogin = function() {
	landingPage.classList.remove('show-ui');
	landingPage.classList.add('hide-ui');
	successfulRegistration.classList.add('show-ui');
	successfulRegistration.classList.remove('hide-ui');
};

nextStep.addEventListener('click', function(e) {
	e.preventDefault();
	showLogin();
})

alreadyMember.addEventListener('click', function(e) {
	e.preventDefault();
	showLogin();
})