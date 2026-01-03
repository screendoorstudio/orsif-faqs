/* ===================================
   ORSIF Radiation Safety FAQs
   Main Application JavaScript
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initNavigation();
    initFAQs();
    initSearch();
    generateSchema();
});

/* ===================================
   Navigation
   =================================== */
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }
}

/* ===================================
   FAQ Initialization
   =================================== */
function initFAQs() {
    const categoryGrid = document.getElementById('category-grid');
    const faqContainer = document.getElementById('faq-container');

    if (!categoryGrid || !faqContainer || typeof faqData === 'undefined') {
        console.error('Required elements or data not found');
        return;
    }

    // Category icons mapping
    const categoryIcons = {
        'radiation-fundamentals': '☢️',
        'occupational-exposure': '📊',
        'cancer-risks': '🎗️',
        'dna-effects': '🧬',
        'eye-cataract': '👁️',
        'orthopedic-injuries': '🦴',
        'women-risks': '♀️',
        'ppe-equipment': '🛡️',
        'novel-technologies': '🔬',
        'dosimetry': '📏',
        'us-federal': '🏛️',
        'us-state': '🗺️',
        'international': '🌍',
        'training': '📚',
        'economic-impact': '💰',
        'best-practices': '✅'
    };

    // Build category navigation
    faqData.categories.forEach(category => {
        const icon = categoryIcons[category.id] || '📋';
        const card = document.createElement('a');
        card.href = `#${category.id}`;
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-icon">${icon}</div>
            <div class="category-info">
                <h4>${category.name}</h4>
            </div>
            <span class="category-count">${category.faqs.length}</span>
        `;
        categoryGrid.appendChild(card);
    });

    // Build FAQ accordions
    faqData.categories.forEach(category => {
        const icon = categoryIcons[category.id] || '📋';
        const section = document.createElement('div');
        section.className = 'faq-category';
        section.id = category.id;

        let faqsHtml = '';
        category.faqs.forEach(faq => {
            faqsHtml += `
                <div class="faq-item" data-id="${faq.id}">
                    <button class="faq-question" aria-expanded="false">
                        <span class="question-text">${faq.question}</span>
                        <span class="faq-toggle">+</span>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer-content">
                            <p>${faq.answer}</p>
                            <p class="faq-source"><strong>Source:</strong> ${faq.source}</p>
                        </div>
                    </div>
                </div>
            `;
        });

        section.innerHTML = `
            <div class="faq-category-header">
                <span style="font-size: 1.5rem;">${icon}</span>
                <h3>${category.name}</h3>
                <span class="category-count">${category.faqs.length} FAQs</span>
            </div>
            <div class="faq-accordion">
                ${faqsHtml}
            </div>
        `;

        faqContainer.appendChild(section);
    });

    // Add click handlers to FAQ questions
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', function() {
            const faqItem = this.closest('.faq-item');
            const isActive = faqItem.classList.contains('active');

            // Toggle current item
            faqItem.classList.toggle('active');
            this.setAttribute('aria-expanded', !isActive);
        });
    });
}

/* ===================================
   Search Functionality
   =================================== */
function initSearch() {
    const searchInput = document.getElementById('faq-search');
    const clearBtn = document.getElementById('clear-search');
    const searchResults = document.getElementById('search-results');
    const resultsList = document.getElementById('results-list');
    const searchTerm = document.getElementById('search-term');
    const resultsCount = document.getElementById('results-count');
    const categoryNav = document.getElementById('category-nav');
    const faqSection = document.getElementById('faq-section');

    if (!searchInput || typeof faqData === 'undefined') {
        return;
    }

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Search function
    function performSearch(query) {
        if (!query || query.length < 2) {
            searchResults.classList.add('hidden');
            categoryNav.classList.remove('hidden');
            faqSection.classList.remove('hidden');
            clearBtn.classList.remove('visible');
            return;
        }

        clearBtn.classList.add('visible');
        const lowerQuery = query.toLowerCase();
        const results = [];

        // Search through all categories and FAQs
        faqData.categories.forEach(category => {
            category.faqs.forEach(faq => {
                const questionMatch = faq.question.toLowerCase().includes(lowerQuery);
                const answerMatch = faq.answer.toLowerCase().includes(lowerQuery);

                if (questionMatch || answerMatch) {
                    results.push({
                        ...faq,
                        categoryName: category.name,
                        categoryId: category.id
                    });
                }
            });
        });

        // Display results
        if (results.length > 0) {
            searchResults.classList.remove('hidden');
            categoryNav.classList.add('hidden');
            faqSection.classList.add('hidden');

            searchTerm.textContent = `"${query}"`;
            resultsCount.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''}`;

            resultsList.innerHTML = results.map(result => `
                <div class="result-item">
                    <h4>${highlightText(result.question, query)}</h4>
                    <p>${highlightText(truncateText(result.answer, 200), query)}</p>
                    <span class="result-category">${result.categoryName}</span>
                </div>
            `).join('');
        } else {
            searchResults.classList.remove('hidden');
            categoryNav.classList.add('hidden');
            faqSection.classList.add('hidden');

            searchTerm.textContent = `"${query}"`;
            resultsCount.textContent = 'No results found';
            resultsList.innerHTML = '<p class="no-results">Try different keywords or browse categories below.</p>';
        }
    }

    // Highlight matching text
    function highlightText(text, query) {
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // Escape special regex characters
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Truncate text
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Event listeners
    searchInput.addEventListener('input', debounce(function() {
        performSearch(this.value.trim());
    }, 300));

    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        performSearch('');
        searchInput.focus();
    });

    // Clear on Escape key
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchInput.value = '';
            performSearch('');
        }
    });
}

/* ===================================
   Schema Generation for SEO
   =================================== */
function generateSchema() {
    if (typeof faqData === 'undefined') return;

    const schemaElement = document.getElementById('faq-schema');
    if (!schemaElement) return;

    // Generate FAQPage schema
    const faqPageSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": []
    };

    // Add all FAQs to schema
    faqData.categories.forEach(category => {
        category.faqs.forEach(faq => {
            faqPageSchema.mainEntity.push({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            });
        });
    });

    schemaElement.textContent = JSON.stringify(faqPageSchema);
}

/* ===================================
   Smooth Scroll for Category Links
   =================================== */
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        const targetId = link.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);

        if (target) {
            e.preventDefault();

            // Show FAQ section if hidden (e.g., from search)
            const faqSection = document.getElementById('faq-section');
            const categoryNav = document.getElementById('category-nav');
            const searchResults = document.getElementById('search-results');

            if (faqSection) faqSection.classList.remove('hidden');
            if (categoryNav) categoryNav.classList.remove('hidden');
            if (searchResults) searchResults.classList.add('hidden');

            // Clear search
            const searchInput = document.getElementById('faq-search');
            if (searchInput) searchInput.value = '';

            // Scroll to target
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
});
