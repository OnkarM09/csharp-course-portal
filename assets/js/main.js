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
    } else if (window.innerWidth <= 900) {
      document.body.classList.remove('sidebar-collapsed');
    }
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth <= 900) {
      document.body.classList.remove('sidebar-collapsed');
    } else {
      const isCollapsed = localStorage.getItem(STORAGE_KEY_SIDEBAR) === 'true';
      if (isCollapsed) {
        document.body.classList.add('sidebar-collapsed');
        updateSidebarToggleBtn(true);
      }
    }
  });

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

    // Attach sidebar collapse/expand & close listener
    document.querySelectorAll('.sidebar-toggle-btn, .sidebar-close-btn, .expand-sidebar-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.innerWidth <= 900) {
          if (sidebar) sidebar.classList.remove('open');
          if (backdrop) backdrop.classList.remove('open');
        } else {
          toggleSidebarCollapsed();
        }
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

      // Close sidebar when tapping a nav link on mobile/tablet
      sidebar.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 900) {
            sidebar.classList.remove('open');
            if (backdrop) backdrop.classList.remove('open');
          }
        });
      });
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
          let copied = false;
          if (navigator.clipboard && window.isSecureContext) {
            try {
              await navigator.clipboard.writeText(textToCopy);
              copied = true;
            } catch (e) {
              // fallback
            }
          }
          if (!copied) {
            // Fallback for file:// or unsecure context or restricted permissions
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

    // 7. Reading Progress Bar (anchored directly to sticky .top-header)
    let progressBar = document.querySelector('.reading-progress-bar');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'reading-progress-bar';
      const header = document.querySelector('.top-header');
      if (header) {
        header.appendChild(progressBar);
      } else {
        document.body.appendChild(progressBar);
      }
    }

    // 8. Floating Scroll-to-Top Button
    let scrollTopBtn = document.querySelector('.scroll-to-top-btn');
    if (!scrollTopBtn) {
      scrollTopBtn = document.createElement('button');
      scrollTopBtn.className = 'scroll-to-top-btn';
      scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
      scrollTopBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>';
      document.body.appendChild(scrollTopBtn);
      scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    function onScrollUpdate() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }
      if (scrollTopBtn) {
        if (scrollTop > 350) {
          scrollTopBtn.classList.add('visible');
        } else {
          scrollTopBtn.classList.remove('visible');
        }
      }
    }

    // 9. Module Tile Section Breakdown Toggle
    document.querySelectorAll('.module-toggle-list-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tile = btn.closest('.module-tile');
        if (!tile) return;
        const drawer = tile.querySelector('.module-tile-drawer');
        if (!drawer) return;
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', (!isExpanded).toString());
        drawer.hidden = isExpanded;
        const toggleText = btn.querySelector('.toggle-text');
        const count = btn.getAttribute('data-count') || '';
        if (toggleText) {
          toggleText.textContent = isExpanded 
            ? (count ? `View all ${count} sections ▾` : 'View all sections ▾')
            : 'Hide sections ▴';
        }
      });
    });

    // 10. Section Completion State & Progress Tracking
    const STORAGE_KEY_COMPLETED = 'csharp_completed_sections';

    function getCompletedSections() {
      try {
        const data = localStorage.getItem(STORAGE_KEY_COMPLETED);
        return data ? JSON.parse(data) : [];
      } catch {
        return [];
      }
    }

    function toggleSectionCompleted(secNum) {
      const list = getCompletedSections();
      const idx = list.indexOf(secNum);
      if (idx === -1) {
        list.push(secNum);
      } else {
        list.splice(idx, 1);
      }
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(list));
      return list.includes(secNum);
    }

    function initSectionCompletionBtn() {
      const btn = document.getElementById('completionBtn');
      if (!btn) return;

      const secNum = parseInt(btn.getAttribute('data-section'), 10);
      const completedList = getCompletedSections();
      const isCompleted = completedList.includes(secNum);

      updateCompletionBtnState(btn, isCompleted);

      btn.addEventListener('click', () => {
        const nowCompleted = toggleSectionCompleted(secNum);
        updateCompletionBtnState(btn, nowCompleted);
      });
    }

    function updateCompletionBtnState(btn, isCompleted) {
      btn.setAttribute('aria-pressed', isCompleted.toString());
      const icon = btn.querySelector('.completion-icon');
      const text = btn.querySelector('.completion-text');

      if (isCompleted) {
        btn.classList.add('completed');
        if (icon) icon.textContent = '✓';
        if (text) text.textContent = 'Section Completed (Click to undo)';
      } else {
        btn.classList.remove('completed');
        if (icon) icon.textContent = '○';
        if (text) text.textContent = 'Mark Section Complete';
      }
    }

    function initHomepageProgress() {
      const completedList = getCompletedSections();

      // Update Section chips and rows with data-section
      document.querySelectorAll('[data-section]').forEach(el => {
        const secNum = parseInt(el.getAttribute('data-section'), 10);
        if (completedList.includes(secNum)) {
          el.classList.add('completed');
        } else {
          el.classList.remove('completed');
        }
      });

      // Update Module Progress Bars
      document.querySelectorAll('.module-tile').forEach(tile => {
        const chips = tile.querySelectorAll('.module-chip-link');
        if (chips.length === 0) return;

        let completedCount = 0;
        chips.forEach(chip => {
          const sec = parseInt(chip.getAttribute('data-section'), 10);
          if (completedList.includes(sec)) completedCount++;
        });

        const fill = tile.querySelector('.module-progress-fill');
        const text = tile.querySelector('.module-progress-text');
        const pct = Math.round((completedCount / chips.length) * 100);

        if (fill) fill.style.width = `${pct}%`;
        if (text) text.textContent = `${completedCount} / ${chips.length} completed (${pct}%)`;
      });

      // Update Overall Progress Card (if present on homepage)
      const overallFill = document.getElementById('overallProgressFill');
      const overallText = document.getElementById('overallProgressText');
      if (overallFill && overallText) {
        const totalCompleted = completedList.length;
        const totalSecs = 37;
        const pct = Math.min(100, Math.round((totalCompleted / totalSecs) * 100));
        overallFill.style.width = `${pct}%`;
        overallText.textContent = `${totalCompleted} of ${totalSecs} Sections Completed (${pct}%)`;
      }
    }

    // Initialize completion handlers
    initSectionCompletionBtn();
    initHomepageProgress();

    window.addEventListener('scroll', onScrollUpdate, { passive: true });
    onScrollUpdate();
  });
})();
