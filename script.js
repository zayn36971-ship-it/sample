/* ============================================================
   IZAN PORT — Premium Futuristic Portfolio
   Complete Production-Ready JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* ----------------------------------------------------------
     0. GLOBAL CONSTANTS & STATE
  ---------------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 1025;
  const isScrollMode = isMobile; // Mobile uses scroll layout, desktop uses slide-based

  const STATE = {
    currentSlide: 0,
    totalSlides: 11,
    isTransitioning: false,
    transitionDuration: 900,
    mouseX: 0,
    mouseY: 0,
    cursorDotX: 0,
    cursorDotY: 0,
    cursorGlowX: 0,
    cursorGlowY: 0,
    glowX: 0,
    glowY: 0,
    touchStartY: 0,
    touchStartX: 0,
    particlesArray: [],
    animationFrameIds: [],
    resizeTimer: null,
  };

  /* ----------------------------------------------------------
     UTILITY HELPERS
  ---------------------------------------------------------- */
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function debounce(fn, delay) {
    let timer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  /* ----------------------------------------------------------
     DOM REFERENCES
  ---------------------------------------------------------- */
  const loadingScreen = document.getElementById('loading-screen');
  const loadingBar = loadingScreen ? loadingScreen.querySelector('.loading-bar') : null;
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorGlow = document.querySelector('.cursor-glow');
  const mouseGlow = document.getElementById('mouse-glow');
  const particlesCanvas = document.getElementById('particles-canvas');
  const morphingGlow = document.getElementById('morphing-glow');
  const nav = document.getElementById('nav');
  const slidesContainer = document.getElementById('slides-container');
  const slides = document.querySelectorAll('.slide');
  const navDots = document.querySelectorAll('.nav-dot');
  const navLinks = document.querySelectorAll('.nav-link');
  const navHamburger = document.getElementById('nav-hamburger');
  const navLinksContainer = document.getElementById('nav-links');
  const progressFill = document.querySelector('.progress-fill');
  const scrollIndicator = document.querySelector('.scroll-indicator');

  /* ==========================================================
     1. LOADING SCREEN
  ========================================================== */
  function initLoadingScreen() {
    if (!loadingScreen) return;

    if (loadingBar) {
      loadingBar.style.transition = 'width 2.5s cubic-bezier(0.23, 1, 0.32, 1)';
      loadingBar.style.width = '0%';
      requestAnimationFrame(function () {
        loadingBar.style.width = '100%';
      });
    }

    setTimeout(function () {
      loadingScreen.classList.add('loaded');
      setTimeout(function () {
        loadingScreen.style.display = 'none';
        if (isScrollMode) {
          // In scroll mode, all slides are already visible via CSS.
          // IntersectionObserver handles animations.
        } else {
          animateSlide(0);
        }
      }, 800);
    }, 2500);
  }

  /* ==========================================================
     2. CUSTOM CURSOR
  ========================================================== */
  function initCustomCursor() {
    if (isMobile || !cursorDot || !cursorGlow) {
      if (cursorDot) cursorDot.style.display = 'none';
      if (cursorGlow) cursorGlow.style.display = 'none';
      return;
    }

    document.addEventListener('mousemove', function (e) {
      STATE.mouseX = e.clientX;
      STATE.mouseY = e.clientY;
    });

    var isHovering = false;
    var interactiveSelectors = 'a, button, .glass-card, .nav-dot, .magnetic-btn, input, textarea, [role="button"]';

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(interactiveSelectors)) {
        if (!isHovering) {
          isHovering = true;
          cursorDot.style.transform = 'translate(-50%, -50%) scale(1.8)';
          cursorGlow.style.transform = 'translate(-50%, -50%) scale(1.6)';
          cursorGlow.style.opacity = '1';
        }
      }
    });

    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(interactiveSelectors)) {
        isHovering = false;
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorGlow.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorGlow.style.opacity = '0.6';
      }
    });

    document.addEventListener('mousedown', function () {
      cursorDot.style.transform = 'translate(-50%, -50%) scale(0.7)';
      cursorGlow.style.transform = 'translate(-50%, -50%) scale(0.8)';
    });

    document.addEventListener('mouseup', function () {
      var scale = isHovering ? 1.8 : 1;
      var glowScale = isHovering ? 1.6 : 1;
      cursorDot.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
      cursorGlow.style.transform = 'translate(-50%, -50%) scale(' + glowScale + ')';
    });

    function updateCursor() {
      STATE.cursorDotX = lerp(STATE.cursorDotX, STATE.mouseX, 0.35);
      STATE.cursorDotY = lerp(STATE.cursorDotY, STATE.mouseY, 0.35);
      STATE.cursorGlowX = lerp(STATE.cursorGlowX, STATE.mouseX, 0.15);
      STATE.cursorGlowY = lerp(STATE.cursorGlowY, STATE.mouseY, 0.15);

      cursorDot.style.left = STATE.cursorDotX + 'px';
      cursorDot.style.top = STATE.cursorDotY + 'px';
      cursorGlow.style.left = STATE.cursorGlowX + 'px';
      cursorGlow.style.top = STATE.cursorGlowY + 'px';

      requestAnimationFrame(updateCursor);
    }

    requestAnimationFrame(updateCursor);
  }

  /* ==========================================================
     3. MOUSE GLOW
  ========================================================== */
  function initMouseGlow() {
    if (!mouseGlow || isMobile) return;

    var glowOffset = 200;

    function updateGlow() {
      STATE.glowX = lerp(STATE.glowX, STATE.mouseX, 0.08);
      STATE.glowY = lerp(STATE.glowY, STATE.mouseY, 0.08);

      mouseGlow.style.transform =
        'translate(' + (STATE.glowX - glowOffset) + 'px, ' + (STATE.glowY - glowOffset) + 'px)';

      requestAnimationFrame(updateGlow);
    }

    requestAnimationFrame(updateGlow);
  }

  /* ==========================================================
     4. PARTICLE SYSTEM
  ========================================================== */
  function initParticles() {
    if (!particlesCanvas || prefersReducedMotion) return;

    var ctx = particlesCanvas.getContext('2d');
    var particleCount = isMobile ? 30 : 80;
    var connectionDistance = 120;

    function resizeCanvas() {
      particlesCanvas.width = window.innerWidth;
      particlesCanvas.height = window.innerHeight;
    }
    resizeCanvas();

    function createParticle() {
      return {
        x: Math.random() * particlesCanvas.width,
        y: Math.random() * particlesCanvas.height,
        radius: randomRange(0.5, 2),
        speedX: randomRange(-0.3, 0.3),
        speedY: randomRange(-0.3, 0.3),
        opacity: randomRange(0.1, 0.5),
      };
    }

    STATE.particlesArray = [];
    for (var i = 0; i < particleCount; i++) {
      STATE.particlesArray.push(createParticle());
    }

    function drawParticle(p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(13, 107, 232, ' + p.opacity + ')';
      ctx.fill();
    }

    function drawConnections() {
      for (var i = 0; i < STATE.particlesArray.length; i++) {
        for (var j = i + 1; j < STATE.particlesArray.length; j++) {
          var dx = STATE.particlesArray[i].x - STATE.particlesArray[j].x;
          var dy = STATE.particlesArray[i].y - STATE.particlesArray[j].y;
          var distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            var proximityFactor = 1 - distance / connectionDistance;
            var alpha = 0.05 * proximityFactor;
            ctx.beginPath();
            ctx.moveTo(STATE.particlesArray[i].x, STATE.particlesArray[i].y);
            ctx.lineTo(STATE.particlesArray[j].x, STATE.particlesArray[j].y);
            ctx.strokeStyle = 'rgba(13, 107, 232, ' + alpha + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function updateParticles() {
      for (var i = 0; i < STATE.particlesArray.length; i++) {
        var p = STATE.particlesArray[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = particlesCanvas.width;
        if (p.x > particlesCanvas.width) p.x = 0;
        if (p.y < 0) p.y = particlesCanvas.height;
        if (p.y > particlesCanvas.height) p.y = 0;
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
      updateParticles();
      drawConnections();
      for (var i = 0; i < STATE.particlesArray.length; i++) {
        drawParticle(STATE.particlesArray[i]);
      }
      requestAnimationFrame(animateParticles);
    }

    requestAnimationFrame(animateParticles);

    window.addEventListener('resize', resizeCanvas);
  }

  /* ==========================================================
     5. SLIDE TRANSITION SYSTEM
  ========================================================== */
  function updateProgressBar() {
    var progressFill = document.getElementById('progress-fill');
    var progressLabel = document.getElementById('progress-label');
    if (!progressFill || !progressLabel) return;

    var total = STATE.totalSlides || 11;
    var current = STATE.currentSlide + 1;
    var percentage = (current / total) * 100;

    progressFill.style.height = percentage + '%';

    var currentStr = current < 10 ? '0' + current : '' + current;
    var totalStr = total < 10 ? '0' + total : '' + total;
    progressLabel.textContent = currentStr + ' / ' + totalStr;
  }

  function updateScrollIndicator() {
    if (!scrollIndicator) return;
    if (STATE.currentSlide === 0) {
      scrollIndicator.style.opacity = '1';
      scrollIndicator.style.visibility = 'visible';
    } else {
      scrollIndicator.style.opacity = '0';
      scrollIndicator.style.visibility = 'hidden';
    }
  }

  function updateNavLinks() {
    navLinks.forEach(function (link, i) {
      link.classList.remove('active');
      if (parseInt(link.getAttribute('data-slide')) === STATE.currentSlide) {
        link.classList.add('active');
      }
    });
    navDots.forEach(function (dot, i) {
      dot.classList.remove('active');
      if (i === STATE.currentSlide) {
        dot.classList.add('active');
      }
    });
  }

  function goToSlide(index) {
    if (STATE.isTransitioning) return;
    if (index === STATE.currentSlide) return;
    if (index < 0 || index >= STATE.totalSlides) return;

    STATE.isTransitioning = true;

    var direction = index > STATE.currentSlide ? 'down' : 'up';
    var currentSlideEl = slides[STATE.currentSlide];
    var nextSlideEl = slides[index];

    if (!currentSlideEl || !nextSlideEl) {
      STATE.isTransitioning = false;
      return;
    }

    var exitClass = direction === 'down' ? 'exit-up' : 'exit-down';

    currentSlideEl.classList.add(exitClass);
    currentSlideEl.classList.remove('active');

    nextSlideEl.classList.add('active');

    STATE.currentSlide = index;

    updateNavLinks();
    updateProgressBar();
    updateScrollIndicator();
    animateSlide(index);
    updateMorphingGlow(index);

    var capturedExitClass = exitClass;
    var capturedSlideEl = currentSlideEl;

    setTimeout(function () {
      capturedSlideEl.classList.remove(capturedExitClass);
      clearSlideAnimations(capturedSlideEl);
      STATE.isTransitioning = false;
    }, STATE.transitionDuration);
  }

  function clearSlideAnimations(slideEl) {
    var animatedElements = slideEl.querySelectorAll('.visible');
    animatedElements.forEach(function (el) {
      el.classList.remove('visible');
    });

    var skillFills = slideEl.querySelectorAll('.skill-fill');
    skillFills.forEach(function (fill) {
      fill.style.width = '0%';
    });
  }

  /* --- Scroll Handling (Desktop only) --- */
  function handleWheel(e) {
    e.preventDefault();
    if (STATE.isTransitioning) return;

    if (e.deltaY > 0) {
      goToSlide(STATE.currentSlide + 1);
    } else if (e.deltaY < 0) {
      goToSlide(STATE.currentSlide - 1);
    }
  }

  if (!isScrollMode) {
    window.addEventListener('wheel', handleWheel, { passive: false });
  }

  /* --- Touch Handling (Desktop only — mobile scrolls naturally) --- */
  if (!isScrollMode) {
    window.addEventListener(
      'touchstart',
      function (e) {
        if (e.changedTouches && e.changedTouches.length > 0) {
          STATE.touchStartY = e.changedTouches[0].clientY;
          STATE.touchStartX = e.changedTouches[0].clientX;
        }
      },
      { passive: true }
    );

    window.addEventListener(
      'touchend',
      function (e) {
        if (STATE.isTransitioning) return;
        if (!e.changedTouches || e.changedTouches.length === 0) return;

        var touchEndY = e.changedTouches[0].clientY;
        var deltaY = STATE.touchStartY - touchEndY;

        if (Math.abs(deltaY) < 40) return;

        if (deltaY > 40) {
          goToSlide(STATE.currentSlide + 1);
        } else if (deltaY < -40) {
          goToSlide(STATE.currentSlide - 1);
        }
      },
      { passive: true }
    );
  }

  /* --- Keyboard Navigation (Desktop only) --- */
  if (!isScrollMode) {
    window.addEventListener('keydown', function (e) {
      if (STATE.isTransitioning) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          goToSlide(STATE.currentSlide + 1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          goToSlide(STATE.currentSlide - 1);
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(STATE.totalSlides - 1);
          break;
      }
    });
  }

  /* --- Nav Dot Clicks --- */
  navDots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      goToSlide(index);
    });

    dot.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToSlide(index);
      }
    });
  });

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var slideIndex = parseInt(this.getAttribute('data-slide'));
      if (isScrollMode) {
        // Mobile: smooth scroll to the section
        var targetSlide = slides[slideIndex];
        if (targetSlide) {
          targetSlide.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        goToSlide(slideIndex);
      }
      if (navLinksContainer) navLinksContainer.classList.remove('open');
      if (navHamburger) navHamburger.classList.remove('active');
      var navEl = document.getElementById('nav');
      if (navEl) navEl.classList.remove('menu-open');
    });
  });

  if (navHamburger) {
    navHamburger.addEventListener('click', function () {
      this.classList.toggle('active');
      navLinksContainer.classList.toggle('open');
      var navEl = document.getElementById('nav');
      if (navEl) navEl.classList.toggle('menu-open');
      this.setAttribute('aria-expanded', this.classList.contains('active'));
    });
  }

  document.addEventListener('click', function (e) {
    var slideTarget = e.target.closest('[data-slide]');
    if (slideTarget) {
      var href = slideTarget.getAttribute('href');
      if (!href || href === '#' || href.startsWith('#')) {
        var slideVal = slideTarget.getAttribute('data-slide');
        if (slideVal !== null && slideVal !== '') {
          var slideIndex = parseInt(slideVal, 10);
          if (!isNaN(slideIndex)) {
            e.preventDefault();
            if (isScrollMode) {
              var targetSlide = slides[slideIndex];
              if (targetSlide) {
                targetSlide.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            } else {
              goToSlide(slideIndex);
            }
            if (navLinksContainer) navLinksContainer.classList.remove('open');
            if (navHamburger) navHamburger.classList.remove('active');
            var navEl = document.getElementById('nav');
            if (navEl) navEl.classList.remove('menu-open');
          }
        }
      }
    }
  });

  /* ==========================================================
     5b. MOBILE SCROLL-MODE — IntersectionObserver Animations
  ========================================================== */
  function initMobileScrollAnimations() {
    if (!isScrollMode) return;

    // Make all slides visible immediately (CSS handles this too, but JS backup)
    slides.forEach(function (slide) {
      slide.classList.add('active');
    });

    // Track which slides have been animated to avoid re-triggering
    var animatedSlides = {};

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var slide = entry.target;
          // Find the index of this slide
          for (var i = 0; i < slides.length; i++) {
            if (slides[i] === slide && !animatedSlides[i]) {
              animatedSlides[i] = true;
              animateSlide(i);
              break;
            }
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    slides.forEach(function (slide) {
      observer.observe(slide);
    });
  }

  /* ==========================================================
     6. SLIDE-SPECIFIC ANIMATIONS
  ========================================================== */
  function animateSlide(index) {
    var slide = slides[index];
    if (!slide) return;

    var duration = (prefersReducedMotion || isScrollMode) ? 0 : undefined;

    switch (index) {
      case 0:
        animateHeroSlide(slide, duration);
        break;
      case 1:
        animateHeroSlide(slide, duration); // Hero Section / Home Intro
        break;
      case 2:
        animateCardsSlide(slide, duration); // Expertise
        break;
      case 3:
        animateGenericSlide(slide, duration); // Tools
        triggerToolsFirstTimeSpin(slide);
        break;
      case 4:
        animateGenericSlide(slide, duration); // Process
        break;
      case 5:
        animateGenericSlide(slide, duration); // Case Studies
        break;
      case 6:
        animateCardsSlide(slide, duration); // Reports
        break;
      case 7:
        animateGenericSlide(slide, duration); // Automation
        break;
      case 8:
        animateCardsSlide(slide, duration); // Why Me
        break;
      case 9:
        animateContactSlide(slide, duration); // Contact
        break;
      case 10:
        animateThankYouSlide(slide, duration); // Thank You
        break;
      default:
        animateGenericSlide(slide, duration);
        break;
    }
  }

  function staggerReveal(elements, baseDelay, intervalDelay) {
    elements.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('visible');
      }, baseDelay + i * intervalDelay);
    });
  }

  function animateHeroSlide(slide, duration) {
    var fadeUps = slide.querySelectorAll('.fade-up');
    var fadeLefts = slide.querySelectorAll('.fade-left');
    var fadeRights = slide.querySelectorAll('.fade-right');
    var scaleIns = slide.querySelectorAll('.scale-in');
    var blurIns = slide.querySelectorAll('.blur-in');

    var allAnimated = [];
    fadeUps.forEach(function (el) { allAnimated.push(el); });
    fadeLefts.forEach(function (el) { allAnimated.push(el); });
    fadeRights.forEach(function (el) { allAnimated.push(el); });
    scaleIns.forEach(function (el) { allAnimated.push(el); });
    blurIns.forEach(function (el) { allAnimated.push(el); });

    if (duration === 0) {
      allAnimated.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    staggerReveal(allAnimated, 200, 120);
  }

  function animateIntroSlide(slide, duration) {
    var fadeUps = slide.querySelectorAll('.fade-up');
    var fadeLefts = slide.querySelectorAll('.fade-left');
    var fadeRights = slide.querySelectorAll('.fade-right');
    var scaleIns = slide.querySelectorAll('.scale-in');
    var blurIns = slide.querySelectorAll('.blur-in');
    var buttons = slide.querySelectorAll('.btn-primary, .btn-secondary, .magnetic-btn');

    var allAnimated = [];
    fadeUps.forEach(function (el) { allAnimated.push(el); });
    fadeLefts.forEach(function (el) { allAnimated.push(el); });
    fadeRights.forEach(function (el) { allAnimated.push(el); });
    scaleIns.forEach(function (el) { allAnimated.push(el); });
    blurIns.forEach(function (el) { allAnimated.push(el); });
    buttons.forEach(function (el) { allAnimated.push(el); });

    if (duration === 0) {
      allAnimated.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    staggerReveal(allAnimated, 150, 100);
  }

  function animateAboutSlide(slide, duration) {
    var fadeUps = slide.querySelectorAll('.fade-up');
    var fadeLefts = slide.querySelectorAll('.fade-left');
    var fadeRights = slide.querySelectorAll('.fade-right');
    var scaleIns = slide.querySelectorAll('.scale-in');
    var blurIns = slide.querySelectorAll('.blur-in');

    var allAnimated = [];
    fadeUps.forEach(function (el) { allAnimated.push(el); });
    fadeLefts.forEach(function (el) { allAnimated.push(el); });
    fadeRights.forEach(function (el) { allAnimated.push(el); });
    scaleIns.forEach(function (el) { allAnimated.push(el); });
    blurIns.forEach(function (el) { allAnimated.push(el); });

    if (duration === 0) {
      allAnimated.forEach(function (el) { el.classList.add('visible'); });
    } else {
      staggerReveal(allAnimated, 100, 130);
    }

    var counters = slide.querySelectorAll('.counter-number');
    counters.forEach(function (counter, i) {
      setTimeout(function () {
        animateCounter(counter);
      }, 400 + i * 200);
    });
  }

  function animateSkillsSlide(slide, duration) {
    var fadeUps = slide.querySelectorAll('.fade-up');
    var fadeLefts = slide.querySelectorAll('.fade-left');
    var fadeRights = slide.querySelectorAll('.fade-right');
    var scaleIns = slide.querySelectorAll('.scale-in');
    var blurIns = slide.querySelectorAll('.blur-in');

    var allAnimated = [];
    fadeUps.forEach(function (el) { allAnimated.push(el); });
    fadeLefts.forEach(function (el) { allAnimated.push(el); });
    fadeRights.forEach(function (el) { allAnimated.push(el); });
    scaleIns.forEach(function (el) { allAnimated.push(el); });
    blurIns.forEach(function (el) { allAnimated.push(el); });

    if (duration === 0) {
      allAnimated.forEach(function (el) { el.classList.add('visible'); });
    } else {
      staggerReveal(allAnimated, 100, 100);
    }

    animateSkillBars(slide);
  }

  function animateCardsSlide(slide, duration) {
    var fadeUps = slide.querySelectorAll('.fade-up');
    var fadeLefts = slide.querySelectorAll('.fade-left');
    var fadeRights = slide.querySelectorAll('.fade-right');
    var scaleIns = slide.querySelectorAll('.scale-in');
    var blurIns = slide.querySelectorAll('.blur-in');
    var cards = slide.querySelectorAll('.glass-card');

    var textElements = [];
    fadeUps.forEach(function (el) {
      if (!el.classList.contains('glass-card')) textElements.push(el);
    });
    fadeLefts.forEach(function (el) {
      if (!el.classList.contains('glass-card')) textElements.push(el);
    });
    fadeRights.forEach(function (el) {
      if (!el.classList.contains('glass-card')) textElements.push(el);
    });
    scaleIns.forEach(function (el) {
      if (!el.classList.contains('glass-card')) textElements.push(el);
    });
    blurIns.forEach(function (el) {
      if (!el.classList.contains('glass-card')) textElements.push(el);
    });

    if (duration === 0) {
      textElements.forEach(function (el) { el.classList.add('visible'); });
      cards.forEach(function (card) { card.classList.add('visible'); });
      return;
    }

    staggerReveal(textElements, 100, 100);

    cards.forEach(function (card, i) {
      setTimeout(function () {
        card.classList.add('visible');
      }, 300 + i * 150);
    });
  }

  function animateContactSlide(slide, duration) {
    var fadeUps = slide.querySelectorAll('.fade-up');
    var fadeLefts = slide.querySelectorAll('.fade-left');
    var fadeRights = slide.querySelectorAll('.fade-right');
    var scaleIns = slide.querySelectorAll('.scale-in');
    var blurIns = slide.querySelectorAll('.blur-in');
    var cards = slide.querySelectorAll('.glass-card');

    var allAnimated = [];
    fadeUps.forEach(function (el) { allAnimated.push(el); });
    fadeLefts.forEach(function (el) { allAnimated.push(el); });
    fadeRights.forEach(function (el) { allAnimated.push(el); });
    scaleIns.forEach(function (el) { allAnimated.push(el); });
    blurIns.forEach(function (el) { allAnimated.push(el); });

    if (duration === 0) {
      allAnimated.forEach(function (el) { el.classList.add('visible'); });
      cards.forEach(function (card) { card.classList.add('visible'); });
      return;
    }

    staggerReveal(allAnimated, 100, 120);

    cards.forEach(function (card, i) {
      setTimeout(function () {
        card.classList.add('visible');
      }, 250 + i * 180);
    });
  }

  function animateThankYouSlide(slide, duration) {
    var fadeUps = slide.querySelectorAll('.fade-up');
    var fadeLefts = slide.querySelectorAll('.fade-left');
    var fadeRights = slide.querySelectorAll('.fade-right');
    var scaleIns = slide.querySelectorAll('.scale-in');
    var blurIns = slide.querySelectorAll('.blur-in');

    var allAnimated = [];
    fadeUps.forEach(function (el) { allAnimated.push(el); });
    fadeLefts.forEach(function (el) { allAnimated.push(el); });
    fadeRights.forEach(function (el) { allAnimated.push(el); });
    scaleIns.forEach(function (el) { allAnimated.push(el); });
    blurIns.forEach(function (el) { allAnimated.push(el); });

    if (duration === 0) {
      allAnimated.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    allAnimated.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('visible');
        if (i === 0) {
          el.style.animation = 'thankYouPulse 2s ease-in-out infinite';
        }
      }, 200 + i * 150);
    });
  }

  function animateGenericSlide(slide, duration) {
    var animatable = slide.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in, .blur-in');

    if (duration === 0) {
      animatable.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    staggerReveal(Array.from(animatable), 100, 100);
  }

  /* ==========================================================
     7. COUNTER ANIMATION
  ========================================================== */
  function animateCounter(element) {
    var rawTarget = element.getAttribute('data-target');
    if (!rawTarget) return;

    var suffix = element.getAttribute('data-suffix') || '';
    var numericString = rawTarget.replace(/[^0-9.]/g, '');
    var target = parseFloat(numericString);

    if (isNaN(target)) return;

    if (rawTarget.indexOf('+') !== -1 && suffix === '') {
      suffix = '+';
    }
    if (rawTarget.indexOf('%') !== -1 && suffix === '') {
      suffix = '%';
    }

    var startTime = null;
    var animDuration = 2000;

    function updateCounter(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / animDuration, 1);

      var easedProgress = easeOutExpo(progress);
      var currentValue = Math.floor(easedProgress * target);

      element.textContent = currentValue + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target + suffix;
      }
    }

    requestAnimationFrame(updateCounter);
  }

  /* ==========================================================
     8. SKILL BAR ANIMATION
  ========================================================== */
  function animateSkillBars(slide) {
    var skillFills = slide.querySelectorAll('.skill-fill');
    var skillPercents = slide.querySelectorAll('.skill-percent');

    skillFills.forEach(function (fill, i) {
      var targetWidth = fill.getAttribute('data-width');
      if (!targetWidth) return;

      fill.style.width = '0%';
      fill.style.transition = 'width 1.2s cubic-bezier(0.23, 1, 0.32, 1)';

      /* Mark parent for the glow dot effect */
      var parentItem = fill.closest('.skill-item');
      if (parentItem) parentItem.classList.remove('animated');

      setTimeout(function () {
        fill.style.width = targetWidth;
        if (parentItem) {
          setTimeout(function () {
            parentItem.classList.add('animated');
          }, 1200);
        }
      }, 300 + i * 200);
    });

    /* Animate the percent labels (e.g. 0% → 100%) */
    skillPercents.forEach(function (pct, i) {
      var target = parseInt(pct.getAttribute('data-target'), 10);
      if (isNaN(target)) return;

      pct.textContent = '0%';

      setTimeout(function () {
        var startTime = null;
        var animDuration = 1200;

        function updatePct(timestamp) {
          if (!startTime) startTime = timestamp;
          var elapsed = timestamp - startTime;
          var progress = Math.min(elapsed / animDuration, 1);
          var easedProgress = easeOutExpo(progress);
          var currentValue = Math.floor(easedProgress * target);
          pct.textContent = currentValue + '%';

          if (progress < 1) {
            requestAnimationFrame(updatePct);
          } else {
            pct.textContent = target + '%';
          }
        }

        requestAnimationFrame(updatePct);
      }, 300 + i * 200);
    });
  }

  /* ==========================================================
     9. 3D LEFT-RIGHT PARALLAX TILT EFFECT (EVERY CARD)
  ========================================================== */
  function init3DParallaxCards() {
    var cards = document.querySelectorAll('.glass-card, .report-card, .report-item, .why-card, .tool-logo-card, .case-card, .meeting-card, .direct-contact-card, .counter-box, .contact-card, .pdf-render-box');

    cards.forEach(function (card) {
      if (card.getAttribute('data-parallax-init')) return;
      card.setAttribute('data-parallax-init', 'true');

      card.style.transformStyle = 'preserve-3d';
      card.style.willChange = 'transform';

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var centerX = rect.width / 2;

        /* percentX ranges from -1 (far left) to +1 (far right) */
        var percentX = (x - centerX) / centerX;

        /* ONLY left/right Y-axis 3D parallax tilt:
           Left hover (percentX < 0) -> rotates Y negative (left side dips back in Z axis)
           Right hover (percentX > 0) -> rotates Y positive (right side dips back in Z axis) */
        var maxTiltDeg = 8;
        var rotateY = percentX * maxTiltDeg;

        card.style.transform = 'perspective(1000px) rotateY(' + rotateY + 'deg) translateZ(4px)';
        card.style.transition = 'transform 0.08s ease-out';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1000px) rotateY(0deg) translateZ(0px)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      });
    });
  }

  function initGlassCardEffects() {
    init3DParallaxCards();
  }

  /* ==========================================================
     10. MAGNETIC BUTTON EFFECT
  ========================================================== */
  function initMagneticButtons() {
    var magneticBtns = document.querySelectorAll('.magnetic-btn');

    magneticBtns.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;

        var maxMove = 10;
        var moveX = clamp(x * 0.3, -maxMove, maxMove);
        var moveY = clamp(y * 0.3, -maxMove, maxMove);

        btn.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
        btn.style.transition = 'transform 0.2s ease-out';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'translate(0px, 0px)';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
      });
    });
  }

  /* ==========================================================
     11. BUTTON RIPPLE EFFECT
  ========================================================== */
  function initButtonRipple() {
    var rippleButtons = document.querySelectorAll('.btn-primary, .btn-secondary');

    rippleButtons.forEach(function (btn) {
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';

      btn.addEventListener('click', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        var ripple = document.createElement('span');
        ripple.classList.add('btn-ripple');

        var size = Math.max(rect.width, rect.height) * 2;

        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = x - size / 2 + 'px';
        ripple.style.top = y - size / 2 + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'rippleExpand 600ms ease-out forwards';
        ripple.style.pointerEvents = 'none';

        btn.appendChild(ripple);

        setTimeout(function () {
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
          }
        }, 600);
      });
    });

    if (!document.getElementById('ripple-keyframes')) {
      var style = document.createElement('style');
      style.id = 'ripple-keyframes';
      style.textContent =
        '@keyframes rippleExpand {' +
        '  0% { transform: scale(0); opacity: 1; }' +
        '  100% { transform: scale(1); opacity: 0; }' +
        '}' +
        '@keyframes thankYouPulse {' +
        '  0%, 100% { transform: scale(1); }' +
        '  50% { transform: scale(1.03); }' +
        '}';
      document.head.appendChild(style);
    }
  }

  /* ==========================================================
     12. CASE STUDY TABS
  ========================================================== */
  function initCaseTabs() {
    var caseTabs = document.querySelectorAll('.case-tab');
    var casePanels = document.querySelectorAll('.case-panel');

    caseTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var caseIndex = this.getAttribute('data-case');

        caseTabs.forEach(function (t) { t.classList.remove('active'); });
        casePanels.forEach(function (p) { p.classList.remove('active'); });

        this.classList.add('active');
        var targetPanel = document.querySelector('.case-panel[data-case="' + caseIndex + '"]');
        if (targetPanel) {
          targetPanel.classList.add('active');
          var animElements = targetPanel.querySelectorAll('.fade-up, .scale-in, .blur-in');
          animElements.forEach(function (el, i) {
            el.classList.remove('visible');
            setTimeout(function () { el.classList.add('visible'); }, 100 + i * 100);
          });
        }
      });
    });
  }

  /* ==========================================================
     13. CONTACT FORM AJAX
  ========================================================== */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var statusEl = document.getElementById('form-status');
      var submitBtn = form.querySelector('.form-submit');

      var hp = form.querySelector('input[name="website"]');
      if (hp && hp.value) return;

      var tzEl = form.querySelector('#contact-timezone');
      var dateEl = form.querySelector('#contact-date');
      var timeEl = form.querySelector('#contact-time');

      var formData = {
        name: form.querySelector('#contact-name').value.trim(),
        email: form.querySelector('#contact-email').value.trim(),
        company: form.querySelector('#contact-company').value.trim(),
        service: form.querySelector('#contact-service').value,
        meeting_date: dateEl ? dateEl.value : '',
        meeting_time: timeEl ? timeEl.value : '',
        timezone: tzEl ? tzEl.value : '',
        message: form.querySelector('#contact-message').value.trim()
      };

      if (!formData.name || !formData.email || !formData.message || !formData.timezone) {
        statusEl.textContent = 'Please fill in all required fields (Name, Email, Timezone, and Message).';
        statusEl.className = 'form-status error';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Sending...';
      statusEl.textContent = '';
      statusEl.className = 'form-status';

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            statusEl.textContent = 'Thank you. Your message has been sent successfully. I will get back to you soon.';
            statusEl.className = 'form-status success';
            form.reset();
          } else {
            statusEl.textContent = data.error || 'Something went wrong. Please try again.';
            statusEl.className = 'form-status error';
          }
        })
        .catch(function () {
          statusEl.textContent = 'Network error. Please try again later.';
          statusEl.className = 'form-status error';
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.querySelector('span').textContent = 'Send Message';
        });
    });
  }

  /* ==========================================================
     14. RESIZE HANDLER
  ========================================================== */
  function initResizeHandler() {
    var debouncedResize = debounce(function () {
      if (particlesCanvas) {
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
      }

      var currentIsMobile = window.innerWidth < 1025;
      if (currentIsMobile) {
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorGlow) cursorGlow.style.display = 'none';
      } else {
        if (cursorDot) cursorDot.style.display = '';
        if (cursorGlow) cursorGlow.style.display = '';
      }
    }, 250);

    window.addEventListener('resize', debouncedResize);
  }

  /* ==========================================================
     15. REDUCED MOTION STYLES (injected via JS)
  ========================================================== */
  function initReducedMotionSupport() {
    if (!prefersReducedMotion) return;

    STATE.transitionDuration = 100;

    var style = document.createElement('style');
    style.textContent =
      '*, *::before, *::after {' +
      '  animation-duration: 0.01ms !important;' +
      '  animation-iteration-count: 1 !important;' +
      '  transition-duration: 0.01ms !important;' +
      '}' +
      '.slide { transition: none !important; }' +
      '#particles-canvas { display: none !important; }';
    document.head.appendChild(style);
  }

  /* ==========================================================
     16. AMBIENT FLOATING SHAPES
  ========================================================== */
  function initAmbientOrbs() {
    if (prefersReducedMotion) return;

    var orbCount = isMobile ? 4 : 7;
    var colors = [
      'rgba(13, 107, 232, 0.04)',
      'rgba(0, 200, 255, 0.03)',
      'rgba(100, 50, 255, 0.03)',
      'rgba(13, 107, 232, 0.05)',
      'rgba(0, 180, 220, 0.03)',
      'rgba(80, 20, 200, 0.04)',
      'rgba(13, 140, 255, 0.03)',
      'rgba(50, 100, 255, 0.04)',
    ];

    if (!document.getElementById('orb-keyframes')) {
      var orbStyle = document.createElement('style');
      orbStyle.id = 'orb-keyframes';
      orbStyle.textContent =
        '@keyframes orbFloat1 {' +
        '  0%, 100% { transform: translate(0, 0) rotate(0deg); }' +
        '  25% { transform: translate(30px, -40px) rotate(5deg); }' +
        '  50% { transform: translate(-20px, -80px) rotate(-3deg); }' +
        '  75% { transform: translate(40px, -30px) rotate(7deg); }' +
        '}' +
        '@keyframes orbFloat2 {' +
        '  0%, 100% { transform: translate(0, 0) rotate(0deg); }' +
        '  25% { transform: translate(-40px, 30px) rotate(-5deg); }' +
        '  50% { transform: translate(50px, 60px) rotate(3deg); }' +
        '  75% { transform: translate(-30px, 20px) rotate(-7deg); }' +
        '}' +
        '@keyframes orbFloat3 {' +
        '  0%, 100% { transform: translate(0, 0) scale(1); }' +
        '  33% { transform: translate(20px, -50px) scale(1.05); }' +
        '  66% { transform: translate(-30px, 30px) scale(0.95); }' +
        '}' +
        '@keyframes orbFloat4 {' +
        '  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }' +
        '  20% { transform: translate(-50px, 20px) rotate(3deg) scale(1.02); }' +
        '  40% { transform: translate(30px, -40px) rotate(-4deg) scale(0.98); }' +
        '  60% { transform: translate(-20px, -60px) rotate(5deg) scale(1.03); }' +
        '  80% { transform: translate(40px, 10px) rotate(-2deg) scale(0.97); }' +
        '}';
      document.head.appendChild(orbStyle);
    }

    var animations = ['orbFloat1', 'orbFloat2', 'orbFloat3', 'orbFloat4'];

    for (var i = 0; i < orbCount; i++) {
      var orb = document.createElement('div');
      orb.classList.add('bg-gradient-orb');

      var size = randomRange(100, 400);
      var posX = randomRange(0, 100);
      var posY = randomRange(0, 100);
      var animName = animations[i % animations.length];
      var duration = randomRange(15, 35);
      var delay = randomRange(0, 10);

      orb.style.cssText =
        'position: fixed;' +
        'width: ' + size + 'px;' +
        'height: ' + size + 'px;' +
        'left: ' + posX + '%;' +
        'top: ' + posY + '%;' +
        'border-radius: 50%;' +
        'background: ' + colors[i % colors.length] + ';' +
        'filter: blur(60px);' +
        'pointer-events: none;' +
        'z-index: 0;' +
        'animation: ' + animName + ' ' + duration + 's ' + delay + 's ease-in-out infinite;' +
        'will-change: transform;';

      document.body.appendChild(orb);
    }
  }

  /* ==========================================================
     17. INTERSECTION OBSERVER FALLBACK
  ========================================================== */
  function initIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    var observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    var lazyElements = document.querySelectorAll(
      '.slide:not(#slide-1) .fade-up:not(.visible), ' +
      '.slide:not(#slide-1) .fade-left:not(.visible), ' +
      '.slide:not(#slide-1) .fade-right:not(.visible), ' +
      '.slide:not(#slide-1) .scale-in:not(.visible), ' +
      '.slide:not(#slide-1) .blur-in:not(.visible)'
    );

    lazyElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ==========================================================
     18. SMOOTH NAV BACKGROUND ON SCROLL STATE
  ========================================================== */
  function updateNavState() {
    if (!nav) return;
    if (STATE.currentSlide > 0) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  /* ==========================================================
     19. CONTEXT MENU BRANDING (optional finesse)
  ========================================================== */
  function initContextMenuGuard() {
    document.addEventListener('contextmenu', function (e) {
      /* Allow default context menu — just prevent on images if needed */
      var target = e.target;
      if (target.tagName === 'IMG') {
        e.preventDefault();
      }
    });
  }

  /* ==========================================================
     20. PERFORMANCE — Visibility API
  ========================================================== */
  function initVisibilityHandler() {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (particlesCanvas) {
          particlesCanvas.style.display = 'none';
        }
      } else {
        if (particlesCanvas) {
          particlesCanvas.style.display = '';
        }
      }
    });
  }

  /* ==========================================================
     21. MORPHING GLOW SYSTEM
  ========================================================== */
  function updateMorphingGlow(index) {
    if (!morphingGlow) return;

    var configs = [
      { left: '50%', top: '50%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(13, 107, 232, 0.4) 0%, rgba(7, 51, 157, 0.15) 45%, transparent 70%)' },
      { left: '30%', top: '45%', width: '550px', height: '550px', background: 'radial-gradient(circle, rgba(45, 142, 255, 0.35) 0%, rgba(13, 76, 200, 0.15) 50%, transparent 70%)' },
      { left: '70%', top: '40%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(7, 51, 157, 0.4) 0%, rgba(13, 107, 232, 0.15) 45%, transparent 70%)' },
      { left: '20%', top: '55%', width: '580px', height: '580px', background: 'radial-gradient(circle, rgba(99, 181, 255, 0.3) 0%, rgba(7, 51, 157, 0.15) 50%, transparent 70%)' },
      { left: '60%', top: '35%', width: '520px', height: '520px', background: 'radial-gradient(circle, rgba(13, 107, 232, 0.35) 0%, rgba(4, 26, 84, 0.2) 50%, transparent 70%)' },
      { left: '50%', top: '50%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(45, 142, 255, 0.35) 0%, rgba(7, 51, 157, 0.15) 45%, transparent 70%)' },
      { left: '80%', top: '60%', width: '550px', height: '550px', background: 'radial-gradient(circle, rgba(13, 107, 232, 0.4) 0%, rgba(2, 32, 105, 0.15) 50%, transparent 75%)' },
      { left: '25%', top: '45%', width: '580px', height: '580px', background: 'radial-gradient(circle, rgba(99, 181, 255, 0.3) 0%, rgba(7, 51, 157, 0.15) 50%, transparent 70%)' },
      { left: '40%', top: '65%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(13, 107, 232, 0.35) 0%, rgba(7, 51, 157, 0.15) 50%, transparent 70%)' },
      { left: '50%', top: '50%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(13, 107, 232, 0.45) 0%, rgba(7, 51, 157, 0.2) 40%, transparent 70%)' }
    ];

    var config = configs[index] || configs[0];

    if (window.innerWidth < 1025) {
      morphingGlow.style.left = '50%';
      morphingGlow.style.top = '50%';
      morphingGlow.style.width = '300px';
      morphingGlow.style.height = '300px';
      morphingGlow.style.background = config.background;
    } else {
      morphingGlow.style.left = config.left;
      morphingGlow.style.top = config.top;
      morphingGlow.style.width = config.width;
      morphingGlow.style.height = config.height;
      morphingGlow.style.background = config.background;
    }
  }

  function fetchDynamicServices() {
    const grid = document.querySelector('#slide-2 .expertise-grid');
    if (!grid) return;

    const { collection, getDocs } = window.firebaseHelpers;
    const db = window.firebaseDB;
    getDocs(collection(db, 'services'))
      .then(snapshot => {
        let services = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        services = services
          .filter(s => s.visible == 1 || s.visible === true)
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        if (!Array.isArray(services) || services.length === 0) return;

        let html = '';
        services.forEach((s, idx) => {
          let tagsHtml = '';
          if (s.key_focus) {
            try {
              let tags = typeof s.key_focus === 'string' && s.key_focus.trim().startsWith('[') ? JSON.parse(s.key_focus) : s.key_focus.split(',');
              tagsHtml = tags.map(t => `<span class="card-tag">${t.trim().replace(/^"/, '').replace(/"$/, '')}</span>`).join('');
            } catch (e) {
              tagsHtml = s.key_focus.split(',').map(t => `<span class="card-tag">${t.trim()}</span>`).join('');
            }
          }

          let defaultIcon = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
          let iconSvg = (s.icon_svg && s.icon_svg.trim()) ? s.icon_svg.trim() : defaultIcon;

          html += `
            <article class="glass-card expertise-card fade-up stagger-${(idx % 6) + 1}">
              <div class="card-icon">
                ${iconSvg}
              </div>
              <h3 class="card-title">${s.title}</h3>
              <p class="card-desc">${s.description || ''}</p>
              ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ''}
            </article>
          `;
        });

        grid.innerHTML = html;
        initGlassCardEffects();
      })
      .catch(err => console.error('Error loading services:', err));
  }

  function fetchDynamicReports() {
    const grid = document.querySelector('#slide-6 .reports-grid');
    if (!grid) return;

    const { collection, getDocs } = window.firebaseHelpers;
    const db = window.firebaseDB;
    getDocs(collection(db, 'reports'))
      .then(snapshot => {
        const allReports = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // Try featured first
        let reports = allReports
          .filter(r => (r.published == 1 || r.published === true) && (r.featured == 1 || r.featured === true))
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        
        // Fallback to all published
        if (reports.length === 0) {
          reports = allReports
            .filter(r => r.published == 1 || r.published === true)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        }
        return reports;
      })
      .then(reports => {
        if (!Array.isArray(reports) || reports.length === 0) return;

        let html = '';
        const displayReports = reports.slice(0, 5);

        displayReports.forEach((r, idx) => {
          let tagsHtml = '';
          if (r.tags) {
            let tags = r.tags.split(',').filter(Boolean).slice(0, 2);
            tagsHtml = tags.map(t => `<span class="card-tag">${t.trim()}</span>`).join('');
          }
          let thumbText = r.category ? r.category.toUpperCase() : 'REPORT';
          let bgStyle = r.thumbnail_path ? `background-image: url('${r.thumbnail_path}');` : '';

          html += `
            <article class="glass-card report-card fade-up stagger-${idx + 1}">
              <div class="report-thumb" style="${bgStyle}">
                <div class="report-thumb-inner">${thumbText}</div>
                <div class="report-thumb-text">
                  <h3 class="card-title">${r.title}</h3>
                  <p class="card-desc">${r.description || ''}</p>
                </div>
              </div>
              <div class="report-footer">
                <a href="/reports" class="report-footer-link">View Report</a>
                ${tagsHtml ? `<div class="report-tags">${tagsHtml}</div>` : ''}
              </div>
            </article>
          `;
        });

        html += `
          <a href="/reports" class="glass-card report-card view-all-card fade-up stagger-6">
            <div class="view-all-card-content">
              <h3 class="view-all-title">View All Reports</h3>
              <p class="view-all-desc">Explore full library of reports &amp; documentation</p>
              <div class="view-all-arrow-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          </a>
        `;

        grid.innerHTML = html;
        initGlassCardEffects();
        initMagneticButtons();
      })
      .catch(err => console.error('Error loading reports:', err));
  }

  function fetchDynamicTools() {
    const container = document.querySelector('#slide-3b .tools-ecosystem');
    if (!container) return;

    const { collection, getDocs } = window.firebaseHelpers;
    const db = window.firebaseDB;
    getDocs(collection(db, 'tools'))
      .then(snapshot => {
        let tools = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        tools = tools
          .filter(t => t.visible == 1 || t.visible === true)
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        if (!Array.isArray(tools) || tools.length === 0) return;

        const categories = {};
        tools.forEach(t => {
          const cat = t.category || 'General';
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(t);
        });

        const categoryOrder = [
          'File & Data Management',
          'Automation',
          'Reporting',
          'Communication',
          'Call Tracking & CRM'
        ];

        const sortedCatNames = Object.keys(categories).sort((a, b) => {
          let ia = categoryOrder.indexOf(a);
          let ib = categoryOrder.indexOf(b);
          if (ia === -1) ia = 99;
          if (ib === -1) ib = 99;
          return ia - ib;
        });

        let row1Html = '';
        let row2Html = '';
        let catIdx = 1;

        sortedCatNames.forEach((catName) => {
          const catTools = categories[catName];
          let toolCardsHtml = '';
          catTools.forEach(t => {
            let iconHtml = '';
            let wrapClass = 'tool-icon-wrap';
            if (t.logo_url && t.logo_url.startsWith('/uploads/')) {
              iconHtml = `<img src="${t.logo_url}" alt="${t.name}" class="tool-icon-img" />`;
              wrapClass += ' has-img';
            } else if (t.icon_svg && t.icon_svg.trim()) {
              iconHtml = t.icon_svg.trim();
              wrapClass += ' has-svg';
            } else {
              let letter = t.logo_text || (t.logo_url && !t.logo_url.includes('/') ? t.logo_url : t.name.substring(0, 3).toUpperCase());
              iconHtml = `<span class="tool-icon-letter">${letter}</span>`;
              wrapClass += ' has-letter';
            }

            toolCardsHtml += `
              <div class="tool-logo-card" data-tool="${t.name.toLowerCase()}">
                <div class="${wrapClass}">${iconHtml}</div>
                <span class="tool-name">${t.name}</span>
              </div>
            `;
          });

          const block = `
            <div class="tool-category fade-up stagger-${(catIdx % 6) + 1}">
              <h3 class="tool-category-title">${catName}</h3>
              <div class="tool-logos">
                ${toolCardsHtml}
              </div>
            </div>
          `;

          if (catIdx <= 3) {
            row1Html += block;
          } else {
            row2Html += block;
          }
          catIdx++;
        });

        container.innerHTML = `
          <div class="tools-row tools-row-top">${row1Html}</div>
          <div class="tools-row tools-row-bottom">${row2Html}</div>
        `;
        initGlassCardEffects();

        var slide3bEl = document.getElementById('slide-3b');
        if (slide3bEl) {
          slide3bEl.removeAttribute('data-tools-spun');
          if (STATE.currentSlide === 3 || slide3bEl.classList.contains('active')) {
            triggerToolsFirstTimeSpin(slide3bEl);
          }
        }
      })
      .catch(err => console.error('Error loading tools:', err));
  }

  function triggerToolsFirstTimeSpin(slide) {
    if (!slide) slide = document.getElementById('slide-3b');
    if (!slide) return;
    if (slide.getAttribute('data-tools-spun') === 'true') return;

    var iconWraps = slide.querySelectorAll('.tool-icon-wrap');
    if (iconWraps.length === 0) return;

    slide.setAttribute('data-tools-spun', 'true');

    iconWraps.forEach(function (icon, index) {
      setTimeout(function () {
        icon.classList.add('first-spin-active');
        setTimeout(function () {
          icon.classList.remove('first-spin-active');
        }, 950);
      }, 150 + index * 35);
    });
  }

  function fetchDynamicCaseStudies() {
    const tabsContainer = document.querySelector('#slide-5 .case-tabs');
    const panelsContainer = document.querySelector('#slide-5 .case-panels');
    if (!tabsContainer || !panelsContainer) return;

    const { collection, getDocs } = window.firebaseHelpers;
    const db = window.firebaseDB;
    getDocs(collection(db, 'case_studies'))
      .then(snapshot => {
        let cases = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        cases = cases
          .filter(c => c.visible == 1 || c.visible === true)
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        if (!Array.isArray(cases) || cases.length === 0) return;

        let tabsHtml = '';
        let panelsHtml = '';

        cases.forEach((c, idx) => {
          const isActive = idx === 0 ? 'active' : '';
          const tabLabel = c.title ? (c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title) : `Case ${idx + 1}`;

          tabsHtml += `<button class="case-tab ${isActive}" data-case="${idx}">${tabLabel}</button>`;

          let flowHtml = '';
          if (c.workflow) {
            let nodes = c.workflow.split(',').filter(Boolean);
            if (nodes.length > 0) {
              flowHtml = '<div class="case-flow">' +
                nodes.map((node, nIdx) => {
                  let html = `<span class="flow-node">${node.trim()}</span>`;
                  if (nIdx < nodes.length - 1) {
                    html += `<span class="flow-arrow">→</span>`;
                  }
                  return html;
                }).join('') +
                '</div>';
            }
          }

          let resultsHtml = '';
          if (c.result) {
            let resItems = c.result.split(',').filter(Boolean);
            if (resItems.length > 0) {
              resultsHtml = '<ul class="case-results">' +
                resItems.map(item => `<li>${item.trim()}</li>`).join('') +
                '</ul>';
            }
          }

          panelsHtml += `
            <div class="case-panel ${isActive}" data-case="${idx}">
              <article class="glass-card case-card fade-up">
                <div class="case-badge">Case Study ${String(idx + 1).padStart(2, '0')}</div>
                <h3 class="card-title">${c.title}</h3>
                ${c.problem ? `
                  <div class="case-section">
                    <h4 class="case-label">Problem</h4>
                    <p class="card-desc">${c.problem}</p>
                  </div>
                ` : ''}
                ${c.solution ? `
                  <div class="case-section">
                    <h4 class="case-label">Solution</h4>
                    <p class="card-desc">${c.solution}</p>
                  </div>
                ` : ''}
                ${flowHtml}
                ${resultsHtml ? `
                  <div class="case-section">
                    <h4 class="case-label">Results</h4>
                    ${resultsHtml}
                  </div>
                ` : ''}
                <a href="${c.button_url || '#'}" class="btn-secondary case-btn magnetic-btn">${c.button_text || 'View Case Study'}</a>
              </article>
            </div>
          `;
        });

        tabsContainer.innerHTML = tabsHtml;
        panelsContainer.innerHTML = panelsHtml;

        initCaseTabs();
        initGlassCardEffects();
        initMagneticButtons();
      })
      .catch(err => console.error('Error loading case studies:', err));
  }

  function fetchDynamicSettings() {
    const { collection, getDocs } = window.firebaseHelpers;
    const db = window.firebaseDB;
    getDocs(collection(db, 'settings'))
      .then(async snapshot => {
        const settings = {};
        snapshot.docs.forEach(d => { settings[d.id] = d.data().value; });
        if (!settings || Object.keys(settings).length === 0) return;

        // 1. Booking URL
        if (settings.booking_url && settings.booking_url.trim()) {
          const url = settings.booking_url.trim();
          const scheduleBtns = document.querySelectorAll('#book-call-btn, #book-call-btn-mobile');
          scheduleBtns.forEach(btn => {
            btn.setAttribute('href', url);
            btn.setAttribute('target', '_blank');
            btn.setAttribute('rel', 'noopener');
            btn.removeAttribute('data-slide');
          });
        }

        // 2. Hero Headline
        if (settings.hero_headline) {
          const hlEl = document.getElementById('hero-headline');
          if (hlEl) {
            const normalizedText = settings.hero_headline.replace(/\s+/g, ' ').trim();
            if (normalizedText === 'Call QA & Automation Specialist for Pay-Per-Call Campaigns') {
              hlEl.innerHTML = 'Call QA & <br class="mobile-br">Automation <br class="mobile-br">Specialist for <br class="mobile-br"><span class="campaign-span">Pay-Per-Call Campaigns</span>';
            } else {
              hlEl.innerHTML = settings.hero_headline;
            }
          }
        }

        // 3. Hero Subtitle
        if (settings.hero_subtitle) {
          const subEl = document.getElementById('hero-subtitle');
          if (subEl) subEl.textContent = settings.hero_subtitle;
        }

        // 4. Hero Button 1
        if (settings.hero_btn1_text) {
          const b1 = document.getElementById('hero-btn-1');
          if (b1) {
            const span1 = b1.querySelector('span');
            if (span1) span1.textContent = settings.hero_btn1_text;
            if (settings.hero_btn1_link) b1.setAttribute('href', settings.hero_btn1_link);
          }
        }

        // 5. Hero Button 2
        if (settings.hero_btn2_text) {
          const b2 = document.getElementById('hero-btn-2');
          if (b2) {
            const span2 = b2.querySelector('span');
            if (span2) span2.textContent = settings.hero_btn2_text;
            if (settings.hero_btn2_link) {
              b2.setAttribute('href', settings.hero_btn2_link);
              if (settings.hero_btn2_link === '#contact' || settings.hero_btn2_link.includes('contact')) {
                b2.setAttribute('data-slide', '9');
              }
            }
          }
        }

        // 6. Hero Button 3
        if (settings.hero_btn3_text) {
          const b3 = document.getElementById('hero-btn-3');
          if (b3) {
            const span3 = b3.querySelector('span');
            if (span3) span3.textContent = settings.hero_btn3_text;
            if (settings.hero_btn3_link) b3.setAttribute('href', settings.hero_btn3_link);
          }
        }

        // 7. Optional Video Button
        const vBtn = document.getElementById('hero-btn-video');
        if (vBtn) {
          if (settings.hero_video_url && settings.hero_video_url.trim()) {
            vBtn.style.display = 'inline-flex';
            vBtn.setAttribute('href', settings.hero_video_url.trim());
          } else {
            vBtn.style.display = 'none';
          }
        }

        // 8. Profile Image / Avatar
        if (settings.hero_profile_img && settings.hero_profile_img.trim()) {
          const pImg = document.getElementById('hero-profile-img');
          const pPlaceholder = document.getElementById('hero-avatar-placeholder');
          if (pImg) {
            pImg.src = settings.hero_profile_img.trim();
            pImg.style.display = 'block';
            if (pPlaceholder) pPlaceholder.style.display = 'none';
          }
        }

        // 9. Background Image Overlay & Opacity
        if (settings.hero_bg_img && settings.hero_bg_img.trim()) {
          const bgEl = document.getElementById('hero-bg-overlay');
          if (bgEl) {
            bgEl.style.backgroundImage = `url('${settings.hero_bg_img.trim()}')`;
            const op = settings.hero_bg_opacity ? (parseInt(settings.hero_bg_opacity, 10) / 100) : 0.4;
            bgEl.style.opacity = op;
            bgEl.style.display = 'block';
          }
        }

        // 10. Social Links (LinkedIn, Facebook & Email)
        if (settings.social_linkedin && settings.social_linkedin.trim()) {
          const liUrl = settings.social_linkedin.trim();
          document.querySelectorAll('a[aria-label="LinkedIn"], .social-link-linkedin, a[href*="linkedin.com"]').forEach(el => {
            el.setAttribute('href', liUrl);
          });
        }
        if (settings.social_facebook && settings.social_facebook.trim()) {
          const fbUrl = settings.social_facebook.trim();
          document.querySelectorAll('a[aria-label="Facebook"], .social-link-facebook, a[href*="facebook.com"]').forEach(el => {
            el.setAttribute('href', fbUrl);
          });
        }
        if (settings.contact_email && settings.contact_email.trim()) {
          const email = settings.contact_email.trim();
          document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
            el.setAttribute('href', `mailto:${email}`);
          });
          document.querySelectorAll('.footer-email').forEach(el => {
            el.textContent = email;
          });
        }

        // 11. Dynamic CV Links — fetch CV path and update all CV buttons
        try {
          const { getDoc, doc: fbDoc } = window.firebaseHelpers;
          const cvSnap = await getDoc(fbDoc(db, 'cv', 'current'));
          if (cvSnap.exists()) {
            const cvData = cvSnap.data();
            if (cvData.pdf_path && cvData.pdf_path.trim()) {
              const cvViewUrl = cvData.pdf_path;
              const cvLinks = ['#nav-cv-link', '#footer-cv-link', '#footer-cv-btn'];
              cvLinks.forEach(sel => {
                const el = document.querySelector(sel);
                if (el) el.setAttribute('href', cvViewUrl);
              });
              // Also update hero button 3 if it points to /cv/download
              const heroBtn3 = document.getElementById('hero-btn-3');
              if (heroBtn3 && (heroBtn3.getAttribute('href') === '/cv/download' || heroBtn3.getAttribute('href') === '#')) {
                heroBtn3.setAttribute('href', cvViewUrl);
              }
            }
          }
        } catch (cvErr) {
          console.error('Error loading CV data:', cvErr);
        }
      })
      .catch(err => console.error('Error loading settings:', err));
  }

  /* ==========================================================
     MOBILE & TABLET NAVIGATION CONTROLS
  ========================================================== */
  function initMobileControls() {
    if (!isScrollMode) return;

    const slideTitles = Array.from(navDots).map(dot => dot.getAttribute('title')) || [
      "Welcome", "Home", "Expertise", "Tools", "Process", "Case Studies", "Reports", "Automation", "Why Me", "Contact", "Thank You"
    ];

    slides.forEach(function (slide, i) {
      if (i === 0 || i >= slides.length - 1) return; // No next slide button on Thank You slide

      const nextBtn = document.createElement('button');
      nextBtn.className = 'mobile-next-slide-btn';

      const nextTitle = slideTitles[i + 1] || 'Next Section';
      nextBtn.innerHTML = `<span>Next: ${nextTitle}</span> <span class="arrow-down-icon">↓</span>`;

      nextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const nextSlide = slides[i + 1];
        if (nextSlide) {
          nextSlide.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });

      slide.appendChild(nextBtn);
    });

    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'mobile-back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    backToTopBtn.innerHTML = '↑';
    document.body.appendChild(backToTopBtn);

    backToTopBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const firstSlide = slides[0];
      if (firstSlide) {
        firstSlide.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    const firstSlideObserver = slides[0];
    if (firstSlideObserver) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          // If the first slide is in view, hide the button
          if (entry.isIntersecting) {
            backToTopBtn.classList.remove('visible');
          } else {
            // If we scrolled past the first slide, show the button
            backToTopBtn.classList.add('visible');
          }
        });
      }, {
        threshold: 0.1
      });
      observer.observe(firstSlideObserver);
    }
  }

  /* ==========================================================
     INITIALIZATION
  ========================================================== */
  function init() {
    initReducedMotionSupport();
    initLoadingScreen();
    initCustomCursor();
    initMouseGlow();
    initParticles();
    initGlassCardEffects();
    initMagneticButtons();
    initButtonRipple();
    initAmbientOrbs();
    initCaseTabs();
    initContactForm();
    initResizeHandler();
    initIntersectionObserver();
    initContextMenuGuard();
    initVisibilityHandler();
    // Wait for Firebase to be ready before fetching data
    function loadFirebaseData() {
      fetchDynamicServices();
      fetchDynamicReports();
      fetchDynamicTools();
      fetchDynamicCaseStudies();
      fetchDynamicSettings();
    }
    if (window.firebaseReady) {
      loadFirebaseData();
    } else {
      window.addEventListener('firebase-ready', loadFirebaseData);
    }

    if (slides.length > 0) {
      STATE.totalSlides = slides.length;
      if (isScrollMode) {
        // Mobile scroll mode: all slides visible, no single active
        slides.forEach(function (slide) {
          slide.classList.add('active');
        });
        initMobileScrollAnimations();
        initMobileControls();
      } else {
        // Desktop slide mode: only first slide active
        slides[0].classList.add('active');
      }
    }
    updateNavLinks();
    if (!isScrollMode) {
      updateProgressBar();
      updateScrollIndicator();
    }
    updateNavState();
    updateMorphingGlow(0);

    window.addEventListener(
      'goToSlide',
      function (e) {
        if (e.detail && typeof e.detail.index === 'number') {
          if (isScrollMode) {
            var targetSlide = slides[e.detail.index];
            if (targetSlide) {
              targetSlide.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } else {
            goToSlide(e.detail.index);
          }
        }
      }
    );

    // Reload page if user resizes across the mobile/desktop breakpoint
    var lastWasMobile = window.innerWidth < 1025;
    window.addEventListener('resize', debounce(function () {
      var nowMobile = window.innerWidth < 1025;
      if (nowMobile !== lastWasMobile) {
        location.reload();
      }
    }, 300));

    console.log(
      '%c✦ IZAN PORT — Portfolio Loaded ✦',
      'color: #0d6be8; font-size: 14px; font-weight: bold; background: #0a0a14; padding: 8px 16px; border-radius: 4px;'
    );
  }

  init();
});
