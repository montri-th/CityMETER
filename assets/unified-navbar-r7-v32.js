(function () {
  "use strict";

  var root = document.documentElement;
  var fallback = document.querySelector(".lm-js-fallback-nav");
  var header = document.querySelector("[data-lm-nav]");
  var motionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  var systemThemeQuery = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function syncThemeColor() {
    if (!themeMeta) return;
    var expected = root.dataset.theme === "dark" ? "#11191D" : "#F6F7F3";
    if (themeMeta.getAttribute("content") !== expected) themeMeta.setAttribute("content", expected);
  }

  syncThemeColor();

  var copyByLanguage = {
    th: {
      skip: "ข้ามไปเนื้อหาหลัก",
      mainNav: "เมนูหลักของ Landometer",
      contact: "คุยกับเรา",
      openMenu: "เปิดเมนู",
      closeMenu: "ปิดเมนู",
      menu: "เมนู Landometer",
      localLabel: "ในหน้านี้",
      localAria: "ส่วนต่าง ๆ ในหน้า CityMETER",
      decision: "เลือกโจทย์",
      examples: "ดูตัวอย่าง",
      datasets: "ข้อมูลทั้งหมด",
      ecosystem: "Landometer ecosystem",
      ecosystemAria: "เว็บไซต์ใน Landometer ecosystem",
      homeDesc: "หน้าแรก · ผลิตภัณฑ์และบริการ",
      citymeterDesc: "มุมมองข้อมูลเมือง 38 รายการ",
      citywikiDesc: "คู่มือย่าน 45 พื้นที่",
      landomDesc: "ผู้คนที่ร่วมสร้าง Landometer",
      here: "· อยู่ที่นี่",
      all: "เปิด landometer.com — ผลิตภัณฑ์ทั้งหมด",
      fallback: "ทางลัดสำรอง",
      preferences: "ภาษาและการแสดงผล",
      preferencesAria: "ภาษาและการแสดงผล",
      displayLabel: "การแสดงผล",
      language: "ภาษา",
      languageLabel: "ภาษา",
      languageAria: "เลือกภาษา",
      languageGroup: "เลือกภาษา",
      thai: "ไทย",
      english: "English",
      englishShort: "EN",
      thaiAria: "แสดงหน้านี้เป็นภาษาไทย",
      englishAria: "Show this page in English",
      theme: "ธีม",
      themeLabel: "ธีม",
      themeAria: "เลือกธีมสี",
      themeGroup: "เลือกธีมสี",
      system: "ตามระบบ",
      systemShort: "ระบบ",
      light: "สว่าง",
      dark: "มืด",
      systemAria: "ใช้ธีมตามระบบ",
      lightAria: "ใช้ธีมสว่าง",
      darkAria: "ใช้ธีมมืด",
      themeSystem: "ใช้ธีมตามระบบ",
      themeLight: "ใช้ธีมสว่าง",
      themeDark: "ใช้ธีมมืด"
    },
    en: {
      skip: "Skip to main content",
      mainNav: "Landometer primary navigation",
      contact: "Contact us",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      menu: "Landometer menu",
      localLabel: "On this page",
      localAria: "Sections on the CityMETER page",
      decision: "Choose a question",
      examples: "See examples",
      datasets: "All data",
      ecosystem: "Landometer ecosystem",
      ecosystemAria: "Sites in the Landometer ecosystem",
      homeDesc: "Home · products and services",
      citymeterDesc: "38 city data views",
      citywikiDesc: "Guides to 45 areas",
      landomDesc: "People who build Landometer",
      here: "· You are here",
      all: "Open landometer.com — all products",
      fallback: "Fallback shortcuts",
      preferences: "Language and appearance",
      preferencesAria: "Language and appearance",
      displayLabel: "Display",
      language: "Language",
      languageLabel: "Language",
      languageAria: "Choose language",
      languageGroup: "Choose language",
      thai: "ไทย",
      english: "English",
      englishShort: "EN",
      thaiAria: "แสดงหน้านี้เป็นภาษาไทย",
      englishAria: "Show this page in English",
      theme: "Theme",
      themeLabel: "Theme",
      themeAria: "Choose color theme",
      themeGroup: "Choose color theme",
      system: "System",
      systemShort: "System",
      light: "Light",
      dark: "Dark",
      systemAria: "Use system theme",
      lightAria: "Use light theme",
      darkAria: "Use dark theme",
      themeSystem: "Use system theme",
      themeLight: "Use light theme",
      themeDark: "Use dark theme"
    }
  };

  function currentCopy() {
    return copyByLanguage[String(root.lang || "th").toLowerCase().startsWith("en") ? "en" : "th"];
  }

  function localizeShell() {
    var copy = currentCopy();
    document.querySelectorAll("[data-lm-copy]").forEach(function (element) {
      var value = copy[element.getAttribute("data-lm-copy")];
      if (value) element.textContent = value;
    });
    document.querySelectorAll("[data-lm-aria]").forEach(function (element) {
      var value = copy[element.getAttribute("data-lm-aria")];
      if (!value) return;
      element.setAttribute("aria-label", value);
      if (element.matches("button, a[href]")) element.setAttribute("title", value);
    });
    document.querySelectorAll("[data-lm-control-label]").forEach(function (element) {
      var value = copy[element.getAttribute("data-lm-control-label")];
      if (!value) return;
      element.setAttribute("aria-label", value);
      element.setAttribute("title", value);
    });
    document.querySelectorAll("[data-lm-rail-label]").forEach(function (element) {
      var value = copy[element.getAttribute("data-lm-rail-label")];
      if (!value) return;
      element.setAttribute("aria-label", value);
      element.setAttribute("title", value);
      element.setAttribute("data-label", value);
    });
    var menuButton = document.querySelector("[data-lm-menu-open]");
    if (menuButton) {
      var menuLabel = menuButton.getAttribute("aria-expanded") === "true" ? copy.closeMenu : copy.openMenu;
      menuButton.setAttribute("aria-label", menuLabel);
      menuButton.setAttribute("title", menuLabel);
    }
  }

  localizeShell();

  var themeValues = ["system", "light", "dark"];
  var themeStorageKeys = ["lds-theme", "citymeter-theme"];

  function normalizedTheme(value) {
    var candidate = String(value || "").toLowerCase();
    if (candidate === "auto") candidate = "system";
    return themeValues.indexOf(candidate) >= 0 ? candidate : "";
  }

  function readStoredTheme() {
    try {
      for (var index = 0; index < themeStorageKeys.length; index += 1) {
        var stored = normalizedTheme(window.localStorage.getItem(themeStorageKeys[index]));
        if (stored) return stored;
      }
    } catch (error) {
      // Storage can be unavailable in privacy modes. The root attributes remain authoritative.
    }
    return "";
  }

  function currentThemePreference() {
    return normalizedTheme(root.dataset.themePreference) || readStoredTheme() || "system";
  }

  function resolvedTheme(preference) {
    if (preference === "dark" || preference === "light") return preference;
    return systemThemeQuery && systemThemeQuery.matches ? "dark" : "light";
  }

  function persistTheme(preference) {
    try {
      themeStorageKeys.forEach(function (key) {
        window.localStorage.setItem(key, preference);
      });
    } catch (error) {
      // A visible, working preference is still useful when storage is unavailable.
    }
  }

  function currentLanguage() {
    return String(root.lang || "th").toLowerCase().startsWith("en") ? "en" : "th";
  }

  function localeDestination(language) {
    var target = language === "en" ? "en" : "th";
    var url = new URL(window.location.href);
    var basePath = url.pathname
      .replace(/\/en(?:\/(?:index\.html)?)?$/i, "/")
      .replace(/\/index\.html$/i, "/");
    if (!basePath.endsWith("/")) basePath += "/";
    url.pathname = target === "en" ? basePath + "en/" : basePath;
    url.searchParams.set("lang", target);
    return url.href;
  }

  function syncLocaleControls() {
    var language = currentLanguage();
    document.querySelectorAll("[data-lm-locale]").forEach(function (control) {
      var target = control.getAttribute("data-lm-locale") === "en" ? "en" : "th";
      var selected = target === language;
      control.classList.toggle("is-selected", selected);
      control.setAttribute("lang", target);
      if (control.matches("a")) {
        control.setAttribute("href", localeDestination(target));
        control.setAttribute("hreflang", target);
      }
      if (selected) control.setAttribute("aria-current", "true");
      else control.removeAttribute("aria-current");
    });
  }

  function syncThemeControls(preference) {
    document.querySelectorAll("[data-lm-theme-choice]").forEach(function (control) {
      var choice = normalizedTheme(control.getAttribute("data-lm-theme-choice"));
      var selected = choice === preference;
      control.classList.toggle("is-selected", selected);
      control.setAttribute("aria-pressed", String(selected));
      if (control.matches("button") && !control.hasAttribute("type")) {
        control.setAttribute("type", "button");
      }
    });
  }

  function syncThemeState(preference) {
    var selected = normalizedTheme(preference) || currentThemePreference();
    var resolved = resolvedTheme(selected);
    if (root.dataset.themePreference !== selected) root.dataset.themePreference = selected;
    if (root.dataset.theme !== resolved) root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
    syncThemeControls(selected);
    syncThemeColor();
  }

  function selectTheme(preference) {
    var selected = normalizedTheme(preference);
    if (!selected) return;
    persistTheme(selected);
    syncThemeState(selected);
  }

  function installPreferences() {
    var localeControls = Array.from(document.querySelectorAll("[data-lm-locale]"));
    var themeControls = Array.from(document.querySelectorAll("[data-lm-theme-choice]"));

    localeControls.forEach(function (control) {
      var target = control.getAttribute("data-lm-locale") === "en" ? "en" : "th";
      if (!control.matches("a")) {
        control.addEventListener("click", function () {
          window.location.assign(localeDestination(target));
        });
      }
    });

    themeControls.forEach(function (control) {
      control.addEventListener("click", function (event) {
        event.preventDefault();
        selectTheme(control.getAttribute("data-lm-theme-choice"));
      });
    });

    syncLocaleControls();
    syncThemeState();
    if (localeControls.length || themeControls.length) root.classList.add("lm-preferences-ready");

    if (systemThemeQuery) {
      var onSystemTheme = function () {
        if (currentThemePreference() === "system") syncThemeState("system");
      };
      if (systemThemeQuery.addEventListener) systemThemeQuery.addEventListener("change", onSystemTheme);
      else if (systemThemeQuery.addListener) systemThemeQuery.addListener(onSystemTheme);
    }

    window.addEventListener("storage", function (event) {
      if (event.key !== null && themeStorageKeys.indexOf(event.key) < 0) return;
      syncThemeState(normalizedTheme(event.newValue) || readStoredTheme() || "system");
    });
    window.addEventListener("pageshow", function () {
      syncLocaleControls();
      syncThemeState();
    });
  }

  installPreferences();

  if ("MutationObserver" in window) {
    new MutationObserver(function (records) {
      var languageChanged = records.some(function (record) { return record.attributeName === "lang"; });
      var themeChanged = records.some(function (record) {
        return record.attributeName === "data-theme" || record.attributeName === "data-theme-preference";
      });
      if (languageChanged) {
        localizeShell();
        syncLocaleControls();
      }
      if (themeChanged) syncThemeState();
    }).observe(root, {
      attributes: true,
      attributeFilter: ["lang", "data-theme", "data-theme-preference"]
    });

    if (themeMeta) {
      new MutationObserver(syncThemeColor).observe(themeMeta, {
        attributes: true,
        attributeFilter: ["content"]
      });
    }
  }

  function showFallback() {
    if (fallback) fallback.hidden = false;
  }

  if (!header) {
    showFallback();
    return;
  }

  function focusHashTarget() {
    if (!window.location.hash) return;
    var id = decodeURIComponent(window.location.hash.slice(1));
    var target = document.getElementById(id);
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    try {
      target.focus({ preventScroll: true });
    } catch (error) {
      target.focus();
    }
  }

  var skipLink = header.querySelector(".lm-skip-link");
  if (skipLink) {
    skipLink.addEventListener("click", function () {
      window.setTimeout(focusHashTarget, 0);
    });
  }

  function installMenu() {
    var shell = document.querySelector("[data-lm-menu-shell]");
    var openButton = header.querySelector("[data-lm-menu-open]");
    var panel = shell && shell.querySelector('[role="dialog"]');
    if (!shell || !openButton || !panel) return false;

    var previousFocus = null;
    function setButtonState(isOpen) {
      var icon = openButton.querySelector("[data-lm-menu-icon]");
      var copy = currentCopy();
      var label = isOpen ? copy.closeMenu : copy.openMenu;
      openButton.setAttribute("aria-expanded", String(isOpen));
      openButton.setAttribute("aria-label", label);
      openButton.setAttribute("title", label);
      if (icon) icon.textContent = isOpen ? "close" : "menu";
    }

    function dispatchState(isOpen) {
      document.dispatchEvent(new CustomEvent("landometer-menu-state", {
        detail: { open: isOpen }
      }));
    }

    function closeMenu(restoreFocus) {
      if (shell.hidden) return;
      shell.hidden = true;
      setButtonState(false);
      dispatchState(false);
      if (restoreFocus !== false && previousFocus && previousFocus.focus) {
        previousFocus.focus();
      }
    }

    function openMenu() {
      previousFocus = document.activeElement;
      header.classList.remove("is-calm");
      shell.hidden = false;
      setButtonState(true);
      dispatchState(true);
      try {
        panel.focus({ preventScroll: true });
      } catch (error) {
        panel.focus();
      }
    }

    openButton.addEventListener("click", function () {
      if (shell.hidden) openMenu();
      else closeMenu();
    });

    shell.querySelectorAll('a[href]').forEach(function (control) {
      control.addEventListener("click", function (event) {
        var destination = new URL(control.href, window.location.href);
        var current = new URL(window.location.href);
        var sameDocumentFragment = Boolean(destination.hash)
          && destination.origin === current.origin
          && destination.pathname === current.pathname
          && destination.search === current.search;
        var modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
        closeMenu(modified || !sameDocumentFragment);
        if (sameDocumentFragment && !modified) window.setTimeout(focusHashTarget, 0);
      });
    });

    document.addEventListener("pointerdown", function (event) {
      if (shell.hidden || panel.contains(event.target) || openButton.contains(event.target)) return;
      closeMenu(false);
      window.setTimeout(function () {
        var active = document.activeElement;
        var hasGenuineDestination = Boolean(active)
          && active !== document.body
          && active !== document.documentElement
          && !shell.contains(active);
        if (!hasGenuineDestination && previousFocus && previousFocus.focus) {
          previousFocus.focus();
        }
      }, 0);
    });

    document.addEventListener("focusin", function (event) {
      if (shell.hidden || panel.contains(event.target) || openButton.contains(event.target)) return;
      closeMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || shell.hidden) return;
      event.preventDefault();
      closeMenu();
    });

    setButtonState(false);
    return true;
  }

  function installCalmHeader() {
    var scrollingElement = document.scrollingElement || document.documentElement;
    var lastY = new WeakMap();
    var pointerInside = false;
    var focusInside = false;
    var menuOpen = false;

    function reducedMotion() {
      return Boolean(motionQuery && motionQuery.matches);
    }

    function setCalm(isCalm) {
      header.classList.toggle(
        "is-calm",
        Boolean(isCalm) && !reducedMotion() && !pointerInside && !focusInside && !menuOpen
      );
    }

    function syncFromPagePosition() {
      setCalm(scrollingElement.scrollTop >= 24);
    }

    function scrollTarget(event) {
      var target = event.target;
      if (target === document || target === document.documentElement || target === document.body) {
        return scrollingElement;
      }
      return target;
    }

    header.addEventListener("pointerenter", function () {
      pointerInside = true;
      setCalm(false);
    });

    header.addEventListener("pointerleave", function () {
      pointerInside = false;
      if (!focusInside && !menuOpen) syncFromPagePosition();
    });

    header.addEventListener("focusin", function () {
      focusInside = true;
      setCalm(false);
    });

    header.addEventListener("focusout", function () {
      window.setTimeout(function () {
        focusInside = header.contains(document.activeElement);
        if (!focusInside && !pointerInside && !menuOpen) syncFromPagePosition();
      }, 0);
    });

    document.addEventListener("landometer-menu-state", function (event) {
      menuOpen = Boolean(event.detail && event.detail.open);
      if (menuOpen) setCalm(false);
      else if (!pointerInside && !focusInside) syncFromPagePosition();
    });

    document.addEventListener("scroll", function (event) {
      var target = scrollTarget(event);
      if (!target || typeof target.scrollTop !== "number") return;
      var y = target.scrollTop;
      var previousY = lastY.has(target) ? lastY.get(target) : y;
      var delta = y - previousY;
      lastY.set(target, y);

      if (reducedMotion() || pointerInside || focusInside || menuOpen || y < 24) {
        setCalm(false);
        return;
      }
      if (delta > 4) setCalm(true);
      else if (delta < -4) setCalm(false);
    }, true);

    if (motionQuery) {
      var onMotionPreference = function (event) {
        if (event.matches) setCalm(false);
        else syncFromPagePosition();
      };
      if (motionQuery.addEventListener) motionQuery.addEventListener("change", onMotionPreference);
      else if (motionQuery.addListener) motionQuery.addListener(onMotionPreference);
    }

    window.addEventListener("pageshow", syncFromPagePosition);
    lastY.set(scrollingElement, scrollingElement.scrollTop);
    syncFromPagePosition();
  }

  function installScrollSpy() {
    var links = Array.from(document.querySelectorAll("[data-lm-scrollspy-link]"));
    if (!links.length) return;

    var sections = links.map(function (link) {
      return document.getElementById(link.getAttribute("data-lm-scrollspy-link"));
    }).filter(function (section, index, list) {
      return section && list.indexOf(section) === index;
    });

    function setActive(id) {
      links.forEach(function (link) {
        var active = link.getAttribute("data-lm-scrollspy-link") === id;
        var icon = link.querySelector(".lm-icon");
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
        if (icon) icon.classList.toggle("lm-icon--filled", active);
      });
    }

    function syncFromHash() {
      var id = window.location.hash.slice(1);
      if (id && sections.some(function (section) { return section.id === id; })) setActive(id);
    }

    window.addEventListener("hashchange", syncFromHash);
    syncFromHash();

    if (!sections.length) return;
    var frame = 0;

    function syncFromViewport() {
      frame = 0;
      var marker = Math.max(96, Math.min(window.innerHeight * .32, 320));
      var visible = [];
      var active = "";

      sections.forEach(function (section) {
        var rect = section.getBoundingClientRect();
        if (rect.top <= marker && rect.bottom > marker) active = section.id;
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          visible.push({
            id: section.id,
            distance: Math.abs((Math.max(0, rect.top) + Math.min(window.innerHeight, rect.bottom)) / 2 - marker)
          });
        }
      });

      if (!active && visible.length) {
        visible.sort(function (a, b) { return a.distance - b.distance; });
        active = visible[0].id;
      }
      setActive(active);
    }

    function scheduleSync() {
      if (frame) return;
      frame = window.requestAnimationFrame(syncFromViewport);
    }

    document.addEventListener("scroll", scheduleSync, true);
    window.addEventListener("resize", scheduleSync);
    window.addEventListener("pageshow", scheduleSync);
    scheduleSync();
  }

  var menuInstalled = false;
  try {
    menuInstalled = installMenu();
  } catch (error) {
    console.error("CityMETER unified menu could not start", error);
  }

  if (!menuInstalled) {
    showFallback();
    return;
  }

  try {
    installCalmHeader();
  } catch (error) {
    header.classList.remove("is-calm");
    console.error("CityMETER calm navbar enhancement is unavailable", error);
  }

  try {
    installScrollSpy();
  } catch (error) {
    console.error("CityMETER navbar scrollspy is unavailable", error);
  }

  root.classList.add("lm-nav-ready");
})();
