const carousel = document.querySelector(".carousel");

if (carousel) {
	const slides = Array.from(carousel.querySelectorAll(".carousel-card"));
	const dots = Array.from(document.querySelectorAll(".carousel-dot"));
	const status = document.querySelector(".carousel-status");
	const viewport = carousel.querySelector(".carousel-viewport");
	let activeIndex = 0;
	let pointerStart = null;

	function showSlide(index) {
		activeIndex = (index + slides.length) % slides.length;

		slides.forEach((slide, slideIndex) => {
			const isActive = slideIndex === activeIndex;
			slide.hidden = !isActive;
			slide.setAttribute("aria-hidden", String(!isActive));
		});

		dots.forEach((dot, dotIndex) => {
			const isActive = dotIndex === activeIndex;
			dot.classList.toggle("is-active", isActive);
			dot.setAttribute("aria-pressed", String(isActive));
		});

		status.textContent = `Совет ${activeIndex + 1} из ${slides.length}`;
	}

	carousel.addEventListener("click", (event) => {
		const arrow = event.target.closest("[data-direction]");
		if (arrow) {
			showSlide(activeIndex + (arrow.dataset.direction === "next" ? 1 : -1));
		}
	});

	document.querySelector(".carousel-dots").addEventListener("click", (event) => {
		const dot = event.target.closest(".carousel-dot");
		if (dot) {
			showSlide(dots.indexOf(dot));
		}
	});

	carousel.addEventListener("keydown", (event) => {
		if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
			event.preventDefault();
			showSlide(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
		}
	});

	viewport.addEventListener("pointerdown", (event) => {
		pointerStart = { x: event.clientX, y: event.clientY };
	});

	viewport.addEventListener("pointerup", (event) => {
		if (!pointerStart) return;

		const deltaX = event.clientX - pointerStart.x;
		const deltaY = event.clientY - pointerStart.y;
		pointerStart = null;

		if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
			showSlide(activeIndex + (deltaX < 0 ? 1 : -1));
		}
	});

	viewport.addEventListener("pointercancel", () => {
		pointerStart = null;
	});

	showSlide(0);
}
