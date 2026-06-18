document.addEventListener('DOMContentLoaded', () => {
    console.log("¡ReBest script cargado y optimizado con éxito!");
    
    const body = document.body;

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

                // Agregamos el espacio real entre palabras (excepto al final)
                if (index < array.length - 1) {
                    const spaceSpan = document.createElement('span');
                    spaceSpan.innerHTML = '&nbsp;';
                    spaceSpan.className = 'char space';
                    linea.appendChild(spaceSpan);
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
    // 2. LÓGICA DE LA PANTALLA DE INTRODUCCIÓN (MULTI-VIDEO Y ALTA PRECISIÓN)
    // =========================================================
    const introOverlay = document.querySelector('.intro-overlay');
    const introVideos = document.querySelectorAll('.intro-overlay video');

    const TIEMPO_REFLEJO = 4.700; 

    let animacionFrameId;
    let videoActivo = null;

    const hideIntro = () => {
        if (introOverlay && !introOverlay.classList.contains('hidden')) {
            introOverlay.classList.add('hidden');
            introOverlay.style.pointerEvents = 'none';
            
            iniciarAnimacionesHero();
            
            introVideos.forEach(v => v.pause());
            cancelAnimationFrame(animacionFrameId);
            
            setTimeout(() => {
                introOverlay.style.display = 'none'; 
            }, 600); 
            
            body.classList.remove('intro-active'); 
        }
    };

    const checkVideoTime = () => {
        if (videoActivo && videoActivo.currentTime >= TIEMPO_REFLEJO) { 
            hideIntro();
        } else if (introOverlay && !introOverlay.classList.contains('hidden')) {
            animacionFrameId = requestAnimationFrame(checkVideoTime);
        }
    };

    // Solo reproducimos el video que realmente está visible según el viewport,
    // para evitar que ambos compitan por iniciar la animación a la vez.
    const obtenerVideoVisible = () => {
        return Array.from(introVideos).find(v => window.getComputedStyle(v).display !== 'none') || null;
    };

    if (introVideos.length > 0) {
        const videoVisible = obtenerVideoVisible();

        if (videoVisible) {
            videoVisible.preload = 'auto';
            const playPromise = videoVisible.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    hideIntro();
                });
            }

            videoVisible.addEventListener('play', () => {
                videoActivo = videoVisible;
                cancelAnimationFrame(animacionFrameId);
                animacionFrameId = requestAnimationFrame(checkVideoTime);
            });

            videoVisible.addEventListener('ended', hideIntro);
            videoVisible.addEventListener('error', hideIntro);
        } else {
            // No hay video visible (caso inesperado): saltamos la intro directamente
            hideIntro();
        }
    } else {
        hideIntro();
    }

    setTimeout(() => {
        hideIntro();
    }, 8000);

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
        hamburgerMenu.setAttribute('aria-hidden', !isOpen);
    };

    if (hamburgerToggle && hamburgerMenu) {
        hamburgerToggle.addEventListener('click', (e) => {
            e.preventDefault(); 
            toggleMenu();
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
                        setTimeout(() => {
                            targetElement.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'start' 
                            });
                        }, 300); 
                    }
                }
            });
        });
    }

    // =========================================================
    // 4. ANIMACIONES DE APARICIÓN (SCROLL)
    // =========================================================
    const scrollElements = document.querySelectorAll(
        '.fade-in, .about-section, .team-section, .services-section, .clients-section, .cta-section, .team-card, .about-highlight, .about-image-wrapper, .solucion-card'
    );

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.08 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;

                if (target.classList.contains('services-section') && window.innerWidth > 900) {
                    const serviceCards = target.querySelectorAll('.service-card');
                    
                    serviceCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('is-visible');
                        }, index * 800); 
                    });
                    
                    target.classList.add('is-visible');
                    observer.unobserve(target);
                } 
                else {
                    target.classList.add('is-visible');
                    observer.unobserve(target); 
                }
            }
        });
    }, observerOptions);

    scrollElements.forEach(element => {
        if(element) observer.observe(element);
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

    // =========================================================
    // 7. CARRUSEL INFINITO AUTOMÁTICO (LOGOS CLIENTES MÓVIL)
    // =========================================================
    const gridClientes = document.querySelector('.clientes-grid');
    
    if (gridClientes && window.innerWidth <= 768) {
        const logosOriginales = Array.from(gridClientes.children);
        
        logosOriginales.forEach(logo => {
            const clon = logo.cloneNode(true);
            gridClientes.appendChild(clon);
        });
    }

    // =========================================================
    // 8. CARRUSEL DE SERVICIOS
    // =========================================================
    const servicesCarousel = document.querySelector('#services-carousel'); 
    const serviceDots = document.querySelectorAll('#services-dots .dot'); 
    const prevBtn = document.querySelector('.services-block .carousel-arrow.prev');
    const nextBtn = document.querySelector('.services-block .carousel-arrow.next');

    if (servicesCarousel) {
        const items = servicesCarousel.querySelectorAll('.service-card'); 
        let currentIndex = 0;
        let isScrolling = false;

        const updateActiveCardClass = (index) => {
            items.forEach((item, i) => {
                item.classList.toggle('active', i === index);
            });
        };

        const navigateToCard = (index) => {
            if (index < 0) {
                currentIndex = items.length - 1; 
            } else if (index >= items.length) {
                currentIndex = 0; 
            } else {
                currentIndex = index;
            }

            const targetLeft = items[currentIndex].offsetLeft - servicesCarousel.offsetLeft;

            isScrolling = true;
            servicesCarousel.scrollTo({
                left: targetLeft,
                behavior: 'smooth'
            });

            updateDots(currentIndex);
            updateActiveCardClass(currentIndex);

            setTimeout(() => {
                isScrolling = false;
            }, 600);
        };

        const updateDots = (index) => {
            serviceDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        };

        if(items.length > 0) {
            updateActiveCardClass(0);
        }

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => navigateToCard(currentIndex - 1));
            nextBtn.addEventListener('click', () => navigateToCard(currentIndex + 1));
        }
        
        serviceDots.forEach((dot, i) => {
            dot.addEventListener('click', () => navigateToCard(i));
        });

        servicesCarousel.addEventListener('scroll', () => {
            if (isScrolling) return; 

            const scrollPosition = servicesCarousel.scrollLeft + (servicesCarousel.clientWidth / 2);
            let closestIndex = 0;
            let minDistance = Infinity;

            items.forEach((item, index) => {
                const itemCenter = item.offsetLeft - servicesCarousel.offsetLeft + (item.offsetWidth / 2);
                const distance = Math.abs(scrollPosition - itemCenter);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = index;
                }
            });

            if (closestIndex !== currentIndex) {
                currentIndex = closestIndex;
                updateDots(currentIndex);
                updateActiveCardClass(currentIndex);
            }
        }, { passive: true });
    }

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
        window.addEventListener('scroll', () => {
            // Se muestra solo si pasamos los 400px de scroll (fuera del inicio)
            if (window.scrollY > 400) {
                whatsappBtn.classList.add('show');
            } else {
                whatsappBtn.classList.remove('show');
            }
        }, { passive: true });
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
        '.team-panel-card, .service-card-panel, .solucion-col-panel, .cta-panel-left, .cta-panel-right'
    );

    const panelObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                panelObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    panelElements.forEach(el => panelObserver.observe(el));

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
            const dot = document.createElement('span');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goToMobile(i));
            mobileDotsBox.appendChild(dot);
        });

        const mobileDots = () => mobileDotsBox.querySelectorAll('.dot');

        const goToMobile = (idx) => {
            // Pausar todos los videos del slide actual
            slides[mobileIdx].querySelectorAll('video').forEach(v => v.pause());

            mobileIdx = (idx + slides.length) % slides.length;
            mobileTrack.style.transform = `translateX(-${mobileIdx * 100}%)`;

            // Actualizar dots
            mobileDots().forEach((d, i) => d.classList.toggle('active', i === mobileIdx));

            // Reproducir video del nuevo slide si existe
            const vid = slides[mobileIdx].querySelector('video');
            if (vid) vid.play().catch(() => {});
        };

        if (mobilePrev) mobilePrev.addEventListener('click', () => goToMobile(mobileIdx - 1));
        if (mobileNext) mobileNext.addEventListener('click', () => goToMobile(mobileIdx + 1));

        // Soporte touch / swipe
        let touchStartX = 0;
        mobileTrack.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        mobileTrack.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 45) goToMobile(mobileIdx + (diff > 0 ? 1 : -1));
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
            if (nosotros) nosotros.scrollIntoView({ behavior: 'smooth' });
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
    // F. SOUND TOGGLE FOR PORTFOLIO VIDEOS
    // ──────────────────────────────────────────
    document.querySelectorAll('.sound-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const video = btn.closest('.portfolio-grid-item').querySelector('video');
            if (!video) return;
            
            if (video.muted) {
                // Mute all other videos first
                document.querySelectorAll('.portfolio-grid-video').forEach(v => {
                    v.muted = true;
                    const otherBtn = v.closest('.portfolio-grid-item')?.querySelector('.sound-toggle');
                    if (otherBtn) {
                        otherBtn.classList.remove('is-unmuted');
                        otherBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                        otherBtn.setAttribute('aria-label', 'Activar sonido');
                    }
                });
                video.muted = false;
                btn.classList.add('is-unmuted');
                btn.innerHTML = '<i class="fas fa-volume-up"></i>';
                btn.setAttribute('aria-label', 'Silenciar');
            } else {
                video.muted = true;
                btn.classList.remove('is-unmuted');
                btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
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
});