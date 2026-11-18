function updateText(element, text) {
	if (!element || element.textContent === text) return;
	element.textContent = text;
	element.classList.remove("text-updated");
	void element.offsetWidth;
	element.classList.add("text-updated");
}

function lockPageScroll() {
	if (document.body.classList.contains("quiz-modal-open")) return;
	const scrollY = window.scrollY;
	document.body.dataset.quizScrollY = String(scrollY);
	document.documentElement.classList.add("quiz-modal-open");
	document.body.classList.add("quiz-modal-open");
	document.body.style.position = "fixed";
	document.body.style.top = `-${scrollY}px`;
	document.body.style.left = "0";
	document.body.style.right = "0";
	document.body.style.width = "100%";
}

function unlockPageScroll() {
	const scrollY = Number(document.body.dataset.quizScrollY || 0);
	document.documentElement.classList.remove("quiz-modal-open");
	document.body.classList.remove("quiz-modal-open");
	document.body.style.position = "";
	document.body.style.top = "";
	document.body.style.left = "";
	document.body.style.right = "";
	document.body.style.width = "";
	delete document.body.dataset.quizScrollY;
	window.scrollTo({ top: scrollY, behavior: "instant" });
}

const pageSections = document.querySelectorAll(".page-section, .person-card, .project-card, .scheme-card, .help-card");

if (pageSections.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
	const sectionObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });

	pageSections.forEach((section) => {
		section.classList.add("reveal-ready");
		sectionObserver.observe(section);
	});
}

const quizQuestionSets = {
	intro: [
		{
			question: "Звонящий представился сотрудником банка и просит код из SMS, чтобы «защитить счёт». Что делать?",
			answers: ["Назвать код, если он знает моё имя", "Завершить звонок и связаться с банком по официальному номеру", "Перевести деньги на «безопасный счёт»"],
			correct: 1,
			feedback: "Код подтверждения нельзя сообщать никому. Заверши звонок и свяжись с банком по номеру с карты или официального сайта."
		},
		{
			question: "Пришло письмо со ссылкой «срочно войдите, иначе аккаунт удалят». Как безопаснее поступить?",
			answers: ["Открыть ссылку и проверить, куда она ведёт", "Ответить отправителю и спросить, настоящее ли письмо", "Не нажимать ссылку и открыть сервис через официальное приложение или сайт"],
			correct: 2,
			feedback: "Поддельный адрес может отличаться всего одним символом. Открой сервис самостоятельно через официальное приложение или сайт."
		},
		{
			question: "Незнакомец обещает приз, но просит сначала оплатить комиссию. Как поступить?",
			answers: ["Не платить и независимо проверить предложение", "Заплатить небольшую сумму для проверки", "Отправить данные карты, но не код"],
			correct: 0,
			feedback: "Неожиданный приз с обязательной предоплатой — повод насторожиться. Не отправляй деньги и проверь предложение независимо."
		},
		{
			question: "Сообщение от службы доставки просит оплатить небольшую пошлину по ссылке. Что делать?",
			answers: ["Перейти по ссылке, сумма ведь небольшая", "Проверить отправление в официальном приложении или на сайте службы", "Ввести данные карты, но не подтверждать платёж"],
			correct: 1,
			feedback: "Ссылка может вести на поддельную страницу оплаты. Проверяй посылку только через официальный сайт или приложение, открытое самостоятельно."
		},
		{
			question: "Знакомый пишет с нового номера и просит срочно перевести деньги. Как лучше поступить?",
			answers: ["Сначала позвонить знакомому по сохранённому номеру и проверить просьбу", "Перевести небольшую сумму для проверки", "Попросить прислать реквизиты карты"],
			correct: 0,
			feedback: "Аккаунт или номер знакомого могли подделать. Проверь просьбу другим способом — например, позвони по уже известному номеру."
		}
	],
	practice: [
		{
			question: "Сотрудник «банка» по телефону просит код из SMS. Что делать?",
			answers: ["Назвать код, если он знает моё имя", "Завершить звонок и позвонить в банк по официальному номеру", "Перевести деньги на безопасный счёт"],
			correct: 1,
			feedback: "Банк не просит сообщать коды подтверждения. Заверши звонок и сам свяжись с банком по номеру с карты или официального сайта."
		},
		{
			question: "Письмо угрожает удалить аккаунт и содержит ссылку для входа. Как поступить?",
			answers: ["Открыть ссылку и войти", "Ответить отправителю", "Открыть сервис через официальное приложение или сайт"],
			correct: 2,
			feedback: "Ссылка может вести на поддельную страницу. Открой сервис самостоятельно и проверь уведомления там."
		},
		{
			question: "Для получения неожиданного приза просят оплатить комиссию. Что делать?",
			answers: ["Не платить и проверить предложение независимо", "Заплатить небольшую сумму", "Отправить данные карты без кода"],
			correct: 0,
			feedback: "Предоплата за неожиданный выигрыш — признак возможного обмана. Не отправляй деньги или данные карты."
		},
		{
			question: "Служба доставки прислала ссылку для оплаты маленькой пошлины. Что безопаснее?",
			answers: ["Сразу оплатить по ссылке", "Проверить посылку в официальном приложении или на сайте", "Ввести данные карты, но отменить платёж"],
			correct: 1,
			feedback: "Ссылка может вести на поддельную страницу оплаты. Найди сайт службы доставки самостоятельно и проверь статус посылки."
		},
		{
			question: "Знакомый пишет с нового номера и срочно просит деньги. Как проверить просьбу?",
			answers: ["Позвонить знакомому по сохранённому номеру", "Перевести небольшую сумму", "Попросить реквизиты карты"],
			correct: 0,
			feedback: "Новый номер или аккаунт могли подделать. Проверь просьбу по уже известному тебе каналу связи."
		},
		{
			question: "Неожиданный QR-код обещает открыть страницу банка. Что делать?",
			answers: ["Сканировать и ввести пароль", "Проверить адрес страницы и открыть банк через официальное приложение", "Переслать QR-код другу"],
			correct: 1,
			feedback: "QR-код скрывает адрес ссылки. Не вводи пароль и платёжные данные на неожиданной странице; используй официальное приложение."
		},
		{
			question: "«Техподдержка» звонит сама и просит установить программу удалённого доступа. Что делать?",
			answers: ["Установить программу, чтобы проверить устройство", "Не устанавливать её и самостоятельно найти официальную поддержку", "Продиктовать код из SMS для проверки личности"],
			correct: 1,
			feedback: "Удалённый доступ может открыть постороннему твои данные и приложения. Не устанавливай программы по просьбе незнакомца."
		},
		{
			question: "Покупатель прислал ссылку, чтобы «получить оплату» за товар. Что безопаснее?",
			answers: ["Ввести данные карты на странице", "Продолжить сделку только внутри официального приложения площадки", "Отправить код подтверждения покупателю"],
			correct: 1,
			feedback: "Ссылка может вести на поддельную страницу. Переписывайся и проводи оплату только внутри официальной площадки."
		},
		{
			question: "Работодатель обещает доход за простые задания, но требует сначала внести залог. Что делать?",
			answers: ["Не платить и проверить работодателя", "Внести залог, если сумма небольшая", "Отправить данные карты для оформления"],
			correct: 0,
			feedback: "Не плати, чтобы получить работу или зарплату. Проверь компанию по независимым источникам."
		},
		{
			question: "Незнакомец предлагает получить деньги на свой счёт и переслать их дальше за вознаграждение. Как поступить?",
			answers: ["Согласиться, если обещают комиссию", "Попросить прислать документы", "Не принимать и не пересылать чужие деньги, рассказать доверенному взрослому"],
			correct: 2,
			feedback: "Так можно стать посредником в незаконном переводе. Не используй свой счёт для чужих денег и обратись за советом к взрослому или в банк."
		}
	]
};

document.querySelectorAll("[data-quiz-run]").forEach((quizRoot) => {
	const questions = quizQuestionSets[quizRoot.dataset.quizRun];
	if (!questions) return;

	const form = quizRoot.querySelector(".quiz-form");
	const questionCount = quizRoot.querySelector(".quiz-count");
	const questionTitle = quizRoot.querySelector(".quiz-question");
	const questionOptions = quizRoot.querySelector(".quiz-options");
	const questionFeedback = quizRoot.querySelector(".quiz-feedback");
	const questionNext = quizRoot.querySelector("#quick-next");
	const reopenResultButton = quizRoot.querySelector("#quick-open-result");
	const resultDialog = quizRoot.querySelector(".quiz-result-dialog");
	const resultCard = quizRoot.querySelector(".quiz-result");
	const resultReviewButton = quizRoot.querySelector("#show-answers");
	const retryButton = quizRoot.querySelector("#retry-quiz");
	const reviewPanel = quizRoot.querySelector(".quiz-review");
	const reviewNavigation = quizRoot.querySelector(".review-navigation");
	const reviewQuestionTitle = quizRoot.querySelector(".review-question-title");
	const reviewOptions = quizRoot.querySelector(".review-options");
	const reviewExplanation = quizRoot.querySelector(".review-explanation");
	const reviewResultButton = quizRoot.querySelector("#close-review");
	let questionIndex = 0;
	let correctAnswers = 0;
	let selectedAnswers = [];
	let completed = false;
	let reviewIndex = 0;

	function renderQuestion() {
		const question = questions[questionIndex];
		questionCount.hidden = false;
		questionTitle.hidden = false;
		questionOptions.hidden = false;
		questionFeedback.hidden = false;
		updateText(questionCount, `Вопрос ${questionIndex + 1} из ${questions.length}`);
		updateText(questionTitle, question.question);
		updateText(questionFeedback, "");
		questionOptions.replaceChildren();
		questionNext.hidden = selectedAnswers[questionIndex] === undefined;
		questionNext.disabled = true;
		questionNext.textContent = questionIndex === questions.length - 1 ? "Завершить тест" : "Дальше";

		question.answers.forEach((answer, answerIndex) => {
			const button = document.createElement("button");
			button.className = "choice-button";
			button.type = "button";
			button.textContent = answer;
			button.classList.add("quiz-option-entering");
			button.style.animationDelay = `${answerIndex * 45}ms`;
			button.addEventListener("click", () => {
				if (selectedAnswers[questionIndex] !== undefined || completed) return;
				selectedAnswers[questionIndex] = answerIndex;
				questionOptions.querySelectorAll("button").forEach((option, optionIndex) => {
					option.disabled = true;
					if (optionIndex === answerIndex) option.classList.add("is-selected");
					if (quizRoot.dataset.feedbackMode === "immediate") {
						option.classList.add(optionIndex === question.correct ? "is-correct" : "is-wrong");
					}
				});
				updateText(questionFeedback, quizRoot.dataset.feedbackMode === "immediate"
					? `${answerIndex === question.correct ? "Верно. " : "Не совсем. "}${question.feedback}`
					: "Ответ сохранён. Результат появится после завершения теста.");
				questionNext.disabled = false;
				questionNext.hidden = false;
			});
			questionOptions.append(button);
		});
	}

	function renderReview(index) {
		reviewIndex = index;
		const question = questions[reviewIndex];
		reviewNavigation.replaceChildren();
		questions.forEach((item, itemIndex) => {
			const button = document.createElement("button");
			button.className = "review-nav-button";
			button.type = "button";
			button.textContent = String(itemIndex + 1);
			button.setAttribute("aria-label", `Вопрос ${itemIndex + 1}`);
			button.setAttribute("aria-current", String(itemIndex === reviewIndex));
			button.classList.toggle("is-correct", selectedAnswers[itemIndex] === item.correct);
			button.classList.toggle("is-wrong", selectedAnswers[itemIndex] !== item.correct);
			button.addEventListener("click", () => renderReview(itemIndex));
			reviewNavigation.append(button);
		});

		updateText(reviewQuestionTitle, `${reviewIndex + 1}. ${question.question}`);
		reviewOptions.replaceChildren();
		question.answers.forEach((answer, answerIndex) => {
			const option = document.createElement("div");
			option.className = `review-option ${answerIndex === question.correct ? "is-correct" : "is-wrong"}`;
			const text = document.createElement("span");
			text.textContent = answer;
			const state = document.createElement("strong");
			state.textContent = answerIndex === question.correct ? "Правильный ответ" : "Неправильный ответ";
			option.append(text, state);
			reviewOptions.append(option);
		});
		updateText(reviewExplanation, question.feedback);
	}

	function finishQuiz() {
		correctAnswers = selectedAnswers.reduce((score, answer, index) => score + Number(answer === questions[index].correct), 0);
		completed = true;
		questionCount.hidden = true;
		questionTitle.hidden = true;
		questionOptions.hidden = true;
		questionFeedback.hidden = true;
		questionNext.hidden = true;
		reopenResultButton.hidden = false;
		const passed = correctAnswers === questions.length;
		resultCard.classList.toggle("is-passed", passed);
		resultCard.classList.toggle("is-failed", !passed);
		quizRoot.querySelector(".result-icon").textContent = passed ? "🛡️" : "☠";
		updateText(quizRoot.querySelector("#result-title"), passed ? "Отлично! Все ответы верны." : "Тебя обманули — но только в тренировке.");
		updateText(quizRoot.querySelector("#result-message"), passed
			? "Ты заметил все подозрительные признаки. Сохраняй спокойствие и продолжай проверять информацию."
			: "Это учебная симуляция: настоящий аккаунт не взломан. Посмотри разбор, чтобы узнать, что можно было заметить.");
		updateText(quizRoot.querySelector("#result-score"), `Правильных ответов: ${correctAnswers} из ${questions.length}`);
		lockPageScroll();
		resultDialog.showModal();
	}

	questionNext.addEventListener("click", () => {
		if (selectedAnswers[questionIndex] === undefined) return;
		if (questionIndex < questions.length - 1) {
			questionIndex += 1;
			renderQuestion();
			return;
		}
		finishQuiz();
	});

	resultReviewButton.addEventListener("click", () => {
		resultDialog.close("review");
		unlockPageScroll();
		form.hidden = true;
		reviewPanel.hidden = false;
		renderReview(0);
	});

	retryButton.addEventListener("click", () => resultDialog.close("retry"));
	quizRoot.querySelector(".result-close").addEventListener("click", () => resultDialog.close("close"));
	reopenResultButton.addEventListener("click", () => {
		lockPageScroll();
		resultDialog.showModal();
	});

	resultDialog.addEventListener("close", () => {
		if (resultDialog.returnValue === "review") return;
		unlockPageScroll();
		if (resultDialog.returnValue === "retry") {
			questionIndex = 0;
			correctAnswers = 0;
			selectedAnswers = [];
			completed = false;
			reopenResultButton.hidden = true;
			reviewPanel.hidden = true;
			form.hidden = false;
			renderQuestion();
			return;
		}
		reopenResultButton.hidden = false;
	});

	reviewResultButton.addEventListener("click", () => {
		reviewPanel.hidden = true;
		form.hidden = false;
		lockPageScroll();
		resultDialog.showModal();
	});

	renderQuestion();
});

const selectedClues = new Set();
const clueNames = ["sender", "rush", "link", "code"];
const spotFeedback = document.getElementById("spot-feedback");
const checkCluesButton = document.getElementById("check-clues");

if (checkCluesButton) {
document.querySelectorAll("[data-clue]").forEach((button) => {
	button.addEventListener("click", () => {
		const clue = button.dataset.clue;
		if (selectedClues.has(clue)) {
			selectedClues.delete(clue);
			button.setAttribute("aria-pressed", "false");
		} else {
			selectedClues.add(clue);
			button.setAttribute("aria-pressed", "true");
		}
		updateText(spotFeedback, `Отмечено: ${selectedClues.size}`);
	});
});

checkCluesButton.addEventListener("click", () => {
	const correctCount = clueNames.filter((clue) => selectedClues.has(clue)).length;
	const wrongCount = selectedClues.size - correctCount;
	if (correctCount === clueNames.length && wrongCount === 0) {
		updateText(spotFeedback, "Верно: подозрительны имя отправителя, давление временем, ссылка и просьба переслать код.");
	} else {
		updateText(spotFeedback, `Ты нашёл ${correctCount} из ${clueNames.length} признаков${wrongCount ? ` и отметил ${wrongCount} лишних` : ""}. Проверь просьбу о коде, ссылку, срочность и отправителя.`);
	}
});

document.getElementById("reset-clues").addEventListener("click", () => {
	selectedClues.clear();
	document.querySelectorAll("[data-clue]").forEach((button) => button.setAttribute("aria-pressed", "false"));
	updateText(spotFeedback, "");
});
}

const rehearsalFeedback = document.getElementById("rehearsal-feedback");
const rehearsalChoices = document.querySelectorAll("[data-final-choice]");
const rehearsalReset = document.getElementById("rehearsal-reset");

if (rehearsalReset) {
rehearsalChoices.forEach((button) => {
	button.addEventListener("click", () => {
		const correct = button.dataset.finalChoice === "ignore";
		rehearsalChoices.forEach((choice) => {
			choice.disabled = true;
			if (choice.dataset.finalChoice === "ignore") choice.classList.add("is-correct");
		});
		if (!correct) button.classList.add("is-wrong");
		updateText(rehearsalFeedback, correct
			? "Верно. Код подтверждения предназначен только для тебя. Не отвечай и проверь аккаунт через официальный канал."
			: "Не отправляй код: он может дать доступ к аккаунту. Безопасный шаг — прекратить переписку и проверить аккаунт через официальный канал.");
		rehearsalReset.hidden = false;
	});
});

rehearsalReset.addEventListener("click", () => {
	rehearsalChoices.forEach((button) => {
		button.disabled = false;
		button.classList.remove("is-correct", "is-wrong");
	});
	updateText(rehearsalFeedback, "");
	rehearsalReset.hidden = true;
});
}
