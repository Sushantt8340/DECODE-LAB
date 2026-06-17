/**
 * BharatSafar - Travel Explorer & Booking Platform
 * Vanilla Javascript Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Mobile Menu Toggle ---
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // --- 2. Sticky Header ---
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 3. Scroll Animations (Intersection Observer) ---
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => scrollObserver.observe(el));

    // --- 4. Form Validation & API Integration ---
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const destInput = document.getElementById('destination');
    const dateInput = document.getElementById('travel-date');
    const msgInput = document.getElementById('message');
    const formSuccess = document.getElementById('form-success');

    const isValidEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const validateInput = (input, validator, errorId) => {
        if (!input) return true;
        const formGroup = input.parentElement;
        if (!validator) {
            formGroup.classList.add('error');
            return false;
        } else {
            formGroup.classList.remove('error');
            return true;
        }
    };

    // Toggle Travel Date visibility and requirement based on destination selection
    if (destInput && dateInput) {
        const dateGroup = document.getElementById('date-group');
        const handleDestChange = () => {
            const isSpecificDest = destInput.value !== '' && destInput.value !== 'other';
            if (isSpecificDest) {
                dateGroup.style.display = 'block';
            } else {
                dateGroup.style.display = 'none';
                dateGroup.classList.remove('error');
                dateInput.value = '';
            }
        };
        destInput.addEventListener('change', handleDestChange);
        // Initial state check
        handleDestChange();
    }

    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const isDestSelected = destInput.value !== '';
            const isOtherSelected = destInput.value === 'other';
            const needsDate = isDestSelected && !isOtherSelected;

            const isNameValid = validateInput(nameInput, nameInput.value.trim() !== '', 'name-error');
            const isEmailValid = validateInput(emailInput, isValidEmail(emailInput.value.trim()), 'email-error');
            const isDestValid = validateInput(destInput, isDestSelected, 'dest-error');
            const isDateValid = needsDate 
                ? validateInput(dateInput, dateInput.value !== '', 'date-error')
                : validateInput(dateInput, true, 'date-error');
            const isMsgValid = validateInput(msgInput, msgInput.value.trim() !== '', 'msg-error');

            if (isNameValid && isEmailValid && isDestValid && isDateValid && isMsgValid) {
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                
                // Disable button and show loading state
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Processing... <i class="fa-solid fa-spinner fa-spin"></i>';

                let url, body;
                if (needsDate) {
                    url = 'http://localhost:5000/api/bookings';
                    body = {
                        fullName: nameInput.value.trim(),
                        email: emailInput.value.trim(),
                        destination: destInput.value,
                        travelDate: dateInput.value
                    };
                } else {
                    url = 'http://localhost:5000/api/contact';
                    body = {
                        name: nameInput.value.trim(),
                        email: emailInput.value.trim(),
                        message: msgInput.value.trim()
                    };
                }

                fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
                .then(res => res.json())
                .then(data => {
                    formSuccess.style.display = 'block';
                    if (data.success) {
                        formSuccess.textContent = needsDate 
                            ? 'Trip booked successfully! We will contact you soon.' 
                            : 'Thank you! Your message has been sent.';
                        formSuccess.style.color = '#10b981'; // Green success color
                        formSuccess.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                        formSuccess.style.border = '1px solid #10b981';
                        contactForm.reset();
                        if (dateInput) document.getElementById('date-group').style.display = 'none';
                    } else {
                        formSuccess.textContent = data.message || 'Validation failed. Please verify inputs.';
                        formSuccess.style.color = '#ef4444'; // Red error color
                        formSuccess.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        formSuccess.style.border = '1px solid #ef4444';
                    }
                    setTimeout(() => {
                        formSuccess.style.display = 'none';
                    }, 5000);
                })
                .catch(err => {
                    console.error('API Error:', err);
                    // Fallback to demo mode if backend is offline
                    formSuccess.style.display = 'block';
                    formSuccess.textContent = 'Offline Demo: Message received successfully!';
                    formSuccess.style.color = '#3b82f6'; // Blue offline color
                    formSuccess.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    formSuccess.style.border = '1px solid #3b82f6';
                    contactForm.reset();
                    if (dateInput) document.getElementById('date-group').style.display = 'none';
                    setTimeout(() => {
                        formSuccess.style.display = 'none';
                    }, 5000);
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                });
            }
        });
    }

    // Dynamic dropdown options helper
    const populateDestinationDropdown = (list) => {
        if (!destInput) return;
        destInput.innerHTML = '<option value="" disabled selected>Select a destination</option>';
        list.forEach(dest => {
            const opt = document.createElement('option');
            opt.value = dest.name;
            opt.textContent = dest.name;
            destInput.appendChild(opt);
        });
        const otherOpt = document.createElement('option');
        otherOpt.value = 'other';
        otherOpt.textContent = 'Other / General Query';
        destInput.appendChild(otherOpt);
    };

    // --- 5. Famous Indian Destinations Data (Seeded initially, updated from API) ---
    let destinations = [
        { name: "Taj Mahal, Agra", price: "₹5,000", rating: "4.9", desc: "A symbol of love and a UNESCO World Heritage Site.", id: "agra", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/500px-Taj_Mahal_%28Edited%29.jpeg" },
        { name: "Jaipur, Rajasthan", price: "₹7,500", rating: "4.7", desc: "The Pink City known for its stunning forts and Hawa Mahal palace.", id: "jaipur", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/500px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg" },
        { name: "Varanasi, UP", price: "₹4,000", rating: "4.8", desc: "The spiritual capital of India on the banks of river Ganga.", id: "varanasi", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg/500px-Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg" },
        { name: "Leh Ladakh", price: "₹15,000", rating: "4.9", desc: "Breathtaking landscapes, high passes, and Buddhist monasteries.", id: "ladakh", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Road_Padum_Zanskar_Range_Jun24_A7CR_00818.jpg/500px-Road_Padum_Zanskar_Range_Jun24_A7CR_00818.jpg" },
        { name: "Goa Beaches", price: "₹10,000", rating: "4.8", desc: "Famous for its pristine beaches, nightlife, and Portuguese heritage.", id: "goa", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/BeachFun.jpg/500px-BeachFun.jpg" },
        { name: "Alleppey, Kerala", price: "₹8,000", rating: "4.7", desc: "Experience the tranquil backwaters in a traditional houseboat.", id: "alleppey", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Alappuzha_Boat_Beauty_W.jpg/500px-Alappuzha_Boat_Beauty_W.jpg" },
        { name: "Rishikesh", price: "₹4,500", rating: "4.6", desc: "The Yoga capital of the world and a hub for river rafting.", id: "rishikesh", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Trayambakeshwar_Temple_VK.jpg/500px-Trayambakeshwar_Temple_VK.jpg" },
        { name: "Darjeeling", price: "₹6,000", rating: "4.7", desc: "Queen of the Hills, famous for tea gardens and toy train.", id: "darjeeling", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/DarjeelingTrainFruitshop_%282%29.jpg/500px-DarjeelingTrainFruitshop_%282%29.jpg" },
        { name: "Munnar, Kerala", price: "₹7,000", rating: "4.8", desc: "Idyllic hill station with sprawling tea plantations.", id: "munnar", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Munnar_Overview.jpg/500px-Munnar_Overview.jpg" },
        { name: "Udaipur, Rajasthan", price: "₹9,000", rating: "4.9", desc: "City of Lakes, known for its majestic City Palace and Lake Palace.", id: "udaipur", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Evening_view%2C_City_Palace%2C_Udaipur.jpg/500px-Evening_view%2C_City_Palace%2C_Udaipur.jpg" },
        { name: "Andaman Islands", price: "₹20,000", rating: "4.9", desc: "Tropical paradise perfect for scuba diving and relaxing.", id: "andaman", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/The_Coral_Reef_at_the_Andaman_Islands.jpg/500px-The_Coral_Reef_at_the_Andaman_Islands.jpg" },
        { name: "Hampi, Karnataka", price: "₹5,500", rating: "4.8", desc: "Ancient village with fascinating ruins of the Vijayanagara Empire.", id: "hampi", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg/500px-Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg" },
        { name: "Ranthambore", price: "₹8,500", rating: "4.6", desc: "One of the best places in India to spot wild Bengal tigers.", id: "ranthambore", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Tiger_in_Ranthambhore.jpg/500px-Tiger_in_Ranthambhore.jpg" },
        { name: "Shimla, HP", price: "₹6,500", rating: "4.5", desc: "Historic hill station featuring colonial architecture and snow.", id: "shimla", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Landscape_of_Shimla_%2C_Himachal_Pradesh.jpg/500px-Landscape_of_Shimla_%2C_Himachal_Pradesh.jpg" },
        { name: "Manali, HP", price: "₹7,500", rating: "4.7", desc: "A high-altitude Himalayan resort town famous for adventure sports.", id: "manali", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Manali_City.jpg/500px-Manali_City.jpg" },
        { name: "Srinagar, J&K", price: "₹12,000", rating: "4.8", desc: "Heaven on Earth, known for its beautiful Dal Lake and Shikaras.", id: "srinagar", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Dal_Lake_Hazratbal_Srinagar.jpg/500px-Dal_Lake_Hazratbal_Srinagar.jpg" },
        { name: "Jaisalmer", price: "₹8,000", rating: "4.7", desc: "The Golden City located in the heart of the Thar Desert.", id: "jaisalmer", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Jaisalmer_Fort.jpg/500px-Jaisalmer_Fort.jpg" },
        { name: "Khajuraho", price: "₹5,000", rating: "4.6", desc: "Stunning ancient temples famous for their intricate sculptures.", id: "khajuraho", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/1_Khajuraho.jpg/500px-1_Khajuraho.jpg" },
        { name: "Ajanta & Ellora", price: "₹4,000", rating: "4.8", desc: "Ancient rock-cut caves featuring masterful Buddhist art.", id: "ajanta", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Ajanta_%2863%29.jpg/500px-Ajanta_%2863%29.jpg" },
        { name: "Mysore, Karnataka", price: "₹5,500", rating: "4.6", desc: "Famous for the magnificent Mysore Palace and silk sarees.", id: "mysore", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mysore_Palace_Morning.jpg/500px-Mysore_Palace_Morning.jpg" },
        { name: "Kanyakumari", price: "₹6,000", rating: "4.5", desc: "The southernmost tip of India where three oceans meet.", id: "kanyakumari", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Vivekananda_Rock_Memorial%2C_Kanyakumari.jpg/500px-Vivekananda_Rock_Memorial%2C_Kanyakumari.jpg" },
        { name: "Madurai", price: "₹4,500", rating: "4.7", desc: "An ancient city dominated by the colourful Meenakshi Amman Temple.", id: "madurai", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg/500px-An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg" },
        { name: "Kaziranga", price: "₹9,000", rating: "4.8", desc: "Home to the world's largest population of one-horned rhinoceroses.", id: "kaziranga", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Beauty_of_Kaziranga_National_Park.jpg/500px-Beauty_of_Kaziranga_National_Park.jpg" },
        { name: "Tawang", price: "₹11,000", rating: "4.7", desc: "Beautiful mountainous town famous for the Tawang Monastery.", id: "tawang", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/TawangMonastery.jpg/500px-TawangMonastery.jpg" },
        { name: "Gangtok, Sikkim", price: "₹8,000", rating: "4.6", desc: "A pristine hill station offering views of Mt. Kanchenjunga.", id: "gangtok", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Kangch-Goechala.jpg/500px-Kangch-Goechala.jpg" },
        { name: "Ooty, TN", price: "₹6,000", rating: "4.5", desc: "Popular hill station in the Nilgiri hills known for its landscapes.", id: "ooty", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Ooty_lake.jpg/500px-Ooty_lake.jpg" },
        { name: "Coorg, Karnataka", price: "₹7,000", rating: "4.6", desc: "The Scotland of India, famous for coffee plantations and mist.", id: "coorg", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Raja%27s_Seat_View_Point.jpg/500px-Raja%27s_Seat_View_Point.jpg" },
        { name: "Pondicherry", price: "₹6,500", rating: "4.7", desc: "A charming coastal city with French colonial legacy.", id: "pondicherry", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Pondicherry-Rock_beach_aerial_view.jpg/500px-Pondicherry-Rock_beach_aerial_view.jpg" },
        { name: "Mahabaleshwar", price: "₹5,000", rating: "4.5", desc: "A forested hill station known for its strawberries and viewpoints.", id: "mahabaleshwar", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/MAHABALESWAR_LANDSCAPE.jpg/500px-MAHABALESWAR_LANDSCAPE.jpg" },
        { name: "Nainital", price: "₹6,000", rating: "4.6", desc: "A beautiful Himalayan resort town set around a serene lake.", id: "nainital", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Nainital_metro.jpg/500px-Nainital_metro.jpg" },
       
        { name: "Rann of Kutch", price: "₹8,000", rating: "4.8", desc: "A massive expanse of white salt desert in Gujarat.", id: "kutch", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Rann_of_Kutch_-_White_Desert.jpg/500px-Rann_of_Kutch_-_White_Desert.jpg" },
    
        { name: "Cherrapunji", price: "₹9,000", rating: "4.7", desc: "One of the wettest places on Earth, famous for living root bridges.", id: "cherrapunji", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Cherrapunji.jpg/500px-Cherrapunji.jpg" },
        { name: "Valley of Flowers", price: "₹10,000", rating: "4.9", desc: "A vibrant national park in Uttarakhand known for endemic flora.", id: "valley", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg/500px-Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg" },
        { name: "Amritsar", price: "₹4,500", rating: "4.8", desc: "Home to the spectacular Golden Temple, the spiritual center of Sikhism.", id: "amritsar", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/The_Golden_Temple_of_Amrithsar_7.jpg/500px-The_Golden_Temple_of_Amrithsar_7.jpg" }
    ];

    const destGrid = document.getElementById('destinations-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchMsg = document.getElementById('search-result-message');
    
    let currentCount = 0;
    const itemsPerLoad = 9;

    // Generate HTML for a single destination card
    const createDestCard = (dest, delay) => {
        return `
            <div class="destination-card animate-on-scroll" style="transition-delay: ${delay}s;">
                <div class="card-img-wrapper">
                    <div class="card-price">From ${dest.price}</div>
                    <img src="${dest.img}" alt="${dest.name}" loading="lazy" onerror="this.onerror=null;this.style.objectFit='none';this.style.background='linear-gradient(135deg,#1a1a2e,#16213e)';this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'260\' viewBox=\'0 0 400 260\'%3E%3Crect fill=\'%231a1a2e\' width=\'400\' height=\'260\'/%3E%3Ctext fill=\'%23ffffff44\' font-size=\'40\' text-anchor=\'middle\' x=\'200\' y=\'140\'%3E🏛%3C/text%3E%3C/svg%3E';">
                </div>
                <div class="card-content">
                    <div class="card-location"><i class="fa-solid fa-map-pin"></i> India</div>
                    <h3 class="card-title">${dest.name}</h3>
                    <p class="card-desc">${dest.desc}</p>
                    <div class="card-footer">
                        <div class="rating">
                            <i class="fa-solid fa-star"></i>
                            <span>${dest.rating} (120+ Reviews)</span>
                        </div>
                        <a href="#contact" class="btn btn-primary-outline" style="padding: 6px 15px; font-size: 0.9rem;">Book</a>
                    </div>
                </div>
            </div>
        `;
    };

    // Render destinations to the grid
    const renderDestinations = (dataList, isSearching = false) => {
        if(isSearching) {
            destGrid.innerHTML = '';
            currentCount = 0;
        }

        const toRender = dataList.slice(currentCount, currentCount + itemsPerLoad);
        
        toRender.forEach((dest, index) => {
            const delay = (index % itemsPerLoad) * 0.1;
            destGrid.insertAdjacentHTML('beforeend', createDestCard(dest, delay));
        });

        currentCount += toRender.length;

        // Apply observer to new elements
        const newElements = destGrid.querySelectorAll('.animate-on-scroll:not(.show)');
        newElements.forEach(el => scrollObserver.observe(el));

        // Handle Load More Button Visibility
        if(currentCount >= dataList.length) {
            loadMoreBtn.parentElement.style.display = 'none';
        } else {
            loadMoreBtn.parentElement.style.display = 'block';
        }
    };

    // Populate the dropdown initially with local data
    populateDestinationDropdown(destinations);

    // Initial render with dynamic backend fetch
    fetch('http://localhost:5000/api/destinations')
        .then(res => res.json())
        .then(data => {
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                console.log('Successfully fetched destinations from backend API');
                destinations = data.data; // Update local memory array
                populateDestinationDropdown(destinations); // Repopulate with clean API names
            }
        })
        .catch(err => {
            console.warn('Backend API offline or failed, falling back to local static destinations:', err);
        })
        .finally(() => {
            // Render the destinations (from API or static fallback)
            renderDestinations(destinations);
        });

    // Handle "Book" button clicks to pre-fill the selected destination
    if (destGrid) {
        destGrid.addEventListener('click', (e) => {
            const bookBtn = e.target.closest('.btn');
            if (bookBtn && bookBtn.textContent.trim().toLowerCase() === 'book') {
                const card = bookBtn.closest('.destination-card');
                if (card) {
                    const destTitle = card.querySelector('.card-title').textContent.trim();
                    if (destInput) {
                        // Find matching option in the dropdown and select it
                        let matchFound = false;
                        for (let i = 0; i < destInput.options.length; i++) {
                            if (destInput.options[i].value === destTitle) {
                                destInput.selectedIndex = i;
                                matchFound = true;
                                break;
                            }
                        }
                        if (!matchFound) {
                            // If no exact match (unlikely), set to Other
                            destInput.value = 'other';
                        }
                        // Trigger change event to update the date input visibility
                        destInput.dispatchEvent(new Event('change'));
                    }
                }
            }
        });
    }

    // Load More functionality
    loadMoreBtn.addEventListener('click', () => {
        // Find if we are currently filtered or not
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm !== '') {
            const filtered = destinations.filter(dest => 
                dest.name.toLowerCase().includes(searchTerm) || 
                dest.desc.toLowerCase().includes(searchTerm)
            );
            renderDestinations(filtered);
        } else {
            renderDestinations(destinations);
        }
    });

    // --- 6. Destination Search Filter ---
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            searchMsg.style.display = 'none';
            renderDestinations(destinations, true);
            return;
        }

        const filtered = destinations.filter(dest => 
            dest.name.toLowerCase().includes(searchTerm) || 
            dest.desc.toLowerCase().includes(searchTerm)
        );

        searchMsg.style.display = 'block';
        
        if (filtered.length > 0) {
            searchMsg.innerHTML = `Found ${filtered.length} destinations matching "<strong>${searchTerm}</strong>"`;
            searchMsg.style.color = 'var(--dark-color)';
        } else {
            searchMsg.innerHTML = `No destinations found matching "<strong>${searchTerm}</strong>". Try another keyword.`;
            searchMsg.style.color = 'var(--primary-color)';
        }

        renderDestinations(filtered, true);
        
        // Scroll to destinations section
        document.getElementById('destinations').scrollIntoView({ behavior: 'smooth' });
    });

    // Handle Active Nav Links on Scroll
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);
            
            if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
                navLink.classList.add('active');
            }
        });
    });

});
