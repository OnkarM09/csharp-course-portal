/**
 * C# Masterclass Documentation Portal - Global Search Engine & Modal
 * Offline-First, Zero External Dependency, Fast Token-Based Fuzzy Search
 */

(function () {
  'use strict';

  // Determine relative root path depending on whether we are in /sections/ or root
  const isInSectionsDir = window.location.pathname.includes('/sections/');
  const rootPath = isInSectionsDir ? '../' : './';

  // Ensure Search Modal HTML exists in DOM
  function injectSearchModal() {
    if (document.querySelector('.search-modal-backdrop')) return;

    const modalHtml = `
      <div class="search-modal-backdrop" id="searchModalBackdrop" role="dialog" aria-modal="true" aria-label="Search Documentation">
        <div class="search-modal">
          <div class="search-modal-header">
            <span class="search-input-icon">🔍</span>
            <input type="text" class="search-modal-input" id="searchModalInput" placeholder="Search topics, syntax, concepts, keywords... (e.g. 'lock', 'linq', 'struct', 'yield')" autocomplete="off" spellcheck="false" />
            <button class="search-close-btn" id="searchCloseBtn" aria-label="Close search">ESC</button>
          </div>
          <div class="search-modal-results" id="searchResultsContainer">
            <div class="search-empty">Type keywords above to search all 37 sections across the curriculum.</div>
          </div>
          <div class="search-modal-footer">
            <span><kbd class="kbd-shortcut">↑</kbd> <kbd class="kbd-shortcut">↓</kbd> to navigate</span>
            <span><kbd class="kbd-shortcut">Enter</kbd> to select</span>
            <span><kbd class="kbd-shortcut">Esc</kbd> to close</span>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  let selectedIndex = -1;
  let currentResults = [];

  function openSearchModal() {
    injectSearchModal();
    const backdrop = document.getElementById('searchModalBackdrop');
    const input = document.getElementById('searchModalInput');
    if (!backdrop || !input) return;

    backdrop.classList.add('open');
    input.value = '';
    input.focus();
    renderResults([]);
  }

  function closeSearchModal() {
    const backdrop = document.getElementById('searchModalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('open');
    }
  }

  function highlightMatches(text, terms) {
    if (!text || !terms || terms.length === 0) return escapeHtml(text || '');
    let escaped = escapeHtml(text);
    terms.forEach(term => {
      if (!term) return;
      const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
      escaped = escaped.replace(regex, '<span class="search-highlight">$1</span>');
    });
    return escaped;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function search(query) {
    if (!window.SEARCH_INDEX || !Array.isArray(window.SEARCH_INDEX)) {
      return [];
    }

    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return [];

    const terms = cleanQuery.split(/\s+/).filter(t => t.length > 0);
    const scored = [];

    window.SEARCH_INDEX.forEach(item => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const sectionLower = item.sectionTitle.toLowerCase();
      const keywordsLower = (item.keywords || []).join(' ').toLowerCase();
      const snippetLower = (item.snippet || '').toLowerCase();

      let allMatched = true;

      terms.forEach(term => {
        let termMatched = false;
        if (titleLower.includes(term)) {
          score += 150;
          if (titleLower.startsWith(term)) score += 50;
          termMatched = true;
        }
        if (sectionLower.includes(term)) {
          score += 80;
          termMatched = true;
        }
        if (keywordsLower.includes(term)) {
          score += 60;
          termMatched = true;
        }
        if (snippetLower.includes(term)) {
          score += 30;
          termMatched = true;
        }
        if (!termMatched) {
          allMatched = false;
        }
      });

      if (allMatched && score > 0) {
        scored.push({ item, score, terms });
      }
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 30).map(s => ({ ...s.item, terms: s.terms }));
  }

  function renderResults(results) {
    const container = document.getElementById('searchResultsContainer');
    if (!container) return;

    currentResults = results;
    selectedIndex = results.length > 0 ? 0 : -1;

    if (results.length === 0) {
      const input = document.getElementById('searchModalInput');
      const val = input ? input.value.trim() : '';
      if (val) {
        container.innerHTML = `<div class="search-empty">No topics found matching "<strong>${escapeHtml(val)}</strong>". Try broader keywords.</div>`;
      } else {
        container.innerHTML = `<div class="search-empty">Type keywords above to search all 37 sections across the curriculum.</div>`;
      }
      return;
    }

    let html = '';
    results.forEach((res, idx) => {
      // Calculate target URL
      let targetUrl = res.url;
      if (isInSectionsDir) {
        // We are inside /sections/
        if (targetUrl.startsWith('sections/')) {
          targetUrl = targetUrl.replace('sections/', '');
        } else if (targetUrl === 'index.html') {
          targetUrl = '../index.html';
        }
      } else {
        // We are at root /
        if (!targetUrl.startsWith('sections/') && targetUrl !== 'index.html') {
          targetUrl = 'sections/' + targetUrl;
        }
      }

      if (res.anchor) {
        targetUrl += '#' + res.anchor;
      }

      const isSelected = idx === selectedIndex ? 'selected' : '';
      const highlightedTitle = highlightMatches(res.title, res.terms);
      const highlightedSnippet = highlightMatches(res.snippet, res.terms);

      html += `
        <a href="${targetUrl}" class="search-result-item ${isSelected}" data-index="${idx}">
          <div class="search-result-header">
            <span class="search-result-title">${highlightedTitle}</span>
            <span class="search-result-module">${escapeHtml(res.sectionTitle)}</span>
          </div>
          <div class="search-result-snippet">${highlightedSnippet}</div>
        </a>
      `;
    });

    container.innerHTML = html;
  }

  function updateSelected() {
    const items = document.querySelectorAll('.search-result-item');
    items.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  function handleKeydown(e) {
    // Open on Ctrl+K, Cmd+K, or / (when not focused in an input)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      openSearchModal();
      return;
    }

    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      openSearchModal();
      return;
    }

    const backdrop = document.getElementById('searchModalBackdrop');
    if (!backdrop || !backdrop.classList.contains('open')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearchModal();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentResults.length > 0) {
        selectedIndex = (selectedIndex + 1) % currentResults.length;
        updateSelected();
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentResults.length > 0) {
        selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
        updateSelected();
      }
      return;
    }

    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
        e.preventDefault();
        const selectedElem = document.querySelector(`.search-result-item[data-index="${selectedIndex}"]`);
        if (selectedElem) {
          selectedElem.click();
        }
      }
    }
  }

  // Setup DOM listeners
  document.addEventListener('DOMContentLoaded', () => {
    injectSearchModal();

    // Trigger buttons
    document.querySelectorAll('.search-trigger-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openSearchModal();
      });
    });

    // Modal background close
    document.addEventListener('click', (e) => {
      const backdrop = document.getElementById('searchModalBackdrop');
      if (backdrop && e.target === backdrop) {
        closeSearchModal();
      }
      if (e.target && e.target.id === 'searchCloseBtn') {
        closeSearchModal();
      }
    });

    // Input typing
    document.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'searchModalInput') {
        const query = e.target.value;
        const results = search(query);
        renderResults(results);
      }
    });

    // Keyboard navigation
    window.addEventListener('keydown', handleKeydown);
  });
})();
