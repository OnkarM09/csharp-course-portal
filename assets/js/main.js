/**
 * C# Masterclass Documentation Portal - Main Script
 * Offline-First, Zero Build Step
 */

(function () {
  'use strict';

  // 1. Theme Initialization & Management
  const STORAGE_KEY_THEME = 'csharp_docs_theme';
  const STORAGE_KEY_SIDEBAR = 'csharp_sidebar_collapsed';

  function initSidebarState() {
    const isCollapsed = localStorage.getItem(STORAGE_KEY_SIDEBAR) === 'true';
    if (isCollapsed && window.innerWidth > 900) {
      document.body.classList.add('sidebar-collapsed');
      updateSidebarToggleBtn(true);
    }
  }

  function toggleSidebarCollapsed() {
    const isNowCollapsed = document.body.classList.toggle('sidebar-collapsed');
    localStorage.setItem(STORAGE_KEY_SIDEBAR, isNowCollapsed ? 'true' : 'false');
    updateSidebarToggleBtn(isNowCollapsed);
  }

  function updateSidebarToggleBtn(isCollapsed) {
    const btns = document.querySelectorAll('.sidebar-toggle-btn');
    btns.forEach(btn => {
      const label = btn.querySelector('.sidebar-toggle-text');
      if (label) {
        label.textContent = isCollapsed ? '» Expand' : '« Collapse';
      }
      btn.setAttribute('aria-expanded', (!isCollapsed).toString());
    });
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    updateThemeToggleIcons(theme);
  }

  function updateThemeToggleIcons(theme) {
    const btns = document.querySelectorAll('.theme-toggle-btn');
    btns.forEach(btn => {
      btn.innerHTML = theme === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    });
  }

  // Initialize theme immediately
  applyTheme(getPreferredTheme());

  document.addEventListener('DOMContentLoaded', () => {
    initSidebarState();

    // Attach sidebar collapse/expand listener
    document.querySelectorAll('.sidebar-toggle-btn, .sidebar-collapse-btn, .expand-sidebar-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleSidebarCollapsed();
      });
    });

    // Attach theme toggle listener
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    });

    // 2. Mobile Sidebar Drawer
    const navToggle = document.querySelector('.nav-toggle-btn');
    const sidebar = document.querySelector('.docs-sidebar');
    const backdrop = document.querySelector('.sidebar-backdrop');

    if (navToggle && sidebar) {
      navToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (backdrop) backdrop.classList.toggle('open');
      });

      if (backdrop) {
        backdrop.addEventListener('click', () => {
          sidebar.classList.remove('open');
          backdrop.classList.remove('open');
        });
      }
    }

    // 3. Code Block Copy Functionality
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const container = btn.closest('.code-block-container');
        if (!container) return;
        const codeElem = container.querySelector('pre code') || container.querySelector('pre');
        if (!codeElem) return;

        const textToCopy = codeElem.innerText;
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(textToCopy);
          } else {
            // Fallback for file:// or unsecure context
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
          }

          const originalHtml = btn.innerHTML;
          btn.innerHTML = '✓ Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.classList.remove('copied');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy code: ', err);
        }
      });
    });

    // 4. Sidebar Real-Time Filtering
    const filterInput = document.querySelector('.sidebar-filter-input');
    if (filterInput) {
      filterInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const items = document.querySelectorAll('.sidebar-nav-item');
        const groups = document.querySelectorAll('.sidebar-group');

        items.forEach(item => {
          const text = item.textContent.toLowerCase();
          if (text.includes(term)) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });

        // Hide empty groups
        groups.forEach(group => {
          const visibleItems = group.querySelectorAll('.sidebar-nav-item:not([style*="display: none"])');
          group.style.display = visibleItems.length === 0 ? 'none' : '';
        });
      });
    }

    // 5. Table of Contents ScrollSpy
    const tocLinks = document.querySelectorAll('.toc-link');
    const headings = Array.from(document.querySelectorAll('.docs-content h2[id], .docs-content h3[id]'));

    if (tocLinks.length > 0 && headings.length > 0) {
      const observerCallback = () => {
        const scrollY = window.scrollY;
        let activeHeading = null;

        for (let i = 0; i < headings.length; i++) {
          const heading = headings[i];
          const top = heading.getBoundingClientRect().top + window.scrollY - 100;
          if (scrollY >= top) {
            activeHeading = heading;
          } else {
            break;
          }
        }

        if (!activeHeading && headings.length > 0) {
          activeHeading = headings[0];
        }

        if (activeHeading) {
          const id = activeHeading.getAttribute('id');
          tocLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      };

      window.addEventListener('scroll', observerCallback, { passive: true });
      observerCallback(); // initial call
    }

    // 6. Smooth scrolling offset fix when clicking on in-page hashes
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').substring(1);
        if (!targetId) return;
        const targetElem = document.getElementById(targetId);
        if (targetElem) {
          e.preventDefault();
          history.pushState(null, null, `#${targetId}`);
          targetElem.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  });
})();
