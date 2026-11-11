document.addEventListener('DOMContentLoaded', () => {
    console.log("¡ReBest script cargado y optimizado con éxito!");

    const body = document.body;

    // Seguro: pase lo que pase más abajo en este script, el scroll se
    // libera sí o sí como máximo a los 5s (ver también el seguro inline
    // en el <body> del HTML, que actúa aunque este archivo no cargue).
    const liberarScrollDeEmergencia = () => {
        body.classList.remove('intro-active');
        const overlay = document.getElementById('intro-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.pointerEvents = 'none';
            overlay.style.display = 'none';
        }
    };
    // Último recurso solo si falla todo el controlador de introducción.
    // No acorta la reproducción normal del video, que finaliza a ~4.7s.
    setTimeout(liberarScrollDeEmergencia, 8500);

    try {

    // =========================================================
    // 1. PREPARACIÓN DE ANIMACIÓN HERO (Letras y Palabras)
    // =========================================================
    let animacionHeroIniciada = false;
    const lineas = document.querySelectorAll('.texto-animado');

    lineas.forEach(linea => {
        if(linea) {
            const texto = linea.textContent;
            linea.textContent = ''; 
            
            // Primero separamos por palabras para evitar cortes de línea a la mitad
            texto.split(' ').forEach((palabra, index, array) => {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'word';
                wordSpan.style.display = 'inline-block'; 
                wordSpan.style.whiteSpace = 'nowrap';

                // Ahora separamos las letras dentro de esa palabra
                palabra.split('').forEach(letra => {
                    const charSpan = document.createElement('span');
                    charSpan.textContent = letra; 
                    charSpan.className = 'char';
                    wordSpan.appendChild(charSpan);
                });

                linea.appendChild(wordSpan);

                // Agregamos el espacio real entre palabras (excepto al final).
                // IMPORTANTE: se agrega como nodo de texto normal (no como
                // span inline-block) para que el navegador SÍ pueda cortar
                // la línea justo ahí. Antes, al estar metido en un span
                // inline-block, no había punto de corte real ahí y el
                // espacio "sobrante" terminaba colándose al inicio de la
                // línea siguiente (el hueco visible antes de "VEAN").
                if (index < array.length - 1) {
                    linea.appendChild(document.createTextNode(' '));
                }
            });
        }
    });

    const iniciarAnimacionesHero = () => {
        if (animacionHeroIniciada) return; 
        animacionHeroIniciada = true;

        // Animamos solo las letras, no los espacios
        const letras = document.querySelectorAll('.char:not(.space)'); 
        letras.forEach((letra, index) => {
            setTimeout(() => {
                letra.classList.add('visible');
            }, index * 30); 
        });

        setTimeout(() => {
            const marcoFoto = document.querySelector('.marco-foto');
            if(marcoFoto) marcoFoto.classList.add('visible');
        }, 500);

        setTimeout(() => {
            document.querySelectorAll('.anim-retraso').forEach(el => el.classList.add('visible'));
        }, 800);
    };

    // =========================================================
    // 2. INTRO DE VIDEO: reproducción original sin bloqueo del scroll.
    // =========================================================
    const introOverlay = document.querySelector('.intro-overlay');
    const introVideos = Array.from(document.querySelectorAll('.intro-overlay video'));
    const TIEMPO_REFLEJO = 4.700;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let introFinished = false;
    let introTimeCheck = 0;
    let introFallback = 0;

    const hideIntro = () => {
        if (introFinished) return;
        introFinished = true;
        window.clearTimeout(introFallback);
        window.cancelAnimationFrame(introTimeCheck);
        if (introOverlay) {
            introOverlay.classList.add('hidden');
            introOverlay.style.pointerEvents = 'none';
            window.setTimeout(() => { introOverlay.style.display = 'none'; }, 450);
        }
        introVideos.forEach(video => video.pause());
        body.classList.remove('intro-active');
        iniciarAnimacionesHero();
    };

    // La intro es solo visual y nunca puede bloquear un scroll iniciado
    // en celular. Se cierra al interactuar con la página, sin preventDefault.
    ['touchstart', 'wheel', 'pointerdown'].forEach(type => {
        document.addEventListener(type, hideIntro, { once: true, passive: true });
    });
    window.addEventListener('scroll', () => {
        if (window.scrollY > 8) hideIntro();
    }, { passive: true });
    window.addEventListener('pagehide', hideIntro, { once: true });

    if (!introOverlay || !introVideos.length || reducedMotion) {
        hideIntro();
    } else {
        const activeVideo = introVideos.find(video => getComputedStyle(video).display !== 'none');
        if (!activeVideo) {
            hideIntro();
        } else {
            const checkVideoTime = () => {
                if (introFinished) return;
                if (activeVideo.currentTime >= TIEMPO_REFLEJO) {
                    hideIntro();
                } else {
                    introTimeCheck = window.requestAnimationFrame(checkVideoTime);
                }
            };
            activeVideo.addEventListener('ended', hideIntro, { once: true });
            activeVideo.addEventListener('error', hideIntro, { once: true });
            activeVideo.addEventListener('playing', () => {
                window.cancelAnimationFrame(introTimeCheck);
                introTimeCheck = window.requestAnimationFrame(checkVideoTime);
            }, { once: true });

            // Registrar eventos antes de solicitar reproducción evita perder
            // el evento de play cuando el vídeo ya está en caché.
            activeVideo.preload = 'auto';
            activeVideo.muted = true;
            const playback = activeVideo.play();
            if (playback && typeof playback.catch === 'function') {
                playback.catch(() => {
                    // No cubrir la landing con una pantalla negra si el
                    // navegador rechaza el autoplay.
                    hideIntro();
                });
            }
            introFallback = window.setTimeout(hideIntro, 7000);
        }
    }

    // =========================================================
    // 3. LÓGICA DEL MENÚ HAMBURGUESA
    // =========================================================
    const hamburgerToggle = document.querySelector('.hamburger-toggle');
    const hamburgerMenu = document.querySelector('.hamburger-menu');

    const toggleMenu = (forzarCierre = false) => {
        if (!hamburgerMenu || !hamburgerToggle) return;
        
        const isOpen = forzarCierre ? false : !hamburgerMenu.classList.contains('open');
        
        hamburgerMenu.classList.toggle('open', isOpen);
        hamburgerToggle.classList.toggle('open', isOpen);
        body.classList.toggle('menu-open', isOpen);
        
        hamburgerToggle.setAttribute('aria-expanded', isOpen);
        hamburgerMenu.setAttribute('aria-hidden', String(!isOpen));
        hamburgerToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
        if ('inert' in hamburgerMenu) hamburgerMenu.inert = !isOpen;
    };
    if (hamburgerMenu && 'inert' in hamburgerMenu) hamburgerMenu.inert = true;

    if (hamburgerToggle && hamburgerMenu) {
        hamburgerToggle.addEventListener('click', (e) => {
            e.preventDefault(); 
            toggleMenu();
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && hamburgerMenu.classList.contains('open')) {
                toggleMenu(true);
                hamburgerToggle.focus();
            }
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth > 900 && hamburgerMenu.classList.contains('open')) {
                toggleMenu(true);
            }
        });

        const menuLinks = document.querySelectorAll('.hamburger-menu a');
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                
                if (targetId && targetId.startsWith('#')) {
                    e.preventDefault(); 
                    toggleMenu(true);

                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        // Esperamos a que termine la transición de cierre del menú
                        // antes de hacer scroll, para evitar cortes por overflow:hidden
                        setTimeout(() => {
                            const headerEl = document.querySelector('.main-header');
                            const headerOffset = headerEl ? headerEl.offsetHeight + 24 : 110;
                            const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                            const offsetPosition = elementPosition - headerOffset;

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                            });
                        }, 420); 
                    }
                }
            });
        });
    }

    // =========================================================
    // 4. ANIMACIONES DE APARICIÓN (SCROLL)
    // =========================================================
    const scrollElements = document.querySelectorAll(
        '.fade-in, .about-section, .team-section, .services-section, .clients-section, .cta-section, .team-card, .about-highlight, .about-image-wrapper, .solucion-card, .anim-slide-left, .anim-slide-right, .portfolio-anim, .frase-linea-verde, .stats-container, .clientes-container, .main-footer'
    );

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px 0px 0px',
        threshold: 0.06
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;

                if (target.classList.contains('services-section') && window.innerWidth > 900) {
                    const serviceCards = target.querySelectorAll('.service-card');
                    serviceCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('is-visible');
                        }, index * 150);
                    });
                    target.classList.add('is-visible');
                    obs.unobserve(target);
                } else {
                    target.classList.add('is-visible');
                    obs.unobserve(target);
                }
            }
        });
    }, observerOptions);

    // Activar inmediatamente los elementos ya visibles al cargar
    scrollElements.forEach(element => {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            element.classList.add('is-visible');
        } else {
            observer.observe(element);
        }
    });

    // =========================================================
    // 5. HEADER DINÁMICO AL HACER SCROLL
    // =========================================================
    const header = document.querySelector('.main-header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled'); 
            } else {
                header.classList.remove('scrolled'); 
            }
        }, { passive: true });
    }

    // =========================================================
    // 6. EFECTO TILT 3D PARA TARJETAS INTERACTIVAS
    // =========================================================
    const cards = document.querySelectorAll('.team-card, .service-card, .about-highlight, .solucion-card'); 

    cards.forEach(card => {
        let isTicking = false;

        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth <= 900) return;

            if (!isTicking) {
                window.requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left; 
                    const y = e.clientY - rect.top;  

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const rotateX = ((y - centerY) / centerY) * -10; 
                    const rotateY = ((x - centerX) / centerX) * 10;

                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                    card.style.transition = 'transform 0.1s ease-out';
                    card.style.zIndex = "10";
                    isTicking = false;
                });
                isTicking = true;
            }
        });

        card.addEventListener('mouseleave', () => {
            if (window.innerWidth <= 900) {
                card.style.transform = "";
                return;
            }
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease-out'; 
            
            card.style.zIndex = ""; 
            setTimeout(() => {
                if (!card.matches(':hover')) {
                    card.style.transform = "";
                    card.style.transition = "";
                }
            }, 500); 
        });
    });

    // Logos de Clientes: una serie original + una copia puramente visual.
    // Su movimiento es continuo y la barra de scroll permanece oculta.
    const clientViewport = document.querySelector('.clientes-container');
    const clientTrack = clientViewport?.querySelector('.clientes-grid');
    if (clientViewport && clientTrack) {
        const originals = Array.from(clientTrack.querySelectorAll('.client-logo-box:not(.clone)'));
        if (originals.length > 0) {
            originals.forEach(item => {
                const copy = item.cloneNode(true);
                copy.classList.add('clone');
                copy.setAttribute('aria-hidden', 'true');
                clientTrack.appendChild(copy);
            });

            // Medimos la distancia hasta el primer clon después de cambiar
            // el layout a una fila continua; el loop termina exactamente
            // donde vuelve a empezar y nunca deja una fila incompleta.
            const measure = () => {
                const clone = clientTrack.querySelector('.client-logo-box.clone');
                if (!clone) return;
                const distance = clone.offsetLeft - originals[0].offsetLeft;
                if (distance > 0) {
                    clientTrack.style.setProperty('--client-distance', distance + 'px');
                    clientViewport.classList.add('is-ready');
                }
            };
            const scheduleMeasure = () => requestAnimationFrame(measure);
            const resizeObserver = typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(scheduleMeasure) : null;
            // Observar viewport, no pista animada: evita loops de resize.
            resizeObserver?.observe(clientViewport);
            window.addEventListener('resize', scheduleMeasure, { passive: true });
            window.addEventListener('load', scheduleMeasure, { once: true });
            if (document.fonts?.ready) document.fonts.ready.then(scheduleMeasure);
            // Activamos la fila antes de medir, para obtener offsetLeft real.
            clientViewport.classList.add('is-ready');
            scheduleMeasure();

            // Solo pausamos con hover verdadero de mouse/trackpad.
            // En móvil no se registra touchstart ni pointerenter y el carrusel
            // nunca queda detenido después de deslizar verticalmente.
            if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
                clientViewport.addEventListener('mouseenter', () => {
                    clientViewport.classList.add('is-paused');
                });
                clientViewport.addEventListener('mouseleave', () => {
                    clientViewport.classList.remove('is-paused');
                });
            }
        }
    }

    // =========================================================
    // 8. CARRUSEL DE SERVICIOS Y SOLUCIONES (función reutilizable)
    // =========================================================
    function initSnapCarousel({ trackSelector, itemSelector, dotsSelector, prevSelector, nextSelector }) {
        const track = document.querySelector(trackSelector);
        if (!track) return;

        const items = track.querySelectorAll(itemSelector);
        const dots = document.querySelectorAll(dotsSelector);
        const prevBtn = document.querySelector(prevSelector);
        const nextBtn = document.querySelector(nextSelector);

        if (!items.length) return;

        let currentIndex = 0;
        let isScrolling = false;

        const updateActiveItemClass = (index) => {
            items.forEach((item, i) => {
                item.classList.toggle('active', i === index);
            });
        };

        const updateDots = (index) => {
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        };

        const navigateTo = (index) => {
            if (index < 0) {
                currentIndex = items.length - 1;
            } else if (index >= items.length) {
                currentIndex = 0;
            } else {
                currentIndex = index;
            }

            const targetLeft = items[currentIndex].offsetLeft - track.offsetLeft;

            isScrolling = true;
            track.scrollTo({
                left: targetLeft,
                behavior: 'smooth'
            });

            updateDots(currentIndex);
            updateActiveItemClass(currentIndex);

            setTimeout(() => {
                isScrolling = false;
            }, 600);
        };

        updateActiveItemClass(0);

        if (prevBtn) prevBtn.addEventListener('click', () => navigateTo(currentIndex - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => navigateTo(currentIndex + 1));

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => navigateTo(i));
        });

        track.addEventListener('scroll', () => {
            if (isScrolling) return;

            const scrollPosition = track.scrollLeft + (track.clientWidth / 2);
            let closestIndex = 0;
            let minDistance = Infinity;

            items.forEach((item, index) => {
                const itemCenter = item.offsetLeft - track.offsetLeft + (item.offsetWidth / 2);
                const distance = Math.abs(scrollPosition - itemCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = index;
                }
            });

            if (closestIndex !== currentIndex) {
                currentIndex = closestIndex;
                updateDots(currentIndex);
                updateActiveItemClass(currentIndex);
            }
        }, { passive: true });
    }

    // Carrusel de Servicios
    initSnapCarousel({
        trackSelector: '#services-carousel',
        itemSelector: '.service-card',
        dotsSelector: '#services-dots .dot',
        prevSelector: '.services-block .carousel-arrow.prev',
        nextSelector: '.services-block .carousel-arrow.next'
    });

    // Carrusel de Soluciones (móvil)
    initSnapCarousel({
        trackSelector: '#soluciones-panel',
        itemSelector: '.solucion-col-panel',
        dotsSelector: '#soluciones-dots .dot',
        prevSelector: '#soluciones-prev',
        nextSelector: '#soluciones-next'
    });

    // =========================================================
    // 9. ANIMACIÓN CONTADOR DE ESTADÍSTICAS
    // =========================================================
    const statsSection = document.querySelector('.stats-container');
    const statNumbers = document.querySelectorAll('.stat-number');
    let hasAnimatedStats = false;

    const animateStats = () => {
        statNumbers.forEach(stat => {
            const originalText = stat.innerText;
            const targetNumber = parseInt(originalText.replace(/[^0-9]/g, ''));
            const prefix = originalText.includes('+') ? '+' : '';
            const suffix = originalText.includes('%') ? '%' : '';
            
            let currentNumber = 0;
            const increment = Math.ceil(targetNumber / 40); 
            
            const updateCounter = () => {
                currentNumber += increment;
                
                if (currentNumber < targetNumber) {
                    stat.innerText = `${prefix}${currentNumber}${suffix}`;
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.innerText = originalText; 
                }
            };
            
            stat.innerText = `${prefix}0${suffix}`;
            updateCounter();
        });
    };

    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimatedStats) {
                animateStats();
                hasAnimatedStats = true; 
                statsObserver.unobserve(statsSection);
            }
        }, { threshold: 0.5 }); 
        
        statsObserver.observe(statsSection);
    }

    // =========================================================
    // 11. MOSTRAR / OCULTAR BURBUJA DE WHATSAPP AL HACER SCROLL
    // =========================================================
    const whatsappBtn = document.querySelector('.whatsapp-flotante');

    if (whatsappBtn) {
        const contacto = document.getElementById('contacto');
        const footer = document.querySelector('.main-footer');
        const visibleInViewport = element => {
            if (!element) return false;
            const rect = element.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        };
        const updateWhatsapp = () => {
            // Evita tapar el CTA, el contacto del footer y los botones
            // del carrusel. El botón reaparece en otras secciones.
            const overContact = visibleInViewport(contacto) || visibleInViewport(footer);
            whatsappBtn.classList.toggle('show', window.scrollY > 400 && !overContact);
        };
        window.addEventListener('scroll', updateWhatsapp, { passive: true });
        window.addEventListener('resize', updateWhatsapp, { passive: true });
        updateWhatsapp();
    }
    } catch (err) {
        console.error('Error en script.js:', err);
        liberarScrollDeEmergencia();
    }
});
// ==========================================================================
// ReBest v2.0 — Nuevos paneles, carrusel móvil portafolio, animaciones extra
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // ──────────────────────────────────────────
    // A. ANIMACIONES PARA NUEVOS PANELES (IntersectionObserver)
    // ──────────────────────────────────────────
    const panelElements = document.querySelectorAll(
        '.team-panel-card, .service-card-panel, .cta-panel-left, .cta-panel-right, .anim-slide-left, .anim-slide-right, .portfolio-anim, .solucion-col-panel:not(.snake-reveal)'
    );

    const panelObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                panelObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.06, rootMargin: '0px 0px 0px 0px' });

    panelElements.forEach(el => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('is-visible');
        } else {
            panelObserver.observe(el);
        }
    });

    // ──────────────────────────────────────────
    // B. CARRUSEL MÓVIL DE PORTAFOLIO
    // ──────────────────────────────────────────
    const mobileTrack   = document.getElementById('portfolio-mobile-track');
    const mobilePrev    = document.getElementById('portfolio-mobile-prev');
    const mobileNext    = document.getElementById('portfolio-mobile-next');
    const mobileDotsBox = document.getElementById('portfolio-mobile-dots');

    if (mobileTrack) {
        const slides = Array.from(mobileTrack.querySelectorAll('.portfolio-mobile-slide'));
        let mobileIdx = 0;

        // Crear dots dinámicamente
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Ver trabajo ${i + 1} de ${slides.length}`);
            dot.setAttribute('aria-pressed', String(i === 0));
            dot.setAttribute('aria-controls', 'portfolio-mobile-track');
            dot.addEventListener('click', () => goToMobile(i));
            mobileDotsBox.appendChild(dot);
        });

        const mobileDots = () => mobileDotsBox.querySelectorAll('.dot');

        // Los slides fuera de pantalla no deben dejar controles de audio
        // accesibles al tabulador ni ocultar el slide activo al lector de pantalla.
        const syncSlideAccess = () => {
            slides.forEach((slide, i) => {
                const isCurrent = i === mobileIdx;
                slide.setAttribute('aria-hidden', String(!isCurrent));
                if ('inert' in slide) slide.inert = !isCurrent;
            });
        };
        syncSlideAccess();

        const goToMobile = (idx) => {
            // Pausar todos los videos del slide actual
            slides[mobileIdx].querySelectorAll('video').forEach(v => v.pause());

            mobileIdx = (idx + slides.length) % slides.length;
            mobileTrack.style.transform = `translateX(-${mobileIdx * 100}%)`;

            // Actualizar dots
            mobileDots().forEach((d, i) => {
                d.classList.toggle('active', i === mobileIdx);
                d.setAttribute('aria-pressed', String(i === mobileIdx));
            });
            syncSlideAccess();

            // Reproducir video del nuevo slide si existe
            const vid = slides[mobileIdx].querySelector('video');
            if (vid) vid.play().catch(() => {});
        };

        if (mobilePrev) mobilePrev.addEventListener('click', () => goToMobile(mobileIdx - 1));
        if (mobileNext) mobileNext.addEventListener('click', () => goToMobile(mobileIdx + 1));

        // Gesto horizontal: evitar que un desplazamiento vertical del
        // usuario cambie de trabajo por accidente en iOS o Android.
        let touchStartX = 0;
        let touchStartY = 0;
        mobileTrack.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        mobileTrack.addEventListener('touchend', e => {
            const diffX = touchStartX - e.changedTouches[0].clientX;
            const diffY = touchStartY - e.changedTouches[0].clientY;
            if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.25) {
                goToMobile(mobileIdx + (diffX > 0 ? 1 : -1));
            }
        }, { passive: true });

        // Reproducir primer video si hay
        const firstVid = slides[0].querySelector('video');
        if (firstVid) firstVid.play().catch(() => {});
    }

    // ──────────────────────────────────────────
    // C. SCROLL INDICATOR HERO
    // ──────────────────────────────────────────
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        // Se muestra junto con las animaciones de hero
        setTimeout(() => scrollIndicator.classList.add('visible'), 1400);
        scrollIndicator.addEventListener('click', () => {
            const nosotros = document.getElementById('nosotros');
            if (nosotros) {
                const headerEl = document.querySelector('.main-header');
                const headerOffset = headerEl ? headerEl.offsetHeight + 24 : 110;
                const elementPosition = nosotros.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
            }
        });
        // Se oculta al hacer scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 120) {
                scrollIndicator.style.opacity = '0';
            } else {
                scrollIndicator.style.opacity = '';
            }
        }, { passive: true });
    }

    // ──────────────────────────────────────────
    // F. SOUND TOGGLE FOR PORTFOLIO VIDEOS (grid PC + carrusel móvil)
    // ──────────────────────────────────────────
    const ICON_MUTE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><line x1="16" y1="9" x2="22" y2="15"/><line x1="22" y1="9" x2="16" y2="15"/></svg>';
    const ICON_UNMUTE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';

    document.querySelectorAll('.sound-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const container = btn.closest('.portfolio-grid-item, .portfolio-mobile-slide');
            const video = container ? container.querySelector('video') : null;
            if (!video) return;

            if (video.muted) {
                // Silenciamos todos los demás videos primero (grid PC + carrusel móvil)
                document.querySelectorAll('.portfolio-grid-video, .portfolio-mobile-media').forEach(v => {
                    if (v === video) return;
                    v.muted = true;
                    const otherBtn = v.closest('.portfolio-grid-item, .portfolio-mobile-slide')?.querySelector('.sound-toggle');
                    if (otherBtn) {
                        otherBtn.classList.remove('is-unmuted');
                        otherBtn.innerHTML = ICON_MUTE;
                        otherBtn.setAttribute('aria-label', 'Activar sonido');
                    }
                });
                video.muted = false;
                btn.classList.add('is-unmuted');
                btn.innerHTML = ICON_UNMUTE;
                btn.setAttribute('aria-label', 'Silenciar');
            } else {
                video.muted = true;
                btn.classList.remove('is-unmuted');
                btn.innerHTML = ICON_MUTE;
                btn.setAttribute('aria-label', 'Activar sonido');
            }
        });
    });

    // ──────────────────────────────────────────
    // D. TILT 3D EN NUEVAS TARJETAS DE PANELES (PC)
    // ──────────────────────────────────────────
    const panelCards = document.querySelectorAll('.service-card-panel, .solucion-col-panel, .team-panel-card');
    panelCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            if (window.innerWidth <= 900) return;
            const r = card.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width  - 0.5) * 12;
            const y = ((e.clientY - r.top)  / r.height - 0.5) * -8;
            card.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.015,1.015,1.015)`;
            card.style.transition = 'transform 0.08s ease-out';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.5s ease, opacity 0.9s ease';
        });
    });

    // ──────────────────────────────────────────
    // E. PARTÍCULAS SUTILES EN SEPARADORES (shimmer efecto)
    // ──────────────────────────────────────────
    // Ya manejado por CSS animation: scanline

    // ──────────────────────────────────────────
    // G. INDEX ESCALONADO PARA LOGOS DE CLIENTES (desktop)
    // ──────────────────────────────────────────
    if (window.innerWidth > 768) {
        document.querySelectorAll('.clientes-grid .client-logo-box:not(.clone)').forEach((logo, i) => {
            logo.style.setProperty('--ci', i);
        });
    }

    // ──────────────────────────────────────────
    // H. SOLUCIONES — Video de serpiente que "trae" cada columna (solo PC)
    // ──────────────────────────────────────────
    const solucionesPanel = document.getElementById('soluciones-panel');
    const snakeVideo = document.getElementById('soluciones-snake-video');
    const snakeColumns = document.querySelectorAll('.solucion-col-panel.snake-reveal');

    if (solucionesPanel && snakeVideo && snakeColumns.length) {
        let snakeTriggered = false;

        const isDesktop = () => window.innerWidth > 900;

        const revealColumnsSequentially = () => {
            snakeColumns.forEach((col, i) => {
                setTimeout(() => {
                    col.classList.add('is-visible');
                }, i * 450);
            });
        };

        const playSnakeSequence = () => {
            if (!isDesktop()) {
                // En móvil: solo revelar columnas con su animación normal, sin video
                revealColumnsSequentially();
                return;
            }

            snakeVideo.currentTime = 0;
            snakeVideo.classList.add('snake-playing');
            const playPromise = snakeVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {});
            }

            // Revela cada columna progresivamente mientras la serpiente recorre el panel (~4.3s totales)
            snakeColumns.forEach((col, i) => {
                setTimeout(() => {
                    col.classList.add('is-visible');
                }, 900 + i * 1100);
            });

            // Limpieza tras finalizar el recorrido animado
            setTimeout(() => {
                snakeVideo.pause();
                snakeVideo.classList.remove('snake-playing');
                snakeVideo.classList.add('snake-done');
            }, 4400);
        };

        const snakeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !snakeTriggered) {
                    snakeTriggered = true;
                    playSnakeSequence();
                    snakeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.35 });

        snakeObserver.observe(solucionesPanel);
    }

    // ──────────────────────────────────────────
    // I. LAZY LOAD DE VIDEOS DE PORTAFOLIO
    // ──────────────────────────────────────────
    // Los videos de portafolio no cargan su archivo real hasta que
    // están a punto de entrar en pantalla. Esto evita que 10 videos
    // intenten descargarse a la vez al cargar la página (causa principal
    // de la sensación de "página pegada" / carga lenta).
    const lazyVideos = document.querySelectorAll('video.portfolio-grid-video, video.portfolio-mobile-media');

    if (lazyVideos.length) {
        const loadVideo = (video) => {
            const source = video.querySelector('source[data-src]');
            if (!source) return;

            // Esperamos a que el video tenga datos suficientes antes de
            // pedirle que reproduzca — llamar play() justo después de load()
            // hace que el navegador rechace la reproducción en muchos casos
            // (video se queda "pegado" en el primer frame o en negro).
            const tryPlay = () => {
                if (!video.isConnected) return;
                const p = video.play();
                if (p && typeof p.catch === 'function') {
                    p.catch(() => {
                        // Reintento único tras un breve respiro, por si el
                        // navegador seguía ocupado decodificando otros videos.
                        setTimeout(() => video.play().catch(() => {}), 250);
                    });
                }
            };

            video.addEventListener('loadeddata', tryPlay, { once: true });
            video.addEventListener('canplay', tryPlay, { once: true });

            source.src = source.getAttribute('data-src');
            source.removeAttribute('data-src');
            video.load();
        };

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadVideo(entry.target);
                    videoObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '150px 0px', threshold: 0.01 });

        lazyVideos.forEach(video => videoObserver.observe(video));

        // ──────────────────────────────────────────
        // I.2 PAUSAR VIDEOS QUE NO ESTÁN REALMENTE VISIBLES
        // ──────────────────────────────────────────
        // Con 10 videos en el grid, dejarlos todos reproduciendo en loop
        // de forma permanente (aunque ya cargaron) satura la decodificación
        // del navegador y se nota como "pixelado" o desincronizado entre
        // ellos. Solo deben reproducir los que están realmente a la vista.
        // (El carrusel móvil ya maneja su propio play/pause por slide más
        // abajo, así que aquí solo se vigila el grid de escritorio.)
        const desktopGridVideos = document.querySelectorAll('video.portfolio-grid-video');
        const visibilityObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (!video.currentSrc && !video.querySelector('source')?.src) return;
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.15 });

        desktopGridVideos.forEach(video => visibilityObserver.observe(video));
    }
});