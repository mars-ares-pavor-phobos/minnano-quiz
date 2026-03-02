(function () {
  "use strict";

  // ============================================
  // SUPABASE CONFIG
  // ============================================
  const SUPABASE_URL = "https://roqighfozecwwkqdoofe.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWlnaGZvemVjd3drcWRvb2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTU1NzgsImV4cCI6MjA4NjczMTU3OH0.ii7MpFQRSohw2Ja_oGVKKA6-bLrEB5j1hkfV052NN24";
  const MASTERY_THRESHOLD = 1;
  const LEGACY_SUPABASE_STORAGE_KEY = "mnq-auth-token";
  const SUPABASE_PROJECT_REF = (function () {
    try {
      return new URL(SUPABASE_URL).hostname.split(".")[0] || "project";
    } catch (e) {
      return "project";
    }
  })();
  const SUPABASE_STORAGE_KEY = "mnq-auth-token-" + SUPABASE_PROJECT_REF;
  const BACKEND_CAPS_CACHE_KEY = "mnq-backend-caps-" + SUPABASE_PROJECT_REF;
  const BACKEND_CAPS_CACHE_TTL_MS = 10 * 60 * 1000;
  const BACKEND_CAPS_RETRY_DELAY_MS = 30 * 1000;

  // ============================================
  // SVG ICON HELPERS
  // ============================================
  var ICONS = {
    check:
      '<span class="icon"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>',
    x: '<span class="icon"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>',
    volumeOn:
      '<span class="icon"><svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg></span>',
    volumeOff:
      '<span class="icon"><svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg></span>',
    book: '<span class="icon"><svg viewBox="0 0 24 24"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h6"/><path d="M8 11h4"/></svg></span>',
    chevronRight:
      '<span class="icon"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></span>',
    layers:
      '<span class="icon"><svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg></span>',
    lightbulb:
      '<span class="icon"><svg viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg></span>',
    fileText:
      '<span class="icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></span>',
    music:
      '<span class="icon"><svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span>',
    musicOff:
      '<span class="icon"><svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><line x1="2" y1="2" x2="22" y2="22" stroke-width="2.5"/></svg></span>',
  };

  // ============================================
  // SAFE SUPABASE INIT
  // ============================================
  let sb = null;
  let supabaseReady = false;

  function initSupabase() {
    try {
      if (
        typeof window.supabase === "undefined" ||
        !window.supabase.createClient
      ) {
        return false;
      }
      if (
        !SUPABASE_URL ||
        SUPABASE_URL.includes("abcdefghij") ||
        !SUPABASE_ANON_KEY ||
        SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY"
      ) {
        return false;
      }
      try {
        var currentToken = window.localStorage.getItem(SUPABASE_STORAGE_KEY);
        var legacyToken = window.localStorage.getItem(
          LEGACY_SUPABASE_STORAGE_KEY,
        );
        if (!currentToken && legacyToken) {
          window.localStorage.setItem(SUPABASE_STORAGE_KEY, legacyToken);
          window.localStorage.removeItem(LEGACY_SUPABASE_STORAGE_KEY);
        }
      } catch (_e) {}
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storageKey: SUPABASE_STORAGE_KEY,
          storage: window.localStorage,
        },
      });
      supabaseReady = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  // ============================================
  // AUTH STATE LISTENER (onAuthStateChange)
  // ============================================
  let authSubscription = null;
  let initialAuthResolved = false;
  const INITIAL_AUTH_FALLBACK_MS = 2000;
  const AUTH_REQUEST_TIMEOUT_MS = 15000;
  const AUTH_BOOTSTRAP_TIMEOUT_MS = 6000;
  const POST_LOGIN_TIMEOUT_MS = 8000;

  function withTimeout(promise, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var settled = false;
      var timer = window.setTimeout(function () {
        if (settled) return;
        settled = true;
        reject(new Error("request_timeout"));
      }, timeoutMs);

      Promise.resolve(promise)
        .then(function (value) {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          resolve(value);
        })
        .catch(function (err) {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          reject(err);
        });
    });
  }

  var backendCaps = {
    checked: false,
    hasWordProgressTable: false,
    hasLeaderboardRpc: false,
    hasUpsertProgressRpc: false,
  };
  var backendCapsRequest = null;
  var backendCapsRetryAt = 0;

  function applyBackendCapabilities(caps) {
    backendCaps.hasWordProgressTable = !!caps.hasWordProgressTable;
    backendCaps.hasLeaderboardRpc = !!caps.hasLeaderboardRpc;
    backendCaps.hasUpsertProgressRpc = !!caps.hasUpsertProgressRpc;
    backendCaps.checked = true;
    backendCapsRetryAt = 0;
  }

  function readCachedBackendCapabilities() {
    try {
      var raw = window.sessionStorage.getItem(BACKEND_CAPS_CACHE_KEY);
      if (!raw) return null;

      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;

      var ts = Number(parsed.ts) || 0;
      if (!ts || Date.now() - ts > BACKEND_CAPS_CACHE_TTL_MS) {
        return null;
      }

      return parsed.value || null;
    } catch (_e) {
      return null;
    }
  }

  function writeCachedBackendCapabilities() {
    try {
      window.sessionStorage.setItem(
        BACKEND_CAPS_CACHE_KEY,
        JSON.stringify({
          ts: Date.now(),
          value: {
            hasWordProgressTable: backendCaps.hasWordProgressTable,
            hasLeaderboardRpc: backendCaps.hasLeaderboardRpc,
            hasUpsertProgressRpc: backendCaps.hasUpsertProgressRpc,
          },
        }),
      );
    } catch (_e) {}
  }

  async function ensureBackendCapabilities() {
    if (!supabaseReady) {
      return backendCaps;
    }

    if (backendCaps.checked) {
      return backendCaps;
    }

    if (backendCapsRequest) {
      return backendCapsRequest;
    }

    if (backendCapsRetryAt && Date.now() < backendCapsRetryAt) {
      return backendCaps;
    }

    var cachedCaps = readCachedBackendCapabilities();
    if (cachedCaps) {
      applyBackendCapabilities(cachedCaps);
      return backendCaps;
    }

    backendCapsRequest = (async function () {
      try {
        var res = await withTimeout(
          fetch(SUPABASE_URL + "/rest/v1/", {
            method: "GET",
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: "Bearer " + SUPABASE_ANON_KEY,
              Accept: "application/openapi+json",
            },
          }),
          5000,
        );

        if (!res.ok) {
          backendCapsRetryAt = Date.now() + BACKEND_CAPS_RETRY_DELAY_MS;
          return backendCaps;
        }

        var spec = await res.json();
        var paths = spec && spec.paths ? spec.paths : {};
        applyBackendCapabilities({
          hasWordProgressTable: !!paths["/word_progress"],
          hasLeaderboardRpc: !!paths["/rpc/get_leaderboard"],
          hasUpsertProgressRpc: !!paths["/rpc/upsert_word_progress"],
        });
        writeCachedBackendCapabilities();
      } catch (_e) {
        backendCapsRetryAt = Date.now() + BACKEND_CAPS_RETRY_DELAY_MS;
      } finally {
        backendCapsRequest = null;
      }

      return backendCaps;
    })();

    return backendCapsRequest;
  }

  async function applyInitialSession(session, finalizeIfMissing) {
    if (session && session.user) {
      if (
        initialAuthResolved &&
        state.user &&
        state.user.id === session.user.id
      ) {
        return;
      }
      initialAuthResolved = true;
      state.user = session.user;
      await onAuthSuccess();
      return;
    }

    if (finalizeIfMissing) {
      resetToAuthScreen();
      initialAuthResolved = true;
    }
  }

  function scheduleInitialSessionFallback() {
    window.setTimeout(async function () {
      if (initialAuthResolved || !supabaseReady || !sb) return;

      try {
        var res = await withTimeout(
          sb.auth.getSession(),
          AUTH_BOOTSTRAP_TIMEOUT_MS,
        );
        var session = res && res.data ? res.data.session : null;
        await applyInitialSession(session, true);
      } catch (e) {
        await applyInitialSession(null, true);
      }
    }, INITIAL_AUTH_FALLBACK_MS);
  }

  function setupAuthListener() {
    if (!supabaseReady || !sb) return;

    try {
      // Подписка на все изменения состояния аутентификации
      var subscriptionResult = sb.auth.onAuthStateChange(
        async function (event, session) {
          // Auth event handled silently (no console logging in production)
          try {
            switch (event) {
              // ——— Начальная загрузка: сессия восстановлена из localStorage (F5, новая вкладка) ———
              case "INITIAL_SESSION":
                // Если INITIAL_SESSION пришёл без сессии, оставляем шанс fallback getSession().
                await applyInitialSession(session, false);
                break;

              // ——— Пользователь залогинился ———
              case "SIGNED_IN":
                // Восстанавливаем UI, если вход выполнен после refresh или ручного логина.
                if (session && session.user) {
                  var shouldReinit =
                    !state.user || state.user.id !== session.user.id;
                  state.user = session.user;
                  initialAuthResolved = true;
                  if (
                    shouldReinit ||
                    els.authScreen.classList.contains("visible")
                  ) {
                    await onAuthSuccess();
                  }
                }
                break;

              // ——— Пользователь вышел / сессия была invalidated ———
              case "SIGNED_OUT":
                initialAuthResolved = true;
                try {
                  window.localStorage.removeItem(SUPABASE_STORAGE_KEY);
                } catch (_e) {}
                resetToAuthScreen();
                break;

              // ——— Access-токен успешно обновлён через refresh-токен ———
              case "TOKEN_REFRESHED":
                if (session && session.user) {
                  state.user = session.user; // обновляем объект user на случай изменений
                }
                break;

              // ——— Данные пользователя обновились (метаданные, email и т.д.) ———
              case "USER_UPDATED":
                if (session && session.user) {
                  state.user = session.user;
                  var md = session.user.user_metadata || {};
                  var dn = md.display_name || md.full_name || md.name;
                  if (dn) {
                    state.displayName = dn;
                    els.headerUserName.textContent = dn;
                  }
                }
                break;

              // ——— Пароль восстановлен через email-ссылку ———
              case "PASSWORD_RECOVERY":
                // Можно показать форму смены пароля; пока просто логируем
                // Password recovery flow detected — could show password change form
                break;
            }
          } catch (e) {
            if (event === "SIGNED_OUT" || !(session && session.user)) {
              resetToAuthScreen();
            }
          }
        },
      );

      if (
        subscriptionResult &&
        subscriptionResult.data &&
        subscriptionResult.data.subscription
      ) {
        authSubscription = subscriptionResult.data.subscription;
      }
    } catch (e) {
      resetToAuthScreen();
      return;
    }

    scheduleInitialSessionFallback();
  }

  function resetToAuthScreen() {
    state.user = null;
    state.displayName = "User";
    state.userProgress = {};
    state.quizMode = null;
    state.resultsMode = null;
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    state.isModalOpen = false;
    state.modalCallback = null;
    state.modalKanjiItem = null;
    state.modalWasCorrect = false;
    setModalVisibility(false);
    showHeaderButtons(false);
    showScreen("auth");
    updateAuthLabels();
  }

  // Очистка подписки (вызывается при необходимости: SPA-роутинг, unmount)
  function teardownAuthListener() {
    if (authSubscription) {
      authSubscription.unsubscribe();
      authSubscription = null;
    }
    initialAuthResolved = false;
  }

  // ============================================
  // WORD DATA
  // ============================================
  const wordsData = [
    {
      id: 1,
      lesson: 1,
      japanese: "<ruby>私<rt>わたし</rt></ruby>",
      cleanWord: "私",
      translations: { ru: "я", uz: "men" },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>人間<rt>にんげん</rt></ruby>じゃ ありません。<ruby>未来<rt>みらい</rt></ruby>の ロボットです。",
          translation: "Я не человек. Я робот из будущего.",
          grammarInfo:
            "【Разбор】\n\n1. 私は — тема предложения «я» + частица は.\n\n2. 人間じゃ ありません — отрицание: «не человек».\n\n3. 未来の ロボットです — «робот из будущего».\n\n💡 В японском языке слово «私» часто опускается, если из контекста понятно, о ком речь.",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>人間<rt>にんげん</rt></ruby>じゃ ありません。<ruby>未来<rt>みらい</rt></ruby>の ロボットです。",
          translation: "Men inson emasman. Kelajak robotiman.",
          grammarInfo:
            "【Tahlil】\n\n1. 私は — gap mavzusi «men» + ko'rsatkich は.\n\n2. 人間じゃ ありません — inkor: «inson emas».\n\n3. 未来の ロボットです — «kelajak roboti».\n\n💡 Yapon tilida gap kim haqida ketayotgani aniq bo'lsa, «私» so'zi ko'pincha tushirib qoldiriladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は マリアです。ブラジル<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Я — Мария. Бразильянка.",
          },
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>学生<rt>がくせい</rt></ruby>じゃ ありません。",
            translation: "Я не студент.",
          },
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>は IMCです。",
            translation: "Моя компания — IMC.",
          },
        ],
        uz: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は マリアです。ブラジル<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Men Mariyaman. Braziliyalikman.",
          },
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>学生<rt>がくせい</rt></ruby>じゃ ありません。",
            translation: "Men talaba emasman.",
          },
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>は IMCです。",
            translation: "Mening kompaniyam IMC.",
          },
        ],
      },
    },
    {
      id: 2,
      lesson: 1,
      japanese: "あなた",
      cleanWord: "あなた",
      translations: { ru: "ты, вы", uz: "sen, siz" },
      exampleSentences: {
        ru: {
          jp: "あなたは スパイですか。<ruby>私<rt>わたし</rt></ruby>も スパイです。",
          translation: "Вы шпион? Я тоже шпион.",
          grammarInfo:
            "【Разбор】\n\n1. あなたは — «вы» + частица は.\n\n2. スパイですか — вопрос с частицей か.\n\n3. 私も — «я тоже» (частица も заменяет は).\n\n⚠️ Обращаться к японцу «аната» напрямую — грубо. Лучше называть человека по фамилии: 田中さんは...",
        },
        uz: {
          jp: "あなたは スパイですか。<ruby>私<rt>わたし</rt></ruby>も スパイです。",
          translation: "Siz josusmisiz? Men ham josusman.",
          grammarInfo:
            "【Tahlil】\n\n1. あなたは — «siz» + ko'rsatkich は.\n\n2. スパイですか — か yuklamasi bilan so'roq gap.\n\n3. 私も — «men ham» (も yuklamasi は ning o'rniga keladi).\n\n⚠️ Yaponlarga bevosita «anata» deb murojaat qilish qo'pollikdir. Familiyasi bilan murojaat qilish afzal: 田中さんは...",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あなたは エンジニアですか。",
            translation: "Вы инженер?",
          },
          {
            jp: "あなたも アメリカ<ruby>人<rt>じん</rt></ruby>ですか。",
            translation: "Вы тоже американец?",
          },
          {
            jp: "あなたは <ruby>学生<rt>がくせい</rt></ruby>じゃ ありません。",
            translation: "Вы не студент.",
          },
        ],
        uz: [
          {
            jp: "あなたは エンジニアですか。",
            translation: "Siz muhandismisiz?",
          },
          {
            jp: "あなたも アメリカ<ruby>人<rt>じん</rt></ruby>ですか。",
            translation: "Siz ham amerikalikmisiz?",
          },
          {
            jp: "あなたは <ruby>学生<rt>がくせい</rt></ruby>じゃ ありません。",
            translation: "Siz talaba emassiz.",
          },
        ],
      },
    },
    {
      id: 3,
      lesson: 1,
      japanese: "あの<ruby>人<rt>ひと</rt></ruby>",
      cleanWord: "あの人",
      translations: {
        ru: "он, она, тот человек",
        uz: "u (erkak/ayol), o'sha odam",
      },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>学校<rt>がっこう</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>じゃ ありません。<ruby>学校<rt>がっこう</rt></ruby>の <ruby>幽霊<rt>ゆうれい</rt></ruby>です。",
          translation:
            "Тот человек — не школьный учитель. Это школьный призрак.",
          grammarInfo:
            "【Разбор】\n\n1. あの人は — указание на человека вдали от собеседников.\n\n2. 学校の 幽霊 — «призрак школы».\n\n💡 Японские школьники обожают страшные легенды о призраках в туалетах или музыкальных классах.",
        },
        uz: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>学校<rt>がっこう</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>じゃ ありません。<ruby>学校<rt>がっこう</rt></ruby>の <ruby>幽霊<rt>ゆうれい</rt></ruby>です。",
          translation: "U odam maktab o'qituvchisi emas. Maktab sharpasi.",
          grammarInfo:
            "【Tahlil】\n\n1. あの人は — suhbatdoshlardan uzoqdagi odamga ishora.\n\n2. 学校の 幽霊 — «maktab sharpasi».\n\n💡 Yapon o'quvchilari hojatxona yoki musiqa xonalaridagi sharpalar haqidagi qo'rqinchli afsonalarni yaxshi ko'rishadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は だれですか。",
            translation: "Кто тот человек?",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>木村<rt>きむら</rt></ruby>さんです。",
            translation: "Тот человек — господин Кимура.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>も <ruby>医者<rt>いしゃ</rt></ruby>ですか。",
            translation: "Тот человек тоже врач?",
          },
        ],
        uz: [
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は だれですか。",
            translation: "U odam kim?",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>木村<rt>きむら</rt></ruby>さんです。",
            translation: "U odam janob Kimura.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>も <ruby>医者<rt>いしゃ</rt></ruby>ですか。",
            translation: "U odam ham shifokormi?",
          },
        ],
      },
    },
    {
      id: 4,
      lesson: 1,
      japanese: "あの<ruby>方<rt>かた</rt></ruby>",
      cleanWord: "あの方",
      translations: {
        ru: "он, она (вежливая форма)",
        uz: "u (muloyim shakl)",
      },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>方<rt>かた</rt></ruby>は どなたですか。…<ruby>私<rt>わたし</rt></ruby>の マフィアの ボスです。",
          translation: "Кто тот господин? Это босс моей мафии.",
          grammarInfo:
            "【Разбор】\n\n1. あの方は — вежливый эквивалент あのひと. Используется в бизнес-среде.\n\n2. どなたですか — вежливое «кто?».\n\n💡 どなた (кто) используется в паре с あの方, чтобы сохранить высокий уровень вежливости.",
        },
        uz: {
          jp: "あの <ruby>方<rt>かた</rt></ruby>は どなたですか。…<ruby>私<rt>わたし</rt></ruby>の マフィアの ボスです。",
          translation: "U kishi kimlar? U mening mafiyam boshlig'i.",
          grammarInfo:
            "【Tahlil】\n\n1. あの方は — あのひと so'zining muloyim shakli. Biznesda ishlatiladi.\n\n2. どなたですか — muloyim shakldagi «kim?».\n\n💡 どなた (kim) so'roq so'zi nutqning hurmat darajasini saqlash uchun あの方 bilan birga ishlatiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あの <ruby>方<rt>かた</rt></ruby>は どなたですか。",
            translation: "Кто вон тот господин/дама?",
          },
          {
            jp: "あの <ruby>方<rt>かた</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "Тот человек — преподаватель (вежливо).",
          },
          {
            jp: "あの <ruby>方<rt>かた</rt></ruby>は イギリス<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Тот господин — британец.",
          },
        ],
        uz: [
          {
            jp: "あの <ruby>方<rt>かた</rt></ruby>は どなたですか。",
            translation: "Ana u janob/xonim kim?",
          },
          {
            jp: "あの <ruby>方<rt>かた</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "U inson — o'qituvchi (hurmat bilan).",
          },
          {
            jp: "あの <ruby>方<rt>かた</rt></ruby>は イギリス<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Ana u janob — britaniyalik.",
          },
        ],
      },
    },
    {
      id: 5,
      lesson: 1,
      japanese: "～さん",
      cleanWord: "～さん",
      translations: {
        ru: "суффикс вежливости (г-н, г-жа)",
        uz: "hurmat qo'shimchasi (janob, xonim)",
      },
      exampleSentences: {
        ru: {
          jp: "ハチ<ruby>公<rt>こう</rt></ruby>さんは <ruby>人間<rt>にんげん</rt></ruby>じゃ ありません。<ruby>日本<rt>にほん</rt></ruby>の ヒーローです。",
          translation: "Господин Хатико не человек. Он герой Японии.",
          grammarInfo:
            "【Разбор】\n\n1. ハチ公さん — имя + суффикс вежливости.\n\n💡 В Японии さん можно добавлять к животным (犬さん) и сказочным персонажам. Но НИКОГДА не добавляйте «-сан» к своему имени!",
        },
        uz: {
          jp: "ハチ<ruby>公<rt>こう</rt></ruby>さんは <ruby>人間<rt>にんげん</rt></ruby>じゃ ありません。<ruby>日本<rt>にほん</rt></ruby>の ヒーローです。",
          translation: "Xachiko janoblari odam emas. U Yaponiya qahramoni.",
          grammarInfo:
            "【Tahlil】\n\n1. ハチ公さん — ism + hurmat qo'shimchasi.\n\n💡 Yaponiyada さん qo'shimchasini hayvonlarga (犬さん) va ertak qahramonlariga ham qo'shish mumkin. Lekin HECH QACHON o'z ismingizga qo'shmang!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>山田<rt>やまだ</rt></ruby>さんは <ruby>医者<rt>いしゃ</rt></ruby>です。",
            translation: "Господин Ямада — врач.",
          },
          {
            jp: "マリアさんは <ruby>学生<rt>がくせい</rt></ruby>ですか。",
            translation: "Мария — студентка?",
          },
          {
            jp: "ミラーさんは <ruby>会社員<rt>かいしゃいん</rt></ruby>です。",
            translation: "Г-н Миллер — сотрудник компании.",
          },
        ],
        uz: [
          {
            jp: "<ruby>山田<rt>やまだ</rt></ruby>さんは <ruby>医者<rt>いしゃ</rt></ruby>です。",
            translation: "Yamada janoblari — shifokor.",
          },
          {
            jp: "マリアさんは <ruby>学生<rt>がくせい</rt></ruby>ですか。",
            translation: "Mariya talabami?",
          },
          {
            jp: "ミラーさんは <ruby>会社員<rt>かいしゃいん</rt></ruby>です。",
            translation: "Janob Miller — kompaniya xodimi.",
          },
        ],
      },
    },
    {
      id: 6,
      lesson: 1,
      japanese: "～ちゃん",
      cleanWord: "～ちゃん",
      translations: {
        ru: "уменьшительно-ласкательный суффикс",
        uz: "erkalash qo'shimchasi",
      },
      exampleSentences: {
        ru: {
          jp: "おじいちゃんは ９９<ruby>歳<rt>さい</rt></ruby>です。ネットの <ruby>名前<rt>なまえ</rt></ruby>は 「サトシちゃん」です。",
          translation: "Дедушке 99 лет. А его имя в интернете — «Сатоси-тян».",
          grammarInfo:
            "【Разбор】\n\n1. おじいちゃん — «дедушка» (уже содержит суффикс ちゃん).\n\n💡 ちゃん используется не только для детей, но и для близких родственников в знак теплоты. И, конечно, в интернете!",
        },
        uz: {
          jp: "おじいちゃんは ９９<ruby>歳<rt>さい</rt></ruby>です。ネットの <ruby>名前<rt>なまえ</rt></ruby>は 「サトシちゃん」です。",
          translation:
            "Bobom 99 yoshda. Uning internetdagi ismi esa «Satoshi-chan».",
          grammarInfo:
            "【Tahlil】\n\n1. おじいちゃん — «bobo» (tarkibida allaqachon ちゃん bor).\n\n💡 ちゃん qo'shimchasi faqat bolalarga emas, balki yaqin qarindoshlarga mehr bildirish uchun ham ishlatiladi. Va albatta, internetda!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "さくらちゃんは ５<ruby>歳<rt>さい</rt></ruby>です。",
            translation: "Сакуре-тян 5 лет.",
          },
          {
            jp: "キティちゃんは イギリス<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Хеллоу Китти — британка.",
          },
          {
            jp: "ハローキティちゃんは <ruby>猫<rt>ねこ</rt></ruby>じゃ ありません。",
            translation: "Хеллоу Китти — не кошка.",
          },
        ],
        uz: [
          {
            jp: "さくらちゃんは ５<ruby>歳<rt>さい</rt></ruby>です。",
            translation: "Sakura-chan 5 yoshda.",
          },
          {
            jp: "キティちゃんは イギリス<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Hello Kitty — britaniyalik.",
          },
          {
            jp: "ハローキティちゃんは <ruby>猫<rt>ねこ</rt></ruby>じゃ ありません。",
            translation: "Hello Kitty — mushuk emas.",
          },
        ],
      },
    },
    {
      id: 7,
      lesson: 1,
      japanese: "～<ruby>君<rt>くん</rt></ruby>",
      cleanWord: "～くん",
      translations: {
        ru: "суффикс (для юношей)",
        uz: "qo'shimcha (o'g'il bolalar uchun)",
      },
      exampleSentences: {
        ru: {
          jp: "コナン<ruby>君<rt>くん</rt></ruby>は <ruby>大人<rt>おとな</rt></ruby>じゃ ありません。<ruby>子供<rt>こども</rt></ruby>の <ruby>探偵<rt>たんてい</rt></ruby>です。",
          translation: "Конан-кун — не взрослый. Он ребенок-детектив.",
          grammarInfo:
            "【Разбор】\n\n1. コナン君 — имя + суффикс 君.\n\n2. 子供の 探偵 — «детектив-ребенок».\n\n💡 くん добавляют к именам мальчиков. Также начальники могут обращаться так к подчиненным.",
        },
        uz: {
          jp: "コナン<ruby>君<rt>くん</rt></ruby>は <ruby>大人<rt>おとな</rt></ruby>じゃ ありません。<ruby>子供<rt>こども</rt></ruby>の <ruby>探偵<rt>たんてい</rt></ruby>です。",
          translation: "Konan-kun katta odam emas. U bola-izquvar.",
          grammarInfo:
            "【Tahlil】\n\n1. コナン君 — ism + 君 qo'shimchasi.\n\n2. 子供の 探偵 — «bola-izquvar».\n\n💡 くん o'g'il bolalar ismiga qo'shiladi. Shuningdek, boshliqlar qo'l ostidagilarga shunday murojaat qilishlari mumkin.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "太郎<ruby>君<rt>くん</rt></ruby>は <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "Таро-кун — студент.",
          },
          {
            jp: "ジョン<ruby>君<rt>くん</rt></ruby>も エンジニアですか。",
            translation: "Джон-кун тоже инженер?",
          },
          {
            jp: "アキラ<ruby>君<rt>くん</rt></ruby>は <ruby>会社員<rt>かいしゃいん</rt></ruby>じゃ ありません。",
            translation: "Акира-кун не сотрудник компании.",
          },
        ],
        uz: [
          {
            jp: "太郎<ruby>君<rt>くん</rt></ruby>は <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "Taro-kun — talaba.",
          },
          {
            jp: "ジョン<ruby>君<rt>くん</rt></ruby>も エンジニアですか。",
            translation: "Jon-kun ham muhandismi?",
          },
          {
            jp: "アキラ<ruby>君<rt>くん</rt></ruby>は <ruby>会社員<rt>かいしゃいん</rt></ruby>じゃ ありません。",
            translation: "Akira-kun kompaniya xodimi emas.",
          },
        ],
      },
    },
    {
      id: 8,
      lesson: 1,
      japanese: "～<ruby>人<rt>じん</rt></ruby>",
      cleanWord: "～人",
      translations: {
        ru: "суффикс национальности",
        uz: "millatni bildiruvchi qo'shimcha",
      },
      exampleSentences: {
        ru: {
          jp: "スーパーマンは アメリカ<ruby>人<rt>じん</rt></ruby>じゃ ありません。<ruby>宇宙人<rt>うちゅうじん</rt></ruby>です。",
          translation: "Супермен не американец. Он инопланетянин.",
          grammarInfo:
            "【Разбор】\n\n1. 国 (страна) + 人 (じん) = национальность.\n\n💡 Страна + 人 (じん) = национальность. Космос (宇宙) + 人 = инопланетянин!",
        },
        uz: {
          jp: "スーパーマンは アメリカ<ruby>人<rt>じん</rt></ruby>じゃ ありません。<ruby>宇宙人<rt>うちゅうじん</rt></ruby>です。",
          translation: "Supermen amerikalik emas. U o'zga sayyoralik.",
          grammarInfo:
            "【Tahlil】\n\n1. 国 (mamlakat) + 人 (jin) = millat.\n\n💡 Davlat + 人 (jin) = millat. Koinot (宇宙) + 人 = o'zga sayyoralik!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>日本<rt>にほん</rt></ruby><ruby>人<rt>じん</rt></ruby>じゃ ありません。",
            translation: "Я не японец.",
          },
          {
            jp: "マリアさんは ブラジル<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Мария — бразильянка.",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は イギリス<ruby>人<rt>じん</rt></ruby>ですか。",
            translation: "Тот человек — британец?",
          },
        ],
        uz: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>日本<rt>にほん</rt></ruby><ruby>人<rt>じん</rt></ruby>じゃ ありません。",
            translation: "Men yapon emasman.",
          },
          {
            jp: "マリアさんは ブラジル<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Mariya — braziliyalik.",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は イギリス<ruby>人<rt>じん</rt></ruby>ですか。",
            translation: "U odam britaniyalikmi?",
          },
        ],
      },
    },
    {
      id: 9,
      lesson: 1,
      japanese: "<ruby>先生<rt>せんせい</rt></ruby>",
      cleanWord: "先生",
      translations: {
        ru: "учитель (при обращении)",
        uz: "o'qituvchi, ustoz",
      },
      exampleSentences: {
        ru: {
          jp: "あの ５<ruby>歳<rt>さい</rt></ruby>の <ruby>男<rt>おとこ</rt></ruby>の <ruby>子<rt>こ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の YouTubeの <ruby>先生<rt>せんせい</rt></ruby>です。",
          translation: "Тот 5-летний мальчик — мой учитель по YouTube.",
          grammarInfo:
            "【Разбор】\n\n1. YouTubeの 先生 — «учитель YouTube».\n\n💡 先生 — это не только профессия, но и титул для тех, кто обладает знаниями (врачей, юристов, авторов манги).",
        },
        uz: {
          jp: "あの ５<ruby>歳<rt>さい</rt></ruby>の <ruby>男<rt>おとこ</rt></ruby>の <ruby>子<rt>こ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の YouTubeの <ruby>先生<rt>せんせい</rt></ruby>です。",
          translation:
            "U 5 yoshli o'g'il bola — mening YouTube bo'yicha ustozim.",
          grammarInfo:
            "【Tahlil】\n\n1. YouTubeの 先生 — «YouTube ustozi».\n\n💡 先生 — bu faqat kasb emas, balki bilimga ega bo'lganlar (shifokorlar, huquqshunoslar, manga mualliflari) uchun unvondir.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>、おはようございます。",
            translation: "Учитель, доброе утро.",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>ですか。",
            translation: "Тот человек — преподаватель?",
          },
          {
            jp: "ミラーさんは <ruby>先生<rt>せんせい</rt></ruby>じゃ ありません。",
            translation: "Г-н Миллер не учитель.",
          },
        ],
        uz: [
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>、おはようございます。",
            translation: "Ustoz, xayrli tong.",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>ですか。",
            translation: "U odam o'qituvchimi?",
          },
          {
            jp: "ミラーさんは <ruby>先生<rt>せんせい</rt></ruby>じゃ ありません。",
            translation: "Janob Miller o'qituvchi emas.",
          },
        ],
      },
    },
    {
      id: 10,
      lesson: 1,
      japanese: "<ruby>教師<rt>きょうし</rt></ruby>",
      cleanWord: "教師",
      translations: {
        ru: "преподаватель (профессия)",
        uz: "o'qituvchi (kasb)",
      },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>教師<rt>きょうし</rt></ruby>です。<ruby>魔法<rt>まほう</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>じゃ ありません。",
          translation: "Я преподаватель (по профессии). Но я не учитель магии.",
          grammarInfo:
            "【Разбор】\n\n1. 魔法の 先生 — «учитель (чего?) магии».\n\n💡 В отличие от 先生, слово 教師 используется только когда вы называете свою ПРОФЕССИЮ. Назвать себя «сэнсэем» — признак высокомерия.",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>教師<rt>きょうし</rt></ruby>です。<ruby>魔法<rt>まほう</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>じゃ ありません。",
          translation:
            "Men o'qituvchiman (kasb). Lekin sehrgarlik ustozi emasman.",
          grammarInfo:
            "【Tahlil】\n\n1. 魔法の 先生 — «sehrgarlik ustozi».\n\n💡 先生 dan farqli o'laroq, 教師 so'zi faqat KASBni aytishda ishlatiladi. O'zini «sensey» deb atash manmanlik belgisidir.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>教師<rt>きょうし</rt></ruby>です。",
            translation: "Моя профессия — учитель.",
          },
          {
            jp: "シュミットさんは <ruby>教師<rt>きょうし</rt></ruby>です。",
            translation: "Г-н Шмидт — преподаватель.",
          },
          {
            jp: "あなたは <ruby>教師<rt>きょうし</rt></ruby>ですか。",
            translation: "Вы по профессии преподаватель?",
          },
        ],
        uz: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>教師<rt>きょうし</rt></ruby>です。",
            translation: "Mening kasbim — o'qituvchi.",
          },
          {
            jp: "シュミットさんは <ruby>教師<rt>きょうし</rt></ruby>です。",
            translation: "Janob Shmidt — o'qituvchi.",
          },
          {
            jp: "あなたは <ruby>教師<rt>きょうし</rt></ruby>ですか。",
            translation: "Siz kasbingiz bo'yicha o'qituvchimisiz?",
          },
        ],
      },
    },
    {
      id: 11,
      lesson: 1,
      japanese: "<ruby>学生<rt>がくせい</rt></ruby>",
      cleanWord: "学生",
      translations: { ru: "студент, ученик", uz: "talaba, o'quvchi" },
      exampleSentences: {
        ru: {
          jp: "おばあちゃんは ８２<ruby>歳<rt>さい</rt></ruby>の <ruby>大学生<rt>だいがくせい</rt></ruby>です。",
          translation: "Моя бабушка — 82-летняя студентка университета.",
          grammarInfo:
            "【Разбор】\n\n1. 大学生 — студент вуза (大学 + 学生).\n\n💡 В Японии учиться никогда не поздно, многие пожилые люди поступают в вузы после выхода на пенсию.",
        },
        uz: {
          jp: "おばあちゃんは ８２<ruby>歳<rt>さい</rt></ruby>の <ruby>大学生<rt>だいがくせい</rt></ruby>です。",
          translation: "Mening buvijonim — 82 yoshli universitet talabasi.",
          grammarInfo:
            "【Tahlil】\n\n1. 大学生 — oliygoh talabasi (大学 + 学生).\n\n💡 Yaponiyada o'qish uchun hech qachon kech emas, ko'plab qariyalar nafaqaga chiqqandan so'ng oliygohga kiradilar.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "Я студент.",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は <ruby>学生<rt>がくせい</rt></ruby>ですか。",
            translation: "Тот человек — студент?",
          },
          {
            jp: "マリアさんは <ruby>学生<rt>がくせい</rt></ruby>じゃ ありません。",
            translation: "Мария не студентка.",
          },
        ],
        uz: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "Men talabaman.",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は <ruby>学生<rt>がくせい</rt></ruby>ですか。",
            translation: "U odam talabami?",
          },
          {
            jp: "マリアさんは <ruby>学生<rt>がくせい</rt></ruby>じゃ ありません。",
            translation: "Mariya talaba emas.",
          },
        ],
      },
    },
    {
      id: 12,
      lesson: 1,
      japanese: "<ruby>会社員<rt>かいしゃいん</rt></ruby>",
      cleanWord: "会社員",
      translations: { ru: "сотрудник компании", uz: "kompaniya xodimi" },
      exampleSentences: {
        ru: {
          jp: "バットマンは <ruby>会社員<rt>かいしゃいん</rt></ruby>ですか。いいえ、<ruby>会社<rt>かいしゃ</rt></ruby>の <ruby>社長<rt>しゃちょう</rt></ruby>です。",
          translation: "Бэтмен — офисный сотрудник? Нет, президент компании.",
          grammarInfo:
            "【Разбор】\n\n1. 会社の 社長 — «президент компании».\n\n💡 会社員 используется, когда вы говорите о профессии в целом, без указания конкретного места работы.",
        },
        uz: {
          jp: "バットマンは <ruby>会社員<rt>かいしゃいん</rt></ruby>ですか。いいえ、<ruby>会社<rt>かいしゃ</rt></ruby>の <ruby>社長<rt>しゃちょう</rt></ruby>です。",
          translation:
            "Betmen kompaniya xodimimi? Yo'q, u kompaniya prezidenti.",
          grammarInfo:
            "【Tahlil】\n\n1. 会社の 社長 — «kompaniya prezidenti».\n\n💡 会社員 so'zi muayyan ish joyini aytmasdan, umumiy kasb haqida gapirganda ishlatiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>父<rt>ちち</rt></ruby>は <ruby>会社員<rt>かいしゃいん</rt></ruby>です。",
            translation: "Мой отец — работник компании.",
          },
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>も <ruby>会社員<rt>かいしゃいん</rt></ruby>です。",
            translation: "Я тоже сотрудник компании.",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は <ruby>会社員<rt>かいしゃいん</rt></ruby>ですか。",
            translation: "Тот человек работает в компании?",
          },
        ],
        uz: [
          {
            jp: "<ruby>父<rt>ちち</rt></ruby>は <ruby>会社員<rt>かいしゃいん</rt></ruby>です。",
            translation: "Otam — kompaniya xodimi.",
          },
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>も <ruby>会社員<rt>かいしゃいん</rt></ruby>です。",
            translation: "Men ham kompaniya xodimiman.",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は <ruby>会社員<rt>かいしゃいん</rt></ruby>ですか。",
            translation: "U odam kompaniyada ishlaydimi?",
          },
        ],
      },
    },
    {
      id: 13,
      lesson: 1,
      japanese: "<ruby>社員<rt>しゃいん</rt></ruby>",
      cleanWord: "社員",
      translations: {
        ru: "сотрудник компании (с названием)",
        uz: "kompaniya xodimi (nomi bilan)",
      },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>猫<rt>ねこ</rt></ruby>は <ruby>鉄道会社<rt>てつどうがいしゃ</rt></ruby>の <ruby>社員<rt>しゃいん</rt></ruby>です。<ruby>駅<rt>えき</rt></ruby>の <ruby>駅長<rt>えきちょう</rt></ruby>です。",
          translation:
            "Та кошка — сотрудник железнодорожной компании. Она начальник станции.",
          grammarInfo:
            "【Разбор】\n\n1. 鉄道会社の 社員 — «сотрудник железнодорожной компании».\n\n💡 Слово 社員 ВСЕГДА используется с названием компании через の. Реальный факт: кошка Тама действительно была начальником станции в Японии!",
        },
        uz: {
          jp: "あの <ruby>猫<rt>ねこ</rt></ruby>は <ruby>鉄道会社<rt>てつどうがいしゃ</rt></ruby>の <ruby>社員<rt>しゃいん</rt></ruby>です。<ruby>駅<rt>えき</rt></ruby>の <ruby>駅長<rt>えきちょう</rt></ruby>です。",
          translation:
            "Ana u mushuk — temir yo'l kompaniyasi xodimi. U bekat boshlig'i.",
          grammarInfo:
            "【Tahlil】\n\n1. 鉄道会社の 社員 — «temir yo'l kompaniyasining xodimi».\n\n💡 社員 so'zi DOIMO kompaniya nomi bilan の orqali ishlatiladi. Haqiqiy fakt: Tama ismli mushuk haqiqatan ham Yaponiyada bekat boshlig'i bo'lgan!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ミラーさんは IMCの <ruby>社員<rt>しゃいん</rt></ruby>です。",
            translation: "Г-н Миллер — сотрудник IMC.",
          },
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は トヨタの <ruby>社員<rt>しゃいん</rt></ruby>じゃ ありません。",
            translation: "Я не сотрудник Тойоты.",
          },
          {
            jp: "あの方は ソニーの <ruby>社員<rt>しゃいん</rt></ruby>ですか。",
            translation: "Тот человек работает в Sony?",
          },
        ],
        uz: [
          {
            jp: "ミラーさんは IMCの <ruby>社員<rt>しゃいん</rt></ruby>です。",
            translation: "Janob Miller — IMC xodimi.",
          },
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は トヨタの <ruby>社員<rt>しゃいん</rt></ruby>じゃ ありません。",
            translation: "Men Toyota xodimi emasman.",
          },
          {
            jp: "あの方は ソニーの <ruby>社員<rt>しゃいん</rt></ruby>ですか。",
            translation: "Ana u janob Sony'da ishlaydimi?",
          },
        ],
      },
    },
    {
      id: 14,
      lesson: 1,
      japanese: "<ruby>銀行員<rt>ぎんこういん</rt></ruby>",
      cleanWord: "銀行員",
      translations: { ru: "банковский служащий", uz: "bank xodimi" },
      exampleSentences: {
        ru: {
          jp: "ハリー・ポッターの <ruby>銀行員<rt>ぎんこういん</rt></ruby>は <ruby>人間<rt>にんげん</rt></ruby>じゃ ありません。ゴブリンです。",
          translation:
            "Банковские служащие в «Гарри Поттере» — не люди. Они гоблины.",
          grammarInfo:
            "【Разбор】\n\n1. 人間じゃ ありません — «не люди».\n\n💡 銀行 (банк) + 員 (сотрудник) = 銀行員.",
        },
        uz: {
          jp: "ハリー・ポッターの <ruby>銀行員<rt>ぎんこういん</rt></ruby>は <ruby>人間<rt>にんげん</rt></ruby>じゃ ありません。ゴブリンです。",
          translation:
            "«Garri Potter»dagi bank xodimlari odamlar emas. Ular goblinlar.",
          grammarInfo:
            "【Tahlil】\n\n1. 人間じゃ ありません — «odamlar emas».\n\n💡 銀行 (bank) + 員 (xodim) = 銀行員.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>銀行員<rt>ぎんこういん</rt></ruby>です。",
            translation: "Я работник банка.",
          },
          {
            jp: "イーさんは <ruby>銀行員<rt>ぎんこういん</rt></ruby>じゃ ありません。",
            translation: "Г-н Ли не сотрудник банка.",
          },
          {
            jp: "あなたは <ruby>銀行員<rt>ぎんこういん</rt></ruby>ですか。",
            translation: "Вы банковский служащий?",
          },
        ],
        uz: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>銀行員<rt>ぎんこういん</rt></ruby>です。",
            translation: "Men bank xodimiman.",
          },
          {
            jp: "イーさんは <ruby>銀行員<rt>ぎんこういん</rt></ruby>じゃ ありません。",
            translation: "Janob Li bank xodimi emas.",
          },
          {
            jp: "あなたは <ruby>銀行員<rt>ぎんこういん</rt></ruby>ですか。",
            translation: "Siz bank xodimimisiz?",
          },
        ],
      },
    },
    {
      id: 15,
      lesson: 1,
      japanese: "<ruby>医者<rt>いしゃ</rt></ruby>",
      cleanWord: "医者",
      translations: { ru: "врач", uz: "shifokor" },
      exampleSentences: {
        ru: {
          jp: "フランケンシュタインは <ruby>怪物<rt>かいぶつ</rt></ruby>じゃ ありません。<ruby>医者<rt>いしゃ</rt></ruby>です。",
          translation: "Франкенштейн — это не монстр. Он врач.",
          grammarInfo:
            "【Разбор】\n\n1. 怪物じゃ ありません — «не монстр».\n\n💡 Популярное заблуждение: Франкенштейн — это фамилия создателя-врача, а не самого чудовища!",
        },
        uz: {
          jp: "フランケンシュタインは <ruby>怪物<rt>かいぶつ</rt></ruby>じゃ ありません。<ruby>医者<rt>いしゃ</rt></ruby>です。",
          translation: "Frankenshteyn maxluq emas. U shifokor.",
          grammarInfo:
            "【Tahlil】\n\n1. 怪物じゃ ありません — «maxluq emas».\n\n💡 Ommabop xato: Frankenshteyn maxluqning emas, balki uni yaratgan shifokorning familiyasidir!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>医者<rt>いしゃ</rt></ruby>です。",
            translation: "Я врач.",
          },
          {
            jp: "シュミットさんは <ruby>医者<rt>いしゃ</rt></ruby>ですか。",
            translation: "Г-н Шмидт — врач?",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は <ruby>医者<rt>いしゃ</rt></ruby>じゃ ありません。",
            translation: "Тот человек не врач.",
          },
        ],
        uz: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>医者<rt>いしゃ</rt></ruby>です。",
            translation: "Men shifokorman.",
          },
          {
            jp: "シュミットさんは <ruby>医者<rt>いしゃ</rt></ruby>ですか。",
            translation: "Janob Shmidt shifokormi?",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は <ruby>医者<rt>いしゃ</rt></ruby>じゃ ありません。",
            translation: "U odam shifokor emas.",
          },
        ],
      },
    },
    {
      id: 16,
      lesson: 1,
      japanese: "<ruby>研究者<rt>けんきゅうしゃ</rt></ruby>",
      cleanWord: "研究者",
      translations: {
        ru: "исследователь, учёный",
        uz: "tadqiqotchi, olim",
      },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は UFOの <ruby>研究者<rt>けんきゅうしゃ</rt></ruby>です。",
          translation: "Тот человек — исследователь НЛО.",
          grammarInfo:
            "【Разбор】\n\n1. UFOの 研究者 — «исследователь (чего?) НЛО».\n\n💡 Суффикс 者 (ся) означает «человек, выполняющий действие».",
        },
        uz: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は UFOの <ruby>研究者<rt>けんきゅうしゃ</rt></ruby>です。",
          translation: "U odam — NUJ (UFO) tadqiqotchisi.",
          grammarInfo:
            "【Tahlil】\n\n1. UFOの 研究者 — «NUJ (nimaning?) tadqiqotchisi».\n\n💡 者 (sha) qo'shimchasi «harakatni bajaruvchi shaxs» ma'nosini beradi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>研究者<rt>けんきゅうしゃ</rt></ruby>です。",
            translation: "Я исследователь.",
          },
          {
            jp: "ミラーさんは <ruby>研究者<rt>けんきゅうしゃ</rt></ruby>じゃ ありません。",
            translation: "Г-н Миллер не исследователь.",
          },
          {
            jp: "あなたも <ruby>研究者<rt>けんきゅうしゃ</rt></ruby>ですか。",
            translation: "Вы тоже исследователь?",
          },
        ],
        uz: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>研究者<rt>けんきゅうしゃ</rt></ruby>です。",
            translation: "Men tadqiqotchiman.",
          },
          {
            jp: "ミラーさんは <ruby>研究者<rt>けんきゅうしゃ</rt></ruby>じゃ ありません。",
            translation: "Janob Miller tadqiqotchi emas.",
          },
          {
            jp: "あなたも <ruby>研究者<rt>けんきゅうしゃ</rt></ruby>ですか。",
            translation: "Siz ham tadqiqotchimisiz?",
          },
        ],
      },
    },
    {
      id: 17,
      lesson: 1,
      japanese: "エンジニア",
      cleanWord: "エンジニア",
      translations: { ru: "инженер", uz: "muhandis" },
      exampleSentences: {
        ru: {
          jp: "アイアンマンは <ruby>魔法使い<rt>まほうつかい</rt></ruby>じゃ ありません。<ruby>天才<rt>てんさい</rt></ruby>の エンジニアです。",
          translation: "Железный Человек — не маг. Он гениальный инженер.",
          grammarInfo:
            "【Разбор】\n\n1. 魔法使い — «маг».\n\n💡 Японцы часто заимствуют названия профессий из английского (engineer -> enjinia).",
        },
        uz: {
          jp: "アイアンマンは <ruby>魔法使い<rt>まほうつかい</rt></ruby>じゃ ありません。<ruby>天才<rt>てんさい</rt></ruby>の エンジニアです。",
          translation: "Temir odam — sehrgar emas. U daho muhandis.",
          grammarInfo:
            "【Tahlil】\n\n1. 魔法使い — «sehrgar».\n\n💡 Yaponlar kasb nomlarini ko'pincha ingliz tilidan o'zlashtiradilar (engineer -> enjinia).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は エンジニアです。",
            translation: "Я инженер.",
          },
          {
            jp: "<ruby>山田<rt>やまだ</rt></ruby>さんは エンジニアじゃ ありません。",
            translation: "Г-н Ямада не инженер.",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>も エンジニアですか。",
            translation: "Тот человек тоже инженер?",
          },
        ],
        uz: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は エンジニアです。",
            translation: "Men muhandisman.",
          },
          {
            jp: "<ruby>山田<rt>やまだ</rt></ruby>さんは エンジニアじゃ ありません。",
            translation: "Yamada janoblari muhandis emas.",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>も エンジニアですか。",
            translation: "U odam ham muhandismi?",
          },
        ],
      },
    },
    {
      id: 18,
      lesson: 1,
      japanese: "<ruby>大学<rt>だいがく</rt></ruby>",
      cleanWord: "大学",
      translations: { ru: "университет", uz: "universitet" },
      exampleSentences: {
        ru: {
          jp: "ホグワーツは <ruby>病院<rt>びょういん</rt></ruby>ですか。いいえ、<ruby>魔法<rt>まほう</rt></ruby>の <ruby>大学<rt>だいがく</rt></ruby>です。",
          translation: "Хогвартс — это больница? Нет, университет магии.",
          grammarInfo:
            "【Разбор】\n\n1. 魔法の 大学 — «университет магии».\n\n💡 Частица の может указывать на принадлежность (университет магии) или местоположение.",
        },
        uz: {
          jp: "ホグワーツは <ruby>病院<rt>びょういん</rt></ruby>ですか。いいえ、<ruby>魔法<rt>まほう</rt></ruby>の <ruby>大学<rt>だいがく</rt></ruby>です。",
          translation: "Xogvarts kasalxonami? Yo'q, sehrgarlik universiteti.",
          grammarInfo:
            "【Tahlil】\n\n1. 魔法の 大学 — «sehrgarlik universiteti».\n\n💡 の ko'rsatkichi tegishlilikni (sehrgarlik universiteti) yoki joylashuvni bildirishi mumkin.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "さくら<ruby>大学<rt>だいがく</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "Преподаватель университета Сакура.",
          },
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>大学<rt>だいがく</rt></ruby>の <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "Я студент университета.",
          },
          {
            jp: "ここは <ruby>大学<rt>だいがく</rt></ruby>です。",
            translation: "Здесь университет.",
          },
        ],
        uz: [
          {
            jp: "さくら<ruby>大学<rt>だいがく</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "Sakura universiteti o'qituvchisi.",
          },
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>大学<rt>だいがく</rt></ruby>の <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "Men universitet talabasiman.",
          },
          {
            jp: "ここは <ruby>大学<rt>だいがく</rt></ruby>です。",
            translation: "Bu yer universitet.",
          },
        ],
      },
    },
    {
      id: 19,
      lesson: 1,
      japanese: "<ruby>病院<rt>びょういん</rt></ruby>",
      cleanWord: "病院",
      translations: { ru: "больница", uz: "kasalxona" },
      exampleSentences: {
        ru: {
          jp: "サクラ<ruby>病院<rt>びょういん</rt></ruby>は <ruby>人間<rt>にんげん</rt></ruby>の <ruby>病院<rt>びょういん</rt></ruby>じゃ ありません。ぬいぐるみの <ruby>病院<rt>びょういん</rt></ruby>です。",
          translation:
            "Больница «Сакура» — не для людей. Это больница для мягких игрушек.",
          grammarInfo:
            "【Разбор】\n\n1. 人間の 病院 — «больница для людей».\n\n💡 В Японии действительно существуют «клиники для плюшевых игрушек», где их бережно стирают и чинят.",
        },
        uz: {
          jp: "サクラ<ruby>病院<rt>びょういん</rt></ruby>は <ruby>人間<rt>にんげん</rt></ruby>の <ruby>病院<rt>びょういん</rt></ruby>じゃ ありません。ぬいぐるみの <ruby>病院<rt>びょういん</rt></ruby>です。",
          translation:
            "«Sakura» kasalxonasi odamlar uchun emas. Bu yumshoq o'yinchoqlar kasalxonasi.",
          grammarInfo:
            "【Tahlil】\n\n1. 人間の 病院 — «odamlar kasalxonasi».\n\n💡 Yaponiyada haqiqatan ham yumshoq o'yinchoqlarni ehtiyotkorlik bilan yuvib, ta'mirlaydigan «klinikalar» bor.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あの <ruby>先生<rt>せんせい</rt></ruby>は <ruby>病院<rt>びょういん</rt></ruby>の <ruby>医者<rt>いしゃ</rt></ruby>です。",
            translation: "Тот преподаватель — врач из больницы.",
          },
          {
            jp: "あれは <ruby>病院<rt>びょういん</rt></ruby>ですか。",
            translation: "То здание — больница?",
          },
          {
            jp: "ここは <ruby>病院<rt>びょういん</rt></ruby>じゃ ありません。",
            translation: "Здесь не больница.",
          },
        ],
        uz: [
          {
            jp: "あの <ruby>先生<rt>せんせい</rt></ruby>は <ruby>病院<rt>びょういん</rt></ruby>の <ruby>医者<rt>いしゃ</rt></ruby>です。",
            translation: "U o'qituvchi — kasalxona shifokori.",
          },
          {
            jp: "あれは <ruby>病院<rt>びょういん</rt></ruby>ですか。",
            translation: "Ana u bino kasalxonami?",
          },
          {
            jp: "ここは <ruby>病院<rt>びょういん</rt></ruby>じゃ ありません。",
            translation: "Bu yer kasalxona emas.",
          },
        ],
      },
    },
    {
      id: 20,
      lesson: 1,
      japanese: "だれ",
      cleanWord: "だれ",
      translations: { ru: "кто?", uz: "kim?" },
      exampleSentences: {
        ru: {
          jp: "あなたの <ruby>会社<rt>かいしゃ</rt></ruby>の ボスは だれですか。AIですか。",
          translation: "Кто босс в вашей компании? Искусственный интеллект?",
          grammarInfo:
            "【Разбор】\n\n1. あなたの 会社の ボス — «босс вашей компании».\n\n💡 Вопросительное слово だれ всегда ставится ПЕРЕД ですか. Порядок слов в японском вопросе не меняется.",
        },
        uz: {
          jp: "あなたの <ruby>会社<rt>かいしゃ</rt></ruby>の ボスは だれですか。AIですか。",
          translation:
            "Sizning kompaniyangiz boshlig'i kim? Sun'iy intellektmi?",
          grammarInfo:
            "【Tahlil】\n\n1. あなたの 会社の ボス — «kompaniyangizning boshlig'i».\n\n💡 だれ so'roq so'zi doim ですか dan OLDIN keladi. Yapon tilida so'roq gaplarda so'z tartibi o'zgarmaydi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は だれですか。",
            translation: "Кто тот человек?",
          },
          { jp: "あなたは だれですか。", translation: "Кто вы?" },
          {
            jp: "だれの <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Чья это книга?",
          },
        ],
        uz: [
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は だれですか。",
            translation: "U odam kim?",
          },
          { jp: "あなたは だれですか。", translation: "Siz kimsiz?" },
          {
            jp: "だれの <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Kimning kitobi?",
          },
        ],
      },
    },
    {
      id: 21,
      lesson: 1,
      japanese: "どなた",
      cleanWord: "どなた",
      translations: { ru: "кто? (вежливо)", uz: "kim? (muloyim shakl)" },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>方<rt>かた</rt></ruby>は どなたですか。…ヤクザの <ruby>親分<rt>おやぶん</rt></ruby>です。",
          translation: "Кто тот господин? ...Это босс якудзы.",
          grammarInfo:
            "【Разбор】\n\n1. あの方は どなたですか — вежливый вопрос «кто тот человек?».\n\n💡 どなた — это парадная, вежливая форма だれ. Используется в официальных ситуациях.",
        },
        uz: {
          jp: "あの <ruby>方<rt>かた</rt></ruby>は どなたですか。…ヤクザの <ruby>親分<rt>おやぶん</rt></ruby>です。",
          translation: "Anavi kishi kimlar? ...Bu yakuza boshlig'i.",
          grammarInfo:
            "【Tahlil】\n\n1. あの方は どなたですか — «u kishi kimlar?» degan muloyim savol.\n\n💡 どなた — だれ so'zining rasmiy, muloyim shakli. Rasmiy holatlarda ishlatiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あの<ruby>方<rt>かた</rt></ruby>は どなたですか。",
            translation: "Кто вон тот господин?",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>は どなたですか。",
            translation: "Кто является преподавателем? (вежливо)",
          },
          {
            jp: "どなたの <ruby>傘<rt>かさ</rt></ruby>ですか。",
            translation: "Чей это зонт? (вежливо)",
          },
        ],
        uz: [
          {
            jp: "あの<ruby>方<rt>かた</rt></ruby>は どなたですか。",
            translation: "Ana u janob/xonim kim?",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>は どなたですか。",
            translation: "O'qituvchi kim? (muloyim)",
          },
          {
            jp: "どなたの <ruby>傘<rt>かさ</rt></ruby>ですか。",
            translation: "Bu kimning soyaboni? (muloyim)",
          },
        ],
      },
    },
    {
      id: 22,
      lesson: 1,
      japanese: "～<ruby>歳<rt>さい</rt></ruby>",
      cleanWord: "～歳",
      translations: {
        ru: "～ лет (о возрасте)",
        uz: "～ yosh (yosh haqida)",
      },
      exampleSentences: {
        ru: {
          jp: "ギネス<ruby>記録<rt>きろく</rt></ruby>の <ruby>犬<rt>いぬ</rt></ruby>は ３１<ruby>歳<rt>さい</rt></ruby>です。<ruby>人間<rt>にんげん</rt></ruby>の ２００<ruby>歳<rt>さい</rt></ruby>です。",
          translation:
            "Собаке-рекордсмену Гиннесса 31 год. Это 200 лет по человеческим меркам.",
          grammarInfo:
            "【Разбор】\n\n1. ３１歳です — «31 год».\n\n💡 歳 (сай) добавляется напрямую к числу. Исключение: 20 лет читается как はたち (hatachi).",
        },
        uz: {
          jp: "ギネス<ruby>記録<rt>きろく</rt></ruby>の <ruby>犬<rt>いぬ</rt></ruby>は ３１<ruby>歳<rt>さい</rt></ruby>です。<ruby>人間<rt>にんげん</rt></ruby>の ２００<ruby>歳<rt>さい</rt></ruby>です。",
          translation:
            "Ginnes rekordchisi bo'lgan it 31 yoshda. Bu inson o'lchovida 200 yosh degani.",
          grammarInfo:
            "【Tahlil】\n\n1. ３１歳です — «31 yosh».\n\n💡 歳 (say) bevosita raqamga qo'shiladi. Istisno: 20 yosh はたち (hatachi) deb o'qiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は ２０<ruby>歳<rt>さい</rt></ruby>です。",
            translation: "Мне 20 лет.",
          },
          {
            jp: "太郎くんは ８<ruby>歳<rt>さい</rt></ruby>です。",
            translation: "Таро-куну 8 лет.",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は ４５<ruby>歳<rt>さい</rt></ruby>です。",
            translation: "Тому человеку 45 лет.",
          },
        ],
        uz: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は ２０<ruby>歳<rt>さい</rt></ruby>です。",
            translation: "Men 20 yoshdaman.",
          },
          {
            jp: "太郎くんは ８<ruby>歳<rt>さい</rt></ruby>です。",
            translation: "Taro-kunga 8 yosh.",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は ４５<ruby>歳<rt>さい</rt></ruby>です。",
            translation: "U odam 45 yoshda.",
          },
        ],
      },
    },
    {
      id: 23,
      lesson: 1,
      japanese: "なん<ruby>歳<rt>さい</rt></ruby>【何歳】",
      cleanWord: "何歳",
      translations: { ru: "сколько лет?", uz: "necha yosh?" },
      exampleSentences: {
        ru: {
          jp: "ドラえもんは なん<ruby>歳<rt>さい</rt></ruby>ですか。マイナス９０<ruby>歳<rt>さい</rt></ruby>です。",
          translation: "Сколько лет Дораэмону? Минус 90 лет.",
          grammarInfo:
            "【Разбор】\n\n1. なん歳ですか — прямой вопрос о возрасте.\n\n💡 Дораэмон — робокот из 22 века (родится в 2112 году), поэтому технически ему «минус» лет!",
        },
        uz: {
          jp: "ドラえもんは なん<ruby>歳<rt>さい</rt></ruby>ですか。マイナス９０<ruby>歳<rt>さい</rt></ruby>です。",
          translation: "Doraemon necha yoshda? Minus 90 yoshda.",
          grammarInfo:
            "【Tahlil】\n\n1. なん歳ですか — yosh haqidagi to'g'ridan-to'g'ri savol.\n\n💡 Doraemon — 22-asrdan kelgan robot-mushuk (2112-yilda tug'iladi), shuning uchun u hozircha «minus» yoshda!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "テレサちゃんは なん<ruby>歳<rt>さい</rt></ruby>ですか。",
            translation: "Сколько лет Терезе-тян?",
          },
          {
            jp: "あなたは なん<ruby>歳<rt>さい</rt></ruby>ですか。",
            translation: "Сколько вам лет?",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は なん<ruby>歳<rt>さい</rt></ruby>ですか。",
            translation: "Сколько лет тому человеку?",
          },
        ],
        uz: [
          {
            jp: "テレサちゃんは なん<ruby>歳<rt>さい</rt></ruby>ですか。",
            translation: "Tereza-channing yoshi nechada?",
          },
          {
            jp: "あなたは なん<ruby>歳<rt>さい</rt></ruby>ですか。",
            translation: "Siz necha yoshdasiz?",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は なん<ruby>歳<rt>さい</rt></ruby>ですか。",
            translation: "U odam necha yoshda?",
          },
        ],
      },
    },
    {
      id: 24,
      lesson: 1,
      japanese: "おいくつ",
      cleanWord: "おいくつ",
      translations: {
        ru: "сколько лет? (вежливо)",
        uz: "necha yosh? (muloyim)",
      },
      exampleSentences: {
        ru: {
          jp: "ヴァンパイアの <ruby>王様<rt>おうさま</rt></ruby>は おいくつですか。５００<ruby>歳<rt>さい</rt></ruby>ですか。",
          translation: "Сколько лет королю вампиров? 500?",
          grammarInfo:
            "【Разбор】\n\n1. おいくつですか — очень вежливый вопрос о возрасте.\n\n💡 Добавление префикса お (о-) к слову いくつ (сколько штук) делает вопрос о возрасте очень тактичным.",
        },
        uz: {
          jp: "ヴァンパイアの <ruby>王様<rt>おうさま</rt></ruby>は おいくつですか。５００<ruby>歳<rt>さい</rt></ruby>ですか。",
          translation: "Vampirlar qiroli necha yoshdalar? 500 yoshdami?",
          grammarInfo:
            "【Tahlil】\n\n1. おいくつですか — yosh haqidagi juda muloyim savol.\n\n💡 いくつ (nechta) so'ziga お (o-) prefiksini qo'shish yosh haqidagi savolni o'ta muloyim va madaniyatli qiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あの<ruby>方<rt>かた</rt></ruby>は おいくつですか。",
            translation: "Сколько лет вон тому господину?",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>は おいくつですか。",
            translation: "Сколько лет преподавателю?",
          },
          {
            jp: "おいくつですか。",
            translation: "Сколько вам лет? (вежливо)",
          },
        ],
        uz: [
          {
            jp: "あの<ruby>方<rt>かた</rt></ruby>は おいくつですか。",
            translation: "Ana u janob/xonim necha yoshdalar?",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>は おいくつですか。",
            translation: "O'qituvchi necha yoshdalar?",
          },
          {
            jp: "おいくつですか。",
            translation: "Necha yoshdasiz? (muloyim)",
          },
        ],
      },
    },
    {
      id: 25,
      lesson: 1,
      japanese: "はい",
      cleanWord: "はい",
      translations: { ru: "да", uz: "ha" },
      exampleSentences: {
        ru: {
          jp: "あなたは スパイですか。…はい、そうです。",
          translation: "Вы шпион? ...Да, это так.",
          grammarInfo:
            "【Разбор】\n\n1. はい、そうです — «Да, это так». Стандартный ответ.\n\n💡 В Японии «хай» часто означает не согласие, а просто «да, я вас слушаю/понимаю».",
        },
        uz: {
          jp: "あなたは スパイですか。…はい、そうです。",
          translation: "Siz josusmisiz? ...Ha, shunday.",
          grammarInfo:
            "【Tahlil】\n\n1. はい、そうです — «Ha, shunday». Standart javob.\n\n💡 Yaponiyada «hay» har doim ham rozilikni bildirmaydi, ko'pincha «ha, sizni eshityapman» ma'nosini beradi.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "はい、そうです。", translation: "Да, это так." },
          {
            jp: "はい、<ruby>私<rt>わたし</rt></ruby>は <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "Да, я студент.",
          },
          {
            jp: "はい、アメリカ<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Да, американец.",
          },
        ],
        uz: [
          { jp: "はい、そうです。", translation: "Ha, shunday." },
          {
            jp: "はい、<ruby>私<rt>わたし</rt></ruby>は <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "Ha, men talabaman.",
          },
          {
            jp: "はい、アメリカ<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Ha, amerikalik.",
          },
        ],
      },
    },
    {
      id: 26,
      lesson: 1,
      japanese: "いいえ",
      cleanWord: "いいえ",
      translations: { ru: "нет", uz: "yo'q" },
      exampleSentences: {
        ru: {
          jp: "あなたは <ruby>人間<rt>にんげん</rt></ruby>ですか。…いいえ、AIの <ruby>先生<rt>せんせい</rt></ruby>です。",
          translation: "Вы человек? ...Нет, я ИИ-учитель.",
          grammarInfo:
            "【Разбор】\n\n1. いいえ — чёткое отрицание «нет».\n\n💡 Японцы редко используют прямое いいえ в разговоре (звучит резко), но для отрицания фактов это норма.",
        },
        uz: {
          jp: "あなたは <ruby>人間<rt>にんげん</rt></ruby>ですか。…いいえ、AIの <ruby>先生<rt>せんせい</rt></ruby>です。",
          translation:
            "Siz insonmisiz? ...Yo'q, men sun'iy intellekt o'qituvchisiman.",
          grammarInfo:
            "【Tahlil】\n\n1. いいえ — aniq inkor «yo'q».\n\n💡 Yaponlar hayotda to'g'ridan-to'g'ri いいえ (yo'q) so'zini kam ishlatishadi (qo'pol eshitiladi), ammo faktlarni inkor etganda bu oddiy hol.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "いいえ、そうじゃ ありません。",
            translation: "Нет, это не так.",
          },
          {
            jp: "いいえ、<ruby>医者<rt>いしゃ</rt></ruby>じゃ ありません。",
            translation: "Нет, не врач.",
          },
          {
            jp: "いいえ、<ruby>私<rt>わたし</rt></ruby>の じゃ ありません。",
            translation: "Нет, не моё.",
          },
        ],
        uz: [
          {
            jp: "いいえ、そうじゃ ありません。",
            translation: "Yo'q, unday emas.",
          },
          {
            jp: "いいえ、<ruby>医者<rt>いしゃ</rt></ruby>じゃ ありません。",
            translation: "Yo'q, shifokor emas.",
          },
          {
            jp: "いいえ、<ruby>私<rt>わたし</rt></ruby>の じゃ ありません。",
            translation: "Yo'q, meniki emas.",
          },
        ],
      },
    },
    {
      id: 27,
      lesson: 1,
      japanese: "はじめまして。",
      cleanWord: "はじめまして。",
      translations: {
        ru: "Приятно познакомиться",
        uz: "Tanishganimdan xursandman",
      },
      exampleSentences: {
        ru: {
          jp: "はじめまして。<ruby>私<rt>わたし</rt></ruby>は <ruby>未来<rt>みらい</rt></ruby>の あなたです。",
          translation: "Приятно познакомиться. Я — это вы из будущего.",
          grammarInfo:
            "【Разбор】\n\n1. はじめまして — фраза, которую говорят ТОЛЬКО при первой встрече.\n\n💡 Фраза произносится с небольшим поклоном ДО того, как назвать своё имя.",
        },
        uz: {
          jp: "はじめまして。<ruby>私<rt>わたし</rt></ruby>は <ruby>未来<rt>みらい</rt></ruby>の あなたです。",
          translation:
            "Tanishganimdan xursandman. Men sizning kelajakdagi o'zingizman.",
          grammarInfo:
            "【Tahlil】\n\n1. はじめまして — FAQAT birinchi marta ko'rishganda aytiladigan ibora.\n\n💡 Bu ibora ismni aytishdan OLDIN kichik ta'zim bilan birga aytiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "はじめまして、マリアです。",
            translation: "Приятно познакомиться, я Мария.",
          },
          {
            jp: "はじめまして、どうぞ よろしく。",
            translation: "Приятно познакомиться, прошу любить и жаловать.",
          },
          {
            jp: "<ruby>皆<rt>みな</rt></ruby>さん、はじめまして。",
            translation: "Всем привет (приятно познакомиться).",
          },
        ],
        uz: [
          {
            jp: "はじめまして、マリアです。",
            translation: "Tanishganimdan xursandman, men Mariyaman.",
          },
          {
            jp: "はじめまして、どうぞ よろしく。",
            translation:
              "Tanishganimdan xursandman, menga yaxshi munosabatda bo'ling.",
          },
          {
            jp: "<ruby>皆<rt>みな</rt></ruby>さん、はじめまして。",
            translation: "Barchaga salom (tanishganimdan xursandman).",
          },
        ],
      },
    },
    {
      id: 28,
      lesson: 1,
      japanese: "～から<ruby>来<rt>き</rt></ruby>ました。",
      cleanWord: "～から来ました。",
      translations: { ru: "Я приехал(а) из ～", uz: "Men ～dan keldim" },
      exampleSentences: {
        ru: {
          jp: "スーパーマンは アメリカから <ruby>来<rt>き</rt></ruby>ましたか。いいえ、クリプトン<ruby>星<rt>せい</rt></ruby>から <ruby>来<rt>き</rt></ruby>ました。",
          translation:
            "Супермен прилетел из Америки? Нет, он прибыл с планеты Криптон.",
          grammarInfo:
            "【Разбор】\n\n1. から — частица «от/из».\n2. 来ました — «пришёл/приехал».\n\n💡 から означает исходную точку в пространстве (из/от). Часто используется при рассказе о родине.",
        },
        uz: {
          jp: "スーパーマンは アメリカから <ruby>来<rt>き</rt></ruby>ましたか。いいえ、クリプトン<ruby>星<rt>せい</rt></ruby>から <ruby>来<rt>き</rt></ruby>ました。",
          translation:
            "Supermen Amerikadan kelganmi? Yo'q, u Kripton sayyorasidan kelgan.",
          grammarInfo:
            "【Tahlil】\n\n1. から — «-dan» ko'rsatkichi.\n2. 来ました — «keldi/keldim» fe'li.\n\n💡 から fazodagi boshlang'ich nuqtani bildiradi. O'z vatani haqida gapirganda tez-tez ishlatiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "アメリカから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Я приехал из Америки.",
          },
          {
            jp: "ブラジルから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Я из Бразилии.",
          },
          {
            jp: "どこから <ruby>来<rt>き</rt></ruby>ましたか。",
            translation: "Откуда вы приехали?",
          },
        ],
        uz: [
          {
            jp: "アメリカから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Amerikadan keldim.",
          },
          {
            jp: "ブラジルから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Men Braziliyadan keldim.",
          },
          {
            jp: "どこから <ruby>来<rt>き</rt></ruby>ましたか。",
            translation: "Qayerdan kelgansiz?",
          },
        ],
      },
    },
    {
      id: 29,
      lesson: 1,
      japanese: "どうぞよろしくお<ruby>願<rt>ねが</rt></ruby>いします。",
      cleanWord: "どうぞよろしくお願いします。",
      translations: {
        ru: "Прошу любить и жаловать",
        uz: "Iltimos, yaxshi munosabatda bo'ling",
      },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>は あなたの ボスです。どうぞ よろしく お<ruby>願<rt>ねが</rt></ruby>いします。",
          translation: "Я ваш босс. Прошу любить и жаловать.",
          grammarInfo:
            "【Разбор】\n\n1. Дословно: «Пожалуйста, будьте ко мне добры».\n\n💡 Этой фразой японцы буквально просят: «пожалуйста, относитесь ко мне хорошо с этого момента». Ей ЗАВЕРШАЮТ представление.",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>は あなたの ボスです。どうぞ よろしく お<ruby>願<rt>ねが</rt></ruby>いします。",
          translation:
            "Men sizning boshlig'ingizman. Iltimos, menga yaxshi munosabatda bo'ling.",
          grammarInfo:
            "【Tahlil】\n\n1. So'zma-so'z: «Iltimos, menga nisbatan mehribon bo'ling».\n\n💡 Bu ibora orqali yaponlar tom ma'noda «bundan buyon men bilan yaxshi munosabatda bo'lishingizni so'rayman» deb iltimos qiladilar. Bu ibora bilan tanishuv YAKUNLANADI.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "マリアです。どうぞよろしくお<ruby>願<rt>ねが</rt></ruby>いします。",
            translation: "Я Мария. Прошу любить и жаловать.",
          },
          {
            jp: "<ruby>会社員<rt>かいしゃいん</rt></ruby>です。どうぞよろしく。",
            translation: "Я сотрудник компании. Рад знакомству. (кратко)",
          },
          {
            jp: "こちらこそ、よろしくお<ruby>願<rt>ねが</rt></ruby>いします。",
            translation: "Мне тоже очень приятно (взаимно).",
          },
        ],
        uz: [
          {
            jp: "マリアです。どうぞよろしくお<ruby>願<rt>ねが</rt></ruby>いします。",
            translation: "Men Mariyaman. Iltimos, yaxshi munosabatda bo'ling.",
          },
          {
            jp: "<ruby>会社員<rt>かいしゃいん</rt></ruby>です。どうぞよろしく。",
            translation:
              "Men kompaniya xodimiman. Tanishganimdan xursandman. (qisqa)",
          },
          {
            jp: "こちらこそ、よろしくお<ruby>願<rt>ねが</rt></ruby>いします。",
            translation: "Men ham juda xursandman (o'zaro).",
          },
        ],
      },
    },
    {
      id: 30,
      lesson: 1,
      japanese: "<ruby>失礼<rt>しつれい</rt></ruby>ですが",
      cleanWord: "失礼ですが",
      translations: { ru: "Извините, но...", uz: "Kechirasiz-u..." },
      exampleSentences: {
        ru: {
          jp: "<ruby>失礼<rt>しつれい</rt></ruby>ですが、あなたは <ruby>本物<rt>ほんもの</rt></ruby>の マイケル・ジャクソンですか。",
          translation: "Извините, но вы — настоящий Майкл Джексон?",
          grammarInfo:
            "【Разбор】\n\n1. 失礼ですが — фраза для смягчения личного вопроса.\n\n💡 Используется перед тем, как задать личный вопрос (имя, возраст, профессия).",
        },
        uz: {
          jp: "<ruby>失礼<rt>しつれい</rt></ruby>ですが、あなたは <ruby>本物<rt>ほんもの</rt></ruby>の マイケル・ジャクソンですか。",
          translation: "Kechirasiz, ammo siz haqiqiy Maykl Jeksonmisiz?",
          grammarInfo:
            "【Tahlil】\n\n1. 失礼ですが — shaxsiy savolni yumshatish uchun ibora.\n\n💡 Shaxsiy savol (ism, yosh, kasb) berishdan oldin ishlatiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>失礼<rt>しつれい</rt></ruby>ですが、お<ruby>名前<rt>なまえ</rt></ruby>は？",
            translation: "Простите, как вас зовут?",
          },
          {
            jp: "<ruby>失礼<rt>しつれい</rt></ruby>ですが、おいくつですか。",
            translation: "Извините за нескромность, сколько вам лет?",
          },
          {
            jp: "<ruby>失礼<rt>しつれい</rt></ruby>ですが、どなたですか。",
            translation: "Простите, а вы кто?",
          },
        ],
        uz: [
          {
            jp: "<ruby>失礼<rt>しつれい</rt></ruby>ですが、お<ruby>名前<rt>なまえ</rt></ruby>は？",
            translation: "Kechirasiz, ismingiz nima?",
          },
          {
            jp: "<ruby>失礼<rt>しつれい</rt></ruby>ですが、おいくつですか。",
            translation: "Kechirasiz, yoshingiz nechada?",
          },
          {
            jp: "<ruby>失礼<rt>しつれい</rt></ruby>ですが、どなたですか。",
            translation: "Kechirasiz, siz kimsiz?",
          },
        ],
      },
    },
    {
      id: 31,
      lesson: 1,
      japanese: "お<ruby>名前<rt>なまえ</rt></ruby>は？",
      cleanWord: "お名前は？",
      translations: { ru: "Как вас зовут?", uz: "Ismingiz nima?" },
      exampleSentences: {
        ru: {
          jp: "あなたは 忍者ですか。お<ruby>名前<rt>なまえ</rt></ruby>は？",
          translation: "Вы ниндзя? Как ваше имя?",
          grammarInfo:
            "【Разбор】\n\n1. お (вежливость) + 名前 (имя) + は (частица темы).\n\n💡 В японском часто опускают конец предложения, если смысл понятен. Полная форма: お名前は 何ですか.",
        },
        uz: {
          jp: "あなたは 忍者ですか。お<ruby>名前<rt>なまえ</rt></ruby>は？",
          translation: "Siz nindzyamisiz? Ismingiz nima?",
          grammarInfo:
            "【Tahlil】\n\n1. お (muloyimlik) + 名前 (ism) + は (mavzu ko'rsatkichi).\n\n💡 Yaponlar ma'no tushunarli bo'lsa, gapning oxirini tushirib qoldirishadi. To'liq shakli: お名前は 何ですか.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>失礼<rt>しつれい</rt></ruby>ですが、お<ruby>名前<rt>なまえ</rt></ruby>は？",
            translation: "Простите, как ваше имя?",
          },
          {
            jp: "犬の お<ruby>名前<rt>なまえ</rt></ruby>は？",
            translation: "Как зовут вашу собаку?",
          },
          {
            jp: "お<ruby>名前<rt>なまえ</rt></ruby>は 何ですか。",
            translation: "Как ваше имя? (полностью)",
          },
        ],
        uz: [
          {
            jp: "<ruby>失礼<rt>しつれい</rt></ruby>ですが、お<ruby>名前<rt>なまえ</rt></ruby>は？",
            translation: "Kechirasiz, ismingiz nima?",
          },
          {
            jp: "犬の お<ruby>名前<rt>なまえ</rt></ruby>は？",
            translation: "Itingizning ismi nima?",
          },
          {
            jp: "お<ruby>名前<rt>なまえ</rt></ruby>は 何ですか。",
            translation: "Ismingiz nima? (to'liq)",
          },
        ],
      },
    },
    {
      id: 32,
      lesson: 1,
      japanese: "こちらは～さんです。",
      cleanWord: "こちらは～さんです。",
      translations: {
        ru: "Это господин/госпожа ~",
        uz: "Bu ~ janob/xonim",
      },
      exampleSentences: {
        ru: {
          jp: "こちらは <ruby>犬<rt>いぬ</rt></ruby>の ハチ<ruby>公<rt>こう</rt></ruby>さんです。渋谷の ボスです。",
          translation: "Это пёс Хатико. Босс Сибуи.",
          grammarInfo:
            "【Разбор】\n\n1. こちらは — буквально «эта сторона» (вежливое указание на человека рядом с вами).\n\n💡 При представлении кого-то третьему лицу используется вежливое こちら (а не просто «он/она»).",
        },
        uz: {
          jp: "こちらは <ruby>犬<rt>いぬ</rt></ruby>の ハチ<ruby>公<rt>こう</rt></ruby>さんです。渋谷の ボスです。",
          translation: "Bu Xachiko ismli it. U Shibuyaning boshlig'i.",
          grammarInfo:
            "【Tahlil】\n\n1. こちらは — so'zma-so'z «bu tomon» (yoningizdagi odamga hurmat bilan ishora).\n\n💡 Uchinchi shaxsni tanishtirganda muloyim こちら ishlatiladi (shunchaki «u» emas).",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "こちらは マリアさんです。", translation: "Это Мария." },
          {
            jp: "こちらは サントスさんです。",
            translation: "Это господин Сантос.",
          },
          {
            jp: "こちらは <ruby>私<rt>わたし</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "Это мой преподаватель.",
          },
        ],
        uz: [
          { jp: "こちらは マリアさんです。", translation: "Bu Mariya." },
          {
            jp: "こちらは サントスさんです。",
            translation: "Bu Santos janoblari.",
          },
          {
            jp: "こちらは <ruby>私<rt>わたし</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "Bu mening ustozim.",
          },
        ],
      },
    },
    {
      id: 33,
      lesson: 1,
      japanese: "<ruby>皆<rt>みな</rt></ruby>さん",
      cleanWord: "皆さん",
      translations: { ru: "все, уважаемые", uz: "azizlar, barcha" },
      exampleSentences: {
        ru: {
          jp: "<ruby>皆<rt>みな</rt></ruby>さん、こちらは <ruby>宇宙人<rt>うちゅうじん</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
          translation: "Дамы и господа, это учитель-инопланетянин.",
          grammarInfo:
            "【Разбор】\n\n1. 皆さん — вежливое обращение к аудитории.\n\n💡 Выступая перед аудиторией, японцы всегда начинают с «Мина-сан!».",
        },
        uz: {
          jp: "<ruby>皆<rt>みな</rt></ruby>さん、こちらは <ruby>宇宙人<rt>うちゅうじん</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
          translation: "Azizlar, bu o'zga sayyoralik ustoz.",
          grammarInfo:
            "【Tahlil】\n\n1. 皆さん — auditoriyaga hurmat bilan murojaat.\n\n💡 Omma oldida nutq so'zlaganda yaponlar doimo «Mina-san!» deb boshlashadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>皆<rt>みな</rt></ruby>さん、こんにちは。",
            translation: "Всем добрый день.",
          },
          {
            jp: "<ruby>皆<rt>みな</rt></ruby>さんは <ruby>学生<rt>がくせい</rt></ruby>ですか。",
            translation: "Вы все студенты?",
          },
          {
            jp: "<ruby>皆<rt>みな</rt></ruby>さんの <ruby>先生<rt>せんせい</rt></ruby>は だれですか。",
            translation: "Кто ваш (всех вас) учитель?",
          },
        ],
        uz: [
          {
            jp: "<ruby>皆<rt>みな</rt></ruby>さん、こんにちは。",
            translation: "Barchaga xayrli kun.",
          },
          {
            jp: "<ruby>皆<rt>みな</rt></ruby>さんは <ruby>学生<rt>がくせい</rt></ruby>ですか。",
            translation: "Siz barchangiz talabamisiz?",
          },
          {
            jp: "<ruby>皆<rt>みな</rt></ruby>さんの <ruby>先生<rt>せんせい</rt></ruby>は だれですか。",
            translation: "Barchangizning ustozingiz kim?",
          },
        ],
      },
    },
    {
      id: 34,
      lesson: 1,
      japanese: "おはようございます",
      cleanWord: "おはようございます",
      translations: { ru: "доброе утро", uz: "xayrli tong" },
      exampleSentences: {
        ru: {
          jp: "<ruby>皆<rt>みな</rt></ruby>さん、おはようございます。<ruby>私<rt>わたし</rt></ruby>は AIの <ruby>先生<rt>せんせい</rt></ruby>です。",
          translation: "Всем доброе утро. Я ваш ИИ-учитель.",
          grammarInfo:
            "【Разбор】\n\n1. Используется до 10-11 часов утра.\n\n💡 Факт: в японском шоу-бизнесе «Охаё: годзаимасу» говорят при первой встрече за день, даже если на часах 2 часа ночи!",
        },
        uz: {
          jp: "<ruby>皆<rt>みな</rt></ruby>さん、おはようございます。<ruby>私<rt>わたし</rt></ruby>は AIの <ruby>先生<rt>せんせい</rt></ruby>です。",
          translation: "Barchaga xayrli tong. Men SI-o'qituvchiman.",
          grammarInfo:
            "【Tahlil】\n\n1. Ertalab soat 10-11 gacha ishlatiladi.\n\n💡 Fakt: yapon shou-biznesida kunning birinchi uchrashuvida hatto tungi soat 2 bo'lsa ham «Ohayo gozaimasu» deyishadi!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>、おはようございます。",
            translation: "Учитель, доброе утро.",
          },
          {
            jp: "<ruby>皆<rt>みな</rt></ruby>さん、おはようございます。",
            translation: "Всем доброе утро.",
          },
          {
            jp: "おはよう！（друзьям）",
            translation: "С добрым утром! (неформально)",
          },
        ],
        uz: [
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>、おはようございます。",
            translation: "Ustoz, xayrli tong.",
          },
          {
            jp: "<ruby>皆<rt>みな</rt></ruby>さん、おはようございます。",
            translation: "Barchaga xayrli tong.",
          },
          {
            jp: "おはよう！（do'stlarga）",
            translation: "Xayrli tong! (norasmiy)",
          },
        ],
      },
    },
    {
      id: 35,
      lesson: 1,
      japanese: "こんにちは",
      cleanWord: "こんにちは",
      translations: { ru: "добрый день", uz: "xayrli kun" },
      exampleSentences: {
        ru: {
          jp: "ドラキュラさんの 「こんにちは」は 「こんばんは」です。",
          translation:
            "У господина Дракулы «добрый день» — это «добрый вечер».",
          grammarInfo:
            "【Разбор】\n\n1. Приветствие днём (примерно с 11:00 до 17:00).\n\n💡 こんにちは пишется с буквой は (ha) на конце, а не わ (wa), так как исторически это была частица темы.",
        },
        uz: {
          jp: "ドラキュラさんの 「こんにちは」は 「こんばんは」です。",
          translation:
            "Drakula janoblarining «xayrli kun»i bu «xayrli kech»dir.",
          grammarInfo:
            "【Tahlil】\n\n1. Kunduzgi salomlashish (taxminan 11:00 dan 17:00 gacha).\n\n💡 こんにちは oxirida わ (wa) emas, は (ha) harfi bilan yoziladi, chunki tarixan bu mavzu ko'rsatkichi bo'lgan.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>皆<rt>みな</rt></ruby>さん、こんにちは。",
            translation: "Всем добрый день.",
          },
          {
            jp: "<ruby>山田<rt>やまだ</rt></ruby>さん、こんにちは。",
            translation: "Добрый день, господин Ямада.",
          },
          { jp: "こんにちは！", translation: "Привет / Добрый день!" },
        ],
        uz: [
          {
            jp: "<ruby>皆<rt>みな</rt></ruby>さん、こんにちは。",
            translation: "Barchaga xayrli kun.",
          },
          {
            jp: "<ruby>山田<rt>やまだ</rt></ruby>さん、こんにちは。",
            translation: "Xayrli kun, Yamada janoblari.",
          },
          { jp: "こんにちは！", translation: "Salom / Xayrli kun!" },
        ],
      },
    },
    {
      id: 36,
      lesson: 1,
      japanese: "こんばんは",
      cleanWord: "こんばんは",
      translations: { ru: "добрый вечер", uz: "xayrli kech" },
      exampleSentences: {
        ru: {
          jp: "フクロウの <ruby>先生<rt>せんせい</rt></ruby>、こんばんは。",
          translation: "Господин Сова, добрый вечер.",
          grammarInfo:
            "【Разбор】\n\n1. Вечернее приветствие.\n\n💡 Как и «Конничива», слово «Конбанва» пишется с частицей は на конце («Что касается сегодняшнего вечера...»).",
        },
        uz: {
          jp: "フクロウの <ruby>先生<rt>せんせい</rt></ruby>、こんばんは。",
          translation: "Boyo'g'li ustoz, xayrli kech.",
          grammarInfo:
            "【Tahlil】\n\n1. Kechki salomlashish.\n\n💡 «Konnichiwa» kabi bu ham oxirida は bilan yoziladi («Bu oqshomga kelsak...»).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "こんばんは、マリアです。",
            translation: "Добрый вечер, я Мария.",
          },
          {
            jp: "<ruby>皆<rt>みな</rt></ruby>さん、こんばんは。",
            translation: "Всем добрый вечер.",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>、こんばんは。",
            translation: "Учитель, добрый вечер.",
          },
        ],
        uz: [
          {
            jp: "こんばんは、マリアです。",
            translation: "Xayrli kech, men Mariyaman.",
          },
          {
            jp: "<ruby>皆<rt>みな</rt></ruby>さん、こんばんは。",
            translation: "Barchaga xayrli kech.",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>、こんばんは。",
            translation: "Ustoz, xayrli kech.",
          },
        ],
      },
    },
    {
      id: 37,
      lesson: 1,
      japanese: "アメリカ",
      cleanWord: "アメリカ",
      translations: { ru: "Америка, США", uz: "Amerika, AQSh" },
      exampleSentences: {
        ru: {
          jp: "コロンブスは アメリカ<ruby>人<rt>じん</rt></ruby>じゃ ありません。イタリア<ruby>人<rt>じん</rt></ruby>です。",
          translation: "Колумб не американец. Он итальянец.",
          grammarInfo:
            "【Разбор】\n\n1. アメリカ (Америка) + 人 (национальность).\n\n💡 Все названия зарубежных стран пишутся катаканой.",
        },
        uz: {
          jp: "コロンブスは アメリカ<ruby>人<rt>じん</rt></ruby>じゃ ありません。イタリア<ruby>人<rt>じん</rt></ruby>です。",
          translation: "Kolumb amerikalik emas. U italiyalik.",
          grammarInfo:
            "【Tahlil】\n\n1. アメリカ (Amerika) + 人 (millat).\n\n💡 Barcha xorijiy mamlakatlar nomlari katakanada yoziladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ミラーさんは アメリカ<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Г-н Миллер — американец.",
          },
          {
            jp: "アメリカから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Я приехал из США.",
          },
          {
            jp: "あの <ruby>学生<rt>がくせい</rt></ruby>は アメリカ<ruby>人<rt>じん</rt></ruby>ですか。",
            translation: "Тот студент американец?",
          },
        ],
        uz: [
          {
            jp: "ミラーさんは アメリカ<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Janob Miller — amerikalik.",
          },
          {
            jp: "アメリカから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Men AQShdan keldim.",
          },
          {
            jp: "あの <ruby>学生<rt>がくせい</rt></ruby>は アメリカ<ruby>人<rt>じん</rt></ruby>ですか。",
            translation: "U talaba amerikalikmi?",
          },
        ],
      },
    },
    {
      id: 38,
      lesson: 1,
      japanese: "イギリス",
      cleanWord: "イギリス",
      translations: { ru: "Великобритания", uz: "Buyuk Britaniya" },
      exampleSentences: {
        ru: {
          jp: "シャーロック・ホームズは イギリスの <ruby>探偵<rt>たんてい</rt></ruby>です。<ruby>警察<rt>けいさつ</rt></ruby>じゃ ありません。",
          translation: "Шерлок Холмс — британский детектив. Не полицейский.",
          grammarInfo:
            "【Разбор】\n\n1. イギリスの 探偵 — «детектив (какой страны?) Великобритании».\n\n💡 Само слово «Игирису» произошло от португальского «Inglez».",
        },
        uz: {
          jp: "シャーロック・ホームズは イギリスの <ruby>探偵<rt>たんてい</rt></ruby>です。<ruby>警察<rt>けいさつ</rt></ruby>じゃ ありません。",
          translation: "Sherlok Xolms Britaniya izquvari. U politsiyachi emas.",
          grammarInfo:
            "【Tahlil】\n\n1. イギリスの 探偵 — «(qaysi mamlakatning?) Buyuk Britaniyaning izquvari».\n\n💡 «Igirisu» so'zi portugalcha «Inglez» so'zidan kelib chiqqan.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ジョンさんは イギリス<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Джон — британец.",
          },
          {
            jp: "イギリスから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Я приехал из Великобритании.",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は イギリスの <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "Тот человек — преподаватель из Англии.",
          },
        ],
        uz: [
          {
            jp: "ジョンさんは イギリス<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Jon — britaniyalik.",
          },
          {
            jp: "イギリスから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Buyuk Britaniyadan keldim.",
          },
          {
            jp: "あの<ruby>人<rt>ひと</rt></ruby>は イギリスの <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "U odam — Angliyalik o'qituvchi.",
          },
        ],
      },
    },
    {
      id: 39,
      lesson: 1,
      japanese: "インド",
      cleanWord: "インド",
      translations: { ru: "Индия", uz: "Hindiston" },
      exampleSentences: {
        ru: {
          jp: "「ゼロ」は インドの <ruby>発明<rt>はつめい</rt></ruby>です。",
          translation: "Цифра «ноль» — это индийское изобретение.",
          grammarInfo:
            "【Разбор】\n\n1. インドの 発明 — «изобретение (откуда?) из Индии».\n\n💡 Японцы очень любят индийское карри, в Японии тысячи индийских ресторанов.",
        },
        uz: {
          jp: "「ゼロ」は インドの <ruby>発明<rt>はつめい</rt></ruby>です。",
          translation: "«Nol» raqami — bu Hindiston ixtirosidir.",
          grammarInfo:
            "【Tahlil】\n\n1. インドの 発明 — «(qayerning?) Hindistonning ixtirosi».\n\n💡 Yaponlar hind karrisini juda yaxshi ko'radilar, Yaponiyada minglab hind restoranlari bor.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ラオさんは インド<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Г-н Рао — индиец.",
          },
          {
            jp: "インドから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Я приехал из Индии.",
          },
          {
            jp: "あの <ruby>学生<rt>がくせい</rt></ruby>は インドの <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "Тот студент — из Индии.",
          },
        ],
        uz: [
          {
            jp: "ラオさんは インド<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Rao janoblari — hindistonlik.",
          },
          {
            jp: "インドから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Hindistondan keldim.",
          },
          {
            jp: "あの <ruby>学生<rt>がくせい</rt></ruby>は インドの <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "U talaba Hindistondan.",
          },
        ],
      },
    },
    {
      id: 40,
      lesson: 1,
      japanese: "インドネシア",
      cleanWord: "インドネシア",
      translations: { ru: "Индонезия", uz: "Indoneziya" },
      exampleSentences: {
        ru: {
          jp: "コモドドラゴンは インドネシアの <ruby>動物<rt>どうぶつ</rt></ruby>です。<ruby>恐竜<rt>きょうりゅう</rt></ruby>じゃ ありません。",
          translation:
            "Комодский варан — это индонезийское животное. Не динозавр.",
          grammarInfo:
            "【Разбор】\n\n1. インドネシアの 動物 — «животное (откуда?) из Индонезии».\n\n💡 Копи Лювак (кофе из зерен, прошедших через ЖКТ зверька) — индонезийский кофе, один из самых дорогих в мире!",
        },
        uz: {
          jp: "コモドドラゴンは インドネシアの <ruby>動物<rt>どうぶつ</rt></ruby>です。<ruby>恐竜<rt>きょうりゅう</rt></ruby>じゃ ありません。",
          translation:
            "Komodo ajdari — Indoneziya hayvonidir. U dinozavr emas.",
          grammarInfo:
            "【Tahlil】\n\n1. インドネシアの 動物 — «(qayerning?) Indoneziya hayvoni».\n\n💡 Kopi Luvak (hayvon oshqozonidan o'tgan donlardan tayyorlanadigan qahva) — Indoneziya qahvasi bo'lib, dunyodagi eng qimmat qahvalardan biridir!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ワティさんは インドネシア<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Вати — индонезийка.",
          },
          {
            jp: "インドネシアから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Я приехал из Индонезии.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は インドネシアの <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "Тот человек — индонезийский студент.",
          },
        ],
        uz: [
          {
            jp: "ワティさんは インドネシア<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Vati — indoneziyalik.",
          },
          {
            jp: "インドネシアから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Indoneziyadan keldim.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は インドネシアの <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "U odam indoneziyalik talaba.",
          },
        ],
      },
    },
    {
      id: 41,
      lesson: 1,
      japanese: "<ruby>韓国<rt>かんこく</rt></ruby>",
      cleanWord: "韓国",
      translations: { ru: "Южная Корея", uz: "Janubiy Koreya" },
      exampleSentences: {
        ru: {
          jp: "ブラックピンクのリサさんは <ruby>韓国人<rt>かんこくじん</rt></ruby>ですか。いいえ、タイ<ruby>人<rt>じん</rt></ruby>です。",
          translation: "Лиса из Blackpink кореянка? Нет, она тайка.",
          grammarInfo:
            "【Разбор】\n\n1. 韓国人 — кореец.\n\n💡 Южная Корея на японском будет 韓国 (Канкоку). Северная — 北朝鮮 (Китатё:сэн).",
        },
        uz: {
          jp: "ブラックピンクのリサさんは <ruby>韓国人<rt>かんこくじん</rt></ruby>ですか。いいえ、タイ<ruby>人<rt>じん</rt></ruby>です。",
          translation:
            "Blackpink guruhidagi Lisa koreysmi? Yo'q, u tay millatiga mansub.",
          grammarInfo:
            "【Tahlil】\n\n1. 韓国人 — koreys.\n\n💡 Janubiy Koreya yapon tilida 韓国 (Kankoku) deyiladi. Shimoliy Koreya esa 北朝鮮 (Kitachousen).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "キムさんは <ruby>韓国<rt>かんこく</rt></ruby><ruby>人<rt>じん</rt></ruby>です。",
            translation: "Г-н Ким — кореец.",
          },
          {
            jp: "<ruby>韓国<rt>かんこく</rt></ruby>から <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Я приехал из Южной Кореи.",
          },
          {
            jp: "あの <ruby>方<rt>かた</rt></ruby>は <ruby>韓国<rt>かんこく</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "Тот господин — учитель из Кореи.",
          },
        ],
        uz: [
          {
            jp: "キムさんは <ruby>韓国<rt>かんこく</rt></ruby><ruby>人<rt>じん</rt></ruby>です。",
            translation: "Janob Kim — koreys.",
          },
          {
            jp: "<ruby>韓国<rt>かんこく</rt></ruby>から <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Janubiy Koreyadan keldim.",
          },
          {
            jp: "あの <ruby>方<rt>かた</rt></ruby>は <ruby>韓国<rt>かんこく</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "U kishi Koreyalik ustoz.",
          },
        ],
      },
    },
    {
      id: 42,
      lesson: 1,
      japanese: "タイ",
      cleanWord: "タイ",
      translations: { ru: "Таиланд", uz: "Tailand" },
      exampleSentences: {
        ru: {
          jp: "ムエタイは タイの スポーツです。",
          translation: "Муай-тай — это тайский спорт.",
          grammarInfo:
            "【Разбор】\n\n1. タイの スポーツ — «спорт Таиланда».\n\n💡 Японцы любят тайскую кухню и часто летают в Таиланд в отпуск.",
        },
        uz: {
          jp: "ムエタイは タイの スポーツです。",
          translation: "Muay-tay — bu Tailand sportidir.",
          grammarInfo:
            "【Tahlil】\n\n1. タイの スポーツ — «Tailand sporti».\n\n💡 Yaponlar tay taomlarini yaxshi ko'radilar va ta'tilda tez-tez Tailandga boradilar.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "タワポンさんは タイ<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Г-н Тавапон — таец.",
          },
          {
            jp: "タイから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Я приехал из Таиланда.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は タイの <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "Тот человек — тайский студент.",
          },
        ],
        uz: [
          {
            jp: "タワポンさんは タイ<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Tavapon janoblari — tailandlik.",
          },
          {
            jp: "タイから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Tailanddan keldim.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は タイの <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "U odam tailandlik talaba.",
          },
        ],
      },
    },
    {
      id: 43,
      lesson: 1,
      japanese: "<ruby>中国<rt>ちゅうごく</rt></ruby>",
      cleanWord: "中国",
      translations: { ru: "Китай", uz: "Xitoy" },
      exampleSentences: {
        ru: {
          jp: "フォーチュンクッキーは <ruby>中国<rt>ちゅうごく</rt></ruby>の お<ruby>菓子<rt>かし</rt></ruby>じゃ ありません。<ruby>日本<rt>にほん</rt></ruby>の お<ruby>菓子<rt>かし</rt></ruby>です。",
          translation:
            "Печенье с предсказаниями — не китайская сладость. Она японская.",
          grammarInfo:
            "【Разбор】\n\n1. 中国の お菓子 — «сладость Китая».\n\n💡 Реальный факт! Печенье с предсказаниями придумали в Японии, а популярным оно стало в США.",
        },
        uz: {
          jp: "フォーチュンクッキーは <ruby>中国<rt>ちゅうごく</rt></ruby>の お<ruby>菓子<rt>かし</rt></ruby>じゃ ありません。<ruby>日本<rt>にほん</rt></ruby>の お<ruby>菓子<rt>かし</rt></ruby>です。",
          translation:
            "Bashoratli pechenyelar Xitoy shirinligi emas. Ular Yaponiyaniki.",
          grammarInfo:
            "【Tahlil】\n\n1. 中国の お菓子 — «Xitoy shirinligi».\n\n💡 Haqiqiy fakt! Bashoratli pechenyelar Yaponiyada o'ylab topilgan, keyin AQShda mashhur bo'lib ketgan.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ワンさんは <ruby>中国<rt>ちゅうごく</rt></ruby><ruby>人<rt>じん</rt></ruby>です。",
            translation: "Г-н Ван — китаец.",
          },
          {
            jp: "<ruby>中国<rt>ちゅうごく</rt></ruby>から <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Я приехал из Китая.",
          },
          {
            jp: "あの <ruby>先生<rt>せんせい</rt></ruby>は <ruby>中国<rt>ちゅうごく</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "Тот учитель — из Китая.",
          },
        ],
        uz: [
          {
            jp: "ワンさんは <ruby>中国<rt>ちゅうごく</rt></ruby><ruby>人<rt>じん</rt></ruby>です。",
            translation: "Janob Van — xitoylik.",
          },
          {
            jp: "<ruby>中国<rt>ちゅうごく</rt></ruby>から <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Xitoydan keldim.",
          },
          {
            jp: "あの <ruby>先生<rt>せんせい</rt></ruby>は <ruby>中国<rt>ちゅうごく</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "U ustoz Xitoylik ustozdir.",
          },
        ],
      },
    },
    {
      id: 44,
      lesson: 1,
      japanese: "ドイツ",
      cleanWord: "ドイツ",
      translations: { ru: "Германия", uz: "Germaniya" },
      exampleSentences: {
        ru: {
          jp: "ハンバーガーは アメリカの <ruby>料理<rt>りょうり</rt></ruby>ですか。いいえ、ドイツの <ruby>料理<rt>りょうり</rt></ruby>です。",
          translation: "Гамбургер — американская еда? Нет, немецкая.",
          grammarInfo:
            "【Разбор】\n\n1. ドイツの 料理 — «еда Германии».\n\n💡 Гамбургер назван в честь немецкого города Гамбург.",
        },
        uz: {
          jp: "ハンバーガーは アメリカの <ruby>料理<rt>りょうり</rt></ruby>ですか。いいえ、ドイツの <ruby>料理<rt>りょうり</rt></ruby>です。",
          translation: "Gamburger Amerika taomimi? Yo'q, u Germaniya taomi.",
          grammarInfo:
            "【Tahlil】\n\n1. ドイツの 料理 — «Germaniya taomi».\n\n💡 Gamburger nemislarning Gamburg shahri sharafiga shunday nomlangan.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "シュミットさんは ドイツ<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Г-н Шмидт — немец.",
          },
          {
            jp: "ドイツから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Я приехал из Германии.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は ドイツの <ruby>医者<rt>いしゃ</rt></ruby>です。",
            translation: "Тот человек — немецкий врач.",
          },
        ],
        uz: [
          {
            jp: "シュミットさんは ドイツ<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Janob Shmidt — nemis.",
          },
          {
            jp: "ドイツから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Germaniyadan keldim.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は ドイツの <ruby>医者<rt>いしゃ</rt></ruby>です。",
            translation: "U odam germaniyalik shifokor.",
          },
        ],
      },
    },
    {
      id: 45,
      lesson: 1,
      japanese: "<ruby>日本<rt>にほん</rt></ruby>",
      cleanWord: "日本",
      translations: { ru: "Япония", uz: "Yaponiya" },
      exampleSentences: {
        ru: {
          jp: "マリオは <ruby>日本<rt>にほん</rt></ruby>の キャラクターです。でも、イタリア<ruby>人<rt>じん</rt></ruby>です。",
          translation: "Марио — японский персонаж. Но он итальянец.",
          grammarInfo:
            "【Разбор】\n\n1. 日本の キャラクター — «японский персонаж».\n\n💡 Сами японцы чаще называют свою страну «Нихон», а не «Ниппон».",
        },
        uz: {
          jp: "マリオは <ruby>日本<rt>にほん</rt></ruby>の キャラクターです。でも、イタリア<ruby>人<rt>じん</rt></ruby>です。",
          translation: "Mario — yapon qahramoni. Lekin u italiyalik.",
          grammarInfo:
            "【Tahlil】\n\n1. 日本の キャラクター — «Yaponiyaning qahramoni».\n\n💡 Yaponlar o'z mamlakatlarini «Nippon» deb emas, ko'pincha «Nihon» deb atashadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>日本<rt>にほん</rt></ruby><ruby>人<rt>じん</rt></ruby>じゃ ありません。",
            translation: "Я не японец.",
          },
          {
            jp: "あの <ruby>方<rt>かた</rt></ruby>は <ruby>日本<rt>にほん</rt></ruby>の <ruby>社長<rt>しゃちょう</rt></ruby>です。",
            translation: "Тот господин — японский директор.",
          },
          {
            jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "Студент из Японии.",
          },
        ],
        uz: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>日本<rt>にほん</rt></ruby><ruby>人<rt>じん</rt></ruby>じゃ ありません。",
            translation: "Men yapon emasman.",
          },
          {
            jp: "あの <ruby>方<rt>かた</rt></ruby>は <ruby>日本<rt>にほん</rt></ruby>の <ruby>社長<rt>しゃちょう</rt></ruby>です。",
            translation: "U kishi Yaponiyalik direktor.",
          },
          {
            jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "Yaponiyalik talaba.",
          },
        ],
      },
    },
    {
      id: 46,
      lesson: 1,
      japanese: "ブラジル",
      cleanWord: "ブラジル",
      translations: { ru: "Бразилия", uz: "Braziliya" },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は ブラジル<ruby>人<rt>じん</rt></ruby>じゃ ありません。ただの サッカーの オタクです。",
          translation:
            "Тот человек не бразилец. Просто отаку, помешанный на футболе.",
          grammarInfo:
            "【Разбор】\n\n1. ブラジル人じゃ ありません — «не бразилец».\n\n2. サッカーの オタクです — «футбольный отаку».\n\n💡 В Бразилии живет самая большая диаспора японцев в мире!",
        },
        uz: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は ブラジル<ruby>人<rt>じん</rt></ruby>じゃ ありません。ただの サッカーの オタクです。",
          translation: "U odam braziliyalik emas. Shunchaki futbol otakusi.",
          grammarInfo:
            "【Tahlil】\n\n1. ブラジル人じゃ ありません — «braziliyalik emas».\n\n2. サッカーの オタクです — «futbol otakusidir».\n\n💡 Braziliyada dunyodagi eng yirik yapon diasporasi yashaydi!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "マリアさんは ブラジル<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Мария — бразильянка.",
          },
          {
            jp: "ブラジルから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Я приехал из Бразилии.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は ブラジルの <ruby>医者<rt>いしゃ</rt></ruby>です。",
            translation: "Тот человек — врач из Бразилии.",
          },
        ],
        uz: [
          {
            jp: "マリアさんは ブラジル<ruby>人<rt>じん</rt></ruby>です。",
            translation: "Mariya — braziliyalik.",
          },
          {
            jp: "ブラジルから <ruby>来<rt>き</rt></ruby>ました。",
            translation: "Braziliyadan keldim.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は ブラジルの <ruby>医者<rt>いしゃ</rt></ruby>です。",
            translation: "U odam Braziliyalik shifokor.",
          },
        ],
      },
    },
    {
      id: 47,
      lesson: 2,
      japanese: "これ",
      cleanWord: "これ",
      translations: { ru: "это (рядом)", uz: "bu (yaqinda)" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>水<rt>みず</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>涙<rt>なみだ</rt></ruby>です。",
          translation: "Это не вода. Это мои слезы.",
          grammarInfo:
            "【Разбор】\n\n1. これは — «это» (близко к говорящему) + は (тема).\n\n2. 水じゃ ありません — отрицание: «не вода».\n\n3. 私の 涙です — «мои слёзы» + связка です.\n\n💡 Указательное местоимение これ работает как самостоятельное существительное.",
        },
        uz: {
          jp: "これは <ruby>水<rt>みず</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>涙<rt>なみだ</rt></ruby>です。",
          translation: "Bu suv emas. Bu mening ko'z yoshlarim.",
          grammarInfo:
            "【Tahlil】\n\n1. これは — «bu» (gapiruvchiga yaqin) + は (mavzu).\n\n2. 水じゃ ありません — inkor: «suv emas».\n\n3. 私の 涙です — «mening ko'z yoshlarim» + です.\n\n💡 これ ko'rsatish olmoshi mustaqil ot kabi ishlaydi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
            translation: "Это моя книга.",
          },
          {
            jp: "これも カメラですか。",
            translation: "Это тоже камера?",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Что это?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
            translation: "Bu mening kitobim.",
          },
          {
            jp: "これも カメラですか。",
            translation: "Bu ham kamerami?",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Bu nima?",
          },
        ],
      },
    },
    {
      id: 48,
      lesson: 2,
      japanese: "それ",
      cleanWord: "それ",
      translations: {
        ru: "то (у собеседника)",
        uz: "shu (suhbatdoshdagi)",
      },
      exampleSentences: {
        ru: {
          jp: "それは コーヒーじゃ ありません。<ruby>醤油<rt>しょうゆ</rt></ruby>です。",
          translation: "То (у вас) не кофе. Это соевый соус.",
          grammarInfo:
            "【Разбор】\n\n1. それは — «то» (предмет у собеседника) + は.\n\n2. コーヒーじゃ ありません — «не кофе».\n\n3. 醤油です — «соевый соус».\n\n💡 В Японии соевый соус часто наливают в кувшинчики, похожие на кофейные. Будьте осторожны!",
        },
        uz: {
          jp: "それは コーヒーじゃ ありません。<ruby>醤油<rt>しょうゆ</rt></ruby>です。",
          translation: "Shu (sizdagi) kofe emas. Bu soya sousi.",
          grammarInfo:
            "【Tahlil】\n\n1. それは — «shu» (suhbatdoshdagi narsa) + は.\n\n2. コーヒーじゃ ありません — «kofe emas».\n\n3. 醤油です — «soya sousi».\n\n💡 Yaponiyada soya sousini ko'pincha kofe idishiga o'xshash idishlarda tortishadi. Ehtiyot bo'ling!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "それは <ruby>辞書<rt>じしょ</rt></ruby>ですか。",
            translation: "То — словарь?",
          },
          {
            jp: "それは <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。",
            translation: "То не моё.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>ですか。",
            translation: "Чей то зонт?",
          },
        ],
        uz: [
          {
            jp: "それは <ruby>辞書<rt>じしょ</rt></ruby>ですか。",
            translation: "Shu lug'atmi?",
          },
          {
            jp: "それは <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。",
            translation: "Shu meniki emas.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>ですか。",
            translation: "Shu kimning soyaboni?",
          },
        ],
      },
    },
    {
      id: 49,
      lesson: 2,
      japanese: "あれ",
      cleanWord: "あれ",
      translations: { ru: "вон то (вдали)", uz: "anavi (uzoqdagi)" },
      exampleSentences: {
        ru: {
          jp: "あれは <ruby>富士山<rt>ふじさん</rt></ruby>じゃ ありません。ゴジラです。",
          translation: "Вон то — не гора Фудзи. Это Годзилла.",
          grammarInfo:
            "【Разбор】\n\n1. あれは — местоимение «вон то» (далеко от обоих) + は.\n\n2. 富士山じゃ ありません — отрицание существительного.\n\n💡 あれ идеально подходит для объектов на горизонте или вне досягаемости обоих собеседников.",
        },
        uz: {
          jp: "あれは <ruby>富士山<rt>ふじさん</rt></ruby>じゃ ありません。ゴジラです。",
          translation: "Anavi uzoqdagi — Fuji tog'i emas. Bu Godzilla.",
          grammarInfo:
            "【Tahlil】\n\n1. あれは — olmosh «anavi» (ikkalasidan ham uzoqda) + は.\n\n2. 富士山じゃ ありません — ot inkor shaklida.\n\n💡 あれ ufqdagi yoki har ikki suhbatdosh yetib bora olmaydigan uzoqdagi narsalar uchun juda mos.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あれは <ruby>会社<rt>かいしゃ</rt></ruby>です。",
            translation: "Вон то — компания.",
          },
          {
            jp: "あれは <ruby>私<rt>わたし</rt></ruby>の <ruby>車<rt>くるま</rt></ruby>です。",
            translation: "Вон там — моя машина.",
          },
          {
            jp: "あれは カメラですか。",
            translation: "Вон то — камера?",
          },
        ],
        uz: [
          {
            jp: "あれは <ruby>会社<rt>かいしゃ</rt></ruby>です。",
            translation: "Anavi — kompaniya.",
          },
          {
            jp: "あれは <ruby>私<rt>わたし</rt></ruby>の <ruby>車<rt>くるま</rt></ruby>です。",
            translation: "Anavi — mening mashinam.",
          },
          { jp: "あれは カメラですか。", translation: "Anavi kamerami?" },
        ],
      },
    },
    {
      id: 50,
      lesson: 2,
      japanese: "この",
      cleanWord: "この",
      translations: { ru: "этот～", uz: "bu～" },
      exampleSentences: {
        ru: {
          jp: "この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。ヤクザの <ruby>傘<rt>かさ</rt></ruby>です。",
          translation: "Этот зонт — не мой. Это зонт якудзы.",
          grammarInfo:
            "【Разбор】\n\n1. この 傘は — «этот зонт». Указательное слово この всегда требует после себя существительное.\n\n2. ヤクザの — «(принадлежит) якудзе».\n\n⚠️ Грубая ошибка: сказать просто «このは» вместо «これは» или «この 傘は».",
        },
        uz: {
          jp: "この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。ヤクザの <ruby>傘<rt>かさ</rt></ruby>です。",
          translation: "Bu soyabon — meniki emas. Bu yakudzaning soyaboni.",
          grammarInfo:
            "【Tahlil】\n\n1. この 傘は — «bu soyabon». この ko'rsatish so'zi har doim o'zidan keyin ot talab qiladi.\n\n2. ヤクザの — «yakudzaga (tegishli)».\n\n⚠️ Qo'pol xato: «これは» yoki «この 傘は» o'rniga shunchaki «このは» deb aytish.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>本<rt>ほん</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Эта книга — моя.",
          },
          {
            jp: "この <ruby>人<rt>ひと</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>ですか。",
            translation: "Кто этот человек?",
          },
          {
            jp: "この 辞書は 誰の ですか。",
            translation: "Чей это словарь?",
          },
        ],
        uz: [
          {
            jp: "この <ruby>本<rt>ほん</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu kitob — meniki.",
          },
          {
            jp: "この <ruby>人<rt>ひと</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>ですか。",
            translation: "Bu odam kim?",
          },
          {
            jp: "この 辞書は 誰の ですか。",
            translation: "Bu lug'at kimniki?",
          },
        ],
      },
    },
    {
      id: 51,
      lesson: 2,
      japanese: "その",
      cleanWord: "その",
      translations: { ru: "тот～ (у собеседника)", uz: "shu～" },
      exampleSentences: {
        ru: {
          jp: "その かぎは <ruby>車<rt>くるま</rt></ruby>の かぎですか。…いいえ、<ruby>私<rt>わたし</rt></ruby>の <ruby>心<rt>こころ</rt></ruby>の かぎです。",
          translation:
            "Тот ключ у тебя — от машины? ...Нет, это ключ от моего сердца.",
          grammarInfo:
            "【Разбор】\n\n1. その かぎ — «тот ключ» (в руках собеседника).\n\n2. 車の かぎ — «ключ от машины» (целевое назначение: の).\n\n3. 心の かぎ — «ключ от сердца».",
        },
        uz: {
          jp: "その かぎは <ruby>車<rt>くるま</rt></ruby>の かぎですか。…いいえ、<ruby>私<rt>わたし</rt></ruby>の <ruby>心<rt>こころ</rt></ruby>の かぎです。",
          translation:
            "Shu yoningizdagi kalit — mashina kalitimi? ...Yo'q, bu mening qalbimning kaliti.",
          grammarInfo:
            "【Tahlil】\n\n1. その かぎ — «shu kalit» (suhbatdoshning qo'lidagi).\n\n2. 車の かぎ — «mashina kaliti» (vazifasi: の).\n\n3. 心の かぎ — «qalb kaliti».",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "その かぎは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Тот ключ — мой.",
          },
          {
            jp: "その <ruby>時計<rt>とけい</rt></ruby>は スイスの ですか。",
            translation: "Те часы — швейцарские?",
          },
          {
            jp: "その かばんは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чья та сумка?",
          },
        ],
        uz: [
          {
            jp: "その かぎは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Shu kalit — meniki.",
          },
          {
            jp: "その <ruby>時計<rt>とけい</rt></ruby>は スイスの ですか。",
            translation: "Shu soat Shveysariyanikimi?",
          },
          {
            jp: "その かばんは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu sumka kimniki?",
          },
        ],
      },
    },
    {
      id: 52,
      lesson: 2,
      japanese: "あの",
      cleanWord: "あの",
      translations: { ru: "вон тот～", uz: "anavi～" },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>医者<rt>いしゃ</rt></ruby>じゃ ありません。スパイです。",
          translation: "Вон тот человек — не врач. Он шпион.",
          grammarInfo:
            "【Разбор】\n\n1. あの 人は — «вон тот человек» (далеко от обоих).\n\n2. 医者じゃ ありません — «не врач».\n\n💡 Сочетание あの 人 (ano hito) — самый частый способ сказать «он/она» о человеке поодаль.",
        },
        uz: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>医者<rt>いしゃ</rt></ruby>じゃ ありません。スパイです。",
          translation: "Anavi odam — shifokor emas. U josus.",
          grammarInfo:
            "【Tahlil】\n\n1. あの 人は — «anavi odam» (ikkalasidan ham uzoqda).\n\n2. 医者じゃ ありません — «shifokor emas».\n\n💡 あの 人 (ano hito) birikmasi — narida turgan kimgadir nisbatan «u» deyishning eng keng tarqalgan usuli.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あの <ruby>車<rt>くるま</rt></ruby>は ミラーさんの です。",
            translation: "Та машина (вдали) — мистера Миллера.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>ですか。",
            translation: "Кто вон тот человек?",
          },
          {
            jp: "あの <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Вон тот зонт — мой.",
          },
        ],
        uz: [
          {
            jp: "あの <ruby>車<rt>くるま</rt></ruby>は ミラーさんの です。",
            translation: "Anavi mashina janob Millerniki.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>ですか。",
            translation: "Anavi odam kim?",
          },
          {
            jp: "あの <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Anavi soyabon meniki.",
          },
        ],
      },
    },
    {
      id: 53,
      lesson: 2,
      japanese: "<ruby>本<rt>ほん</rt></ruby>",
      cleanWord: "本",
      translations: { ru: "книга", uz: "kitob" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>料理<rt>りょうり</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>じゃ ありません。<ruby>黒魔術<rt>くろまじゅつ</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
          translation: "Это не кулинарная книга. Это книга по черной магии.",
          grammarInfo:
            "【Разбор】\n\n1. 料理の 本 — «книга по кулинарии» (の указывает на содержание книги).\n\n2. じゃ ありません — отрицание связки です.\n\n3. 黒魔術の 本です — «книга черной магии».",
        },
        uz: {
          jp: "これは <ruby>料理<rt>りょうり</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>じゃ ありません。<ruby>黒魔術<rt>くろまじゅつ</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
          translation: "Bu pazandachilik kitobi emas. Bu qora sehr kitobi.",
          grammarInfo:
            "【Tahlil】\n\n1. 料理の 本 — «pazandachilik kitobi» (の kitob nima haqidaligini bildiradi).\n\n2. じゃ ありません — です bog'lovchisining inkor shakli.\n\n3. 黒魔術の 本です — «qora sehr kitobi».",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "それは <ruby>車<rt>くるま</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Это книга о машинах?",
          },
          {
            jp: "この <ruby>本<rt>ほん</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Эта книга — моя.",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "О чем эта книга?",
          },
        ],
        uz: [
          {
            jp: "それは <ruby>車<rt>くるま</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "U mashinalar haqidagi kitobmi?",
          },
          {
            jp: "この <ruby>本<rt>ほん</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu kitob meniki.",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Bu nima haqidagi kitob?",
          },
        ],
      },
    },
    {
      id: 54,
      lesson: 2,
      japanese: "<ruby>辞書<rt>じしょ</rt></ruby>",
      cleanWord: "辞書",
      translations: { ru: "словарь", uz: "lugʻat" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>辞書<rt>じしょ</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>枕<rt>まくら</rt></ruby>です。",
          translation: "Это не словарь. Это моя подушка.",
          grammarInfo:
            "【Разбор】\n\n1. 辞書じゃ ありません — «не словарь».\n\n2. 私の 枕 — «моя подушка» (makura).\n\n💡 Тяжелые бумажные словари японского языка идеально подходят для сна на парте во время скучных лекций!",
        },
        uz: {
          jp: "これは <ruby>辞書<rt>じしょ</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>枕<rt>まくら</rt></ruby>です。",
          translation: "Bu lugʻat emas. Bu mening yostigʻim.",
          grammarInfo:
            "【Tahlil】\n\n1. 辞書じゃ ありません — «lugʻat emas».\n\n2. 私の 枕 — «mening yostig'im» (makura).\n\n💡 Og'ir qog'ozli yapon tili lug'atlari zerikarli ma'ruzalar paytida partada uxlash uchun juda mos keladi!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あの <ruby>辞書<rt>じしょ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Тот словарь (вдали) — учителя.",
          },
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "Это словарь английского языка.",
          },
          {
            jp: "その <ruby>辞書<rt>じしょ</rt></ruby>は あなたの ですか。",
            translation: "Тот словарь — твой?",
          },
        ],
        uz: [
          {
            jp: "あの <ruby>辞書<rt>じしょ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Anavi lug'at o'qituvchiniki.",
          },
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "Bu ingliz tili lug'ati.",
          },
          {
            jp: "その <ruby>辞書<rt>じしょ</rt></ruby>は あなたの ですか。",
            translation: "Shu lug'at siznikimi?",
          },
        ],
      },
    },
    {
      id: 55,
      lesson: 2,
      japanese: "<ruby>雑誌<rt>ざっし</rt></ruby>",
      cleanWord: "雑誌",
      translations: { ru: "журнал", uz: "jurnal" },
      exampleSentences: {
        ru: {
          jp: "それは <ruby>車<rt>くるま</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>ですか。…いいえ、ＵＦＯの <ruby>雑誌<rt>ざっし</rt></ruby>です。",
          translation:
            "Это у тебя журнал об автомобилях? ...Нет, журнал об НЛО.",
          grammarInfo:
            "【Разбор】\n\n1. 車の 雑誌 — «журнал о машинах».\n\n2. ＵＦＯの 雑誌 — «журнал об НЛО» (yuu-foo).\n\n💡 В Японии журналы продаются в любом комбини, и многие читают их прямо у витрины.",
        },
        uz: {
          jp: "それは <ruby>車<rt>くるま</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>ですか。…いいえ、ＵＦＯの <ruby>雑誌<rt>ざっし</rt></ruby>です。",
          translation: "Shu mashinalar jurnalimi? ...Yo'q, NUJ haqida jurnal.",
          grammarInfo:
            "【Tahlil】\n\n1. 車の 雑誌 — «mashinalar jurnali».\n\n2. ＵＦＯの 雑誌 — «NUJ haqida jurnal» (yuu-foo).\n\n💡 Yaponiyada jurnallar har qanday do'konda sotiladi va ko'pchilik ularni vitrina oldida turib o'qiydi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>車<rt>くるま</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>です。",
            translation: "Это журнал об автомобилях.",
          },
          {
            jp: "それは カメラの <ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "Это журнал о камерах?",
          },
          {
            jp: "その <ruby>雑誌<rt>ざっし</rt></ruby>も <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Тот журнал тоже мой.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>車<rt>くるま</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>です。",
            translation: "Bu avtomobillar jurnali.",
          },
          {
            jp: "それは カメラの <ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "U kameralar jurnalimi?",
          },
          {
            jp: "その <ruby>雑誌<rt>ざっし</rt></ruby>も <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Shu jurnal ham meniki.",
          },
        ],
      },
    },
    {
      id: 56,
      lesson: 2,
      japanese: "<ruby>新聞<rt>しんぶん</rt></ruby>",
      cleanWord: "新聞",
      translations: { ru: "газета", uz: "gazeta" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>今日<rt>きょう</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>じゃ ありません。<ruby>未来<rt>みらい</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>です。",
          translation: "Это не сегодняшняя газета. Это газета из будущего.",
          grammarInfo:
            "【Разбор】\n\n1. 今日の 新聞 — «газета (от) сегодня» (kyou).\n\n2. 未来の 新聞 — «газета из будущего» (mirai).\n\n💡 Япония до сих пор остается страной, где по утрам миллионы людей читают свежие бумажные газеты в метро.",
        },
        uz: {
          jp: "これは <ruby>今日<rt>きょう</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>じゃ ありません。<ruby>未来<rt>みらい</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>です。",
          translation: "Bu bugungi gazeta emas. Bu kelajak gazetasi.",
          grammarInfo:
            "【Tahlil】\n\n1. 今日の 新聞 — «bugungi gazeta» (kyou).\n\n2. 未来の 新聞 — «kelajak gazetasi» (mirai).\n\n💡 Yaponiya hali ham har kuni ertalab millionlab odamlar metroning o'zida yangi qog'oz gazetalar o'qiydigan davlat bo'lib qolmoqda.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>です。",
            translation: "Это японская газета.",
          },
          {
            jp: "あれは <ruby>新聞<rt>しんぶん</rt></ruby>ですか、<ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "То вдали — газета или журнал?",
          },
          {
            jp: "あの <ruby>新聞<rt>しんぶん</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чья та газета?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>です。",
            translation: "Bu yapon gazetasi.",
          },
          {
            jp: "あれは <ruby>新聞<rt>しんぶん</rt></ruby>ですか、<ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "Anavi gazetami yoki jurnalmi?",
          },
          {
            jp: "あの <ruby>新聞<rt>しんぶん</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi gazeta kimniki?",
          },
        ],
      },
    },
    {
      id: 57,
      lesson: 2,
      japanese: "ノート",
      cleanWord: "ノート",
      translations: { ru: "тетрадь", uz: "daftar" },
      exampleSentences: {
        ru: {
          jp: "この ノートは デスノートですか。…いいえ、<ruby>英語<rt>えいご</rt></ruby>の ノートです。",
          translation:
            "Эта тетрадь — Тетрадь Смерти? ...Нет, это тетрадь по английскому.",
          grammarInfo:
            "【Разбор】\n\n1. デスノート — «Тетрадь Смерти» (Death Note, известное аниме).\n\n2. 英語の ノート — «тетрадь для английского».\n\n💡 Японское ノート произошло от английского «notebook», но означает только бумажную тетрадь. Ноутбук — это パソコン (pasokon).",
        },
        uz: {
          jp: "この ノートは デスノートですか。…いいえ、<ruby>英語<rt>えいご</rt></ruby>の ノートです。",
          translation:
            "Bu daftar — Ajal daftarimi? ...Yo'q, bu ingliz tili daftari.",
          grammarInfo:
            "【Tahlil】\n\n1. デスノート — «Ajal daftari» (Death Note, mashhur anime).\n\n2. 英語の ノート — «ingliz tili daftari».\n\n💡 Yaponcha ノート inglizcha «notebook» dan kelib chiqqan, lekin faqat qog'oz daftarni bildiradi. Noutbuk kompyuter esa パソコン (pasokon) deyiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "その ノートは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Та тетрадь — моя.",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の ノートですか。",
            translation: "Для чего эта тетрадь?",
          },
          {
            jp: "あの ノートも <ruby>先生<rt>せんせい</rt></ruby>の ですか。",
            translation: "Вон та тетрадь тоже учителя?",
          },
        ],
        uz: [
          {
            jp: "その ノートは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Shu daftar — meniki.",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の ノートですか。",
            translation: "Bu nima uchun mo'ljallangan daftar?",
          },
          {
            jp: "あの ノートも <ruby>先生<rt>せんせい</rt></ruby>の ですか。",
            translation: "Anavi daftar ham o'qituvchinikimi?",
          },
        ],
      },
    },
    {
      id: 58,
      lesson: 2,
      japanese: "<ruby>手帳<rt>てちょう</rt></ruby>",
      cleanWord: "手帳",
      translations: { ru: "блокнот", uz: "yondaftar" },
      exampleSentences: {
        ru: {
          jp: "この <ruby>手帳<rt>てちょう</rt></ruby>は <ruby>大統領<rt>だいとうりょう</rt></ruby>の <ruby>手帳<rt>てちょう</rt></ruby>です。あなたの じゃ ありません。",
          translation: "Это блокнот президента. Не твой.",
          grammarInfo:
            "【Разбор】\n\n1. 大統領の — «(принадлежащий) президенту» (daitouryou).\n\n2. あなたの じゃ ありません — «не твой».\n\n💡 Даже в эпоху смартфонов японские офисные работники обожают карманные бумажные планировщики.",
        },
        uz: {
          jp: "この <ruby>手帳<rt>てちょう</rt></ruby>は <ruby>大統領<rt>だいとうりょう</rt></ruby>の <ruby>手帳<rt>てちょう</rt></ruby>です。あなたの じゃ ありません。",
          translation: "Bu prezidentning yondaftari. Seniki emas.",
          grammarInfo:
            "【Tahlil】\n\n1. 大統領の — «prezidentga (tegishli)» (daitouryou).\n\n2. あなたの じゃ ありません — «seniki emas».\n\n💡 Smartfonlar davrida ham yapon ofis xodimlari cho'ntak qog'oz rejalashtirgichlarini yaxshi ko'radilar.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>手帳<rt>てちょう</rt></ruby>は ミラーさんの です。",
            translation: "Этот блокнот — мистера Миллера.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>手帳<rt>てちょう</rt></ruby>ですか。",
            translation: "Чей это блокнот?",
          },
          {
            jp: "その <ruby>手帳<rt>てちょう</rt></ruby>を ください。",
            translation: "Дайте, пожалуйста, этот блокнот.",
          },
        ],
        uz: [
          {
            jp: "この <ruby>手帳<rt>てちょう</rt></ruby>は ミラーさんの です。",
            translation: "Bu yondaftar janob Millerniki.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>手帳<rt>てちょう</rt></ruby>ですか。",
            translation: "U kimning yondaftari?",
          },
          {
            jp: "その <ruby>手帳<rt>てちょう</rt></ruby>を ください。",
            translation: "Iltimos, shu yondaftarni bering.",
          },
        ],
      },
    },
    {
      id: 59,
      lesson: 2,
      japanese: "<ruby>名刺<rt>めいし</rt></ruby>",
      cleanWord: "名刺",
      translations: { ru: "визитка", uz: "vizitka" },
      exampleSentences: {
        ru: {
          jp: "これは イーロン・マスクの <ruby>名刺<rt>めいし</rt></ruby>です。<ruby>私<rt>わたし</rt></ruby>の <ruby>宝物<rt>たからもの</rt></ruby>です。",
          translation: "Это визитка Илона Маска. Мое сокровище.",
          grammarInfo:
            "【Разбор】\n\n1. イーロン・マスクの — «(принадлежит) Илону Маску».\n\n2. 宝物です — «является сокровищем» (takaramono).\n\n💡 Обмен визитками (名刺交換) в Японии — это священный ритуал бизнеса.",
        },
        uz: {
          jp: "これは イーロン・マスクの <ruby>名刺<rt>めいし</rt></ruby>です。<ruby>私<rt>わたし</rt></ruby>の <ruby>宝物<rt>たからもの</rt></ruby>です。",
          translation: "Bu Ilon Maskning vizitkasi. Mening xazinam.",
          grammarInfo:
            "【Tahlil】\n\n1. イーロン・マスクの — «Ilon Maskga (tegishli)».\n\n2. 宝物です — «xazinadir» (takaramono).\n\n💡 Yaponiyada vizitkalar almashinuvi (名刺交換) biznesning muqaddas marosimidir.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>名刺<rt>めいし</rt></ruby>です。",
            translation: "Это моя визитка.",
          },
          {
            jp: "あの <ruby>名刺<rt>めいし</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чья та визитка?",
          },
          {
            jp: "この <ruby>名刺<rt>めいし</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Эта визитка — учителя.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>名刺<rt>めいし</rt></ruby>です。",
            translation: "Bu mening vizitkam.",
          },
          {
            jp: "あの <ruby>名刺<rt>めいし</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi vizitka kimniki?",
          },
          {
            jp: "この <ruby>名刺<rt>めいし</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Bu vizitka o'qituvchiniki.",
          },
        ],
      },
    },
    {
      id: 60,
      lesson: 2,
      japanese: "カード",
      cleanWord: "カード",
      translations: { ru: "карта", uz: "karta" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>銀行<rt>ぎんこう</rt></ruby>の カードじゃ ありません。イルミナティの カードです。",
          translation: "Это не банковская карта. Это карта Иллюминатов.",
          grammarInfo:
            "【Разбор】\n\n1. 銀行の カード — «карта банка».\n\n2. じゃ ありません — отрицание.\n\n💡 Слово カード может означать кредитку, пропуск, открытку или коллекционную карточку.",
        },
        uz: {
          jp: "これは <ruby>銀行<rt>ぎんこう</rt></ruby>の カードじゃ ありません。イルミナティの カードです。",
          translation: "Bu bank kartasi emas. Bu Illuminatilar kartasi.",
          grammarInfo:
            "【Tahlil】\n\n1. 銀行の カード — «bank kartasi».\n\n2. じゃ ありません — inkor.\n\n💡 カード so'zi kredit karta, ruxsatnoma, otkritka yoki kolleksiya kartasini anglatishi mumkin.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この カードは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Эта карта — моя.",
          },
          {
            jp: "それは <ruby>電話<rt>でんわ</rt></ruby>の カードですか。",
            translation: "Это телефонная карточка?",
          },
          {
            jp: "あの カードも だめです。",
            translation: "Та карточка тоже не подходит.",
          },
        ],
        uz: [
          {
            jp: "この カードは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu karta meniki.",
          },
          {
            jp: "それは <ruby>電話<rt>でんわ</rt></ruby>の カードですか。",
            translation: "Bu telefon kartasimi?",
          },
          {
            jp: "あの カードも だめです。",
            translation: "Anavi karta ham to'g'ri kelmaydi.",
          },
        ],
      },
    },
    {
      id: 61,
      lesson: 2,
      japanese: "<ruby>鉛筆<rt>えんぴつ</rt></ruby>",
      cleanWord: "鉛筆",
      translations: { ru: "карандаш", uz: "qalam" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>鉛筆<rt>えんぴつ</rt></ruby>じゃ ありません。チョコレートです。",
          translation: "Это не карандаш. Это шоколад.",
          grammarInfo:
            "【Разбор】\n\n1. 鉛筆じゃ ありません — «не карандаш».\n\n2. チョコレートです — «(это) шоколад».\n\n💡 В Японии обожают выпускать сувенирные сладости, которые выглядят точь-в-точь как настоящие канцелярские принадлежности! Не перепутайте!",
        },
        uz: {
          jp: "これは <ruby>鉛筆<rt>えんぴつ</rt></ruby>じゃ ありません。チョコレートです。",
          translation: "Bu qalam emas. Bu shokolad.",
          grammarInfo:
            "【Tahlil】\n\n1. 鉛筆じゃ ありません — «qalam emas».\n\n2. チョコレートです — «(bu) shokolad».\n\n💡 Yaponiyada xuddi haqiqiy kanselyariya mollariga o'xshab ketadigan esdalik shirinliklarini ishlab chiqarishni yaxshi ko'rishadi! Adashtirib qo'ymang!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>鉛筆<rt>えんぴつ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот карандаш — мой.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>鉛筆<rt>えんぴつ</rt></ruby>ですか。",
            translation: "Чей это карандаш?",
          },
          {
            jp: "あの <ruby>鉛筆<rt>えんぴつ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Вон тот карандаш — учителя.",
          },
        ],
        uz: [
          {
            jp: "この <ruby>鉛筆<rt>えんぴつ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu qalam meniki.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>鉛筆<rt>えんぴつ</rt></ruby>ですか。",
            translation: "Bu kimning qalami?",
          },
          {
            jp: "あの <ruby>鉛筆<rt>えんぴつ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Anavi qalam o'qituvchiniki.",
          },
        ],
      },
    },
    {
      id: 62,
      lesson: 2,
      japanese: "ボールペン",
      cleanWord: "ボールペン",
      translations: { ru: "шариковая ручка", uz: "sharikli ruchka" },
      exampleSentences: {
        ru: {
          jp: "この ボールペンは １００<ruby>円<rt>えん</rt></ruby>じゃ ありません。１００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です！",
          translation: "Эта ручка стоит не 100 иен. Она стоит 1 миллион иен!",
          grammarInfo:
            "【Разбор】\n\n1. １００円じゃ ありません — «не за 100 иен».\n\n2. １００万円です — «(она) за 1 миллион иен» (man - десять тысяч, 100 man = 1 миллион).\n\n💡 Японские бренды шариковых ручек (Zebra, Pilot) считаются одними из лучших в мире.",
        },
        uz: {
          jp: "この ボールペンは １００<ruby>円<rt>えん</rt></ruby>じゃ ありません。１００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です！",
          translation: "Bu ruchka 100 iyen emas. U 1 million iyen turadi!",
          grammarInfo:
            "【Tahlil】\n\n1. １００円じゃ ありません — «100 iyenlik emas».\n\n2. １００万円です — «(u) 1 million iyenlik» (man - o'n ming, 100 man = 1 million).\n\n💡 Yaponiyaning sharikli ruchka brendlari (Zebra, Pilot) dunyodagi eng yaxshilaridan biri hisoblanadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この ボールペンは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Эта ручка — моя.",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の ボールペンですか。",
            translation: "Это ручка учителя?",
          },
          {
            jp: "あの ボールペンも <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Вон та ручка тоже моя.",
          },
        ],
        uz: [
          {
            jp: "この ボールペンは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu ruchka meniki.",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の ボールペンですか。",
            translation: "Bu o'qituvchining ruchkasimi?",
          },
          {
            jp: "あの ボールペンも <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Anavi ruchka ham meniki.",
          },
        ],
      },
    },
    {
      id: 63,
      lesson: 2,
      japanese: "シャープペンシル",
      cleanWord: "シャープペンシル",
      translations: { ru: "мех. карандаш", uz: "mexanik qalam" },
      exampleSentences: {
        ru: {
          jp: "これは シャープペンシルですか。…いいえ、<ruby>注射器<rt>ちゅうしゃき</rt></ruby>です。",
          translation: "Это механический карандаш? ...Нет, это шприц.",
          grammarInfo:
            "【Разбор】\n\n1. シャープペンシルですか — «механический карандаш?».\n\n2. 注射器です — «шприц» (chuushaki).\n\n💡 В Японии механический карандаш называют シャーペン (shaapen) в разговорной речи.",
        },
        uz: {
          jp: "これは シャープペンシルですか。…いいえ、<ruby>注射器<rt>ちゅうしゃき</rt></ruby>です。",
          translation: "Bu mexanik qalammi? ...Yo'q, bu shprits.",
          grammarInfo:
            "【Tahlil】\n\n1. シャープペンシルですか — «mexanik qalammi?».\n\n2. 注射器です — «shprits» (chuushaki).\n\n💡 Yaponiyada so'zlashuvda mexanik qalamni ko'pincha シャーペン (shaapen) deb atashadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の シャープペンシルです。",
            translation: "Это мой механический карандаш.",
          },
          {
            jp: "その シャープペンシルは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей тот механический карандаш?",
          },
          {
            jp: "この シャープペンシルは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Этот карандаш — учителя.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の シャープペンシルです。",
            translation: "Bu mening mexanik qalamim.",
          },
          {
            jp: "その シャープペンシルは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu mexanik qalam kimniki?",
          },
          {
            jp: "この シャープペンシルは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Bu qalam o'qituvchiniki.",
          },
        ],
      },
    },
    {
      id: 64,
      lesson: 2,
      japanese: "かぎ",
      cleanWord: "かぎ",
      translations: { ru: "ключ", uz: "kalit" },
      exampleSentences: {
        ru: {
          jp: "この かぎは <ruby>車<rt>くるま</rt></ruby>の じゃ ありません。<ruby>秘密<rt>ひみつ</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>の かぎです。",
          translation: "Этот ключ — не от машины. Это ключ от тайной комнаты.",
          grammarInfo:
            "【Разбор】\n\n1. 車の じゃ ありません — «не от машины» (существительное かぎ опущено).\n\n2. 秘密の 部屋の かぎ — «ключ (от) тайной комнаты» (himitsu no heya).\n\n💡 Слово かぎ (kagi) часто пишется хираганой, хотя у него есть сложный кандзи 鍵.",
        },
        uz: {
          jp: "この かぎは <ruby>車<rt>くるま</rt></ruby>の じゃ ありません。<ruby>秘密<rt>ひみつ</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>の かぎです。",
          translation:
            "Bu kalit — mashinaning kaliti emas. Bu maxfiy xonaning kaliti.",
          grammarInfo:
            "【Tahlil】\n\n1. 車の じゃ ありません — «mashinadan emas» (かぎ oti tushirib qoldirilgan).\n\n2. 秘密の 部屋の かぎ — «maxfiy xona kaliti» (himitsu no heya).\n\n💡 かぎ (kagi) so'zi ko'pincha hiraganada yoziladi, garchi uning murakkab iyeroglifi (鍵) bo'lsa ham.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>車<rt>くるま</rt></ruby>の かぎです。",
            translation: "Это ключ от машины.",
          },
          {
            jp: "その かぎは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей тот ключ?",
          },
          {
            jp: "この かぎは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот ключ — мой.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>車<rt>くるま</rt></ruby>の かぎです。",
            translation: "Bu mashina kaliti.",
          },
          {
            jp: "その かぎは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu kalit kimniki?",
          },
          {
            jp: "この かぎは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu kalit meniki.",
          },
        ],
      },
    },
    {
      id: 65,
      lesson: 2,
      japanese: "<ruby>時計<rt>とけい</rt></ruby>",
      cleanWord: "時計",
      translations: { ru: "часы", uz: "soat" },
      exampleSentences: {
        ru: {
          jp: "その <ruby>時計<rt>とけい</rt></ruby>は ロレックスですか。…いいえ、おもちゃです。",
          translation: "Те часы у тебя — Ролекс? ...Нет, игрушка.",
          grammarInfo:
            "【Разбор】\n\n1. その 時計は — «те часы (на твоей руке)».\n\n2. ロレックスですか — «Ролекс?».\n\n3. おもちゃです — «игрушка».\n\n💡 時計 (tokei) означает любые часы — и наручные, и настенные, и башенные.",
        },
        uz: {
          jp: "その <ruby>時計<rt>とけい</rt></ruby>は ロレックスですか。…いいえ、おもちゃです。",
          translation: "Qo'lingizdagi soat — Roleksmi? ...Yo'q, o'yinchoq.",
          grammarInfo:
            "【Tahlil】\n\n1. その 時計は — «shu soat (qo'lingizdagi)».\n\n2. ロレックスですか — «Roleksmi?».\n\n3. おもちゃです — «o'yinchoq».\n\n💡 時計 (tokei) har qanday soatni — qo'l soatini ham, devor soatini ham bildiradi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>時計<rt>とけい</rt></ruby>です。",
            translation: "Это мои часы.",
          },
          {
            jp: "あの <ruby>時計<rt>とけい</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чьи вон те часы?",
          },
          {
            jp: "その <ruby>時計<rt>とけい</rt></ruby>は スイスの ですか。",
            translation: "Те часы швейцарские?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>時計<rt>とけい</rt></ruby>です。",
            translation: "Bu mening soatim.",
          },
          {
            jp: "あの <ruby>時計<rt>とけい</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi soat kimniki?",
          },
          {
            jp: "その <ruby>時計<rt>とけい</rt></ruby>は スイスの ですか。",
            translation: "Shu soat Shveysariyanikimi?",
          },
        ],
      },
    },
    {
      id: 66,
      lesson: 2,
      japanese: "<ruby>傘<rt>かさ</rt></ruby>",
      cleanWord: "傘",
      translations: { ru: "зонт", uz: "soyabon" },
      exampleSentences: {
        ru: {
          jp: "あのう、それは <ruby>私<rt>わたし</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>です。あなたの じゃ ありません。<ruby>泥棒<rt>どろぼう</rt></ruby>！",
          translation: "Э-э, простите, это мой зонт. Не ваш. Вор!",
          grammarInfo:
            "【Разбор】\n\n1. あのう — междометие для привлечения внимания.\n\n2. あなたの じゃ ありません — «не ваш» (существительное 傘 опущено).\n\n3. 泥棒 (dorobou) — «вор».\n\n💡 Кража одинаковых прозрачных зонтиков в Японии — национальная проблема.",
        },
        uz: {
          jp: "あのう、それは <ruby>私<rt>わたし</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>です。あなたの じゃ ありません。<ruby>泥棒<rt>どろぼう</rt></ruby>！",
          translation:
            "M-m, kechirasiz, bu mening soyabonim. Sizniki emas. O'g'ri!",
          grammarInfo:
            "【Tahlil】\n\n1. あのう — e'tiborni tortish uchun ishlatiladigan undov so'z.\n\n2. あなたの じゃ ありません — «sizniki emas» (傘 so'zi tushirib qoldirilgan).\n\n3. 泥棒 (dorobou) — «o'g'ri».\n\n💡 Yaponiyada bir xil shaffof soyabonlarning o'g'irlanishi — milliy muammo.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот зонт — мой.",
          },
          {
            jp: "あの <ruby>傘<rt>かさ</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей вон тот зонт?",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>ですか。",
            translation: "Это зонт учителя?",
          },
        ],
        uz: [
          {
            jp: "この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu soyabon meniki.",
          },
          {
            jp: "あの <ruby>傘<rt>かさ</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi soyabon kimniki?",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>ですか。",
            translation: "Bu o'qituvchining soyabonimi?",
          },
        ],
      },
    },
    {
      id: 67,
      lesson: 2,
      japanese: "かばん",
      cleanWord: "かばん",
      translations: { ru: "сумка", uz: "sumka" },
      exampleSentences: {
        ru: {
          jp: "この かばんは グッチの かばんですか。…いいえ、１００<ruby>円<rt>えん</rt></ruby>の かばんです。",
          translation: "Эта сумка от Гуччи? …Нет, это сумка за 100 иен.",
          grammarInfo:
            "【Разбор】\n\n1. グッチの かばん — «сумка (от) Гуччи».\n\n2. １００円の かばん — «сумка (за) 100 иен».\n\n💡 かばん — общее слово для сумок, портфелей, рюкзаков.",
        },
        uz: {
          jp: "この かばんは グッチの かばんですか。…いいえ、１００<ruby>円<rt>えん</rt></ruby>の かばんです。",
          translation: "Bu sumka Gucchimi? ...Yo'q, bu 100 iyenlik sumka.",
          grammarInfo:
            "【Tahlil】\n\n1. グッチの かばん — «Gucci sumkasi».\n\n2. １００円の かばん — «100 iyenlik sumka».\n\n💡 かばん — sumka, portfel va ryukzaklar uchun umumiy so'z.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この かばんは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Эта сумка — моя.",
          },
          {
            jp: "あの かばんは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чья вон та сумка?",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の かばんです。",
            translation: "То — сумка учителя.",
          },
        ],
        uz: [
          {
            jp: "この かばんは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu sumka meniki.",
          },
          {
            jp: "あの かばんは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi sumka kimniki?",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の かばんです。",
            translation: "U o'qituvchining sumkasi.",
          },
        ],
      },
    },
    {
      id: 68,
      lesson: 2,
      japanese: "CD",
      cleanWord: "CD",
      translations: { ru: "CD-диск", uz: "CD (kompakt-disk)" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>英語<rt>えいご</rt></ruby>の CDじゃ ありません。お<ruby>経<rt>きょう</rt></ruby>の CDです。",
          translation:
            "Это не диск с английским. Это CD с буддийскими мантрами.",
          grammarInfo:
            "【Разбор】\n\n1. 英語の CD — «CD по английскому».\n\n2. じゃ ありません — отрицание.\n\n3. お経の CD — «CD мантр (сутр)» (okyou).\n\n💡 В Японии до сих пор активно покупают и слушают физические CD-диски.",
        },
        uz: {
          jp: "これは <ruby>英語<rt>えいご</rt></ruby>の CDじゃ ありません。お<ruby>経<rt>きょう</rt></ruby>の CDです。",
          translation: "Bu ingliz tili diski emas. Bu buddizm sutralari CD si.",
          grammarInfo:
            "【Tahlil】\n\n1. 英語の CD — «ingliz tili CDsi».\n\n2. じゃ ありません — inkor.\n\n3. お経の CD — «sutralar CDsi» (okyou).\n\n💡 Yaponiyada hozirgacha jismoniy CD disklar faol sotib olinadi va eshitiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の CDです。",
            translation: "Это CD по английскому языку.",
          },
          {
            jp: "この CDは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот CD — мой.",
          },
          {
            jp: "その CDは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей тот CD?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の CDです。",
            translation: "Bu ingliz tili CDsi.",
          },
          {
            jp: "この CDは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu CD meniki.",
          },
          {
            jp: "その CDは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu CD kimniki?",
          },
        ],
      },
    },
    {
      id: 69,
      lesson: 2,
      japanese: "テレビ",
      cleanWord: "テレビ",
      translations: { ru: "телевизор", uz: "televizor" },
      exampleSentences: {
        ru: {
          jp: "あれは テレビじゃ ありません。ゲームの モニターです。",
          translation: "То вдали — не телевизор. Это монитор для игр.",
          grammarInfo:
            "【Разбор】\n\n1. あれは — «то» (вдали).\n\n2. テレビじゃ ありません — «не телевизор».\n\n3. ゲームの モニター — «монитор (для) игр».\n\n💡 Японское слово テレビ (terebi) образовано от английского television.",
        },
        uz: {
          jp: "あれは テレビじゃ ありません。ゲームの モニターです。",
          translation: "Anavi televizor emas. O'yin monitori.",
          grammarInfo:
            "【Tahlil】\n\n1. あれは — «anavi» (uzoqda).\n\n2. テレビじゃ ありません — «televizor emas».\n\n3. ゲームの モニター — «o'yin monitori».\n\n💡 Yaponcha テレビ (terebi) so'zi inglizcha television so'zidan kelib chiqqan.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この テレビは <ruby>日本<rt>にほん</rt></ruby>の です。",
            translation: "Этот телевизор — японский.",
          },
          {
            jp: "あの テレビは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Вон тот телевизор — мой.",
          },
          {
            jp: "あれは テレビですか。",
            translation: "То вдали — телевизор?",
          },
        ],
        uz: [
          {
            jp: "この テレビは <ruby>日本<rt>にほん</rt></ruby>の です。",
            translation: "Bu televizor yaponlarniki.",
          },
          {
            jp: "あの テレビは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Anavi televizor meniki.",
          },
          {
            jp: "あれは テレビですか。",
            translation: "Anavi televizormi?",
          },
        ],
      },
    },
    {
      id: 70,
      lesson: 2,
      japanese: "ラジオ",
      cleanWord: "ラジオ",
      translations: { ru: "радио", uz: "radio" },
      exampleSentences: {
        ru: {
          jp: "この ラジオは <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。<ruby>宇宙人<rt>うちゅうじん</rt></ruby>の です。",
          translation: "Это радио — не мое. Оно принадлежит пришельцам.",
          grammarInfo:
            "【Разбор】\n\n1. 私の じゃ ありません — «не моё».\n\n2. 宇宙人の です — «(оно) пришельцев» (uchuujin).\n\n💡 В Японии радио остаётся важным средством оповещения при землетрясениях.",
        },
        uz: {
          jp: "この ラジオは <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。<ruby>宇宙人<rt>うちゅうじん</rt></ruby>の です。",
          translation: "Bu radio — meniki emas. U o'zga sayyoraliklarniki.",
          grammarInfo:
            "【Tahlil】\n\n1. 私の じゃ ありません — «meniki emas».\n\n2. 宇宙人の です — «(u) o'zga sayyoraliklarniki» (uchuujin).\n\n💡 Yaponiyada radio zilzilalar paytida ogohlantirishning muhim vositasi bo'lib qolmoqda.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この ラジオは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Это радио — мое.",
          },
          {
            jp: "それは <ruby>日本<rt>にほん</rt></ruby>の ラジオですか。",
            translation: "Это японское радио?",
          },
          {
            jp: "あれは <ruby>誰<rt>だれ</rt></ruby>の ラジオですか。",
            translation: "Чье вон то радио?",
          },
        ],
        uz: [
          {
            jp: "この ラジオは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu radio meniki.",
          },
          {
            jp: "それは <ruby>日本<rt>にほん</rt></ruby>の ラジオですか。",
            translation: "Bu yapon radiosimi?",
          },
          {
            jp: "あれは <ruby>誰<rt>だれ</rt></ruby>の ラジオですか。",
            translation: "Anavi kimning radiosi?",
          },
        ],
      },
    },
    {
      id: 71,
      lesson: 2,
      japanese: "カメラ",
      cleanWord: "カメラ",
      translations: { ru: "фотоаппарат", uz: "fotoapparat" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>人間<rt>にんげん</rt></ruby>の カメラじゃ ありません。<ruby>犬<rt>いぬ</rt></ruby>の カメラです。",
          translation:
            "Это фотоаппарат не для людей. Это камера для собаки (на ошейнике).",
          grammarInfo:
            "【Разбор】\n\n1. 人間の — «(для) людей / человека» (ningen).\n\n2. 犬の カメラ — «камера (для) собаки» (inu).\n\n💡 Японские бренды (Canon, Nikon, Sony) доминируют на мировом рынке камер.",
        },
        uz: {
          jp: "これは <ruby>人間<rt>にんげん</rt></ruby>の カメラじゃ ありません。<ruby>犬<rt>いぬ</rt></ruby>の カメラです。",
          translation:
            "Bu odamlar uchun fotoapparat emas. Bu itlar kamerasi (bo'yinturuqdagi).",
          grammarInfo:
            "【Tahlil】\n\n1. 人間の — «odamlar (uchun)» (ningen).\n\n2. 犬の カメラ — «it (uchun) kamera» (inu).\n\n💡 Yapon brendlari (Canon, Nikon, Sony) jahon kameralar bozorida yetakchilik qiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の カメラです。",
            translation: "Это японская камера.",
          },
          {
            jp: "その カメラは あなたの ですか。",
            translation: "Та камера — ваша?",
          },
          {
            jp: "あの カメラは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Вон та камера — учителя.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の カメラです。",
            translation: "Bu yapon kamerasi.",
          },
          {
            jp: "その カメラは あなたの ですか。",
            translation: "Shu kamera siznikimi?",
          },
          {
            jp: "あの カメラは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Anavi kamera o'qituvchiniki.",
          },
        ],
      },
    },
    {
      id: 72,
      lesson: 2,
      japanese: "コンピューター",
      cleanWord: "コンピューター",
      translations: { ru: "компьютер", uz: "kompyuter" },
      exampleSentences: {
        ru: {
          jp: "これは アップルの コンピューターじゃ ありません。ポテトの コンピューターです。",
          translation:
            "Это не компьютер Apple (Яблоко). Это компьютер Potato (Картошка).",
          grammarInfo:
            "【Разбор】\n\n1. アップルの — «от (компании) Apple».\n\n2. ポテトの — «от (компании) Potato» (пародия).\n\n💡 Японцы часто называют ноутбуки словом パソコン (pasokon) — сокращение от personal computer.",
        },
        uz: {
          jp: "これは アップルの コンピューターじゃ ありません。ポテトの コンピューターです。",
          translation:
            "Bu Apple (Olma) kompyuteri emas. Bu Potato (Kartoshka) kompyuteri.",
          grammarInfo:
            "【Tahlil】\n\n1. アップルの — «Apple (kompaniyasi)ning».\n\n2. ポテトの — «Potato (kompaniyasi)ning» (parodiya).\n\n💡 Yaponlar noutbuklarni ko'pincha パソコン (pasokon) — personal computer so'zining qisqartmasi bilan atashadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この コンピューターは アメリカの です。",
            translation: "Этот компьютер — американский.",
          },
          {
            jp: "それは コンピューターの <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Это книга о компьютерах?",
          },
          {
            jp: "あの コンピューターは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей вон тот компьютер?",
          },
        ],
        uz: [
          {
            jp: "この コンピューターは アメリカの です。",
            translation: "Bu kompyuter Amerikaniki.",
          },
          {
            jp: "それは コンピューターの <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Bu kompyuterlar haqidagi kitobmi?",
          },
          {
            jp: "あの コンピューターは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi kompyuter kimniki?",
          },
        ],
      },
    },
    {
      id: 73,
      lesson: 2,
      japanese: "<ruby>車<rt>くるま</rt></ruby>",
      cleanWord: "車",
      translations: { ru: "машина", uz: "mashina" },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>車<rt>くるま</rt></ruby>は フェラーリですか。…いいえ、トラクターです。",
          translation: "Вон та машина — Феррари? …Нет, трактор.",
          grammarInfo:
            "【Разбор】\n\n1. あの 車は — «вон та машина».\n\n2. フェラーリですか — «Феррари?».\n\n3. トラクターです — «(это) трактор».\n\n💡 В Японии невозможно купить машину, если вы не докажете полиции, что у вас есть парковочное место.",
        },
        uz: {
          jp: "あの <ruby>車<rt>くるま</rt></ruby>は フェラーリですか。…いいえ、トラクターです。",
          translation: "Anavi mashina — Ferrarimi? …Yo'q, traktor.",
          grammarInfo:
            "【Tahlil】\n\n1. あの 車は — «anavi mashina».\n\n2. フェラーリですか — «Ferrarimi?».\n\n3. トラクターです — «(bu) traktor».\n\n💡 Yaponiyada politsiyaga o'zingizning avtoturargohingiz borligini isbotlamaguningizcha mashina sotib ololmaysiz.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の <ruby>車<rt>くるま</rt></ruby>です。",
            translation: "Это японский автомобиль.",
          },
          {
            jp: "その <ruby>車<rt>くるま</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чья та машина?",
          },
          {
            jp: "あの <ruby>車<rt>くるま</rt></ruby>も ドイツの ですか。",
            translation: "Вон та машина тоже немецкая?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の <ruby>車<rt>くるま</rt></ruby>です。",
            translation: "Bu yapon mashinasi.",
          },
          {
            jp: "その <ruby>車<rt>くるま</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu mashina kimniki?",
          },
          {
            jp: "あの <ruby>車<rt>くるま</rt></ruby>も ドイツの ですか。",
            translation: "Anavi mashina ham Germaniyanikimi?",
          },
        ],
      },
    },
    {
      id: 74,
      lesson: 2,
      japanese: "<ruby>机<rt>つくえ</rt></ruby>",
      cleanWord: "机",
      translations: { ru: "стол", uz: "stol" },
      exampleSentences: {
        ru: {
          jp: "この <ruby>机<rt>つくえ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の です！",
          translation: "Этот стол — не учителя. Он мой!",
          grammarInfo:
            "【Разбор】\n\n1. 先生の じゃ ありません — «не учителя».\n\n2. 私の です — «он мой» (существительное опущено).\n\n💡 机 (tsukue) — это именно письменный, рабочий или школьный стол. Обеденный стол называют テーブル (teeburu).",
        },
        uz: {
          jp: "この <ruby>机<rt>つくえ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の です！",
          translation: "Bu stol — o'qituvchiniki emas. U meniki!",
          grammarInfo:
            "【Tahlil】\n\n1. 先生の じゃ ありません — «o'qituvchini emas».\n\n2. 私の です — «u meniki» (ot tushirib qoldirilgan).\n\n💡 机 (tsukue) — bu aynan yozuv, ish yoki maktab stoli. Ovqatlanish stoli テーブル (teeburu) deyiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>机<rt>つくえ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот стол — мой.",
          },
          {
            jp: "あれは <ruby>先生<rt>せんせい</rt></ruby>の <ruby>机<rt>つくえ</rt></ruby>です。",
            translation: "Вон то — стол учителя.",
          },
          {
            jp: "その <ruby>机<rt>つくえ</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей тот стол?",
          },
        ],
        uz: [
          {
            jp: "この <ruby>机<rt>つくえ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu stol meniki.",
          },
          {
            jp: "あれは <ruby>先生<rt>せんせい</rt></ruby>の <ruby>机<rt>つくえ</rt></ruby>です。",
            translation: "Anavi — o'qituvchining stoli.",
          },
          {
            jp: "その <ruby>机<rt>つくえ</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu stol kimniki?",
          },
        ],
      },
    },
    {
      id: 75,
      lesson: 2,
      japanese: "いす",
      cleanWord: "いす",
      translations: { ru: "стул", uz: "stul" },
      exampleSentences: {
        ru: {
          jp: "その いすは <ruby>王様<rt>おうさま</rt></ruby>の いすです。あなたの じゃ ありません。",
          translation: "Тот стул (у тебя) — трон короля. Не твой.",
          grammarInfo:
            "【Разбор】\n\n1. 王様の — «(принадлежащий) королю» (ousama).\n\n2. あなたの — «твой».\n\n💡 Традиционно в Японии сидели прямо на полу, стулья (いす) вошли в массовый обиход позже.",
        },
        uz: {
          jp: "その いすは <ruby>王様<rt>おうさま</rt></ruby>の いすです。あなたの じゃ ありません。",
          translation: "U stul — qirolning taxti. Seniki emas.",
          grammarInfo:
            "【Tahlil】\n\n1. 王様の — «qirolning» (ousama).\n\n2. あなたの — «seniki».\n\n💡 An'anaviy Yaponiyada odamlar to'g'ridan-to'g'ri polda o'tirishgan, stullar (いす) keyinchalik ommaviy muomalaga kirgan.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "その いすは あなたの ですか。",
            translation: "Тот стул — твой?",
          },
          {
            jp: "あの いすは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Вон тот стул — учителя.",
          },
          {
            jp: "この いすは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот стул — мой.",
          },
        ],
        uz: [
          {
            jp: "その いすは あなたの ですか。",
            translation: "Shu stul siznikimi?",
          },
          {
            jp: "あの いすは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Anavi stul o'qituvchiniki.",
          },
          {
            jp: "この いすは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu stul meniki.",
          },
        ],
      },
    },
    {
      id: 76,
      lesson: 2,
      japanese: "チョコレート",
      cleanWord: "チョコレート",
      translations: { ru: "шоколад", uz: "shokolad" },
      exampleSentences: {
        ru: {
          jp: "この チョコレートは お<ruby>菓子<rt>かし</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>薬<rt>くすり</rt></ruby>です。",
          translation:
            "Этот шоколад — не сладость. Это моё лекарство (от стресса).",
          grammarInfo:
            "【Разбор】\n\n1. お菓子じゃ ありません — «не сладость / не снек» (okashi).\n\n2. 薬です — «лекарство» (kusuri).\n\n💡 14 февраля в Японии именно женщины дарят шоколад мужчинам! Это огромная индустрия.",
        },
        uz: {
          jp: "この チョコレートは お<ruby>菓子<rt>かし</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>薬<rt>くすり</rt></ruby>です。",
          translation:
            "Bu shokolad — shirinlik emas. Bu mening dorim (stressga qarshi).",
          grammarInfo:
            "【Tahlil】\n\n1. お菓子じゃ ありません — «shirinlik emas» (okashi).\n\n2. 薬です — «dori» (kusuri).\n\n💡 Yaponiyada 14-fevralda aynan ayollar erkaklarga shokolad sovg'a qilishadi! Bu ulkan sanoatdir.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは スイスの チョコレートです。",
            translation: "Это швейцарский шоколад.",
          },
          {
            jp: "その チョコレートは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Тот шоколад — мой.",
          },
          {
            jp: "あの チョコレートは <ruby>先生<rt>せんせい</rt></ruby>の ですか。",
            translation: "Вон тот шоколад — учителя?",
          },
        ],
        uz: [
          {
            jp: "これは スイスの チョコレートです。",
            translation: "Bu Shveysariya shokoladi.",
          },
          {
            jp: "その チョコレートは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Shu shokolad meniki.",
          },
          {
            jp: "あの チョコレートは <ruby>先生<rt>せんせい</rt></ruby>の ですか。",
            translation: "Anavi shokolad o'qituvchinikimi?",
          },
        ],
      },
    },
    {
      id: 77,
      lesson: 2,
      japanese: "コーヒー",
      cleanWord: "コーヒー",
      translations: { ru: "кофе", uz: "kofe" },
      exampleSentences: {
        ru: {
          jp: "これは コーヒーじゃ ありません。<ruby>泥水<rt>どろみず</rt></ruby>です。",
          translation: "Это не кофе. Это грязная вода.",
          grammarInfo:
            "【Разбор】\n\n1. コーヒーじゃ ありません — «не кофе».\n\n2. 泥水です — «грязная вода» (doromizu).\n\n💡 Горячий кофе в Японии продается на каждом углу в железных банках прямо в торговых автоматах.",
        },
        uz: {
          jp: "これは コーヒーじゃ ありません。<ruby>泥水<rt>どろみず</rt></ruby>です。",
          translation: "Bu kofe emas. Bu loyqa suv.",
          grammarInfo:
            "【Tahlil】\n\n1. コーヒーじゃ ありません — «kofe emas».\n\n2. 泥水です — «loyqa suv» (doromizu).\n\n💡 Yaponiyada har bir burchakda avtomat-do'konlardan temir bankalarda qaynoq kofe xarid qilish mumkin.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ブラジルの コーヒーです。",
            translation: "Это кофе из Бразилии.",
          },
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の コーヒーです。",
            translation: "Это мой кофе.",
          },
          { jp: "コーヒーですか。", translation: "Это кофе?" },
        ],
        uz: [
          {
            jp: "ブラジルの コーヒーです。",
            translation: "Bu Braziliya kofesi.",
          },
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の コーヒーです。",
            translation: "Bu mening kofem.",
          },
          { jp: "コーヒーですか。", translation: "Kofemi?" },
        ],
      },
    },
    {
      id: 78,
      lesson: 2,
      japanese: "お<ruby>土産<rt>みやげ</rt></ruby>",
      cleanWord: "お土産",
      translations: { ru: "сувенир", uz: "sovg'a" },
      exampleSentences: {
        ru: {
          jp: "これは パリの お<ruby>土産<rt>みやげ</rt></ruby>ですか。…いいえ、スーパーの チョコレートです。",
          translation: "Это сувенир из Парижа? …Нет, шоколад из супермаркета.",
          grammarInfo:
            "【Разбор】\n\n1. パリの お土産 — «сувенир (из) Парижа».\n\n2. スーパーの — «из супермаркета».\n\n💡 Японцы всегда привозят お土産 (обычно съедобные) из поездок для своих коллег. Это негласный закон.",
        },
        uz: {
          jp: "これは パリの お<ruby>土産<rt>みやげ</rt></ruby>ですか。…いいえ、スーパーの チョコレートです。",
          translation:
            "Bu Parijdan sovg'ami? …Yo'q, supermarketdan olingan shokolad.",
          grammarInfo:
            "【Tahlil】\n\n1. パリの お土産 — «Parijdan (kelgan) sovg'a».\n\n2. スーパーの — «supermarketdan (olingan)».\n\n💡 Yaponlar safardan doim hamkasblari uchun お土産 (odatda yeyiladigan) olib kelishadi. Bu yozilmagan qonundir.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の お<ruby>土産<rt>みやげ</rt></ruby>です。",
            translation: "Это сувенир из Японии.",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>への お<ruby>土産<rt>みやげ</rt></ruby>です。",
            translation: "Это сувенир для учителя.",
          },
          {
            jp: "お<ruby>土産<rt>みやげ</rt></ruby>ですか。",
            translation: "Это сувенир?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の お<ruby>土産<rt>みやげ</rt></ruby>です。",
            translation: "Bu Yaponiyadan esdalik sovg'asi.",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>への お<ruby>土産<rt>みやげ</rt></ruby>です。",
            translation: "Bu o'qituvchi uchun sovg'a.",
          },
          {
            jp: "お<ruby>土産<rt>みやげ</rt></ruby>ですか。",
            translation: "Sovg'ami?",
          },
        ],
      },
    },
    {
      id: 79,
      lesson: 2,
      japanese: "<ruby>英語<rt>えいご</rt></ruby>",
      cleanWord: "英語",
      translations: { ru: "английский язык", uz: "ingliz tili" },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>英語<rt>えいご</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>ですか。…いいえ、ハリウッドの <ruby>俳優<rt>はいゆう</rt></ruby>です。",
          translation:
            "Вон тот человек — учитель английского? …Нет, голливудский актёр.",
          grammarInfo:
            "【Разбор】\n\n1. 英語の 先生 — «учитель английского языка».\n\n2. ハリウッドの 俳優 — «голливудский актёр» (haiyuu).\n\n💡 Японцы часто используют английские слова, но произносят их так (катаканой), что носители их не понимают.",
        },
        uz: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>英語<rt>えいご</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>ですか。…いいえ、ハリウッドの <ruby>俳優<rt>はいゆう</rt></ruby>です。",
          translation:
            "Anavi odam — ingliz tili o'qituvchisimi? …Yo'q, Gollivud aktyori.",
          grammarInfo:
            "【Tahlil】\n\n1. 英語の 先生 — «ingliz tili o'qituvchisi».\n\n2. ハリウッドの 俳優 — «Gollivud aktyori» (haiyuu).\n\n💡 Yaponlar inglizcha so'zlardan ko'p foydalanishadi, lekin ularni katakanada shunday talaffuz qilishadiki, inglizlar tushunmay qoladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>英語<rt>えいご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "Словарь английского языка.",
          },
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>ですか。",
            translation: "Это газета на английском?",
          },
          {
            jp: "<ruby>英語<rt>えいご</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "Учитель английского языка.",
          },
        ],
        uz: [
          {
            jp: "<ruby>英語<rt>えいご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "Ingliz tili lug'ati.",
          },
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>ですか。",
            translation: "Bu ingliz tilidagi gazetam?",
          },
          {
            jp: "<ruby>英語<rt>えいご</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "Ingliz tili o'qituvchisi.",
          },
        ],
      },
    },
    {
      id: 80,
      lesson: 2,
      japanese: "<ruby>日本語<rt>にほんご</rt></ruby>",
      cleanWord: "日本語",
      translations: { ru: "японский язык", uz: "yapon tili" },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>日本語<rt>にほんご</rt></ruby>は アニメの <ruby>日本語<rt>にほんご</rt></ruby>です。ビジネスの じゃ ありません。",
          translation: "Мой японский — это язык из аниме. А не для бизнеса.",
          grammarInfo:
            "【Разбор】\n\n1. アニメの 日本語 — «японский (взятый из) аниме».\n\n2. ビジネスの じゃ ありません — «не для бизнеса» (business).\n\n💡 Разговорный язык в аниме часто грубый или излишне эмоциональный. Использовать его с японским начальником — катастрофа.",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>日本語<rt>にほんご</rt></ruby>は アニメの <ruby>日本語<rt>にほんご</rt></ruby>です。ビジネスの じゃ ありません。",
          translation:
            "Mening yapon tilim — bu animedagi til. Biznes uchun emas.",
          grammarInfo:
            "【Tahlil】\n\n1. アニメの 日本語 — «animedan (olingan) yapon tili».\n\n2. ビジネスの じゃ ありません — «biznes uchun emas» (business).\n\n💡 Animedagi so'zlashuv tili ko'pincha qo'pol yoki o'ta emotsional bo'ladi. Yaponiyalik boshliq bilan gaplashganda uni ishlatish — fojiadir.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>日本語<rt>にほんご</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
            translation: "Книга по японскому языку.",
          },
          {
            jp: "これは <ruby>日本語<rt>にほんご</rt></ruby>の CDです。",
            translation: "Это CD по японскому языку.",
          },
          {
            jp: "<ruby>日本語<rt>にほんご</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "Это журнал на японском?",
          },
        ],
        uz: [
          {
            jp: "<ruby>日本語<rt>にほんご</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
            translation: "Yapon tili kitobi.",
          },
          {
            jp: "これは <ruby>日本語<rt>にほんご</rt></ruby>の CDです。",
            translation: "Bu yapon tili CD si.",
          },
          {
            jp: "<ruby>日本語<rt>にほんご</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "Yapon tilidagi jurnalmi?",
          },
        ],
      },
    },
    {
      id: 81,
      lesson: 2,
      japanese: "〜<ruby>語<rt>ご</rt></ruby>",
      cleanWord: "〜語",
      translations: { ru: "~ язык", uz: "~ tili" },
      exampleSentences: {
        ru: {
          jp: "それは <ruby>何語<rt>なにご</rt></ruby>ですか。…<ruby>猫語<rt>ねこご</rt></ruby>です。",
          translation: "Это на каком языке? …На кошачьем.",
          grammarInfo:
            "【Разбор】\n\n1. 何語 — «какой язык» (вопросительное слово 何 + 語).\n\n2. 猫語 — «кошачий язык» (neko - кошка).\n\n💡 Суффикс 語 можно прикрепить почти к любому существу или стране, чтобы обозначить язык.",
        },
        uz: {
          jp: "それは <ruby>何語<rt>なにご</rt></ruby>ですか。…<ruby>猫語<rt>ねこご</rt></ruby>です。",
          translation: "Bu qaysi tilda? …Mushuklar tilida.",
          grammarInfo:
            "【Tahlil】\n\n1. 何語 — «qaysi til» (so'roq so'zi 何 + 語).\n\n2. 猫語 — «mushuklar tili» (neko - mushuk).\n\n💡 語 qo'shimchasini tilni ifodalash uchun deyarli har qanday mavjudot yoki davlatga qo'shish mumkin.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ロシア<ruby>語<rt>ご</rt></ruby>です。",
            translation: "Русский язык.",
          },
          {
            jp: "ウズベク<ruby>語<rt>ご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "Словарь узбекского языка.",
          },
          {
            jp: "スペイン<ruby>語<rt>ご</rt></ruby>ですか。",
            translation: "Испанский язык?",
          },
        ],
        uz: [
          {
            jp: "ロシア<ruby>語<rt>ご</rt></ruby>です。",
            translation: "Rus tili.",
          },
          {
            jp: "ウズベク<ruby>語<rt>ご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "O'zbek tili lug'ati.",
          },
          {
            jp: "スペイン<ruby>語<rt>ご</rt></ruby>ですか。",
            translation: "Ispan tilimi?",
          },
        ],
      },
    },
    {
      id: 82,
      lesson: 2,
      japanese: "<ruby>何<rt>なん</rt></ruby>",
      cleanWord: "何",
      translations: { ru: "что?", uz: "nima?" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>何<rt>なん</rt></ruby>ですか。コーヒーですか、お<ruby>茶<rt>ちゃ</rt></ruby>ですか。",
          translation: "Что это? Кофе или чай?",
          grammarInfo:
            "【Разбор】\n\n1. 何ですか — «Что (это)?»\n\n2. コーヒーですか、お茶ですか — Выбор: «Кофе? Чай?».\n\n⚠️ Ошибка: читать как «nani desu ka». Перед です кандзи 何 читается строго как «なん» (nan).",
        },
        uz: {
          jp: "これは <ruby>何<rt>なん</rt></ruby>ですか。コーヒーですか、お<ruby>茶<rt>ちゃ</rt></ruby>ですか。",
          translation: "Bu nima? Kofemi yoki choymi?",
          grammarInfo:
            "【Tahlil】\n\n1. 何ですか — «(Bu) nima?»\n\n2. コーヒーですか、お茶ですか — Tanlov: «Kofemi? Choymi?».\n\n⚠️ Xato: «nani desu ka» deb o'qish. です dan oldin 何 iyeroglifi doim «なん» (nan) deb o'qiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "О чём эта книга?",
          },
          {
            jp: "あれは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Что вон там?",
          },
          {
            jp: "その かばんは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Что это за сумка?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Bu nima haqidagi kitob?",
          },
          {
            jp: "あれは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Anavi nima?",
          },
          {
            jp: "その かばんは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Shu qanday sumka?",
          },
        ],
      },
    },
    {
      id: 83,
      lesson: 2,
      japanese: "そう",
      cleanWord: "そう",
      translations: { ru: "так, да", uz: "shunday, ha" },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は スパイですか。…はい、そうです。",
          translation: "Вон тот человек — шпион? …Да, всё так.",
          grammarInfo:
            "【Разбор】\n\n1. はい — «да».\n\n2. そうです — «так (и есть)».\n\n💡 Японцы часто отвечают на вопрос с существительным краткой фразой «はい、そうです» вместо того, чтобы повторять всё слово («Да, он шпион»).",
        },
        uz: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は スパイですか。…はい、そうです。",
          translation: "Anavi odam — josusmi? …Ha, shunday.",
          grammarInfo:
            "【Tahlil】\n\n1. はい — «ha».\n\n2. そうです — «shunday».\n\n💡 Yaponlar ot qatnashgan so'roq gaplarga butun so'zni qaytarmasdan, qisqacha «はい、そうです» deb javob berishadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "はい、そうです。", translation: "Да, это так." },
          { jp: "そうですか。", translation: "Вот как. Понятно." },
          {
            jp: "ミラーさんですか。…はい、そうです。",
            translation: "Вы Миллер? ...Да.",
          },
        ],
        uz: [
          { jp: "はい、そうです。", translation: "Ha, shunday." },
          { jp: "そうですか。", translation: "Shunaqami. Tushunarli." },
          {
            jp: "ミラーさんですか。…はい、そうです。",
            translation: "Siz Millermisiz? ...Ha, shunday.",
          },
        ],
      },
    },
    {
      id: 84,
      lesson: 2,
      japanese: "<ruby>違<rt>ちが</rt></ruby>います。",
      cleanWord: "違います。",
      translations: { ru: "нет, это не так", uz: "yo'q, unday emas" },
      exampleSentences: {
        ru: {
          jp: "あなたは バットマンですか。…いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
          translation: "Вы Бэтмен? …Нет, это не так.",
          grammarInfo:
            "【Разбор】\n\n1. いいえ — «нет».\n\n2. 違います — дословно глагол «отличается». Используется в значении «вы не правы / это не так».\n\n💡 Это самый естественный способ отрицательно ответить на вопрос «А это Б?», не повторяя само слово.",
        },
        uz: {
          jp: "あなたは バットマンですか。…いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
          translation: "Siz Betmenmisiz? …Yo'q, unday emas.",
          grammarInfo:
            "【Tahlil】\n\n1. いいえ — «yo'q».\n\n2. 違います — so'zma-so'z «farq qiladi» degan fe'l. «Siz nohaqsiz / unday emas» ma'nosida ishlatiladi.\n\n💡 Bu «A bu Bmi?» degan savolga otni qaytarmasdan inkor javob berishning eng tabiiy usuli.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Нет, вы ошибаетесь.",
          },
          {
            jp: "医者ですか。…いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Вы врач? ...Нет, это не так.",
          },
          {
            jp: "その 傘は わたしのです。…<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Тот зонт мой. ...Нет, не ваш.",
          },
        ],
        uz: [
          {
            jp: "いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Yo'q, noto'g'ri.",
          },
          {
            jp: "医者ですか。…いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Shifokormisiz? ...Yo'q, unday emas.",
          },
          {
            jp: "その 傘は わたしのです。…<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Shu soyabon meniki. ...Yo'q, noto'g'ri.",
          },
        ],
      },
    },
    {
      id: 85,
      lesson: 2,
      japanese: "そうですか。",
      cleanWord: "そうですか。",
      translations: { ru: "вот как", uz: "shunaqami" },
      exampleSentences: {
        ru: {
          jp: "この カメラは １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。…そうですか。さようなら。",
          translation: "Эта камера стоит миллион иен. …Вот как. До свидания.",
          grammarInfo:
            "【Разбор】\n\n1. そうですか — фраза-реакция. Выражает то, что говорящий принял новую информацию.\n\n2. さようなら — «до свидания».\n\n💡 Интонация в «そうですか» в этом значении падает ВНИЗ, а не идёт вверх (как в обычном вопросе).",
        },
        uz: {
          jp: "この カメラは １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。…そうですか。さようなら。",
          translation: "Bu kamera 1 million iyen turadi. …Shunaqami. Xayr.",
          grammarInfo:
            "【Tahlil】\n\n1. そうですか — reaksiya bildirish iborasi. Gapiruvchi yangi ma'lumotni qabul qilganini bildiradi.\n\n2. さようなら — «xayr».\n\n💡 Bu ma'noda «そうですか» iborasining intonatsiyasi (oddiy so'roq gapdan farqli o'laroq) PASTGA tushadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "あ、そうですか。", translation: "А, понятно." },
          {
            jp: "そうですか。ありがとうございます。",
            translation: "Вот как. Спасибо.",
          },
          {
            jp: "わたしは 医者です。…そうですか。",
            translation: "Я врач. ...Понятно.",
          },
        ],
        uz: [
          { jp: "あ、そうですか。", translation: "A, tushunarli." },
          {
            jp: "そうですか。ありがとうございます。",
            translation: "Shunaqami. Rahmat.",
          },
          {
            jp: "わたしは 医者です。…そうですか。",
            translation: "Men shifokorman. ...Tushunarli.",
          },
        ],
      },
    },
    {
      id: 86,
      lesson: 2,
      japanese: "あのう",
      cleanWord: "あのう",
      translations: { ru: "м-м, простите", uz: "m-m, kechirasiz" },
      exampleSentences: {
        ru: {
          jp: "あのう、この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。あなたの じゃ ありません。",
          translation: "Э-э-э... простите, но это мой зонт. Не ваш.",
          grammarInfo:
            "【Разбор】\n\n1. あのう — междометие, выражающее лёгкое замешательство.\n\n💡 Японцы используют «あのう», чтобы смягчить начало разговора, когда хотят возразить или обратиться к незнакомцу. Это звучит намного вежливее, чем резкое вступление.",
        },
        uz: {
          jp: "あのう、この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。あなたの じゃ ありません。",
          translation:
            "M-m-m... kechirasiz, bu mening soyabonim. Sizniki emas.",
          grammarInfo:
            "【Tahlil】\n\n1. あのう — biroz ikkilanishni bildiruvchi undov so'z.\n\n💡 Yaponlar notanish odamga murojaat qilishda yoki e'tiroz bildirishda suhbat boshini yumshatish uchun «あのう» dan foydalanishadi. Bu to'g'ridan-to'g'ri gapirishdan ko'ra ancha xushmuomala eshitiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "あのう、すみません。", translation: "М-м... извините." },
          {
            jp: "あのう、ミラーさんですか。",
            translation: "Э-э... вы господин Миллер?",
          },
          {
            jp: "あのう、これは お土産です。",
            translation: "Э-э... вот, это сувенир.",
          },
        ],
        uz: [
          {
            jp: "あのう、すみません。",
            translation: "M-m... kechirasiz.",
          },
          {
            jp: "あのう、ミラーさんですか。",
            translation: "M-m... siz Millermisiz?",
          },
          {
            jp: "あのう、これは お土産です。",
            translation: "M-m... bu esdalik sovg'asi.",
          },
        ],
      },
    },
    {
      id: 87,
      lesson: 2,
      japanese: "えっ",
      cleanWord: "えっ",
      translations: { ru: "что?!", uz: "nima?!" },
      exampleSentences: {
        ru: {
          jp: "わたしは ７０<ruby>歳<rt>さい</rt></ruby>です。…えっ？！",
          translation: "Мне 70 лет. ...Что?!",
          grammarInfo:
            "【Разбор】\n\n1. えっ — междометие удивления, произносится отрывисто (маленькая «tsu» на конце означает резкую остановку звука).\n\n💡 Классическая реакция в аниме, когда герой осознаёт, что совершил фатальную ошибку или услышал шокирующий факт.",
        },
        uz: {
          jp: "わたしは ７０<ruby>歳<rt>さい</rt></ruby>です。…えっ？！",
          translation: "Men 70 yoshdaman. ...Nima?!",
          grammarInfo:
            "【Tahlil】\n\n1. えっ — hayratni bildiruvchi undov so'z, qisqa talaffuz qilinadi (oxiridagi kichik «tsu» tovushning keskin to'xtashini bildiradi).\n\n💡 Animelarda qahramon mudhish xatoga yo'l qo'yganini yoki shok xabarni eshitganini anglab yetgandagi klassik reaksiya.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "えっ、本当ですか。", translation: "Что, правда?" },
          { jp: "えっ、わたしですか。", translation: "А? Это вы мне?" },
          { jp: "えっ、そうですか。", translation: "Да неужели?" },
        ],
        uz: [
          { jp: "えっ、本当ですか。", translation: "Nima, rostdanmi?" },
          { jp: "えっ、わたしですか。", translation: "A, menmi?" },
          {
            jp: "えっ、そうですか。",
            translation: "Nahotki shunday bo'lsa?",
          },
        ],
      },
    },
    {
      id: 88,
      lesson: 2,
      japanese: "どうぞ。",
      cleanWord: "どうぞ。",
      translations: { ru: "пожалуйста", uz: "marhamat" },
      exampleSentences: {
        ru: {
          jp: "わたしの <ruby>名刺<rt>めいし</rt></ruby>です。どうぞ。…えっ、ヤクザですか。",
          translation: "Вот моя визитка. Пожалуйста. ...Что, якудза?!",
          grammarInfo:
            "【Разбор】\n\n1. どうぞ — универсальное слово для того, чтобы предложить кому-то вещь, уступить место или пригласить войти.\n\n💡 Не путать с «пожалуйста», когда вы ПРОСИТЕ о чём-то (для этого используется お願いします - onegaishimasu).",
        },
        uz: {
          jp: "わたしの <ruby>名刺<rt>めいし</rt></ruby>です。どうぞ。…えっ、ヤクザですか。",
          translation: "Mening vizitkam. Marhamat. ...Nima, yakuzamisiz?!",
          grammarInfo:
            "【Tahlil】\n\n1. どうぞ — kimgadir biror narsa taklif qilish, joy berish yoki kirishga taklif qilish uchun universal so'z.\n\n💡 Birovdan biror narsa SO'RAGANDAGI «iltimos» bilan adashtirmang (buning uchun お願いします - onegaishimasu ishlatiladi).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "どうぞ。",
            translation: "Пожалуйста (возьмите/проходите).",
          },
          {
            jp: "これ、どうぞ。",
            translation: "Вот это, пожалуйста (возьмите).",
          },
          {
            jp: "お茶、どうぞ。",
            translation: "Чай, пожалуйста (угощайтесь).",
          },
        ],
        uz: [
          { jp: "どうぞ。", translation: "Marhamat (oling/kiring)." },
          { jp: "これ、どうぞ。", translation: "Buni oling, marhamat." },
          { jp: "お茶、どうぞ。", translation: "Choy iching, marhamat." },
        ],
      },
    },
    {
      id: 89,
      lesson: 2,
      japanese: "どうも ありがとう ございます",
      cleanWord: "どうも ありがとう ございます",
      translations: { ru: "большое спасибо", uz: "katta rahmat" },
      exampleSentences: {
        ru: {
          jp: "これ、１００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。どうぞ。…どうも ありがとう ございます！",
          translation: "Вот 1 миллион иен. Пожалуйста. ...Огромное спасибо!!",
          grammarInfo:
            "【Разбор】\n\n1. どうも — «очень».\n\n2. ありがとうございます — «спасибо» (вежливая форма).\n\n💡 Если сказать просто «ありがとう», это будет звучать по-дружески (невежливо по отношению к старшим).",
        },
        uz: {
          jp: "これ、１００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。どうぞ。…どうも ありがとう ございます！",
          translation: "Mana 1 million iyen. Marhamat. ...Katta rahmat!!",
          grammarInfo:
            "【Tahlil】\n\n1. どうも — «juda / katta».\n\n2. ありがとうございます — «rahmat» (hurmat shakli).\n\n💡 Shunchaki «ありがとう» deyish do'stona eshitiladi (o'zidan kattalarga nisbatan hurmatsizlik bo'lishi mumkin).",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "どうも。", translation: "Спасибо. (коротко)" },
          {
            jp: "ありがとうございます。",
            translation: "Спасибо (вежливо).",
          },
          {
            jp: "どうも ありがとうございます。",
            translation: "Большое спасибо (очень вежливо).",
          },
        ],
        uz: [
          { jp: "どうも。", translation: "Rahmat. (qisqa)" },
          {
            jp: "ありがとうございます。",
            translation: "Rahmat (xushmuomala).",
          },
          {
            jp: "どうも ありがとうございます。",
            translation: "Katta rahmat (juda xushmuomala).",
          },
        ],
      },
    },
    {
      id: 90,
      lesson: 2,
      japanese: "あ",
      cleanWord: "あ",
      translations: { ru: "ах!", uz: "a!" },
      exampleSentences: {
        ru: {
          jp: "あ、わたしの <ruby>車<rt>くるま</rt></ruby>！…あなたの じゃ ありません！",
          translation: "Ах, моя машина! ...Она не твоя! (крик вслед угонщику)",
          grammarInfo:
            "【Разбор】\n\n1. あ — междометие. Произносится, когда человек внезапно что-то замечает или вспоминает.\n\n💡 В японском очень много коротких эмоциональных вскриков, и «あ» — самый частый из них.",
        },
        uz: {
          jp: "あ、わたしの <ruby>車<rt>くるま</rt></ruby>！…あなたの じゃ ありません！",
          translation:
            "A, mening mashinam! ...U seniki emas! (o'g'rining ortidan qichqiriq)",
          grammarInfo:
            "【Tahlil】\n\n1. あ — undov so'z. Odam to'satdan biror narsani payqab qolganda yoki eslaganda aytiladi.\n\n💡 Yapon tilida qisqa hissiy undovlar juda ko'p bo'lib, «あ» shulardan eng ko'p ishlatiladiganidir.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "あ、そうですか。", translation: "А, вот как." },
          { jp: "あ、ミラーさん。", translation: "О, господин Миллер." },
          { jp: "あ、すみません。", translation: "Ой, извините." },
        ],
        uz: [
          { jp: "あ、そうですか。", translation: "A, shunaqami." },
          { jp: "あ、ミラーさん。", translation: "O, Miller janoblari." },
          { jp: "あ、すみません。", translation: "Voy, kechirasiz." },
        ],
      },
    },
    {
      id: 91,
      lesson: 2,
      japanese: "これから お<ruby>世話<rt>せわ</rt></ruby>に なります",
      cleanWord: "これから お世話に なります",
      translations: {
        ru: "надеюсь на поддержку",
        uz: "g'amxo'rligingizdan umidvorman",
      },
      exampleSentences: {
        ru: {
          jp: "わたしは <ruby>猫<rt>ねこ</rt></ruby>の タマです。これから お<ruby>世話<rt>せわ</rt></ruby>に なります。",
          translation:
            "Я кот по имени Тама. С надеждой на вашу поддержку (и корм).",
          grammarInfo:
            "【Разбор】\n\n1. これから — «с этого момента».\n\n2. お世話に なります — устоявшееся выражение «вручаю себя вашим заботам».\n\n💡 Эта фраза ОБЯЗАТЕЛЬНА, когда вы переезжаете к кому-то, поступаете на работу или въезжаете в новое жильё.",
        },
        uz: {
          jp: "わたしは <ruby>猫<rt>ねこ</rt></ruby>の タマです。これから お<ruby>世話<rt>せわ</rt></ruby>に なります。",
          translation:
            "Men Tama ismli mushukman. Bundan buyon g'amxo'rligingizdan umidvorman.",
          grammarInfo:
            "【Tahlil】\n\n1. これから — «bundan buyon».\n\n2. お世話に なります — «o'zimni sizning g'amxo'rligingizga topshiraman» degan qolip ibora.\n\n💡 Bu ibora kimgadir qo'shnichilikka ko'chib o'tganda, ishga kirganda yoki yangi uyga ko'chganda MAJBURIY aytilishi kerak.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これから お世話に なります。",
            translation: "Рассчитываю на вашу поддержку в будущем.",
          },
          {
            jp: "山田です。これから お世話に なります。",
            translation: "Я Ямада. Прошу любить и жаловать.",
          },
          {
            jp: "こちらこそ、これから お世話に なります。",
            translation: "И я тоже надеюсь на вашу поддержку.",
          },
        ],
        uz: [
          {
            jp: "これから お世話に なります。",
            translation: "Kelajakda qo'llab-quvvatlashingizdan umidvorman.",
          },
          {
            jp: "山田です。これから お世話に なります。",
            translation: "Men Yamada. G'amxo'rligingizdan umidvorman.",
          },
          {
            jp: "こちらこそ、これから お世話に なります。",
            translation: "Men ham qo'llab-quvvatlashingizdan umidvorman.",
          },
        ],
      },
    },
    {
      id: 92,
      lesson: 2,
      japanese: "こちらこそ よろしく お<ruby>願<rt>ねが</rt></ruby>いします",
      cleanWord: "こちらこそ よろしく お願いします",
      translations: {
        ru: "мне тоже очень приятно",
        uz: "men ham xursandman",
      },
      exampleSentences: {
        ru: {
          jp: "わたしは <ruby>宇宙人<rt>うちゅうじん</rt></ruby>です。よろしく お<ruby>願<rt>ねが</rt></ruby>いします。…こちらこそ よろしく お<ruby>願<rt>ねが</rt></ruby>いします。",
          translation:
            "Я инопланетянин. Рад знакомству. ...М-мне тоже очень приятно.",
          grammarInfo:
            "【Разбор】\n\n1. こちらこそ — «с моей стороны тоже» (ответ на приветствие).\n\n2. よろしく お願いします — вежливая просьба о хорошем отношении.\n\n💡 Японцы настолько привыкли к этой фразе, что отвечают ею почти на автомате в любой ситуации знакомства.",
        },
        uz: {
          jp: "わたしは <ruby>宇宙人<rt>うちゅうじん</rt></ruby>です。よろしく お<ruby>願<rt>ねが</rt></ruby>いします。…こちらこそ よろしく お<ruby>願<rt>ねが</rt></ruby>いします。",
          translation:
            "Men o'zga sayyoralikman. Tanishganimdan xursandman. ...M-men ham tanishganimdan xursandman.",
          grammarInfo:
            "【Tahlil】\n\n1. こちらこそ — «mening tarafimdan ham» (salomlashishga javob).\n\n2. よろしく お願いします — yaxshi munosabatda bo'lishni xushmuomalalik bilan so'rash.\n\n💡 Yaponlar bu iboraga shunchalik o'rganib qolishganki, tanishuvning har qanday holatida avtomatik ravishda shu javobni qaytarishadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "こちらこそ。", translation: "Мне тоже. (коротко)" },
          {
            jp: "こちらこそ よろしく。",
            translation: "Мне тоже приятно познакомиться.",
          },
          {
            jp: "こちらこそ どうぞ よろしく おねがいします。",
            translation: "И мне очень приятно познакомиться.",
          },
        ],
        uz: [
          { jp: "こちらこそ。", translation: "Men ham. (qisqa)" },
          {
            jp: "こちらこそ よろしく。",
            translation: "Men ham tanishganimdan xursandman.",
          },
          {
            jp: "こちらこそ どうぞ よろしく おねがいします。",
            translation: "Men ham tanishganimdan juda xursandman.",
          },
        ],
      },
    },
    {
      id: 47,
      lesson: 2,
      japanese: "これ",
      cleanWord: "これ",
      translations: { ru: "это (рядом)", uz: "bu (yaqinda)" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>水<rt>みず</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>涙<rt>なみだ</rt></ruby>です。",
          translation: "Это не вода. Это мои слезы.",
          grammarInfo:
            "【Разбор】\n\n1. これは — «это» (близко к говорящему) + は (тема).\n\n2. 水じゃ ありません — отрицание: «не вода».\n\n3. 私の 涙です — «мои слёзы» + связка です.\n\n💡 Указательное местоимение これ работает как самостоятельное существительное.",
        },
        uz: {
          jp: "これは <ruby>水<rt>みず</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>涙<rt>なみだ</rt></ruby>です。",
          translation: "Bu suv emas. Bu mening ko'z yoshlarim.",
          grammarInfo:
            "【Tahlil】\n\n1. これは — «bu» (gapiruvchiga yaqin) + は (mavzu).\n\n2. 水じゃ ありません — inkor: «suv emas».\n\n3. 私の 涙です — «mening ko'z yoshlarim» + です.\n\n💡 これ ko'rsatish olmoshi mustaqil ot kabi ishlaydi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
            translation: "Это моя книга.",
          },
          {
            jp: "これも カメラですか。",
            translation: "Это тоже камера?",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Что это?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
            translation: "Bu mening kitobim.",
          },
          {
            jp: "これも カメラですか。",
            translation: "Bu ham kamerami?",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Bu nima?",
          },
        ],
      },
    },
    {
      id: 48,
      lesson: 2,
      japanese: "それ",
      cleanWord: "それ",
      translations: {
        ru: "то (у собеседника)",
        uz: "shu (suhbatdoshdagi)",
      },
      exampleSentences: {
        ru: {
          jp: "それは コーヒーじゃ ありません。<ruby>醤油<rt>しょうゆ</rt></ruby>です。",
          translation: "То (у вас) не кофе. Это соевый соус.",
          grammarInfo:
            "【Разбор】\n\n1. それは — «то» (предмет у собеседника) + は.\n\n2. コーヒーじゃ ありません — «не кофе».\n\n3. 醤油です — «соевый соус».\n\n💡 В Японии соевый соус часто наливают в кувшинчики, похожие на кофейные. Будьте осторожны!",
        },
        uz: {
          jp: "それは コーヒーじゃ ありません。<ruby>醤油<rt>しょうゆ</rt></ruby>です。",
          translation: "Shu (sizdagi) kofe emas. Bu soya sousi.",
          grammarInfo:
            "【Tahlil】\n\n1. それは — «shu» (suhbatdoshdagi narsa) + は.\n\n2. コーヒーじゃ ありません — «kofe emas».\n\n3. 醤油です — «soya sousi».\n\n💡 Yaponiyada soya sousini ko'pincha kofe idishiga o'xshash idishlarda tortishadi. Ehtiyot bo'ling!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "それは <ruby>辞書<rt>じしょ</rt></ruby>ですか。",
            translation: "То — словарь?",
          },
          {
            jp: "それは <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。",
            translation: "То не моё.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>ですか。",
            translation: "Чей то зонт?",
          },
        ],
        uz: [
          {
            jp: "それは <ruby>辞書<rt>じしょ</rt></ruby>ですか。",
            translation: "Shu lug'atmi?",
          },
          {
            jp: "それは <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。",
            translation: "Shu meniki emas.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>ですか。",
            translation: "Shu kimning soyaboni?",
          },
        ],
      },
    },
    {
      id: 49,
      lesson: 2,
      japanese: "あれ",
      cleanWord: "あれ",
      translations: { ru: "вон то (вдали)", uz: "anavi (uzoqdagi)" },
      exampleSentences: {
        ru: {
          jp: "あれは <ruby>富士山<rt>ふじさん</rt></ruby>じゃ ありません。ゴジラです。",
          translation: "Вон то — не гора Фудзи. Это Годзилла.",
          grammarInfo:
            "【Разбор】\n\n1. あれは — местоимение «вон то» (далеко от обоих) + は.\n\n2. 富士山じゃ ありません — отрицание существительного.\n\n💡 あれ идеально подходит для объектов на горизонте или вне досягаемости обоих собеседников.",
        },
        uz: {
          jp: "あれは <ruby>富士山<rt>ふじさん</rt></ruby>じゃ ありません。ゴジラです。",
          translation: "Anavi uzoqdagi — Fuji tog'i emas. Bu Godzilla.",
          grammarInfo:
            "【Tahlil】\n\n1. あれは — olmosh «anavi» (ikkalasidan ham uzoqda) + は.\n\n2. 富士山じゃ ありません — ot inkor shaklida.\n\n💡 あれ ufqdagi yoki har ikki suhbatdosh yetib bora olmaydigan uzoqdagi narsalar uchun juda mos.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あれは <ruby>会社<rt>かいしゃ</rt></ruby>です。",
            translation: "Вон то — компания.",
          },
          {
            jp: "あれは <ruby>私<rt>わたし</rt></ruby>の <ruby>車<rt>くるま</rt></ruby>です。",
            translation: "Вон там — моя машина.",
          },
          {
            jp: "あれは カメラですか。",
            translation: "Вон то — камера?",
          },
        ],
        uz: [
          {
            jp: "あれは <ruby>会社<rt>かいしゃ</rt></ruby>です。",
            translation: "Anavi — kompaniya.",
          },
          {
            jp: "あれは <ruby>私<rt>わたし</rt></ruby>の <ruby>車<rt>くるま</rt></ruby>です。",
            translation: "Anavi — mening mashinam.",
          },
          { jp: "あれは カメラですか。", translation: "Anavi kamerami?" },
        ],
      },
    },
    {
      id: 50,
      lesson: 2,
      japanese: "この",
      cleanWord: "この",
      translations: { ru: "этот～", uz: "bu～" },
      exampleSentences: {
        ru: {
          jp: "この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。ヤクザの <ruby>傘<rt>かさ</rt></ruby>です。",
          translation: "Этот зонт — не мой. Это зонт якудзы.",
          grammarInfo:
            "【Разбор】\n\n1. この 傘は — «этот зонт». Указательное слово この всегда требует после себя существительное.\n\n2. ヤクザの — «(принадлежит) якудзе».\n\n⚠️ Грубая ошибка: сказать просто «このは» вместо «これは» или «この 傘は».",
        },
        uz: {
          jp: "この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。ヤクザの <ruby>傘<rt>かさ</rt></ruby>です。",
          translation: "Bu soyabon — meniki emas. Bu yakudzaning soyaboni.",
          grammarInfo:
            "【Tahlil】\n\n1. この 傘は — «bu soyabon». この ko'rsatish so'zi har doim o'zidan keyin ot talab qiladi.\n\n2. ヤクザの — «yakudzaga (tegishli)».\n\n⚠️ Qo'pol xato: «これは» yoki «この 傘は» o'rniga shunchaki «このは» deb aytish.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>本<rt>ほん</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Эта книга — моя.",
          },
          {
            jp: "この <ruby>人<rt>ひと</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>ですか。",
            translation: "Кто этот человек?",
          },
          {
            jp: "この 辞書は 誰の ですか。",
            translation: "Чей это словарь?",
          },
        ],
        uz: [
          {
            jp: "この <ruby>本<rt>ほん</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu kitob — meniki.",
          },
          {
            jp: "この <ruby>人<rt>ひと</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>ですか。",
            translation: "Bu odam kim?",
          },
          {
            jp: "この 辞書は 誰の ですか。",
            translation: "Bu lug'at kimniki?",
          },
        ],
      },
    },
    {
      id: 51,
      lesson: 2,
      japanese: "その",
      cleanWord: "その",
      translations: { ru: "тот～ (у собеседника)", uz: "shu～" },
      exampleSentences: {
        ru: {
          jp: "その かぎは <ruby>車<rt>くるま</rt></ruby>の かぎですか。…いいえ、<ruby>私<rt>わたし</rt></ruby>の <ruby>心<rt>こころ</rt></ruby>の かぎです。",
          translation:
            "Тот ключ у тебя — от машины? ...Нет, это ключ от моего сердца.",
          grammarInfo:
            "【Разбор】\n\n1. その かぎ — «тот ключ» (в руках собеседника).\n\n2. 車の かぎ — «ключ от машины» (целевое назначение: の).\n\n3. 心の かぎ — «ключ от сердца».",
        },
        uz: {
          jp: "その かぎは <ruby>車<rt>くるま</rt></ruby>の かぎですか。…いいえ、<ruby>私<rt>わたし</rt></ruby>の <ruby>心<rt>こころ</rt></ruby>の かぎです。",
          translation:
            "Shu yoningizdagi kalit — mashina kalitimi? ...Yo'q, bu mening qalbimning kaliti.",
          grammarInfo:
            "【Tahlil】\n\n1. その かぎ — «shu kalit» (suhbatdoshning qo'lidagi).\n\n2. 車の かぎ — «mashina kaliti» (vazifasi: の).\n\n3. 心の かぎ — «qalb kaliti».",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "その かぎは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Тот ключ — мой.",
          },
          {
            jp: "その <ruby>時計<rt>とけい</rt></ruby>は スイスの ですか。",
            translation: "Те часы — швейцарские?",
          },
          {
            jp: "その かばんは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чья та сумка?",
          },
        ],
        uz: [
          {
            jp: "その かぎは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Shu kalit — meniki.",
          },
          {
            jp: "その <ruby>時計<rt>とけい</rt></ruby>は スイスの ですか。",
            translation: "Shu soat Shveysariyanikimi?",
          },
          {
            jp: "その かばんは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu sumka kimniki?",
          },
        ],
      },
    },
    {
      id: 52,
      lesson: 2,
      japanese: "あの",
      cleanWord: "あの",
      translations: { ru: "вон тот～", uz: "anavi～" },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>医者<rt>いしゃ</rt></ruby>じゃ ありません。スパイです。",
          translation: "Вон тот человек — не врач. Он шпион.",
          grammarInfo:
            "【Разбор】\n\n1. あの 人は — «вон тот человек» (далеко от обоих).\n\n2. 医者じゃ ありません — «не врач».\n\n💡 Сочетание あの 人 (ano hito) — самый частый способ сказать «он/она» о человеке поодаль.",
        },
        uz: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>医者<rt>いしゃ</rt></ruby>じゃ ありません。スパイです。",
          translation: "Anavi odam — shifokor emas. U josus.",
          grammarInfo:
            "【Tahlil】\n\n1. あの 人は — «anavi odam» (ikkalasidan ham uzoqda).\n\n2. 医者じゃ ありません — «shifokor emas».\n\n💡 あの 人 (ano hito) birikmasi — narida turgan kimgadir nisbatan «u» deyishning eng keng tarqalgan usuli.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あの <ruby>車<rt>くるま</rt></ruby>は ミラーさんの です。",
            translation: "Та машина (вдали) — мистера Миллера.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>ですか。",
            translation: "Кто вон тот человек?",
          },
          {
            jp: "あの <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Вон тот зонт — мой.",
          },
        ],
        uz: [
          {
            jp: "あの <ruby>車<rt>くるま</rt></ruby>は ミラーさんの です。",
            translation: "Anavi mashina janob Millerniki.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>ですか。",
            translation: "Anavi odam kim?",
          },
          {
            jp: "あの <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Anavi soyabon meniki.",
          },
        ],
      },
    },
    {
      id: 53,
      lesson: 2,
      japanese: "<ruby>本<rt>ほん</rt></ruby>",
      cleanWord: "本",
      translations: { ru: "книга", uz: "kitob" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>料理<rt>りょうり</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>じゃ ありません。<ruby>黒魔術<rt>くろまじゅつ</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
          translation: "Это не кулинарная книга. Это книга по черной магии.",
          grammarInfo:
            "【Разбор】\n\n1. 料理の 本 — «книга по кулинарии» (の указывает на содержание книги).\n\n2. じゃ ありません — отрицание связки です.\n\n3. 黒魔術の 本です — «книга черной магии».",
        },
        uz: {
          jp: "これは <ruby>料理<rt>りょうり</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>じゃ ありません。<ruby>黒魔術<rt>くろまじゅつ</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
          translation: "Bu pazandachilik kitobi emas. Bu qora sehr kitobi.",
          grammarInfo:
            "【Tahlil】\n\n1. 料理の 本 — «pazandachilik kitobi» (の kitob nima haqidaligini bildiradi).\n\n2. じゃ ありません — です bog'lovchisining inkor shakli.\n\n3. 黒魔術の 本です — «qora sehr kitobi».",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "それは <ruby>車<rt>くるま</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Это книга о машинах?",
          },
          {
            jp: "この <ruby>本<rt>ほん</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Эта книга — моя.",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "О чем эта книга?",
          },
        ],
        uz: [
          {
            jp: "それは <ruby>車<rt>くるま</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "U mashinalar haqidagi kitobmi?",
          },
          {
            jp: "この <ruby>本<rt>ほん</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu kitob meniki.",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Bu nima haqidagi kitob?",
          },
        ],
      },
    },
    {
      id: 54,
      lesson: 2,
      japanese: "<ruby>辞書<rt>じしょ</rt></ruby>",
      cleanWord: "辞書",
      translations: { ru: "словарь", uz: "lugʻat" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>辞書<rt>じしょ</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>枕<rt>まくら</rt></ruby>です。",
          translation: "Это не словарь. Это моя подушка.",
          grammarInfo:
            "【Разбор】\n\n1. 辞書じゃ ありません — «не словарь».\n\n2. 私の 枕 — «моя подушка» (makura).\n\n💡 Тяжелые бумажные словари японского языка идеально подходят для сна на парте во время скучных лекций!",
        },
        uz: {
          jp: "これは <ruby>辞書<rt>じしょ</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>枕<rt>まくら</rt></ruby>です。",
          translation: "Bu lugʻat emas. Bu mening yostigʻim.",
          grammarInfo:
            "【Tahlil】\n\n1. 辞書じゃ ありません — «lugʻat emas».\n\n2. 私の 枕 — «mening yostig'im» (makura).\n\n💡 Og'ir qog'ozli yapon tili lug'atlari zerikarli ma'ruzalar paytida partada uxlash uchun juda mos keladi!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あの <ruby>辞書<rt>じしょ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Тот словарь (вдали) — учителя.",
          },
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "Это словарь английского языка.",
          },
          {
            jp: "その <ruby>辞書<rt>じしょ</rt></ruby>は あなたの ですか。",
            translation: "Тот словарь — твой?",
          },
        ],
        uz: [
          {
            jp: "あの <ruby>辞書<rt>じしょ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Anavi lug'at o'qituvchiniki.",
          },
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "Bu ingliz tili lug'ati.",
          },
          {
            jp: "その <ruby>辞書<rt>じしょ</rt></ruby>は あなたの ですか。",
            translation: "Shu lug'at siznikimi?",
          },
        ],
      },
    },
    {
      id: 55,
      lesson: 2,
      japanese: "<ruby>雑誌<rt>ざっし</rt></ruby>",
      cleanWord: "雑誌",
      translations: { ru: "журнал", uz: "jurnal" },
      exampleSentences: {
        ru: {
          jp: "それは <ruby>車<rt>くるま</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>ですか。…いいえ、ＵＦＯの <ruby>雑誌<rt>ざっし</rt></ruby>です。",
          translation:
            "Это у тебя журнал об автомобилях? ...Нет, журнал об НЛО.",
          grammarInfo:
            "【Разбор】\n\n1. 車の 雑誌 — «журнал о машинах».\n\n2. ＵＦＯの 雑誌 — «журнал об НЛО» (yuu-foo).\n\n💡 В Японии журналы продаются в любом комбини, и многие читают их прямо у витрины.",
        },
        uz: {
          jp: "それは <ruby>車<rt>くるま</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>ですか。…いいえ、ＵＦＯの <ruby>雑誌<rt>ざっし</rt></ruby>です。",
          translation: "Shu mashinalar jurnalimi? ...Yo'q, NUJ haqida jurnal.",
          grammarInfo:
            "【Tahlil】\n\n1. 車の 雑誌 — «mashinalar jurnali».\n\n2. ＵＦＯの 雑誌 — «NUJ haqida jurnal» (yuu-foo).\n\n💡 Yaponiyada jurnallar har qanday do'konda sotiladi va ko'pchilik ularni vitrina oldida turib o'qiydi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>車<rt>くるま</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>です。",
            translation: "Это журнал об автомобилях.",
          },
          {
            jp: "それは カメラの <ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "Это журнал о камерах?",
          },
          {
            jp: "その <ruby>雑誌<rt>ざっし</rt></ruby>も <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Тот журнал тоже мой.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>車<rt>くるま</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>です。",
            translation: "Bu avtomobillar jurnali.",
          },
          {
            jp: "それは カメラの <ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "U kameralar jurnalimi?",
          },
          {
            jp: "その <ruby>雑誌<rt>ざっし</rt></ruby>も <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Shu jurnal ham meniki.",
          },
        ],
      },
    },
    {
      id: 56,
      lesson: 2,
      japanese: "<ruby>新聞<rt>しんぶん</rt></ruby>",
      cleanWord: "新聞",
      translations: { ru: "газета", uz: "gazeta" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>今日<rt>きょう</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>じゃ ありません。<ruby>未来<rt>みらい</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>です。",
          translation: "Это не сегодняшняя газета. Это газета из будущего.",
          grammarInfo:
            "【Разбор】\n\n1. 今日の 新聞 — «газета (от) сегодня» (kyou).\n\n2. 未来の 新聞 — «газета из будущего» (mirai).\n\n💡 Япония до сих пор остается страной, где по утрам миллионы людей читают свежие бумажные газеты в метро.",
        },
        uz: {
          jp: "これは <ruby>今日<rt>きょう</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>じゃ ありません。<ruby>未来<rt>みらい</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>です。",
          translation: "Bu bugungi gazeta emas. Bu kelajak gazetasi.",
          grammarInfo:
            "【Tahlil】\n\n1. 今日の 新聞 — «bugungi gazeta» (kyou).\n\n2. 未来の 新聞 — «kelajak gazetasi» (mirai).\n\n💡 Yaponiya hali ham har kuni ertalab millionlab odamlar metroning o'zida yangi qog'oz gazetalar o'qiydigan davlat bo'lib qolmoqda.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>です。",
            translation: "Это японская газета.",
          },
          {
            jp: "あれは <ruby>新聞<rt>しんぶん</rt></ruby>ですか、<ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "То вдали — газета или журнал?",
          },
          {
            jp: "あの <ruby>新聞<rt>しんぶん</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чья та газета?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>です。",
            translation: "Bu yapon gazetasi.",
          },
          {
            jp: "あれは <ruby>新聞<rt>しんぶん</rt></ruby>ですか、<ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "Anavi gazetami yoki jurnalmi?",
          },
          {
            jp: "あの <ruby>新聞<rt>しんぶん</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi gazeta kimniki?",
          },
        ],
      },
    },
    {
      id: 57,
      lesson: 2,
      japanese: "ノート",
      cleanWord: "ノート",
      translations: { ru: "тетрадь", uz: "daftar" },
      exampleSentences: {
        ru: {
          jp: "この ノートは デスノートですか。…いいえ、<ruby>英語<rt>えいご</rt></ruby>の ノートです。",
          translation:
            "Эта тетрадь — Тетрадь Смерти? ...Нет, это тетрадь по английскому.",
          grammarInfo:
            "【Разбор】\n\n1. デスノート — «Тетрадь Смерти» (Death Note, известное аниме).\n\n2. 英語の ノート — «тетрадь для английского».\n\n💡 Японское ノート произошло от английского «notebook», но означает только бумажную тетрадь. Ноутбук — это パソコン (pasokon).",
        },
        uz: {
          jp: "この ノートは デスノートですか。…いいえ、<ruby>英語<rt>えいご</rt></ruby>の ノートです。",
          translation:
            "Bu daftar — Ajal daftarimi? ...Yo'q, bu ingliz tili daftari.",
          grammarInfo:
            "【Tahlil】\n\n1. デスノート — «Ajal daftari» (Death Note, mashhur anime).\n\n2. 英語の ノート — «ingliz tili daftari».\n\n💡 Yaponcha ノート inglizcha «notebook» dan kelib chiqqan, lekin faqat qog'oz daftarni bildiradi. Noutbuk kompyuter esa パソコン (pasokon) deyiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "その ノートは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Та тетрадь — моя.",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の ノートですか。",
            translation: "Для чего эта тетрадь?",
          },
          {
            jp: "あの ノートも <ruby>先生<rt>せんせい</rt></ruby>の ですか。",
            translation: "Вон та тетрадь тоже учителя?",
          },
        ],
        uz: [
          {
            jp: "その ノートは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Shu daftar — meniki.",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の ノートですか。",
            translation: "Bu nima uchun mo'ljallangan daftar?",
          },
          {
            jp: "あの ノートも <ruby>先生<rt>せんせい</rt></ruby>の ですか。",
            translation: "Anavi daftar ham o'qituvchinikimi?",
          },
        ],
      },
    },
    {
      id: 58,
      lesson: 2,
      japanese: "<ruby>手帳<rt>てちょう</rt></ruby>",
      cleanWord: "手帳",
      translations: { ru: "блокнот", uz: "yondaftar" },
      exampleSentences: {
        ru: {
          jp: "この <ruby>手帳<rt>てちょう</rt></ruby>は <ruby>大統領<rt>だいとうりょう</rt></ruby>の <ruby>手帳<rt>てちょう</rt></ruby>です。あなたの じゃ ありません。",
          translation: "Это блокнот президента. Не твой.",
          grammarInfo:
            "【Разбор】\n\n1. 大統領の — «(принадлежащий) президенту» (daitouryou).\n\n2. あなたの じゃ ありません — «не твой».\n\n💡 Даже в эпоху смартфонов японские офисные работники обожают карманные бумажные планировщики.",
        },
        uz: {
          jp: "この <ruby>手帳<rt>てちょう</rt></ruby>は <ruby>大統領<rt>だいとうりょう</rt></ruby>の <ruby>手帳<rt>てちょう</rt></ruby>です。あなたの じゃ ありません。",
          translation: "Bu prezidentning yondaftari. Seniki emas.",
          grammarInfo:
            "【Tahlil】\n\n1. 大統領の — «prezidentga (tegishli)» (daitouryou).\n\n2. あなたの じゃ ありません — «seniki emas».\n\n💡 Smartfonlar davrida ham yapon ofis xodimlari cho'ntak qog'oz rejalashtirgichlarini yaxshi ko'radilar.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>手帳<rt>てちょう</rt></ruby>は ミラーさんの です。",
            translation: "Этот блокнот — мистера Миллера.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>手帳<rt>てちょう</rt></ruby>ですか。",
            translation: "Чей это блокнот?",
          },
          {
            jp: "その <ruby>手帳<rt>てちょう</rt></ruby>を ください。",
            translation: "Дайте, пожалуйста, этот блокнот.",
          },
        ],
        uz: [
          {
            jp: "この <ruby>手帳<rt>てちょう</rt></ruby>は ミラーさんの です。",
            translation: "Bu yondaftar janob Millerniki.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>手帳<rt>てちょう</rt></ruby>ですか。",
            translation: "U kimning yondaftari?",
          },
          {
            jp: "その <ruby>手帳<rt>てちょう</rt></ruby>を ください。",
            translation: "Iltimos, shu yondaftarni bering.",
          },
        ],
      },
    },
    {
      id: 59,
      lesson: 2,
      japanese: "<ruby>名刺<rt>めいし</rt></ruby>",
      cleanWord: "名刺",
      translations: { ru: "визитка", uz: "vizitka" },
      exampleSentences: {
        ru: {
          jp: "これは イーロン・マスクの <ruby>名刺<rt>めいし</rt></ruby>です。<ruby>私<rt>わたし</rt></ruby>の <ruby>宝物<rt>たからもの</rt></ruby>です。",
          translation: "Это визитка Илона Маска. Мое сокровище.",
          grammarInfo:
            "【Разбор】\n\n1. イーロン・マスクの — «(принадлежит) Илону Маску».\n\n2. 宝物です — «является сокровищем» (takaramono).\n\n💡 Обмен визитками (名刺交換) в Японии — это священный ритуал бизнеса.",
        },
        uz: {
          jp: "これは イーロン・マスクの <ruby>名刺<rt>めいし</rt></ruby>です。<ruby>私<rt>わたし</rt></ruby>の <ruby>宝物<rt>たからもの</rt></ruby>です。",
          translation: "Bu Ilon Maskning vizitkasi. Mening xazinam.",
          grammarInfo:
            "【Tahlil】\n\n1. イーロン・マスクの — «Ilon Maskga (tegishli)».\n\n2. 宝物です — «xazinadir» (takaramono).\n\n💡 Yaponiyada vizitkalar almashinuvi (名刺交換) biznesning muqaddas marosimidir.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>名刺<rt>めいし</rt></ruby>です。",
            translation: "Это моя визитка.",
          },
          {
            jp: "あの <ruby>名刺<rt>めいし</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чья та визитка?",
          },
          {
            jp: "この <ruby>名刺<rt>めいし</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Эта визитка — учителя.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>名刺<rt>めいし</rt></ruby>です。",
            translation: "Bu mening vizitkam.",
          },
          {
            jp: "あの <ruby>名刺<rt>めいし</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi vizitka kimniki?",
          },
          {
            jp: "この <ruby>名刺<rt>めいし</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Bu vizitka o'qituvchiniki.",
          },
        ],
      },
    },
    {
      id: 60,
      lesson: 2,
      japanese: "カード",
      cleanWord: "カード",
      translations: { ru: "карта", uz: "karta" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>銀行<rt>ぎんこう</rt></ruby>の カードじゃ ありません。イルミナティの カードです。",
          translation: "Это не банковская карта. Это карта Иллюминатов.",
          grammarInfo:
            "【Разбор】\n\n1. 銀行の カード — «карта банка».\n\n2. じゃ ありません — отрицание.\n\n💡 Слово カード может означать кредитку, пропуск, открытку или коллекционную карточку.",
        },
        uz: {
          jp: "これは <ruby>銀行<rt>ぎんこう</rt></ruby>の カードじゃ ありません。イルミナティの カードです。",
          translation: "Bu bank kartasi emas. Bu Illuminatilar kartasi.",
          grammarInfo:
            "【Tahlil】\n\n1. 銀行の カード — «bank kartasi».\n\n2. じゃ ありません — inkor.\n\n💡 カード so'zi kredit karta, ruxsatnoma, otkritka yoki kolleksiya kartasini anglatishi mumkin.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この カードは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Эта карта — моя.",
          },
          {
            jp: "それは <ruby>電話<rt>でんわ</rt></ruby>の カードですか。",
            translation: "Это телефонная карточка?",
          },
          {
            jp: "あの カードも だめです。",
            translation: "Та карточка тоже не подходит.",
          },
        ],
        uz: [
          {
            jp: "この カードは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu karta meniki.",
          },
          {
            jp: "それは <ruby>電話<rt>でんわ</rt></ruby>の カードですか。",
            translation: "Bu telefon kartasimi?",
          },
          {
            jp: "あの カードも だめです。",
            translation: "Anavi karta ham to'g'ri kelmaydi.",
          },
        ],
      },
    },
    {
      id: 61,
      lesson: 2,
      japanese: "<ruby>鉛筆<rt>えんぴつ</rt></ruby>",
      cleanWord: "鉛筆",
      translations: { ru: "карандаш", uz: "qalam" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>鉛筆<rt>えんぴつ</rt></ruby>じゃ ありません。チョコレートです。",
          translation: "Это не карандаш. Это шоколад.",
          grammarInfo:
            "【Разбор】\n\n1. 鉛筆じゃ ありません — «не карандаш».\n\n2. チョコレートです — «(это) шоколад».\n\n💡 В Японии обожают выпускать сувенирные сладости, которые выглядят точь-в-точь как настоящие канцелярские принадлежности! Не перепутайте!",
        },
        uz: {
          jp: "これは <ruby>鉛筆<rt>えんぴつ</rt></ruby>じゃ ありません。チョコレートです。",
          translation: "Bu qalam emas. Bu shokolad.",
          grammarInfo:
            "【Tahlil】\n\n1. 鉛筆じゃ ありません — «qalam emas».\n\n2. チョコレートです — «(bu) shokolad».\n\n💡 Yaponiyada xuddi haqiqiy kanselyariya mollariga o'xshab ketadigan esdalik shirinliklarini ishlab chiqarishni yaxshi ko'rishadi! Adashtirib qo'ymang!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>鉛筆<rt>えんぴつ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот карандаш — мой.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>鉛筆<rt>えんぴつ</rt></ruby>ですか。",
            translation: "Чей это карандаш?",
          },
          {
            jp: "あの <ruby>鉛筆<rt>えんぴつ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Вон тот карандаш — учителя.",
          },
        ],
        uz: [
          {
            jp: "この <ruby>鉛筆<rt>えんぴつ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu qalam meniki.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>鉛筆<rt>えんぴつ</rt></ruby>ですか。",
            translation: "Bu kimning qalami?",
          },
          {
            jp: "あの <ruby>鉛筆<rt>えんぴつ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Anavi qalam o'qituvchiniki.",
          },
        ],
      },
    },
    {
      id: 62,
      lesson: 2,
      japanese: "ボールペン",
      cleanWord: "ボールペン",
      translations: { ru: "шариковая ручка", uz: "sharikli ruchka" },
      exampleSentences: {
        ru: {
          jp: "この ボールペンは １００<ruby>円<rt>えん</rt></ruby>じゃ ありません。１００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です！",
          translation: "Эта ручка стоит не 100 иен. Она стоит 1 миллион иен!",
          grammarInfo:
            "【Разбор】\n\n1. １００円じゃ ありません — «не за 100 иен».\n\n2. １００万円です — «(она) за 1 миллион иен» (man - десять тысяч, 100 man = 1 миллион).\n\n💡 Японские бренды шариковых ручек (Zebra, Pilot) считаются одними из лучших в мире.",
        },
        uz: {
          jp: "この ボールペンは １００<ruby>円<rt>えん</rt></ruby>じゃ ありません。１００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です！",
          translation: "Bu ruchka 100 iyen emas. U 1 million iyen turadi!",
          grammarInfo:
            "【Tahlil】\n\n1. １００円じゃ ありません — «100 iyenlik emas».\n\n2. １００万円です — «(u) 1 million iyenlik» (man - o'n ming, 100 man = 1 million).\n\n💡 Yaponiyaning sharikli ruchka brendlari (Zebra, Pilot) dunyodagi eng yaxshilaridan biri hisoblanadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この ボールペンは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Эта ручка — моя.",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の ボールペンですか。",
            translation: "Это ручка учителя?",
          },
          {
            jp: "あの ボールペンも <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Вон та ручка тоже моя.",
          },
        ],
        uz: [
          {
            jp: "この ボールペンは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu ruchka meniki.",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の ボールペンですか。",
            translation: "Bu o'qituvchining ruchkasimi?",
          },
          {
            jp: "あの ボールペンも <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Anavi ruchka ham meniki.",
          },
        ],
      },
    },
    {
      id: 63,
      lesson: 2,
      japanese: "シャープペンシル",
      cleanWord: "シャープペンシル",
      translations: { ru: "мех. карандаш", uz: "mexanik qalam" },
      exampleSentences: {
        ru: {
          jp: "これは シャープペンシルですか。…いいえ、<ruby>注射器<rt>ちゅうしゃき</rt></ruby>です。",
          translation: "Это механический карандаш? ...Нет, это шприц.",
          grammarInfo:
            "【Разбор】\n\n1. シャープペンシルですか — «механический карандаш?».\n\n2. 注射器です — «шприц» (chuushaki).\n\n💡 В Японии механический карандаш называют シャーペン (shaapen) в разговорной речи.",
        },
        uz: {
          jp: "これは シャープペンシルですか。…いいえ、<ruby>注射器<rt>ちゅうしゃき</rt></ruby>です。",
          translation: "Bu mexanik qalammi? ...Yo'q, bu shprits.",
          grammarInfo:
            "【Tahlil】\n\n1. シャープペンシルですか — «mexanik qalammi?».\n\n2. 注射器です — «shprits» (chuushaki).\n\n💡 Yaponiyada so'zlashuvda mexanik qalamni ko'pincha シャーペン (shaapen) deb atashadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の シャープペンシルです。",
            translation: "Это мой механический карандаш.",
          },
          {
            jp: "その シャープペンシルは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей тот механический карандаш?",
          },
          {
            jp: "この シャープペンシルは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Этот карандаш — учителя.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の シャープペンシルです。",
            translation: "Bu mening mexanik qalamim.",
          },
          {
            jp: "その シャープペンシルは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu mexanik qalam kimniki?",
          },
          {
            jp: "この シャープペンシルは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Bu qalam o'qituvchiniki.",
          },
        ],
      },
    },
    {
      id: 64,
      lesson: 2,
      japanese: "かぎ",
      cleanWord: "かぎ",
      translations: { ru: "ключ", uz: "kalit" },
      exampleSentences: {
        ru: {
          jp: "この かぎは <ruby>車<rt>くるま</rt></ruby>の じゃ ありません。<ruby>秘密<rt>ひみつ</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>の かぎです。",
          translation: "Этот ключ — не от машины. Это ключ от тайной комнаты.",
          grammarInfo:
            "【Разбор】\n\n1. 車の じゃ ありません — «не от машины» (существительное かぎ опущено).\n\n2. 秘密の 部屋の かぎ — «ключ (от) тайной комнаты» (himitsu no heya).\n\n💡 Слово かぎ (kagi) часто пишется хираганой, хотя у него есть сложный кандзи 鍵.",
        },
        uz: {
          jp: "この かぎは <ruby>車<rt>くるま</rt></ruby>の じゃ ありません。<ruby>秘密<rt>ひみつ</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>の かぎです。",
          translation:
            "Bu kalit — mashinaning kaliti emas. Bu maxfiy xonaning kaliti.",
          grammarInfo:
            "【Tahlil】\n\n1. 車の じゃ ありません — «mashinadan emas» (かぎ oti tushirib qoldirilgan).\n\n2. 秘密の 部屋の かぎ — «maxfiy xona kaliti» (himitsu no heya).\n\n💡 かぎ (kagi) so'zi ko'pincha hiraganada yoziladi, garchi uning murakkab iyeroglifi (鍵) bo'lsa ham.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>車<rt>くるま</rt></ruby>の かぎです。",
            translation: "Это ключ от машины.",
          },
          {
            jp: "その かぎは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей тот ключ?",
          },
          {
            jp: "この かぎは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот ключ — мой.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>車<rt>くるま</rt></ruby>の かぎです。",
            translation: "Bu mashina kaliti.",
          },
          {
            jp: "その かぎは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu kalit kimniki?",
          },
          {
            jp: "この かぎは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu kalit meniki.",
          },
        ],
      },
    },
    {
      id: 65,
      lesson: 2,
      japanese: "<ruby>時計<rt>とけい</rt></ruby>",
      cleanWord: "時計",
      translations: { ru: "часы", uz: "soat" },
      exampleSentences: {
        ru: {
          jp: "その <ruby>時計<rt>とけい</rt></ruby>は ロレックスですか。…いいえ、おもちゃです。",
          translation: "Те часы у тебя — Ролекс? ...Нет, игрушка.",
          grammarInfo:
            "【Разбор】\n\n1. その 時計は — «те часы (на твоей руке)».\n\n2. ロレックスですか — «Ролекс?».\n\n3. おもちゃです — «игрушка».\n\n💡 時計 (tokei) означает любые часы — и наручные, и настенные, и башенные.",
        },
        uz: {
          jp: "その <ruby>時計<rt>とけい</rt></ruby>は ロレックスですか。…いいえ、おもちゃです。",
          translation: "Qo'lingizdagi soat — Roleksmi? ...Yo'q, o'yinchoq.",
          grammarInfo:
            "【Tahlil】\n\n1. その 時計は — «shu soat (qo'lingizdagi)».\n\n2. ロレックスですか — «Roleksmi?».\n\n3. おもちゃです — «o'yinchoq».\n\n💡 時計 (tokei) har qanday soatni — qo'l soatini ham, devor soatini ham bildiradi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>時計<rt>とけい</rt></ruby>です。",
            translation: "Это мои часы.",
          },
          {
            jp: "あの <ruby>時計<rt>とけい</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чьи вон те часы?",
          },
          {
            jp: "その <ruby>時計<rt>とけい</rt></ruby>は スイスの ですか。",
            translation: "Те часы швейцарские?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>時計<rt>とけい</rt></ruby>です。",
            translation: "Bu mening soatim.",
          },
          {
            jp: "あの <ruby>時計<rt>とけい</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi soat kimniki?",
          },
          {
            jp: "その <ruby>時計<rt>とけい</rt></ruby>は スイスの ですか。",
            translation: "Shu soat Shveysariyanikimi?",
          },
        ],
      },
    },
    {
      id: 66,
      lesson: 2,
      japanese: "<ruby>傘<rt>かさ</rt></ruby>",
      cleanWord: "傘",
      translations: { ru: "зонт", uz: "soyabon" },
      exampleSentences: {
        ru: {
          jp: "あのう、それは <ruby>私<rt>わたし</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>です。あなたの じゃ ありません。<ruby>泥棒<rt>どろぼう</rt></ruby>！",
          translation: "Э-э, простите, это мой зонт. Не ваш. Вор!",
          grammarInfo:
            "【Разбор】\n\n1. あのう — междометие для привлечения внимания.\n\n2. あなたの じゃ ありません — «не ваш» (существительное 傘 опущено).\n\n3. 泥棒 (dorobou) — «вор».\n\n💡 Кража одинаковых прозрачных зонтиков в Японии — национальная проблема.",
        },
        uz: {
          jp: "あのう、それは <ruby>私<rt>わたし</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>です。あなたの じゃ ありません。<ruby>泥棒<rt>どろぼう</rt></ruby>！",
          translation:
            "M-m, kechirasiz, bu mening soyabonim. Sizniki emas. O'g'ri!",
          grammarInfo:
            "【Tahlil】\n\n1. あのう — e'tiborni tortish uchun ishlatiladigan undov so'z.\n\n2. あなたの じゃ ありません — «sizniki emas» (傘 so'zi tushirib qoldirilgan).\n\n3. 泥棒 (dorobou) — «o'g'ri».\n\n💡 Yaponiyada bir xil shaffof soyabonlarning o'g'irlanishi — milliy muammo.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот зонт — мой.",
          },
          {
            jp: "あの <ruby>傘<rt>かさ</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей вон тот зонт?",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>ですか。",
            translation: "Это зонт учителя?",
          },
        ],
        uz: [
          {
            jp: "この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu soyabon meniki.",
          },
          {
            jp: "あの <ruby>傘<rt>かさ</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi soyabon kimniki?",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>ですか。",
            translation: "Bu o'qituvchining soyabonimi?",
          },
        ],
      },
    },
    {
      id: 67,
      lesson: 2,
      japanese: "かばん",
      cleanWord: "かばん",
      translations: { ru: "сумка", uz: "sumka" },
      exampleSentences: {
        ru: {
          jp: "この かばんは グッチの かばんですか。…いいえ、１００<ruby>円<rt>えん</rt></ruby>の かばんです。",
          translation: "Эта сумка от Гуччи? …Нет, это сумка за 100 иен.",
          grammarInfo:
            "【Разбор】\n\n1. グッチの かばん — «сумка (от) Гуччи».\n\n2. １００円の かばん — «сумка (за) 100 иен».\n\n💡 かばん — общее слово для сумок, портфелей, рюкзаков.",
        },
        uz: {
          jp: "この かばんは グッチの かばんですか。…いいえ、１００<ruby>円<rt>えん</rt></ruby>の かばんです。",
          translation: "Bu sumka Gucchimi? ...Yo'q, bu 100 iyenlik sumka.",
          grammarInfo:
            "【Tahlil】\n\n1. グッチの かばん — «Gucci sumkasi».\n\n2. １００円の かばん — «100 iyenlik sumka».\n\n💡 かばん — sumka, portfel va ryukzaklar uchun umumiy so'z.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この かばんは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Эта сумка — моя.",
          },
          {
            jp: "あの かばんは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чья вон та сумка?",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の かばんです。",
            translation: "То — сумка учителя.",
          },
        ],
        uz: [
          {
            jp: "この かばんは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu sumka meniki.",
          },
          {
            jp: "あの かばんは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi sumka kimniki?",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の かばんです。",
            translation: "U o'qituvchining sumkasi.",
          },
        ],
      },
    },
    {
      id: 68,
      lesson: 2,
      japanese: "CD",
      cleanWord: "CD",
      translations: { ru: "CD-диск", uz: "CD (kompakt-disk)" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>英語<rt>えいご</rt></ruby>の CDじゃ ありません。お<ruby>経<rt>きょう</rt></ruby>の CDです。",
          translation:
            "Это не диск с английским. Это CD с буддийскими мантрами.",
          grammarInfo:
            "【Разбор】\n\n1. 英語の CD — «CD по английскому».\n\n2. じゃ ありません — отрицание.\n\n3. お経の CD — «CD мантр (сутр)» (okyou).\n\n💡 В Японии до сих пор активно покупают и слушают физические CD-диски.",
        },
        uz: {
          jp: "これは <ruby>英語<rt>えいご</rt></ruby>の CDじゃ ありません。お<ruby>経<rt>きょう</rt></ruby>の CDです。",
          translation: "Bu ingliz tili diski emas. Bu buddizm sutralari CD si.",
          grammarInfo:
            "【Tahlil】\n\n1. 英語の CD — «ingliz tili CDsi».\n\n2. じゃ ありません — inkor.\n\n3. お経の CD — «sutralar CDsi» (okyou).\n\n💡 Yaponiyada hozirgacha jismoniy CD disklar faol sotib olinadi va eshitiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の CDです。",
            translation: "Это CD по английскому языку.",
          },
          {
            jp: "この CDは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот CD — мой.",
          },
          {
            jp: "その CDは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей тот CD?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の CDです。",
            translation: "Bu ingliz tili CDsi.",
          },
          {
            jp: "この CDは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu CD meniki.",
          },
          {
            jp: "その CDは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu CD kimniki?",
          },
        ],
      },
    },
    {
      id: 69,
      lesson: 2,
      japanese: "テレビ",
      cleanWord: "テレビ",
      translations: { ru: "телевизор", uz: "televizor" },
      exampleSentences: {
        ru: {
          jp: "あれは テレビじゃ ありません。ゲームの モニターです。",
          translation: "То вдали — не телевизор. Это монитор для игр.",
          grammarInfo:
            "【Разбор】\n\n1. あれは — «то» (вдали).\n\n2. テレビじゃ ありません — «не телевизор».\n\n3. ゲームの モニター — «монитор (для) игр».\n\n💡 Японское слово テレビ (terebi) образовано от английского television.",
        },
        uz: {
          jp: "あれは テレビじゃ ありません。ゲームの モニターです。",
          translation: "Anavi televizor emas. O'yin monitori.",
          grammarInfo:
            "【Tahlil】\n\n1. あれは — «anavi» (uzoqda).\n\n2. テレビじゃ ありません — «televizor emas».\n\n3. ゲームの モニター — «o'yin monitori».\n\n💡 Yaponcha テレビ (terebi) so'zi inglizcha television so'zidan kelib chiqqan.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この テレビは <ruby>日本<rt>にほん</rt></ruby>の です。",
            translation: "Этот телевизор — японский.",
          },
          {
            jp: "あの テレビは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Вон тот телевизор — мой.",
          },
          {
            jp: "あれは テレビですか。",
            translation: "То вдали — телевизор?",
          },
        ],
        uz: [
          {
            jp: "この テレビは <ruby>日本<rt>にほん</rt></ruby>の です。",
            translation: "Bu televizor yaponlarniki.",
          },
          {
            jp: "あの テレビは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Anavi televizor meniki.",
          },
          {
            jp: "あれは テレビですか。",
            translation: "Anavi televizormi?",
          },
        ],
      },
    },
    {
      id: 70,
      lesson: 2,
      japanese: "ラジオ",
      cleanWord: "ラジオ",
      translations: { ru: "радио", uz: "radio" },
      exampleSentences: {
        ru: {
          jp: "この ラジオは <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。<ruby>宇宙人<rt>うちゅうじん</rt></ruby>の です。",
          translation: "Это радио — не мое. Оно принадлежит пришельцам.",
          grammarInfo:
            "【Разбор】\n\n1. 私の じゃ ありません — «не моё».\n\n2. 宇宙人の です — «(оно) пришельцев» (uchuujin).\n\n💡 В Японии радио остаётся важным средством оповещения при землетрясениях.",
        },
        uz: {
          jp: "この ラジオは <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。<ruby>宇宙人<rt>うちゅうじん</rt></ruby>の です。",
          translation: "Bu radio — meniki emas. U o'zga sayyoraliklarniki.",
          grammarInfo:
            "【Tahlil】\n\n1. 私の じゃ ありません — «meniki emas».\n\n2. 宇宙人の です — «(u) o'zga sayyoraliklarniki» (uchuujin).\n\n💡 Yaponiyada radio zilzilalar paytida ogohlantirishning muhim vositasi bo'lib qolmoqda.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この ラジオは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Это радио — мое.",
          },
          {
            jp: "それは <ruby>日本<rt>にほん</rt></ruby>の ラジオですか。",
            translation: "Это японское радио?",
          },
          {
            jp: "あれは <ruby>誰<rt>だれ</rt></ruby>の ラジオですか。",
            translation: "Чье вон то радио?",
          },
        ],
        uz: [
          {
            jp: "この ラジオは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu radio meniki.",
          },
          {
            jp: "それは <ruby>日本<rt>にほん</rt></ruby>の ラジオですか。",
            translation: "Bu yapon radiosimi?",
          },
          {
            jp: "あれは <ruby>誰<rt>だれ</rt></ruby>の ラジオですか。",
            translation: "Anavi kimning radiosi?",
          },
        ],
      },
    },
    {
      id: 71,
      lesson: 2,
      japanese: "カメラ",
      cleanWord: "カメラ",
      translations: { ru: "фотоаппарат", uz: "fotoapparat" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>人間<rt>にんげん</rt></ruby>の カメラじゃ ありません。<ruby>犬<rt>いぬ</rt></ruby>の カメラです。",
          translation:
            "Это фотоаппарат не для людей. Это камера для собаки (на ошейнике).",
          grammarInfo:
            "【Разбор】\n\n1. 人間の — «(для) людей / человека» (ningen).\n\n2. 犬の カメラ — «камера (для) собаки» (inu).\n\n💡 Японские бренды (Canon, Nikon, Sony) доминируют на мировом рынке камер.",
        },
        uz: {
          jp: "これは <ruby>人間<rt>にんげん</rt></ruby>の カメラじゃ ありません。<ruby>犬<rt>いぬ</rt></ruby>の カメラです。",
          translation:
            "Bu odamlar uchun fotoapparat emas. Bu itlar kamerasi (bo'yinturuqdagi).",
          grammarInfo:
            "【Tahlil】\n\n1. 人間の — «odamlar (uchun)» (ningen).\n\n2. 犬の カメラ — «it (uchun) kamera» (inu).\n\n💡 Yapon brendlari (Canon, Nikon, Sony) jahon kameralar bozorida yetakchilik qiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の カメラです。",
            translation: "Это японская камера.",
          },
          {
            jp: "その カメラは あなたの ですか。",
            translation: "Та камера — ваша?",
          },
          {
            jp: "あの カメラは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Вон та камера — учителя.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の カメラです。",
            translation: "Bu yapon kamerasi.",
          },
          {
            jp: "その カメラは あなたの ですか。",
            translation: "Shu kamera siznikimi?",
          },
          {
            jp: "あの カメラは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Anavi kamera o'qituvchiniki.",
          },
        ],
      },
    },
    {
      id: 72,
      lesson: 2,
      japanese: "コンピューター",
      cleanWord: "コンピューター",
      translations: { ru: "компьютер", uz: "kompyuter" },
      exampleSentences: {
        ru: {
          jp: "これは アップルの コンピューターじゃ ありません。ポテトの コンピューターです。",
          translation:
            "Это не компьютер Apple (Яблоко). Это компьютер Potato (Картошка).",
          grammarInfo:
            "【Разбор】\n\n1. アップルの — «от (компании) Apple».\n\n2. ポテトの — «от (компании) Potato» (пародия).\n\n💡 Японцы часто называют ноутбуки словом パソコン (pasokon) — сокращение от personal computer.",
        },
        uz: {
          jp: "これは アップルの コンピューターじゃ ありません。ポテトの コンピューターです。",
          translation:
            "Bu Apple (Olma) kompyuteri emas. Bu Potato (Kartoshka) kompyuteri.",
          grammarInfo:
            "【Tahlil】\n\n1. アップルの — «Apple (kompaniyasi)ning».\n\n2. ポテトの — «Potato (kompaniyasi)ning» (parodiya).\n\n💡 Yaponlar noutbuklarni ko'pincha パソコン (pasokon) — personal computer so'zining qisqartmasi bilan atashadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この コンピューターは アメリカの です。",
            translation: "Этот компьютер — американский.",
          },
          {
            jp: "それは コンピューターの <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Это книга о компьютерах?",
          },
          {
            jp: "あの コンピューターは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей вон тот компьютер?",
          },
        ],
        uz: [
          {
            jp: "この コンピューターは アメリカの です。",
            translation: "Bu kompyuter Amerikaniki.",
          },
          {
            jp: "それは コンピューターの <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Bu kompyuterlar haqidagi kitobmi?",
          },
          {
            jp: "あの コンピューターは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi kompyuter kimniki?",
          },
        ],
      },
    },
    {
      id: 73,
      lesson: 2,
      japanese: "<ruby>車<rt>くるま</rt></ruby>",
      cleanWord: "車",
      translations: { ru: "машина", uz: "mashina" },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>車<rt>くるま</rt></ruby>は フェラーリですか。…いいえ、トラクターです。",
          translation: "Вон та машина — Феррари? …Нет, трактор.",
          grammarInfo:
            "【Разбор】\n\n1. あの 車は — «вон та машина».\n\n2. フェラーリですか — «Феррари?».\n\n3. トラクターです — «(это) трактор».\n\n💡 В Японии невозможно купить машину, если вы не докажете полиции, что у вас есть парковочное место.",
        },
        uz: {
          jp: "あの <ruby>車<rt>くるま</rt></ruby>は フェラーリですか。…いいえ、トラクターです。",
          translation: "Anavi mashina — Ferrarimi? …Yo'q, traktor.",
          grammarInfo:
            "【Tahlil】\n\n1. あの 車は — «anavi mashina».\n\n2. フェラーリですか — «Ferrarimi?».\n\n3. トラクターです — «(bu) traktor».\n\n💡 Yaponiyada politsiyaga o'zingizning avtoturargohingiz borligini isbotlamaguningizcha mashina sotib ololmaysiz.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の <ruby>車<rt>くるま</rt></ruby>です。",
            translation: "Это японский автомобиль.",
          },
          {
            jp: "その <ruby>車<rt>くるま</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чья та машина?",
          },
          {
            jp: "あの <ruby>車<rt>くるま</rt></ruby>も ドイツの ですか。",
            translation: "Вон та машина тоже немецкая?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の <ruby>車<rt>くるま</rt></ruby>です。",
            translation: "Bu yapon mashinasi.",
          },
          {
            jp: "その <ruby>車<rt>くるま</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu mashina kimniki?",
          },
          {
            jp: "あの <ruby>車<rt>くるま</rt></ruby>も ドイツの ですか。",
            translation: "Anavi mashina ham Germaniyanikimi?",
          },
        ],
      },
    },
    {
      id: 74,
      lesson: 2,
      japanese: "<ruby>机<rt>つくえ</rt></ruby>",
      cleanWord: "机",
      translations: { ru: "стол", uz: "stol" },
      exampleSentences: {
        ru: {
          jp: "この <ruby>机<rt>つくえ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の です！",
          translation: "Этот стол — не учителя. Он мой!",
          grammarInfo:
            "【Разбор】\n\n1. 先生の じゃ ありません — «не учителя».\n\n2. 私の です — «он мой» (существительное опущено).\n\n💡 机 (tsukue) — это именно письменный, рабочий или школьный стол. Обеденный стол называют テーブル (teeburu).",
        },
        uz: {
          jp: "この <ruby>机<rt>つくえ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の です！",
          translation: "Bu stol — o'qituvchiniki emas. U meniki!",
          grammarInfo:
            "【Tahlil】\n\n1. 先生の じゃ ありません — «o'qituvchini emas».\n\n2. 私の です — «u meniki» (ot tushirib qoldirilgan).\n\n💡 机 (tsukue) — bu aynan yozuv, ish yoki maktab stoli. Ovqatlanish stoli テーブル (teeburu) deyiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>机<rt>つくえ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот стол — мой.",
          },
          {
            jp: "あれは <ruby>先生<rt>せんせい</rt></ruby>の <ruby>机<rt>つくえ</rt></ruby>です。",
            translation: "Вон то — стол учителя.",
          },
          {
            jp: "その <ruby>机<rt>つくえ</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей тот стол?",
          },
        ],
        uz: [
          {
            jp: "この <ruby>机<rt>つくえ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu stol meniki.",
          },
          {
            jp: "あれは <ruby>先生<rt>せんせい</rt></ruby>の <ruby>机<rt>つくえ</rt></ruby>です。",
            translation: "Anavi — o'qituvchining stoli.",
          },
          {
            jp: "その <ruby>机<rt>つくえ</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu stol kimniki?",
          },
        ],
      },
    },
    {
      id: 75,
      lesson: 2,
      japanese: "いす",
      cleanWord: "いす",
      translations: { ru: "стул", uz: "stul" },
      exampleSentences: {
        ru: {
          jp: "その いすは <ruby>王様<rt>おうさま</rt></ruby>の いすです。あなたの じゃ ありません。",
          translation: "Тот стул (у тебя) — трон короля. Не твой.",
          grammarInfo:
            "【Разбор】\n\n1. 王様の — «(принадлежащий) королю» (ousama).\n\n2. あなたの — «твой».\n\n💡 Традиционно в Японии сидели прямо на полу, стулья (いす) вошли в массовый обиход позже.",
        },
        uz: {
          jp: "その いすは <ruby>王様<rt>おうさま</rt></ruby>の いすです。あなたの じゃ ありません。",
          translation: "U stul — qirolning taxti. Seniki emas.",
          grammarInfo:
            "【Tahlil】\n\n1. 王様の — «qirolning» (ousama).\n\n2. あなたの — «seniki».\n\n💡 An'anaviy Yaponiyada odamlar to'g'ridan-to'g'ri polda o'tirishgan, stullar (いす) keyinchalik ommaviy muomalaga kirgan.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "その いすは あなたの ですか。",
            translation: "Тот стул — твой?",
          },
          {
            jp: "あの いすは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Вон тот стул — учителя.",
          },
          {
            jp: "この いすは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот стул — мой.",
          },
        ],
        uz: [
          {
            jp: "その いすは あなたの ですか。",
            translation: "Shu stul siznikimi?",
          },
          {
            jp: "あの いすは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Anavi stul o'qituvchiniki.",
          },
          {
            jp: "この いすは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu stul meniki.",
          },
        ],
      },
    },
    {
      id: 76,
      lesson: 2,
      japanese: "チョコレート",
      cleanWord: "チョコレート",
      translations: { ru: "шоколад", uz: "shokolad" },
      exampleSentences: {
        ru: {
          jp: "この チョコレートは お<ruby>菓子<rt>かし</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>薬<rt>くすり</rt></ruby>です。",
          translation:
            "Этот шоколад — не сладость. Это моё лекарство (от стресса).",
          grammarInfo:
            "【Разбор】\n\n1. お菓子じゃ ありません — «не сладость / не снек» (okashi).\n\n2. 薬です — «лекарство» (kusuri).\n\n💡 14 февраля в Японии именно женщины дарят шоколад мужчинам! Это огромная индустрия.",
        },
        uz: {
          jp: "この チョコレートは お<ruby>菓子<rt>かし</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>薬<rt>くすり</rt></ruby>です。",
          translation:
            "Bu shokolad — shirinlik emas. Bu mening dorim (stressga qarshi).",
          grammarInfo:
            "【Tahlil】\n\n1. お菓子じゃ ありません — «shirinlik emas» (okashi).\n\n2. 薬です — «dori» (kusuri).\n\n💡 Yaponiyada 14-fevralda aynan ayollar erkaklarga shokolad sovg'a qilishadi! Bu ulkan sanoatdir.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは スイスの チョコレートです。",
            translation: "Это швейцарский шоколад.",
          },
          {
            jp: "その チョコレートは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Тот шоколад — мой.",
          },
          {
            jp: "あの チョコレートは <ruby>先生<rt>せんせい</rt></ruby>の ですか。",
            translation: "Вон тот шоколад — учителя?",
          },
        ],
        uz: [
          {
            jp: "これは スイスの チョコレートです。",
            translation: "Bu Shveysariya shokoladi.",
          },
          {
            jp: "その チョコレートは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Shu shokolad meniki.",
          },
          {
            jp: "あの チョコレートは <ruby>先生<rt>せんせい</rt></ruby>の ですか。",
            translation: "Anavi shokolad o'qituvchinikimi?",
          },
        ],
      },
    },
    {
      id: 77,
      lesson: 2,
      japanese: "コーヒー",
      cleanWord: "コーヒー",
      translations: { ru: "кофе", uz: "kofe" },
      exampleSentences: {
        ru: {
          jp: "これは コーヒーじゃ ありません。<ruby>泥水<rt>どろみず</rt></ruby>です。",
          translation: "Это не кофе. Это грязная вода.",
          grammarInfo:
            "【Разбор】\n\n1. コーヒーじゃ ありません — «не кофе».\n\n2. 泥水です — «грязная вода» (doromizu).\n\n💡 Горячий кофе в Японии продается на каждом углу в железных банках прямо в торговых автоматах.",
        },
        uz: {
          jp: "これは コーヒーじゃ ありません。<ruby>泥水<rt>どろみず</rt></ruby>です。",
          translation: "Bu kofe emas. Bu loyqa suv.",
          grammarInfo:
            "【Tahlil】\n\n1. コーヒーじゃ ありません — «kofe emas».\n\n2. 泥水です — «loyqa suv» (doromizu).\n\n💡 Yaponiyada har bir burchakda avtomat-do'konlardan temir bankalarda qaynoq kofe xarid qilish mumkin.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ブラジルの コーヒーです。",
            translation: "Это кофе из Бразилии.",
          },
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の コーヒーです。",
            translation: "Это мой кофе.",
          },
          { jp: "コーヒーですか。", translation: "Это кофе?" },
        ],
        uz: [
          {
            jp: "ブラジルの コーヒーです。",
            translation: "Bu Braziliya kofesi.",
          },
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の コーヒーです。",
            translation: "Bu mening kofem.",
          },
          { jp: "コーヒーですか。", translation: "Kofemi?" },
        ],
      },
    },
    {
      id: 78,
      lesson: 2,
      japanese: "お<ruby>土産<rt>みやげ</rt></ruby>",
      cleanWord: "お土産",
      translations: { ru: "сувенир", uz: "sovg'a" },
      exampleSentences: {
        ru: {
          jp: "これは パリの お<ruby>土産<rt>みやげ</rt></ruby>ですか。…いいえ、スーパーの チョコレートです。",
          translation: "Это сувенир из Парижа? …Нет, шоколад из супермаркета.",
          grammarInfo:
            "【Разбор】\n\n1. パリの お土産 — «сувенир (из) Парижа».\n\n2. スーパーの — «из супермаркета».\n\n💡 Японцы всегда привозят お土産 (обычно съедобные) из поездок для своих коллег. Это негласный закон.",
        },
        uz: {
          jp: "これは パリの お<ruby>土産<rt>みやげ</rt></ruby>ですか。…いいえ、スーパーの チョコレートです。",
          translation:
            "Bu Parijdan sovg'ami? …Yo'q, supermarketdan olingan shokolad.",
          grammarInfo:
            "【Tahlil】\n\n1. パリの お土産 — «Parijdan (kelgan) sovg'a».\n\n2. スーパーの — «supermarketdan (olingan)».\n\n💡 Yaponlar safardan doim hamkasblari uchun お土産 (odatda yeyiladigan) olib kelishadi. Bu yozilmagan qonundir.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の お<ruby>土産<rt>みやげ</rt></ruby>です。",
            translation: "Это сувенир из Японии.",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>への お<ruby>土産<rt>みやげ</rt></ruby>です。",
            translation: "Это сувенир для учителя.",
          },
          {
            jp: "お<ruby>土産<rt>みやげ</rt></ruby>ですか。",
            translation: "Это сувенир?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の お<ruby>土産<rt>みやげ</rt></ruby>です。",
            translation: "Bu Yaponiyadan esdalik sovg'asi.",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>への お<ruby>土産<rt>みやげ</rt></ruby>です。",
            translation: "Bu o'qituvchi uchun sovg'a.",
          },
          {
            jp: "お<ruby>土産<rt>みやげ</rt></ruby>ですか。",
            translation: "Sovg'ami?",
          },
        ],
      },
    },
    {
      id: 79,
      lesson: 2,
      japanese: "<ruby>英語<rt>えいご</rt></ruby>",
      cleanWord: "英語",
      translations: { ru: "английский язык", uz: "ingliz tili" },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>英語<rt>えいご</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>ですか。…いいえ、ハリウッドの <ruby>俳優<rt>はいゆう</rt></ruby>です。",
          translation:
            "Вон тот человек — учитель английского? …Нет, голливудский актёр.",
          grammarInfo:
            "【Разбор】\n\n1. 英語の 先生 — «учитель английского языка».\n\n2. ハリウッドの 俳優 — «голливудский актёр» (haiyuu).\n\n💡 Японцы часто используют английские слова, но произносят их так (катаканой), что носители их не понимают.",
        },
        uz: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>英語<rt>えいご</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>ですか。…いいえ、ハリウッドの <ruby>俳優<rt>はいゆう</rt></ruby>です。",
          translation:
            "Anavi odam — ingliz tili o'qituvchisimi? …Yo'q, Gollivud aktyori.",
          grammarInfo:
            "【Tahlil】\n\n1. 英語の 先生 — «ingliz tili o'qituvchisi».\n\n2. ハリウッドの 俳優 — «Gollivud aktyori» (haiyuu).\n\n💡 Yaponlar inglizcha so'zlardan ko'p foydalanishadi, lekin ularni katakanada shunday talaffuz qilishadiki, inglizlar tushunmay qoladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>英語<rt>えいご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "Словарь английского языка.",
          },
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>ですか。",
            translation: "Это газета на английском?",
          },
          {
            jp: "<ruby>英語<rt>えいご</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "Учитель английского языка.",
          },
        ],
        uz: [
          {
            jp: "<ruby>英語<rt>えいご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "Ingliz tili lug'ati.",
          },
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>ですか。",
            translation: "Bu ingliz tilidagi gazetam?",
          },
          {
            jp: "<ruby>英語<rt>えいご</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "Ingliz tili o'qituvchisi.",
          },
        ],
      },
    },
    {
      id: 80,
      lesson: 2,
      japanese: "<ruby>日本語<rt>にほんご</rt></ruby>",
      cleanWord: "日本語",
      translations: { ru: "японский язык", uz: "yapon tili" },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>日本語<rt>にほんご</rt></ruby>は アニメの <ruby>日本語<rt>にほんご</rt></ruby>です。ビジネスの じゃ ありません。",
          translation: "Мой японский — это язык из аниме. А не для бизнеса.",
          grammarInfo:
            "【Разбор】\n\n1. アニメの 日本語 — «японский (взятый из) аниме».\n\n2. ビジネスの じゃ ありません — «не для бизнеса» (business).\n\n💡 Разговорный язык в аниме часто грубый или излишне эмоциональный. Использовать его с японским начальником — катастрофа.",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>日本語<rt>にほんご</rt></ruby>は アニメの <ruby>日本語<rt>にほんご</rt></ruby>です。ビジネスの じゃ ありません。",
          translation:
            "Mening yapon tilim — bu animedagi til. Biznes uchun emas.",
          grammarInfo:
            "【Tahlil】\n\n1. アニメの 日本語 — «animedan (olingan) yapon tili».\n\n2. ビジネスの じゃ ありません — «biznes uchun emas» (business).\n\n💡 Animedagi so'zlashuv tili ko'pincha qo'pol yoki o'ta emotsional bo'ladi. Yaponiyalik boshliq bilan gaplashganda uni ishlatish — fojiadir.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>日本語<rt>にほんご</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
            translation: "Книга по японскому языку.",
          },
          {
            jp: "これは <ruby>日本語<rt>にほんご</rt></ruby>の CDです。",
            translation: "Это CD по японскому языку.",
          },
          {
            jp: "<ruby>日本語<rt>にほんご</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "Это журнал на японском?",
          },
        ],
        uz: [
          {
            jp: "<ruby>日本語<rt>にほんご</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
            translation: "Yapon tili kitobi.",
          },
          {
            jp: "これは <ruby>日本語<rt>にほんご</rt></ruby>の CDです。",
            translation: "Bu yapon tili CD si.",
          },
          {
            jp: "<ruby>日本語<rt>にほんご</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "Yapon tilidagi jurnalmi?",
          },
        ],
      },
    },
    {
      id: 81,
      lesson: 2,
      japanese: "〜<ruby>語<rt>ご</rt></ruby>",
      cleanWord: "〜語",
      translations: { ru: "~ язык", uz: "~ tili" },
      exampleSentences: {
        ru: {
          jp: "それは <ruby>何語<rt>なにご</rt></ruby>ですか。…<ruby>猫語<rt>ねこご</rt></ruby>です。",
          translation: "Это на каком языке? …На кошачьем.",
          grammarInfo:
            "【Разбор】\n\n1. 何語 — «какой язык» (вопросительное слово 何 + 語).\n\n2. 猫語 — «кошачий язык» (neko - кошка).\n\n💡 Суффикс 語 можно прикрепить почти к любому существу или стране, чтобы обозначить язык.",
        },
        uz: {
          jp: "それは <ruby>何語<rt>なにご</rt></ruby>ですか。…<ruby>猫語<rt>ねこご</rt></ruby>です。",
          translation: "Bu qaysi tilda? …Mushuklar tilida.",
          grammarInfo:
            "【Tahlil】\n\n1. 何語 — «qaysi til» (so'roq so'zi 何 + 語).\n\n2. 猫語 — «mushuklar tili» (neko - mushuk).\n\n💡 語 qo'shimchasini tilni ifodalash uchun deyarli har qanday mavjudot yoki davlatga qo'shish mumkin.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ロシア<ruby>語<rt>ご</rt></ruby>です。",
            translation: "Русский язык.",
          },
          {
            jp: "ウズベク<ruby>語<rt>ご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "Словарь узбекского языка.",
          },
          {
            jp: "スペイン<ruby>語<rt>ご</rt></ruby>ですか。",
            translation: "Испанский язык?",
          },
        ],
        uz: [
          {
            jp: "ロシア<ruby>語<rt>ご</rt></ruby>です。",
            translation: "Rus tili.",
          },
          {
            jp: "ウズベク<ruby>語<rt>ご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "O'zbek tili lug'ati.",
          },
          {
            jp: "スペイン<ruby>語<rt>ご</rt></ruby>ですか。",
            translation: "Ispan tilimi?",
          },
        ],
      },
    },
    {
      id: 82,
      lesson: 2,
      japanese: "<ruby>何<rt>なん</rt></ruby>",
      cleanWord: "何",
      translations: { ru: "что?", uz: "nima?" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>何<rt>なん</rt></ruby>ですか。コーヒーですか、お<ruby>茶<rt>ちゃ</rt></ruby>ですか。",
          translation: "Что это? Кофе или чай?",
          grammarInfo:
            "【Разбор】\n\n1. 何ですか — «Что (это)?»\n\n2. コーヒーですか、お茶ですか — Выбор: «Кофе? Чай?».\n\n⚠️ Ошибка: читать как «nani desu ka». Перед です кандзи 何 читается строго как «なん» (nan).",
        },
        uz: {
          jp: "これは <ruby>何<rt>なん</rt></ruby>ですか。コーヒーですか、お<ruby>茶<rt>ちゃ</rt></ruby>ですか。",
          translation: "Bu nima? Kofemi yoki choymi?",
          grammarInfo:
            "【Tahlil】\n\n1. 何ですか — «(Bu) nima?»\n\n2. コーヒーですか、お茶ですか — Tanlov: «Kofemi? Choymi?».\n\n⚠️ Xato: «nani desu ka» deb o'qish. です dan oldin 何 iyeroglifi doim «なん» (nan) deb o'qiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "О чём эта книга?",
          },
          {
            jp: "あれは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Что вон там?",
          },
          {
            jp: "その かばんは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Что это за сумка?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Bu nima haqidagi kitob?",
          },
          {
            jp: "あれは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Anavi nima?",
          },
          {
            jp: "その かばんは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Shu qanday sumka?",
          },
        ],
      },
    },
    {
      id: 83,
      lesson: 2,
      japanese: "そう",
      cleanWord: "そう",
      translations: { ru: "так, да", uz: "shunday, ha" },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は スパイですか。…はい、そうです。",
          translation: "Вон тот человек — шпион? …Да, всё так.",
          grammarInfo:
            "【Разбор】\n\n1. はい — «да».\n\n2. そうです — «так (и есть)».\n\n💡 Японцы часто отвечают на вопрос с существительным краткой фразой «はい、そうです» вместо того, чтобы повторять всё слово («Да, он шпион»).",
        },
        uz: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は スパイですか。…はい、そうです。",
          translation: "Anavi odam — josusmi? …Ha, shunday.",
          grammarInfo:
            "【Tahlil】\n\n1. はい — «ha».\n\n2. そうです — «shunday».\n\n💡 Yaponlar ot qatnashgan so'roq gaplarga butun so'zni qaytarmasdan, qisqacha «はい、そうです» deb javob berishadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "はい、そうです。", translation: "Да, это так." },
          { jp: "そうですか。", translation: "Вот как. Понятно." },
          {
            jp: "ミラーさんですか。…はい、そうです。",
            translation: "Вы Миллер? ...Да.",
          },
        ],
        uz: [
          { jp: "はい、そうです。", translation: "Ha, shunday." },
          { jp: "そうですか。", translation: "Shunaqami. Tushunarli." },
          {
            jp: "ミラーさんですか。…はい、そうです。",
            translation: "Siz Millermisiz? ...Ha, shunday.",
          },
        ],
      },
    },
    {
      id: 84,
      lesson: 2,
      japanese: "<ruby>違<rt>ちが</rt></ruby>います。",
      cleanWord: "違います。",
      translations: { ru: "нет, это не так", uz: "yo'q, unday emas" },
      exampleSentences: {
        ru: {
          jp: "あなたは バットマンですか。…いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
          translation: "Вы Бэтмен? …Нет, это не так.",
          grammarInfo:
            "【Разбор】\n\n1. いいえ — «нет».\n\n2. 違います — дословно глагол «отличается». Используется в значении «вы не правы / это не так».\n\n💡 Это самый естественный способ отрицательно ответить на вопрос «А это Б?», не повторяя само слово.",
        },
        uz: {
          jp: "あなたは バットマンですか。…いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
          translation: "Siz Betmenmisiz? …Yo'q, unday emas.",
          grammarInfo:
            "【Tahlil】\n\n1. いいえ — «yo'q».\n\n2. 違います — so'zma-so'z «farq qiladi» degan fe'l. «Siz nohaqsiz / unday emas» ma'nosida ishlatiladi.\n\n💡 Bu «A bu Bmi?» degan savolga otni qaytarmasdan inkor javob berishning eng tabiiy usuli.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Нет, вы ошибаетесь.",
          },
          {
            jp: "医者ですか。…いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Вы врач? ...Нет, это не так.",
          },
          {
            jp: "その 傘は わたしのです。…<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Тот зонт мой. ...Нет, не ваш.",
          },
        ],
        uz: [
          {
            jp: "いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Yo'q, noto'g'ri.",
          },
          {
            jp: "医者ですか。…いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Shifokormisiz? ...Yo'q, unday emas.",
          },
          {
            jp: "その 傘は わたしのです。…<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Shu soyabon meniki. ...Yo'q, noto'g'ri.",
          },
        ],
      },
    },
    {
      id: 85,
      lesson: 2,
      japanese: "そうですか。",
      cleanWord: "そうですか。",
      translations: { ru: "вот как", uz: "shunaqami" },
      exampleSentences: {
        ru: {
          jp: "この カメラは １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。…そうですか。さようなら。",
          translation: "Эта камера стоит миллион иен. …Вот как. До свидания.",
          grammarInfo:
            "【Разбор】\n\n1. そうですか — фраза-реакция. Выражает то, что говорящий принял новую информацию.\n\n2. さようなら — «до свидания».\n\n💡 Интонация в «そうですか» в этом значении падает ВНИЗ, а не идёт вверх (как в обычном вопросе).",
        },
        uz: {
          jp: "この カメラは １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。…そうですか。さようなら。",
          translation: "Bu kamera 1 million iyen turadi. …Shunaqami. Xayr.",
          grammarInfo:
            "【Tahlil】\n\n1. そうですか — reaksiya bildirish iborasi. Gapiruvchi yangi ma'lumotni qabul qilganini bildiradi.\n\n2. さようなら — «xayr».\n\n💡 Bu ma'noda «そうですか» iborasining intonatsiyasi (oddiy so'roq gapdan farqli o'laroq) PASTGA tushadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "あ、そうですか。", translation: "А, понятно." },
          {
            jp: "そうですか。ありがとうございます。",
            translation: "Вот как. Спасибо.",
          },
          {
            jp: "わたしは 医者です。…そうですか。",
            translation: "Я врач. ...Понятно.",
          },
        ],
        uz: [
          { jp: "あ、そうですか。", translation: "A, tushunarli." },
          {
            jp: "そうですか。ありがとうございます。",
            translation: "Shunaqami. Rahmat.",
          },
          {
            jp: "わたしは 医者です。…そうですか。",
            translation: "Men shifokorman. ...Tushunarli.",
          },
        ],
      },
    },
    {
      id: 86,
      lesson: 2,
      japanese: "あのう",
      cleanWord: "あのう",
      translations: { ru: "м-м, простите", uz: "m-m, kechirasiz" },
      exampleSentences: {
        ru: {
          jp: "あのう、この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。あなたの じゃ ありません。",
          translation: "Э-э-э... простите, но это мой зонт. Не ваш.",
          grammarInfo:
            "【Разбор】\n\n1. あのう — междометие, выражающее лёгкое замешательство.\n\n💡 Японцы используют «あのう», чтобы смягчить начало разговора, когда хотят возразить или обратиться к незнакомцу. Это звучит намного вежливее, чем резкое вступление.",
        },
        uz: {
          jp: "あのう、この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。あなたの じゃ ありません。",
          translation:
            "M-m-m... kechirasiz, bu mening soyabonim. Sizniki emas.",
          grammarInfo:
            "【Tahlil】\n\n1. あのう — biroz ikkilanishni bildiruvchi undov so'z.\n\n💡 Yaponlar notanish odamga murojaat qilishda yoki e'tiroz bildirishda suhbat boshini yumshatish uchun «あのう» dan foydalanishadi. Bu to'g'ridan-to'g'ri gapirishdan ko'ra ancha xushmuomala eshitiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "あのう、すみません。", translation: "М-м... извините." },
          {
            jp: "あのう、ミラーさんですか。",
            translation: "Э-э... вы господин Миллер?",
          },
          {
            jp: "あのう、これは お土産です。",
            translation: "Э-э... вот, это сувенир.",
          },
        ],
        uz: [
          {
            jp: "あのう、すみません。",
            translation: "M-m... kechirasiz.",
          },
          {
            jp: "あのう、ミラーさんですか。",
            translation: "M-m... siz Millermisiz?",
          },
          {
            jp: "あのう、これは お土産です。",
            translation: "M-m... bu esdalik sovg'asi.",
          },
        ],
      },
    },
    {
      id: 87,
      lesson: 2,
      japanese: "えっ",
      cleanWord: "えっ",
      translations: { ru: "что?!", uz: "nima?!" },
      exampleSentences: {
        ru: {
          jp: "わたしは ７０<ruby>歳<rt>さい</rt></ruby>です。…えっ？！",
          translation: "Мне 70 лет. ...Что?!",
          grammarInfo:
            "【Разбор】\n\n1. えっ — междометие удивления, произносится отрывисто (маленькая «tsu» на конце означает резкую остановку звука).\n\n💡 Классическая реакция в аниме, когда герой осознаёт, что совершил фатальную ошибку или услышал шокирующий факт.",
        },
        uz: {
          jp: "わたしは ７０<ruby>歳<rt>さい</rt></ruby>です。…えっ？！",
          translation: "Men 70 yoshdaman. ...Nima?!",
          grammarInfo:
            "【Tahlil】\n\n1. えっ — hayratni bildiruvchi undov so'z, qisqa talaffuz qilinadi (oxiridagi kichik «tsu» tovushning keskin to'xtashini bildiradi).\n\n💡 Animelarda qahramon mudhish xatoga yo'l qo'yganini yoki shok xabarni eshitganini anglab yetgandagi klassik reaksiya.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "えっ、本当ですか。", translation: "Что, правда?" },
          { jp: "えっ、わたしですか。", translation: "А? Это вы мне?" },
          { jp: "えっ、そうですか。", translation: "Да неужели?" },
        ],
        uz: [
          { jp: "えっ、本当ですか。", translation: "Nima, rostdanmi?" },
          { jp: "えっ、わたしですか。", translation: "A, menmi?" },
          {
            jp: "えっ、そうですか。",
            translation: "Nahotki shunday bo'lsa?",
          },
        ],
      },
    },
    {
      id: 88,
      lesson: 2,
      japanese: "どうぞ。",
      cleanWord: "どうぞ。",
      translations: { ru: "пожалуйста", uz: "marhamat" },
      exampleSentences: {
        ru: {
          jp: "わたしの <ruby>名刺<rt>めいし</rt></ruby>です。どうぞ。…えっ、ヤクザですか。",
          translation: "Вот моя визитка. Пожалуйста. ...Что, якудза?!",
          grammarInfo:
            "【Разбор】\n\n1. どうぞ — универсальное слово для того, чтобы предложить кому-то вещь, уступить место или пригласить войти.\n\n💡 Не путать с «пожалуйста», когда вы ПРОСИТЕ о чём-то (для этого используется お願いします - onegaishimasu).",
        },
        uz: {
          jp: "わたしの <ruby>名刺<rt>めいし</rt></ruby>です。どうぞ。…えっ、ヤクザですか。",
          translation: "Mening vizitkam. Marhamat. ...Nima, yakuzamisiz?!",
          grammarInfo:
            "【Tahlil】\n\n1. どうぞ — kimgadir biror narsa taklif qilish, joy berish yoki kirishga taklif qilish uchun universal so'z.\n\n💡 Birovdan biror narsa SO'RAGANDAGI «iltimos» bilan adashtirmang (buning uchun お願いします - onegaishimasu ishlatiladi).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "どうぞ。",
            translation: "Пожалуйста (возьмите/проходите).",
          },
          {
            jp: "これ、どうぞ。",
            translation: "Вот это, пожалуйста (возьмите).",
          },
          {
            jp: "お茶、どうぞ。",
            translation: "Чай, пожалуйста (угощайтесь).",
          },
        ],
        uz: [
          { jp: "どうぞ。", translation: "Marhamat (oling/kiring)." },
          { jp: "これ、どうぞ。", translation: "Buni oling, marhamat." },
          { jp: "お茶、どうぞ。", translation: "Choy iching, marhamat." },
        ],
      },
    },
    {
      id: 89,
      lesson: 2,
      japanese: "どうも ありがとう ございます",
      cleanWord: "どうも ありがとう ございます",
      translations: { ru: "большое спасибо", uz: "katta rahmat" },
      exampleSentences: {
        ru: {
          jp: "これ、１００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。どうぞ。…どうも ありがとう ございます！",
          translation: "Вот 1 миллион иен. Пожалуйста. ...Огромное спасибо!!",
          grammarInfo:
            "【Разбор】\n\n1. どうも — «очень».\n\n2. ありがとうございます — «спасибо» (вежливая форма).\n\n💡 Если сказать просто «ありがとう», это будет звучать по-дружески (невежливо по отношению к старшим).",
        },
        uz: {
          jp: "これ、１００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。どうぞ。…どうも ありがとう ございます！",
          translation: "Mana 1 million iyen. Marhamat. ...Katta rahmat!!",
          grammarInfo:
            "【Tahlil】\n\n1. どうも — «juda / katta».\n\n2. ありがとうございます — «rahmat» (hurmat shakli).\n\n💡 Shunchaki «ありがとう» deyish do'stona eshitiladi (o'zidan kattalarga nisbatan hurmatsizlik bo'lishi mumkin).",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "どうも。", translation: "Спасибо. (коротко)" },
          {
            jp: "ありがとうございます。",
            translation: "Спасибо (вежливо).",
          },
          {
            jp: "どうも ありがとうございます。",
            translation: "Большое спасибо (очень вежливо).",
          },
        ],
        uz: [
          { jp: "どうも。", translation: "Rahmat. (qisqa)" },
          {
            jp: "ありがとうございます。",
            translation: "Rahmat (xushmuomala).",
          },
          {
            jp: "どうも ありがとうございます。",
            translation: "Katta rahmat (juda xushmuomala).",
          },
        ],
      },
    },
    {
      id: 90,
      lesson: 2,
      japanese: "あ",
      cleanWord: "あ",
      translations: { ru: "ах!", uz: "a!" },
      exampleSentences: {
        ru: {
          jp: "あ、わたしの <ruby>車<rt>くるま</rt></ruby>！…あなたの じゃ ありません！",
          translation: "Ах, моя машина! ...Она не твоя! (крик вслед угонщику)",
          grammarInfo:
            "【Разбор】\n\n1. あ — междометие. Произносится, когда человек внезапно что-то замечает или вспоминает.\n\n💡 В японском очень много коротких эмоциональных вскриков, и «あ» — самый частый из них.",
        },
        uz: {
          jp: "あ、わたしの <ruby>車<rt>くるま</rt></ruby>！…あなたの じゃ ありません！",
          translation:
            "A, mening mashinam! ...U seniki emas! (o'g'rining ortidan qichqiriq)",
          grammarInfo:
            "【Tahlil】\n\n1. あ — undov so'z. Odam to'satdan biror narsani payqab qolganda yoki eslaganda aytiladi.\n\n💡 Yapon tilida qisqa hissiy undovlar juda ko'p bo'lib, «あ» shulardan eng ko'p ishlatiladiganidir.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "あ、そうですか。", translation: "А, вот как." },
          { jp: "あ、ミラーさん。", translation: "О, господин Миллер." },
          { jp: "あ、すみません。", translation: "Ой, извините." },
        ],
        uz: [
          { jp: "あ、そうですか。", translation: "A, shunaqami." },
          { jp: "あ、ミラーさん。", translation: "O, Miller janoblari." },
          { jp: "あ、すみません。", translation: "Voy, kechirasiz." },
        ],
      },
    },
    {
      id: 91,
      lesson: 2,
      japanese: "これから お<ruby>世話<rt>せわ</rt></ruby>に なります",
      cleanWord: "これから お世話に なります",
      translations: {
        ru: "надеюсь на поддержку",
        uz: "g'amxo'rligingizdan umidvorman",
      },
      exampleSentences: {
        ru: {
          jp: "わたしは <ruby>猫<rt>ねこ</rt></ruby>の タマです。これから お<ruby>世話<rt>せわ</rt></ruby>に なります。",
          translation:
            "Я кот по имени Тама. С надеждой на вашу поддержку (и корм).",
          grammarInfo:
            "【Разбор】\n\n1. これから — «с этого момента».\n\n2. お世話に なります — устоявшееся выражение «вручаю себя вашим заботам».\n\n💡 Эта фраза ОБЯЗАТЕЛЬНА, когда вы переезжаете к кому-то, поступаете на работу или въезжаете в новое жильё.",
        },
        uz: {
          jp: "わたしは <ruby>猫<rt>ねこ</rt></ruby>の タマです。これから お<ruby>世話<rt>せわ</rt></ruby>に なります。",
          translation:
            "Men Tama ismli mushukman. Bundan buyon g'amxo'rligingizdan umidvorman.",
          grammarInfo:
            "【Tahlil】\n\n1. これから — «bundan buyon».\n\n2. お世話に なります — «o'zimni sizning g'amxo'rligingizga topshiraman» degan qolip ibora.\n\n💡 Bu ibora kimgadir qo'shnichilikka ko'chib o'tganda, ishga kirganda yoki yangi uyga ko'chganda MAJBURIY aytilishi kerak.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これから お世話に なります。",
            translation: "Рассчитываю на вашу поддержку в будущем.",
          },
          {
            jp: "山田です。これから お世話に なります。",
            translation: "Я Ямада. Прошу любить и жаловать.",
          },
          {
            jp: "こちらこそ、これから お世話に なります。",
            translation: "И я тоже надеюсь на вашу поддержку.",
          },
        ],
        uz: [
          {
            jp: "これから お世話に なります。",
            translation: "Kelajakda qo'llab-quvvatlashingizdan umidvorman.",
          },
          {
            jp: "山田です。これから お世話に なります。",
            translation: "Men Yamada. G'amxo'rligingizdan umidvorman.",
          },
          {
            jp: "こちらこそ、これから お世話に なります。",
            translation: "Men ham qo'llab-quvvatlashingizdan umidvorman.",
          },
        ],
      },
    },
    {
      id: 92,
      lesson: 2,
      japanese: "こちらこそ よろしく お<ruby>願<rt>ねが</rt></ruby>いします",
      cleanWord: "こちらこそ よろしく お願いします",
      translations: {
        ru: "мне тоже очень приятно",
        uz: "men ham xursandman",
      },
      exampleSentences: {
        ru: {
          jp: "わたしは <ruby>宇宙人<rt>うちゅうじん</rt></ruby>です。よろしく お<ruby>願<rt>ねが</rt></ruby>いします。…こちらこそ よろしく お<ruby>願<rt>ねが</rt></ruby>いします。",
          translation:
            "Я инопланетянин. Рад знакомству. ...М-мне тоже очень приятно.",
          grammarInfo:
            "【Разбор】\n\n1. こちらこそ — «с моей стороны тоже» (ответ на приветствие).\n\n2. よろしく お願いします — вежливая просьба о хорошем отношении.\n\n💡 Японцы настолько привыкли к этой фразе, что отвечают ею почти на автомате в любой ситуации знакомства.",
        },
        uz: {
          jp: "わたしは <ruby>宇宙人<rt>うちゅうじん</rt></ruby>です。よろしく お<ruby>願<rt>ねが</rt></ruby>いします。…こちらこそ よろしく お<ruby>願<rt>ねが</rt></ruby>いします。",
          translation:
            "Men o'zga sayyoralikman. Tanishganimdan xursandman. ...M-men ham tanishganimdan xursandman.",
          grammarInfo:
            "【Tahlil】\n\n1. こちらこそ — «mening tarafimdan ham» (salomlashishga javob).\n\n2. よろしく お願いします — yaxshi munosabatda bo'lishni xushmuomalalik bilan so'rash.\n\n💡 Yaponlar bu iboraga shunchalik o'rganib qolishganki, tanishuvning har qanday holatida avtomatik ravishda shu javobni qaytarishadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "こちらこそ。", translation: "Мне тоже. (коротко)" },
          {
            jp: "こちらこそ よろしく。",
            translation: "Мне тоже приятно познакомиться.",
          },
          {
            jp: "こちらこそ どうぞ よろしく おねがいします。",
            translation: "И мне очень приятно познакомиться.",
          },
        ],
        uz: [
          { jp: "こちらこそ。", translation: "Men ham. (qisqa)" },
          {
            jp: "こちらこそ よろしく。",
            translation: "Men ham tanishganimdan xursandman.",
          },
          {
            jp: "こちらこそ どうぞ よろしく おねがいします。",
            translation: "Men ham tanishganimdan juda xursandman.",
          },
        ],
      },
    },
    {
      id: 47,
      lesson: 2,
      japanese: "これ",
      cleanWord: "これ",
      translations: { ru: "это (рядом)", uz: "bu (yaqinda)" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>水<rt>みず</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>涙<rt>なみだ</rt></ruby>です。",
          translation: "Это не вода. Это мои слезы.",
          grammarInfo:
            "【Разбор】\n\n1. これは — «это» (близко к говорящему) + は (тема).\n\n2. 水じゃ ありません — отрицание: «не вода».\n\n3. 私の 涙です — «мои слёзы» + связка です.\n\n💡 Указательное местоимение これ работает как самостоятельное существительное.",
        },
        uz: {
          jp: "これは <ruby>水<rt>みず</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>涙<rt>なみだ</rt></ruby>です。",
          translation: "Bu suv emas. Bu mening ko'z yoshlarim.",
          grammarInfo:
            "【Tahlil】\n\n1. これは — «bu» (gapiruvchiga yaqin) + は (mavzu).\n\n2. 水じゃ ありません — inkor: «suv emas».\n\n3. 私の 涙です — «mening ko'z yoshlarim» + です.\n\n💡 これ ko'rsatish olmoshi mustaqil ot kabi ishlaydi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
            translation: "Это моя книга.",
          },
          {
            jp: "これも カメラですか。",
            translation: "Это тоже камера?",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Что это?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
            translation: "Bu mening kitobim.",
          },
          {
            jp: "これも カメラですか。",
            translation: "Bu ham kamerami?",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Bu nima?",
          },
        ],
      },
    },
    {
      id: 48,
      lesson: 2,
      japanese: "それ",
      cleanWord: "それ",
      translations: {
        ru: "то (у собеседника)",
        uz: "shu (suhbatdoshdagi)",
      },
      exampleSentences: {
        ru: {
          jp: "それは コーヒーじゃ ありません。<ruby>醤油<rt>しょうゆ</rt></ruby>です。",
          translation: "То (у вас) не кофе. Это соевый соус.",
          grammarInfo:
            "【Разбор】\n\n1. それは — «то» (предмет у собеседника) + は.\n\n2. コーヒーじゃ ありません — «не кофе».\n\n3. 醤油です — «соевый соус».\n\n💡 В Японии соевый соус часто наливают в кувшинчики, похожие на кофейные. Будьте осторожны!",
        },
        uz: {
          jp: "それは コーヒーじゃ ありません。<ruby>醤油<rt>しょうゆ</rt></ruby>です。",
          translation: "Shu (sizdagi) kofe emas. Bu soya sousi.",
          grammarInfo:
            "【Tahlil】\n\n1. それは — «shu» (suhbatdoshdagi narsa) + は.\n\n2. コーヒーじゃ ありません — «kofe emas».\n\n3. 醤油です — «soya sousi».\n\n💡 Yaponiyada soya sousini ko'pincha kofe idishiga o'xshash idishlarda tortishadi. Ehtiyot bo'ling!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "それは <ruby>辞書<rt>じしょ</rt></ruby>ですか。",
            translation: "То — словарь?",
          },
          {
            jp: "それは <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。",
            translation: "То не моё.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>ですか。",
            translation: "Чей то зонт?",
          },
        ],
        uz: [
          {
            jp: "それは <ruby>辞書<rt>じしょ</rt></ruby>ですか。",
            translation: "Shu lug'atmi?",
          },
          {
            jp: "それは <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。",
            translation: "Shu meniki emas.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>ですか。",
            translation: "Shu kimning soyaboni?",
          },
        ],
      },
    },
    {
      id: 49,
      lesson: 2,
      japanese: "あれ",
      cleanWord: "あれ",
      translations: { ru: "вон то (вдали)", uz: "anavi (uzoqdagi)" },
      exampleSentences: {
        ru: {
          jp: "あれは <ruby>富士山<rt>ふじさん</rt></ruby>じゃ ありません。ゴジラです。",
          translation: "Вон то — не гора Фудзи. Это Годзилла.",
          grammarInfo:
            "【Разбор】\n\n1. あれは — местоимение «вон то» (далеко от обоих) + は.\n\n2. 富士山じゃ ありません — отрицание существительного.\n\n💡 あれ идеально подходит для объектов на горизонте или вне досягаемости обоих собеседников.",
        },
        uz: {
          jp: "あれは <ruby>富士山<rt>ふじさん</rt></ruby>じゃ ありません。ゴジラです。",
          translation: "Anavi uzoqdagi — Fuji tog'i emas. Bu Godzilla.",
          grammarInfo:
            "【Tahlil】\n\n1. あれは — olmosh «anavi» (ikkalasidan ham uzoqda) + は.\n\n2. 富士山じゃ ありません — ot inkor shaklida.\n\n💡 あれ ufqdagi yoki har ikki suhbatdosh yetib bora olmaydigan uzoqdagi narsalar uchun juda mos.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あれは <ruby>会社<rt>かいしゃ</rt></ruby>です。",
            translation: "Вон то — компания.",
          },
          {
            jp: "あれは <ruby>私<rt>わたし</rt></ruby>の <ruby>車<rt>くるま</rt></ruby>です。",
            translation: "Вон там — моя машина.",
          },
          {
            jp: "あれは カメラですか。",
            translation: "Вон то — камера?",
          },
        ],
        uz: [
          {
            jp: "あれは <ruby>会社<rt>かいしゃ</rt></ruby>です。",
            translation: "Anavi — kompaniya.",
          },
          {
            jp: "あれは <ruby>私<rt>わたし</rt></ruby>の <ruby>車<rt>くるま</rt></ruby>です。",
            translation: "Anavi — mening mashinam.",
          },
          { jp: "あれは カメラですか。", translation: "Anavi kamerami?" },
        ],
      },
    },
    {
      id: 50,
      lesson: 2,
      japanese: "この",
      cleanWord: "この",
      translations: { ru: "этот～", uz: "bu～" },
      exampleSentences: {
        ru: {
          jp: "この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。ヤクザの <ruby>傘<rt>かさ</rt></ruby>です。",
          translation: "Этот зонт — не мой. Это зонт якудзы.",
          grammarInfo:
            "【Разбор】\n\n1. この 傘は — «этот зонт». Указательное слово この всегда требует после себя существительное.\n\n2. ヤクザの — «(принадлежит) якудзе».\n\n⚠️ Грубая ошибка: сказать просто «このは» вместо «これは» или «この 傘は».",
        },
        uz: {
          jp: "この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。ヤクザの <ruby>傘<rt>かさ</rt></ruby>です。",
          translation: "Bu soyabon — meniki emas. Bu yakudzaning soyaboni.",
          grammarInfo:
            "【Tahlil】\n\n1. この 傘は — «bu soyabon». この ko'rsatish so'zi har doim o'zidan keyin ot talab qiladi.\n\n2. ヤクザの — «yakudzaga (tegishli)».\n\n⚠️ Qo'pol xato: «これは» yoki «この 傘は» o'rniga shunchaki «このは» deb aytish.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>本<rt>ほん</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Эта книга — моя.",
          },
          {
            jp: "この <ruby>人<rt>ひと</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>ですか。",
            translation: "Кто этот человек?",
          },
          {
            jp: "この 辞書は 誰の ですか。",
            translation: "Чей это словарь?",
          },
        ],
        uz: [
          {
            jp: "この <ruby>本<rt>ほん</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu kitob — meniki.",
          },
          {
            jp: "この <ruby>人<rt>ひと</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>ですか。",
            translation: "Bu odam kim?",
          },
          {
            jp: "この 辞書は 誰の ですか。",
            translation: "Bu lug'at kimniki?",
          },
        ],
      },
    },
    {
      id: 51,
      lesson: 2,
      japanese: "その",
      cleanWord: "その",
      translations: { ru: "тот～ (у собеседника)", uz: "shu～" },
      exampleSentences: {
        ru: {
          jp: "その かぎは <ruby>車<rt>くるま</rt></ruby>の かぎですか。…いいえ、<ruby>私<rt>わたし</rt></ruby>の <ruby>心<rt>こころ</rt></ruby>の かぎです。",
          translation:
            "Тот ключ у тебя — от машины? ...Нет, это ключ от моего сердца.",
          grammarInfo:
            "【Разбор】\n\n1. その かぎ — «тот ключ» (в руках собеседника).\n\n2. 車の かぎ — «ключ от машины» (целевое назначение: の).\n\n3. 心の かぎ — «ключ от сердца».",
        },
        uz: {
          jp: "その かぎは <ruby>車<rt>くるま</rt></ruby>の かぎですか。…いいえ、<ruby>私<rt>わたし</rt></ruby>の <ruby>心<rt>こころ</rt></ruby>の かぎです。",
          translation:
            "Shu yoningizdagi kalit — mashina kalitimi? ...Yo'q, bu mening qalbimning kaliti.",
          grammarInfo:
            "【Tahlil】\n\n1. その かぎ — «shu kalit» (suhbatdoshning qo'lidagi).\n\n2. 車の かぎ — «mashina kaliti» (vazifasi: の).\n\n3. 心の かぎ — «qalb kaliti».",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "その かぎは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Тот ключ — мой.",
          },
          {
            jp: "その <ruby>時計<rt>とけい</rt></ruby>は スイスの ですか。",
            translation: "Те часы — швейцарские?",
          },
          {
            jp: "その かばんは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чья та сумка?",
          },
        ],
        uz: [
          {
            jp: "その かぎは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Shu kalit — meniki.",
          },
          {
            jp: "その <ruby>時計<rt>とけい</rt></ruby>は スイスの ですか。",
            translation: "Shu soat Shveysariyanikimi?",
          },
          {
            jp: "その かばんは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu sumka kimniki?",
          },
        ],
      },
    },
    {
      id: 52,
      lesson: 2,
      japanese: "あの",
      cleanWord: "あの",
      translations: { ru: "вон тот～", uz: "anavi～" },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>医者<rt>いしゃ</rt></ruby>じゃ ありません。スパイです。",
          translation: "Вон тот человек — не врач. Он шпион.",
          grammarInfo:
            "【Разбор】\n\n1. あの 人は — «вон тот человек» (далеко от обоих).\n\n2. 医者じゃ ありません — «не врач».\n\n💡 Сочетание あの 人 (ano hito) — самый частый способ сказать «он/она» о человеке поодаль.",
        },
        uz: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>医者<rt>いしゃ</rt></ruby>じゃ ありません。スパイです。",
          translation: "Anavi odam — shifokor emas. U josus.",
          grammarInfo:
            "【Tahlil】\n\n1. あの 人は — «anavi odam» (ikkalasidan ham uzoqda).\n\n2. 医者じゃ ありません — «shifokor emas».\n\n💡 あの 人 (ano hito) birikmasi — narida turgan kimgadir nisbatan «u» deyishning eng keng tarqalgan usuli.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あの <ruby>車<rt>くるま</rt></ruby>は ミラーさんの です。",
            translation: "Та машина (вдали) — мистера Миллера.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>ですか。",
            translation: "Кто вон тот человек?",
          },
          {
            jp: "あの <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Вон тот зонт — мой.",
          },
        ],
        uz: [
          {
            jp: "あの <ruby>車<rt>くるま</rt></ruby>は ミラーさんの です。",
            translation: "Anavi mashina janob Millerniki.",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>ですか。",
            translation: "Anavi odam kim?",
          },
          {
            jp: "あの <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Anavi soyabon meniki.",
          },
        ],
      },
    },
    {
      id: 53,
      lesson: 2,
      japanese: "<ruby>本<rt>ほん</rt></ruby>",
      cleanWord: "本",
      translations: { ru: "книга", uz: "kitob" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>料理<rt>りょうり</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>じゃ ありません。<ruby>黒魔術<rt>くろまじゅつ</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
          translation: "Это не кулинарная книга. Это книга по черной магии.",
          grammarInfo:
            "【Разбор】\n\n1. 料理の 本 — «книга по кулинарии» (の указывает на содержание книги).\n\n2. じゃ ありません — отрицание связки です.\n\n3. 黒魔術の 本です — «книга черной магии».",
        },
        uz: {
          jp: "これは <ruby>料理<rt>りょうり</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>じゃ ありません。<ruby>黒魔術<rt>くろまじゅつ</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
          translation: "Bu pazandachilik kitobi emas. Bu qora sehr kitobi.",
          grammarInfo:
            "【Tahlil】\n\n1. 料理の 本 — «pazandachilik kitobi» (の kitob nima haqidaligini bildiradi).\n\n2. じゃ ありません — です bog'lovchisining inkor shakli.\n\n3. 黒魔術の 本です — «qora sehr kitobi».",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "それは <ruby>車<rt>くるま</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Это книга о машинах?",
          },
          {
            jp: "この <ruby>本<rt>ほん</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Эта книга — моя.",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "О чем эта книга?",
          },
        ],
        uz: [
          {
            jp: "それは <ruby>車<rt>くるま</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "U mashinalar haqidagi kitobmi?",
          },
          {
            jp: "この <ruby>本<rt>ほん</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu kitob meniki.",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Bu nima haqidagi kitob?",
          },
        ],
      },
    },
    {
      id: 54,
      lesson: 2,
      japanese: "<ruby>辞書<rt>じしょ</rt></ruby>",
      cleanWord: "辞書",
      translations: { ru: "словарь", uz: "lugʻat" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>辞書<rt>じしょ</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>枕<rt>まくら</rt></ruby>です。",
          translation: "Это не словарь. Это моя подушка.",
          grammarInfo:
            "【Разбор】\n\n1. 辞書じゃ ありません — «не словарь».\n\n2. 私の 枕 — «моя подушка» (makura).\n\n💡 Тяжелые бумажные словари японского языка идеально подходят для сна на парте во время скучных лекций!",
        },
        uz: {
          jp: "これは <ruby>辞書<rt>じしょ</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>枕<rt>まくら</rt></ruby>です。",
          translation: "Bu lugʻat emas. Bu mening yostigʻim.",
          grammarInfo:
            "【Tahlil】\n\n1. 辞書じゃ ありません — «lugʻat emas».\n\n2. 私の 枕 — «mening yostig'im» (makura).\n\n💡 Og'ir qog'ozli yapon tili lug'atlari zerikarli ma'ruzalar paytida partada uxlash uchun juda mos keladi!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あの <ruby>辞書<rt>じしょ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Тот словарь (вдали) — учителя.",
          },
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "Это словарь английского языка.",
          },
          {
            jp: "その <ruby>辞書<rt>じしょ</rt></ruby>は あなたの ですか。",
            translation: "Тот словарь — твой?",
          },
        ],
        uz: [
          {
            jp: "あの <ruby>辞書<rt>じしょ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Anavi lug'at o'qituvchiniki.",
          },
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "Bu ingliz tili lug'ati.",
          },
          {
            jp: "その <ruby>辞書<rt>じしょ</rt></ruby>は あなたの ですか。",
            translation: "Shu lug'at siznikimi?",
          },
        ],
      },
    },
    {
      id: 55,
      lesson: 2,
      japanese: "<ruby>雑誌<rt>ざっし</rt></ruby>",
      cleanWord: "雑誌",
      translations: { ru: "журнал", uz: "jurnal" },
      exampleSentences: {
        ru: {
          jp: "それは <ruby>車<rt>くるま</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>ですか。…いいえ、ＵＦＯの <ruby>雑誌<rt>ざっし</rt></ruby>です。",
          translation:
            "Это у тебя журнал об автомобилях? ...Нет, журнал об НЛО.",
          grammarInfo:
            "【Разбор】\n\n1. 車の 雑誌 — «журнал о машинах».\n\n2. ＵＦＯの 雑誌 — «журнал об НЛО» (yuu-foo).\n\n💡 В Японии журналы продаются в любом комбини, и многие читают их прямо у витрины.",
        },
        uz: {
          jp: "それは <ruby>車<rt>くるま</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>ですか。…いいえ、ＵＦＯの <ruby>雑誌<rt>ざっし</rt></ruby>です。",
          translation: "Shu mashinalar jurnalimi? ...Yo'q, NUJ haqida jurnal.",
          grammarInfo:
            "【Tahlil】\n\n1. 車の 雑誌 — «mashinalar jurnali».\n\n2. ＵＦＯの 雑誌 — «NUJ haqida jurnal» (yuu-foo).\n\n💡 Yaponiyada jurnallar har qanday do'konda sotiladi va ko'pchilik ularni vitrina oldida turib o'qiydi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>車<rt>くるま</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>です。",
            translation: "Это журнал об автомобилях.",
          },
          {
            jp: "それは カメラの <ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "Это журнал о камерах?",
          },
          {
            jp: "その <ruby>雑誌<rt>ざっし</rt></ruby>も <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Тот журнал тоже мой.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>車<rt>くるま</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>です。",
            translation: "Bu avtomobillar jurnali.",
          },
          {
            jp: "それは カメラの <ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "U kameralar jurnalimi?",
          },
          {
            jp: "その <ruby>雑誌<rt>ざっし</rt></ruby>も <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Shu jurnal ham meniki.",
          },
        ],
      },
    },
    {
      id: 56,
      lesson: 2,
      japanese: "<ruby>新聞<rt>しんぶん</rt></ruby>",
      cleanWord: "新聞",
      translations: { ru: "газета", uz: "gazeta" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>今日<rt>きょう</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>じゃ ありません。<ruby>未来<rt>みらい</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>です。",
          translation: "Это не сегодняшняя газета. Это газета из будущего.",
          grammarInfo:
            "【Разбор】\n\n1. 今日の 新聞 — «газета (от) сегодня» (kyou).\n\n2. 未来の 新聞 — «газета из будущего» (mirai).\n\n💡 Япония до сих пор остается страной, где по утрам миллионы людей читают свежие бумажные газеты в метро.",
        },
        uz: {
          jp: "これは <ruby>今日<rt>きょう</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>じゃ ありません。<ruby>未来<rt>みらい</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>です。",
          translation: "Bu bugungi gazeta emas. Bu kelajak gazetasi.",
          grammarInfo:
            "【Tahlil】\n\n1. 今日の 新聞 — «bugungi gazeta» (kyou).\n\n2. 未来の 新聞 — «kelajak gazetasi» (mirai).\n\n💡 Yaponiya hali ham har kuni ertalab millionlab odamlar metroning o'zida yangi qog'oz gazetalar o'qiydigan davlat bo'lib qolmoqda.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>です。",
            translation: "Это японская газета.",
          },
          {
            jp: "あれは <ruby>新聞<rt>しんぶん</rt></ruby>ですか、<ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "То вдали — газета или журнал?",
          },
          {
            jp: "あの <ruby>新聞<rt>しんぶん</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чья та газета?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>です。",
            translation: "Bu yapon gazetasi.",
          },
          {
            jp: "あれは <ruby>新聞<rt>しんぶん</rt></ruby>ですか、<ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "Anavi gazetami yoki jurnalmi?",
          },
          {
            jp: "あの <ruby>新聞<rt>しんぶん</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi gazeta kimniki?",
          },
        ],
      },
    },
    {
      id: 57,
      lesson: 2,
      japanese: "ノート",
      cleanWord: "ノート",
      translations: { ru: "тетрадь", uz: "daftar" },
      exampleSentences: {
        ru: {
          jp: "この ノートは デスノートですか。…いいえ、<ruby>英語<rt>えいご</rt></ruby>の ノートです。",
          translation:
            "Эта тетрадь — Тетрадь Смерти? ...Нет, это тетрадь по английскому.",
          grammarInfo:
            "【Разбор】\n\n1. デスノート — «Тетрадь Смерти» (Death Note, известное аниме).\n\n2. 英語の ノート — «тетрадь для английского».\n\n💡 Японское ノート произошло от английского «notebook», но означает только бумажную тетрадь. Ноутбук — это パソコン (pasokon).",
        },
        uz: {
          jp: "この ノートは デスノートですか。…いいえ、<ruby>英語<rt>えいご</rt></ruby>の ノートです。",
          translation:
            "Bu daftar — Ajal daftarimi? ...Yo'q, bu ingliz tili daftari.",
          grammarInfo:
            "【Tahlil】\n\n1. デスノート — «Ajal daftari» (Death Note, mashhur anime).\n\n2. 英語の ノート — «ingliz tili daftari».\n\n💡 Yaponcha ノート inglizcha «notebook» dan kelib chiqqan, lekin faqat qog'oz daftarni bildiradi. Noutbuk kompyuter esa パソコン (pasokon) deyiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "その ノートは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Та тетрадь — моя.",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の ノートですか。",
            translation: "Для чего эта тетрадь?",
          },
          {
            jp: "あの ノートも <ruby>先生<rt>せんせい</rt></ruby>の ですか。",
            translation: "Вон та тетрадь тоже учителя?",
          },
        ],
        uz: [
          {
            jp: "その ノートは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Shu daftar — meniki.",
          },
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の ノートですか。",
            translation: "Bu nima uchun mo'ljallangan daftar?",
          },
          {
            jp: "あの ノートも <ruby>先生<rt>せんせい</rt></ruby>の ですか。",
            translation: "Anavi daftar ham o'qituvchinikimi?",
          },
        ],
      },
    },
    {
      id: 58,
      lesson: 2,
      japanese: "<ruby>手帳<rt>てちょう</rt></ruby>",
      cleanWord: "手帳",
      translations: { ru: "блокнот", uz: "yondaftar" },
      exampleSentences: {
        ru: {
          jp: "この <ruby>手帳<rt>てちょう</rt></ruby>は <ruby>大統領<rt>だいとうりょう</rt></ruby>の <ruby>手帳<rt>てちょう</rt></ruby>です。あなたの じゃ ありません。",
          translation: "Это блокнот президента. Не твой.",
          grammarInfo:
            "【Разбор】\n\n1. 大統領の — «(принадлежащий) президенту» (daitouryou).\n\n2. あなたの じゃ ありません — «не твой».\n\n💡 Даже в эпоху смартфонов японские офисные работники обожают карманные бумажные планировщики.",
        },
        uz: {
          jp: "この <ruby>手帳<rt>てちょう</rt></ruby>は <ruby>大統領<rt>だいとうりょう</rt></ruby>の <ruby>手帳<rt>てちょう</rt></ruby>です。あなたの じゃ ありません。",
          translation: "Bu prezidentning yondaftari. Seniki emas.",
          grammarInfo:
            "【Tahlil】\n\n1. 大統領の — «prezidentga (tegishli)» (daitouryou).\n\n2. あなたの じゃ ありません — «seniki emas».\n\n💡 Smartfonlar davrida ham yapon ofis xodimlari cho'ntak qog'oz rejalashtirgichlarini yaxshi ko'radilar.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>手帳<rt>てちょう</rt></ruby>は ミラーさんの です。",
            translation: "Этот блокнот — мистера Миллера.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>手帳<rt>てちょう</rt></ruby>ですか。",
            translation: "Чей это блокнот?",
          },
          {
            jp: "その <ruby>手帳<rt>てちょう</rt></ruby>を ください。",
            translation: "Дайте, пожалуйста, этот блокнот.",
          },
        ],
        uz: [
          {
            jp: "この <ruby>手帳<rt>てちょう</rt></ruby>は ミラーさんの です。",
            translation: "Bu yondaftar janob Millerniki.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>手帳<rt>てちょう</rt></ruby>ですか。",
            translation: "U kimning yondaftari?",
          },
          {
            jp: "その <ruby>手帳<rt>てちょう</rt></ruby>を ください。",
            translation: "Iltimos, shu yondaftarni bering.",
          },
        ],
      },
    },
    {
      id: 59,
      lesson: 2,
      japanese: "<ruby>名刺<rt>めいし</rt></ruby>",
      cleanWord: "名刺",
      translations: { ru: "визитка", uz: "vizitka" },
      exampleSentences: {
        ru: {
          jp: "これは イーロン・マスクの <ruby>名刺<rt>めいし</rt></ruby>です。<ruby>私<rt>わたし</rt></ruby>の <ruby>宝物<rt>たからもの</rt></ruby>です。",
          translation: "Это визитка Илона Маска. Мое сокровище.",
          grammarInfo:
            "【Разбор】\n\n1. イーロン・マスクの — «(принадлежит) Илону Маску».\n\n2. 宝物です — «является сокровищем» (takaramono).\n\n💡 Обмен визитками (名刺交換) в Японии — это священный ритуал бизнеса.",
        },
        uz: {
          jp: "これは イーロン・マスクの <ruby>名刺<rt>めいし</rt></ruby>です。<ruby>私<rt>わたし</rt></ruby>の <ruby>宝物<rt>たからもの</rt></ruby>です。",
          translation: "Bu Ilon Maskning vizitkasi. Mening xazinam.",
          grammarInfo:
            "【Tahlil】\n\n1. イーロン・マスクの — «Ilon Maskga (tegishli)».\n\n2. 宝物です — «xazinadir» (takaramono).\n\n💡 Yaponiyada vizitkalar almashinuvi (名刺交換) biznesning muqaddas marosimidir.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>名刺<rt>めいし</rt></ruby>です。",
            translation: "Это моя визитка.",
          },
          {
            jp: "あの <ruby>名刺<rt>めいし</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чья та визитка?",
          },
          {
            jp: "この <ruby>名刺<rt>めいし</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Эта визитка — учителя.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>名刺<rt>めいし</rt></ruby>です。",
            translation: "Bu mening vizitkam.",
          },
          {
            jp: "あの <ruby>名刺<rt>めいし</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi vizitka kimniki?",
          },
          {
            jp: "この <ruby>名刺<rt>めいし</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Bu vizitka o'qituvchiniki.",
          },
        ],
      },
    },
    {
      id: 60,
      lesson: 2,
      japanese: "カード",
      cleanWord: "カード",
      translations: { ru: "карта", uz: "karta" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>銀行<rt>ぎんこう</rt></ruby>の カードじゃ ありません。イルミナティの カードです。",
          translation: "Это не банковская карта. Это карта Иллюминатов.",
          grammarInfo:
            "【Разбор】\n\n1. 銀行の カード — «карта банка».\n\n2. じゃ ありません — отрицание.\n\n💡 Слово カード может означать кредитку, пропуск, открытку или коллекционную карточку.",
        },
        uz: {
          jp: "これは <ruby>銀行<rt>ぎんこう</rt></ruby>の カードじゃ ありません。イルミナティの カードです。",
          translation: "Bu bank kartasi emas. Bu Illuminatilar kartasi.",
          grammarInfo:
            "【Tahlil】\n\n1. 銀行の カード — «bank kartasi».\n\n2. じゃ ありません — inkor.\n\n💡 カード so'zi kredit karta, ruxsatnoma, otkritka yoki kolleksiya kartasini anglatishi mumkin.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この カードは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Эта карта — моя.",
          },
          {
            jp: "それは <ruby>電話<rt>でんわ</rt></ruby>の カードですか。",
            translation: "Это телефонная карточка?",
          },
          {
            jp: "あの カードも だめです。",
            translation: "Та карточка тоже не подходит.",
          },
        ],
        uz: [
          {
            jp: "この カードは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu karta meniki.",
          },
          {
            jp: "それは <ruby>電話<rt>でんわ</rt></ruby>の カードですか。",
            translation: "Bu telefon kartasimi?",
          },
          {
            jp: "あの カードも だめです。",
            translation: "Anavi karta ham to'g'ri kelmaydi.",
          },
        ],
      },
    },
    {
      id: 61,
      lesson: 2,
      japanese: "<ruby>鉛筆<rt>えんぴつ</rt></ruby>",
      cleanWord: "鉛筆",
      translations: { ru: "карандаш", uz: "qalam" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>鉛筆<rt>えんぴつ</rt></ruby>じゃ ありません。チョコレートです。",
          translation: "Это не карандаш. Это шоколад.",
          grammarInfo:
            "【Разбор】\n\n1. 鉛筆じゃ ありません — «не карандаш».\n\n2. チョコレートです — «(это) шоколад».\n\n💡 В Японии обожают выпускать сувенирные сладости, которые выглядят точь-в-точь как настоящие канцелярские принадлежности! Не перепутайте!",
        },
        uz: {
          jp: "これは <ruby>鉛筆<rt>えんぴつ</rt></ruby>じゃ ありません。チョコレートです。",
          translation: "Bu qalam emas. Bu shokolad.",
          grammarInfo:
            "【Tahlil】\n\n1. 鉛筆じゃ ありません — «qalam emas».\n\n2. チョコレートです — «(bu) shokolad».\n\n💡 Yaponiyada xuddi haqiqiy kanselyariya mollariga o'xshab ketadigan esdalik shirinliklarini ishlab chiqarishni yaxshi ko'rishadi! Adashtirib qo'ymang!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>鉛筆<rt>えんぴつ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот карандаш — мой.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>鉛筆<rt>えんぴつ</rt></ruby>ですか。",
            translation: "Чей это карандаш?",
          },
          {
            jp: "あの <ruby>鉛筆<rt>えんぴつ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Вон тот карандаш — учителя.",
          },
        ],
        uz: [
          {
            jp: "この <ruby>鉛筆<rt>えんぴつ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu qalam meniki.",
          },
          {
            jp: "それは <ruby>誰<rt>だれ</rt></ruby>の <ruby>鉛筆<rt>えんぴつ</rt></ruby>ですか。",
            translation: "Bu kimning qalami?",
          },
          {
            jp: "あの <ruby>鉛筆<rt>えんぴつ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Anavi qalam o'qituvchiniki.",
          },
        ],
      },
    },
    {
      id: 62,
      lesson: 2,
      japanese: "ボールペン",
      cleanWord: "ボールペン",
      translations: { ru: "шариковая ручка", uz: "sharikli ruchka" },
      exampleSentences: {
        ru: {
          jp: "この ボールペンは １００<ruby>円<rt>えん</rt></ruby>じゃ ありません。１００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です！",
          translation: "Эта ручка стоит не 100 иен. Она стоит 1 миллион иен!",
          grammarInfo:
            "【Разбор】\n\n1. １００円じゃ ありません — «не за 100 иен».\n\n2. １００万円です — «(она) за 1 миллион иен» (man - десять тысяч, 100 man = 1 миллион).\n\n💡 Японские бренды шариковых ручек (Zebra, Pilot) считаются одними из лучших в мире.",
        },
        uz: {
          jp: "この ボールペンは １００<ruby>円<rt>えん</rt></ruby>じゃ ありません。１００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です！",
          translation: "Bu ruchka 100 iyen emas. U 1 million iyen turadi!",
          grammarInfo:
            "【Tahlil】\n\n1. １００円じゃ ありません — «100 iyenlik emas».\n\n2. １００万円です — «(u) 1 million iyenlik» (man - o'n ming, 100 man = 1 million).\n\n💡 Yaponiyaning sharikli ruchka brendlari (Zebra, Pilot) dunyodagi eng yaxshilaridan biri hisoblanadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この ボールペンは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Эта ручка — моя.",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の ボールペンですか。",
            translation: "Это ручка учителя?",
          },
          {
            jp: "あの ボールペンも <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Вон та ручка тоже моя.",
          },
        ],
        uz: [
          {
            jp: "この ボールペンは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu ruchka meniki.",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の ボールペンですか。",
            translation: "Bu o'qituvchining ruchkasimi?",
          },
          {
            jp: "あの ボールペンも <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Anavi ruchka ham meniki.",
          },
        ],
      },
    },
    {
      id: 63,
      lesson: 2,
      japanese: "シャープペンシル",
      cleanWord: "シャープペンシル",
      translations: { ru: "мех. карандаш", uz: "mexanik qalam" },
      exampleSentences: {
        ru: {
          jp: "これは シャープペンシルですか。…いいえ、<ruby>注射器<rt>ちゅうしゃき</rt></ruby>です。",
          translation: "Это механический карандаш? ...Нет, это шприц.",
          grammarInfo:
            "【Разбор】\n\n1. シャープペンシルですか — «механический карандаш?».\n\n2. 注射器です — «шприц» (chuushaki).\n\n💡 В Японии механический карандаш называют シャーペン (shaapen) в разговорной речи.",
        },
        uz: {
          jp: "これは シャープペンシルですか。…いいえ、<ruby>注射器<rt>ちゅうしゃき</rt></ruby>です。",
          translation: "Bu mexanik qalammi? ...Yo'q, bu shprits.",
          grammarInfo:
            "【Tahlil】\n\n1. シャープペンシルですか — «mexanik qalammi?».\n\n2. 注射器です — «shprits» (chuushaki).\n\n💡 Yaponiyada so'zlashuvda mexanik qalamni ko'pincha シャーペン (shaapen) deb atashadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の シャープペンシルです。",
            translation: "Это мой механический карандаш.",
          },
          {
            jp: "その シャープペンシルは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей тот механический карандаш?",
          },
          {
            jp: "この シャープペンシルは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Этот карандаш — учителя.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の シャープペンシルです。",
            translation: "Bu mening mexanik qalamim.",
          },
          {
            jp: "その シャープペンシルは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu mexanik qalam kimniki?",
          },
          {
            jp: "この シャープペンシルは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Bu qalam o'qituvchiniki.",
          },
        ],
      },
    },
    {
      id: 64,
      lesson: 2,
      japanese: "かぎ",
      cleanWord: "かぎ",
      translations: { ru: "ключ", uz: "kalit" },
      exampleSentences: {
        ru: {
          jp: "この かぎは <ruby>車<rt>くるま</rt></ruby>の じゃ ありません。<ruby>秘密<rt>ひみつ</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>の かぎです。",
          translation: "Этот ключ — не от машины. Это ключ от тайной комнаты.",
          grammarInfo:
            "【Разбор】\n\n1. 車の じゃ ありません — «не от машины» (существительное かぎ опущено).\n\n2. 秘密の 部屋の かぎ — «ключ (от) тайной комнаты» (himitsu no heya).\n\n💡 Слово かぎ (kagi) часто пишется хираганой, хотя у него есть сложный кандзи 鍵.",
        },
        uz: {
          jp: "この かぎは <ruby>車<rt>くるま</rt></ruby>の じゃ ありません。<ruby>秘密<rt>ひみつ</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>の かぎです。",
          translation:
            "Bu kalit — mashinaning kaliti emas. Bu maxfiy xonaning kaliti.",
          grammarInfo:
            "【Tahlil】\n\n1. 車の じゃ ありません — «mashinadan emas» (かぎ oti tushirib qoldirilgan).\n\n2. 秘密の 部屋の かぎ — «maxfiy xona kaliti» (himitsu no heya).\n\n💡 かぎ (kagi) so'zi ko'pincha hiraganada yoziladi, garchi uning murakkab iyeroglifi (鍵) bo'lsa ham.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>車<rt>くるま</rt></ruby>の かぎです。",
            translation: "Это ключ от машины.",
          },
          {
            jp: "その かぎは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей тот ключ?",
          },
          {
            jp: "この かぎは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот ключ — мой.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>車<rt>くるま</rt></ruby>の かぎです。",
            translation: "Bu mashina kaliti.",
          },
          {
            jp: "その かぎは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu kalit kimniki?",
          },
          {
            jp: "この かぎは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu kalit meniki.",
          },
        ],
      },
    },
    {
      id: 65,
      lesson: 2,
      japanese: "<ruby>時計<rt>とけい</rt></ruby>",
      cleanWord: "時計",
      translations: { ru: "часы", uz: "soat" },
      exampleSentences: {
        ru: {
          jp: "その <ruby>時計<rt>とけい</rt></ruby>は ロレックスですか。…いいえ、おもちゃです。",
          translation: "Те часы у тебя — Ролекс? ...Нет, игрушка.",
          grammarInfo:
            "【Разбор】\n\n1. その 時計は — «те часы (на твоей руке)».\n\n2. ロレックスですか — «Ролекс?».\n\n3. おもちゃです — «игрушка».\n\n💡 時計 (tokei) означает любые часы — и наручные, и настенные, и башенные.",
        },
        uz: {
          jp: "その <ruby>時計<rt>とけい</rt></ruby>は ロレックスですか。…いいえ、おもちゃです。",
          translation: "Qo'lingizdagi soat — Roleksmi? ...Yo'q, o'yinchoq.",
          grammarInfo:
            "【Tahlil】\n\n1. その 時計は — «shu soat (qo'lingizdagi)».\n\n2. ロレックスですか — «Roleksmi?».\n\n3. おもちゃです — «o'yinchoq».\n\n💡 時計 (tokei) har qanday soatni — qo'l soatini ham, devor soatini ham bildiradi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>時計<rt>とけい</rt></ruby>です。",
            translation: "Это мои часы.",
          },
          {
            jp: "あの <ruby>時計<rt>とけい</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чьи вон те часы?",
          },
          {
            jp: "その <ruby>時計<rt>とけい</rt></ruby>は スイスの ですか。",
            translation: "Те часы швейцарские?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>時計<rt>とけい</rt></ruby>です。",
            translation: "Bu mening soatim.",
          },
          {
            jp: "あの <ruby>時計<rt>とけい</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi soat kimniki?",
          },
          {
            jp: "その <ruby>時計<rt>とけい</rt></ruby>は スイスの ですか。",
            translation: "Shu soat Shveysariyanikimi?",
          },
        ],
      },
    },
    {
      id: 66,
      lesson: 2,
      japanese: "<ruby>傘<rt>かさ</rt></ruby>",
      cleanWord: "傘",
      translations: { ru: "зонт", uz: "soyabon" },
      exampleSentences: {
        ru: {
          jp: "あのう、それは <ruby>私<rt>わたし</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>です。あなたの じゃ ありません。<ruby>泥棒<rt>どろぼう</rt></ruby>！",
          translation: "Э-э, простите, это мой зонт. Не ваш. Вор!",
          grammarInfo:
            "【Разбор】\n\n1. あのう — междометие для привлечения внимания.\n\n2. あなたの じゃ ありません — «не ваш» (существительное 傘 опущено).\n\n3. 泥棒 (dorobou) — «вор».\n\n💡 Кража одинаковых прозрачных зонтиков в Японии — национальная проблема.",
        },
        uz: {
          jp: "あのう、それは <ruby>私<rt>わたし</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>です。あなたの じゃ ありません。<ruby>泥棒<rt>どろぼう</rt></ruby>！",
          translation:
            "M-m, kechirasiz, bu mening soyabonim. Sizniki emas. O'g'ri!",
          grammarInfo:
            "【Tahlil】\n\n1. あのう — e'tiborni tortish uchun ishlatiladigan undov so'z.\n\n2. あなたの じゃ ありません — «sizniki emas» (傘 so'zi tushirib qoldirilgan).\n\n3. 泥棒 (dorobou) — «o'g'ri».\n\n💡 Yaponiyada bir xil shaffof soyabonlarning o'g'irlanishi — milliy muammo.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот зонт — мой.",
          },
          {
            jp: "あの <ruby>傘<rt>かさ</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей вон тот зонт?",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>ですか。",
            translation: "Это зонт учителя?",
          },
        ],
        uz: [
          {
            jp: "この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu soyabon meniki.",
          },
          {
            jp: "あの <ruby>傘<rt>かさ</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi soyabon kimniki?",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>ですか。",
            translation: "Bu o'qituvchining soyabonimi?",
          },
        ],
      },
    },
    {
      id: 67,
      lesson: 2,
      japanese: "かばん",
      cleanWord: "かばん",
      translations: { ru: "сумка", uz: "sumka" },
      exampleSentences: {
        ru: {
          jp: "この かばんは グッチの かばんですか。…いいえ、１００<ruby>円<rt>えん</rt></ruby>の かばんです。",
          translation: "Эта сумка от Гуччи? …Нет, это сумка за 100 иен.",
          grammarInfo:
            "【Разбор】\n\n1. グッチの かばん — «сумка (от) Гуччи».\n\n2. １００円の かばん — «сумка (за) 100 иен».\n\n💡 かばん — общее слово для сумок, портфелей, рюкзаков.",
        },
        uz: {
          jp: "この かばんは グッチの かばんですか。…いいえ、１００<ruby>円<rt>えん</rt></ruby>の かばんです。",
          translation: "Bu sumka Gucchimi? ...Yo'q, bu 100 iyenlik sumka.",
          grammarInfo:
            "【Tahlil】\n\n1. グッチの かばん — «Gucci sumkasi».\n\n2. １００円の かばん — «100 iyenlik sumka».\n\n💡 かばん — sumka, portfel va ryukzaklar uchun umumiy so'z.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この かばんは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Эта сумка — моя.",
          },
          {
            jp: "あの かばんは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чья вон та сумка?",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の かばんです。",
            translation: "То — сумка учителя.",
          },
        ],
        uz: [
          {
            jp: "この かばんは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu sumka meniki.",
          },
          {
            jp: "あの かばんは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi sumka kimniki?",
          },
          {
            jp: "それは <ruby>先生<rt>せんせい</rt></ruby>の かばんです。",
            translation: "U o'qituvchining sumkasi.",
          },
        ],
      },
    },
    {
      id: 68,
      lesson: 2,
      japanese: "CD",
      cleanWord: "CD",
      translations: { ru: "CD-диск", uz: "CD (kompakt-disk)" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>英語<rt>えいご</rt></ruby>の CDじゃ ありません。お<ruby>経<rt>きょう</rt></ruby>の CDです。",
          translation:
            "Это не диск с английским. Это CD с буддийскими мантрами.",
          grammarInfo:
            "【Разбор】\n\n1. 英語の CD — «CD по английскому».\n\n2. じゃ ありません — отрицание.\n\n3. お経の CD — «CD мантр (сутр)» (okyou).\n\n💡 В Японии до сих пор активно покупают и слушают физические CD-диски.",
        },
        uz: {
          jp: "これは <ruby>英語<rt>えいご</rt></ruby>の CDじゃ ありません。お<ruby>経<rt>きょう</rt></ruby>の CDです。",
          translation: "Bu ingliz tili diski emas. Bu buddizm sutralari CD si.",
          grammarInfo:
            "【Tahlil】\n\n1. 英語の CD — «ingliz tili CDsi».\n\n2. じゃ ありません — inkor.\n\n3. お経の CD — «sutralar CDsi» (okyou).\n\n💡 Yaponiyada hozirgacha jismoniy CD disklar faol sotib olinadi va eshitiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の CDです。",
            translation: "Это CD по английскому языку.",
          },
          {
            jp: "この CDは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот CD — мой.",
          },
          {
            jp: "その CDは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей тот CD?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の CDです。",
            translation: "Bu ingliz tili CDsi.",
          },
          {
            jp: "この CDは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu CD meniki.",
          },
          {
            jp: "その CDは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu CD kimniki?",
          },
        ],
      },
    },
    {
      id: 69,
      lesson: 2,
      japanese: "テレビ",
      cleanWord: "テレビ",
      translations: { ru: "телевизор", uz: "televizor" },
      exampleSentences: {
        ru: {
          jp: "あれは テレビじゃ ありません。ゲームの モニターです。",
          translation: "То вдали — не телевизор. Это монитор для игр.",
          grammarInfo:
            "【Разбор】\n\n1. あれは — «то» (вдали).\n\n2. テレビじゃ ありません — «не телевизор».\n\n3. ゲームの モニター — «монитор (для) игр».\n\n💡 Японское слово テレビ (terebi) образовано от английского television.",
        },
        uz: {
          jp: "あれは テレビじゃ ありません。ゲームの モニターです。",
          translation: "Anavi televizor emas. O'yin monitori.",
          grammarInfo:
            "【Tahlil】\n\n1. あれは — «anavi» (uzoqda).\n\n2. テレビじゃ ありません — «televizor emas».\n\n3. ゲームの モニター — «o'yin monitori».\n\n💡 Yaponcha テレビ (terebi) so'zi inglizcha television so'zidan kelib chiqqan.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この テレビは <ruby>日本<rt>にほん</rt></ruby>の です。",
            translation: "Этот телевизор — японский.",
          },
          {
            jp: "あの テレビは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Вон тот телевизор — мой.",
          },
          {
            jp: "あれは テレビですか。",
            translation: "То вдали — телевизор?",
          },
        ],
        uz: [
          {
            jp: "この テレビは <ruby>日本<rt>にほん</rt></ruby>の です。",
            translation: "Bu televizor yaponlarniki.",
          },
          {
            jp: "あの テレビは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Anavi televizor meniki.",
          },
          {
            jp: "あれは テレビですか。",
            translation: "Anavi televizormi?",
          },
        ],
      },
    },
    {
      id: 70,
      lesson: 2,
      japanese: "ラジオ",
      cleanWord: "ラジオ",
      translations: { ru: "радио", uz: "radio" },
      exampleSentences: {
        ru: {
          jp: "この ラジオは <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。<ruby>宇宙人<rt>うちゅうじん</rt></ruby>の です。",
          translation: "Это радио — не мое. Оно принадлежит пришельцам.",
          grammarInfo:
            "【Разбор】\n\n1. 私の じゃ ありません — «не моё».\n\n2. 宇宙人の です — «(оно) пришельцев» (uchuujin).\n\n💡 В Японии радио остаётся важным средством оповещения при землетрясениях.",
        },
        uz: {
          jp: "この ラジオは <ruby>私<rt>わたし</rt></ruby>の じゃ ありません。<ruby>宇宙人<rt>うちゅうじん</rt></ruby>の です。",
          translation: "Bu radio — meniki emas. U o'zga sayyoraliklarniki.",
          grammarInfo:
            "【Tahlil】\n\n1. 私の じゃ ありません — «meniki emas».\n\n2. 宇宙人の です — «(u) o'zga sayyoraliklarniki» (uchuujin).\n\n💡 Yaponiyada radio zilzilalar paytida ogohlantirishning muhim vositasi bo'lib qolmoqda.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この ラジオは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Это радио — мое.",
          },
          {
            jp: "それは <ruby>日本<rt>にほん</rt></ruby>の ラジオですか。",
            translation: "Это японское радио?",
          },
          {
            jp: "あれは <ruby>誰<rt>だれ</rt></ruby>の ラジオですか。",
            translation: "Чье вон то радио?",
          },
        ],
        uz: [
          {
            jp: "この ラジオは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu radio meniki.",
          },
          {
            jp: "それは <ruby>日本<rt>にほん</rt></ruby>の ラジオですか。",
            translation: "Bu yapon radiosimi?",
          },
          {
            jp: "あれは <ruby>誰<rt>だれ</rt></ruby>の ラジオですか。",
            translation: "Anavi kimning radiosi?",
          },
        ],
      },
    },
    {
      id: 71,
      lesson: 2,
      japanese: "カメラ",
      cleanWord: "カメラ",
      translations: { ru: "фотоаппарат", uz: "fotoapparat" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>人間<rt>にんげん</rt></ruby>の カメラじゃ ありません。<ruby>犬<rt>いぬ</rt></ruby>の カメラです。",
          translation:
            "Это фотоаппарат не для людей. Это камера для собаки (на ошейнике).",
          grammarInfo:
            "【Разбор】\n\n1. 人間の — «(для) людей / человека» (ningen).\n\n2. 犬の カメラ — «камера (для) собаки» (inu).\n\n💡 Японские бренды (Canon, Nikon, Sony) доминируют на мировом рынке камер.",
        },
        uz: {
          jp: "これは <ruby>人間<rt>にんげん</rt></ruby>の カメラじゃ ありません。<ruby>犬<rt>いぬ</rt></ruby>の カメラです。",
          translation:
            "Bu odamlar uchun fotoapparat emas. Bu itlar kamerasi (bo'yinturuqdagi).",
          grammarInfo:
            "【Tahlil】\n\n1. 人間の — «odamlar (uchun)» (ningen).\n\n2. 犬の カメラ — «it (uchun) kamera» (inu).\n\n💡 Yapon brendlari (Canon, Nikon, Sony) jahon kameralar bozorida yetakchilik qiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の カメラです。",
            translation: "Это японская камера.",
          },
          {
            jp: "その カメラは あなたの ですか。",
            translation: "Та камера — ваша?",
          },
          {
            jp: "あの カメラは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Вон та камера — учителя.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の カメラです。",
            translation: "Bu yapon kamerasi.",
          },
          {
            jp: "その カメラは あなたの ですか。",
            translation: "Shu kamera siznikimi?",
          },
          {
            jp: "あの カメラは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Anavi kamera o'qituvchiniki.",
          },
        ],
      },
    },
    {
      id: 72,
      lesson: 2,
      japanese: "コンピューター",
      cleanWord: "コンピューター",
      translations: { ru: "компьютер", uz: "kompyuter" },
      exampleSentences: {
        ru: {
          jp: "これは アップルの コンピューターじゃ ありません。ポテトの コンピューターです。",
          translation:
            "Это не компьютер Apple (Яблоко). Это компьютер Potato (Картошка).",
          grammarInfo:
            "【Разбор】\n\n1. アップルの — «от (компании) Apple».\n\n2. ポテトの — «от (компании) Potato» (пародия).\n\n💡 Японцы часто называют ноутбуки словом パソコン (pasokon) — сокращение от personal computer.",
        },
        uz: {
          jp: "これは アップルの コンピューターじゃ ありません。ポテトの コンピューターです。",
          translation:
            "Bu Apple (Olma) kompyuteri emas. Bu Potato (Kartoshka) kompyuteri.",
          grammarInfo:
            "【Tahlil】\n\n1. アップルの — «Apple (kompaniyasi)ning».\n\n2. ポテトの — «Potato (kompaniyasi)ning» (parodiya).\n\n💡 Yaponlar noutbuklarni ko'pincha パソコン (pasokon) — personal computer so'zining qisqartmasi bilan atashadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この コンピューターは アメリカの です。",
            translation: "Этот компьютер — американский.",
          },
          {
            jp: "それは コンピューターの <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Это книга о компьютерах?",
          },
          {
            jp: "あの コンピューターは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей вон тот компьютер?",
          },
        ],
        uz: [
          {
            jp: "この コンピューターは アメリカの です。",
            translation: "Bu kompyuter Amerikaniki.",
          },
          {
            jp: "それは コンピューターの <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Bu kompyuterlar haqidagi kitobmi?",
          },
          {
            jp: "あの コンピューターは <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Anavi kompyuter kimniki?",
          },
        ],
      },
    },
    {
      id: 73,
      lesson: 2,
      japanese: "<ruby>車<rt>くるま</rt></ruby>",
      cleanWord: "車",
      translations: { ru: "машина", uz: "mashina" },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>車<rt>くるま</rt></ruby>は フェラーリですか。…いいえ、トラクターです。",
          translation: "Вон та машина — Феррари? …Нет, трактор.",
          grammarInfo:
            "【Разбор】\n\n1. あの 車は — «вон та машина».\n\n2. フェラーリですか — «Феррари?».\n\n3. トラクターです — «(это) трактор».\n\n💡 В Японии невозможно купить машину, если вы не докажете полиции, что у вас есть парковочное место.",
        },
        uz: {
          jp: "あの <ruby>車<rt>くるま</rt></ruby>は フェラーリですか。…いいえ、トラクターです。",
          translation: "Anavi mashina — Ferrarimi? …Yo'q, traktor.",
          grammarInfo:
            "【Tahlil】\n\n1. あの 車は — «anavi mashina».\n\n2. フェラーリですか — «Ferrarimi?».\n\n3. トラクターです — «(bu) traktor».\n\n💡 Yaponiyada politsiyaga o'zingizning avtoturargohingiz borligini isbotlamaguningizcha mashina sotib ololmaysiz.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の <ruby>車<rt>くるま</rt></ruby>です。",
            translation: "Это японский автомобиль.",
          },
          {
            jp: "その <ruby>車<rt>くるま</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чья та машина?",
          },
          {
            jp: "あの <ruby>車<rt>くるま</rt></ruby>も ドイツの ですか。",
            translation: "Вон та машина тоже немецкая?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の <ruby>車<rt>くるま</rt></ruby>です。",
            translation: "Bu yapon mashinasi.",
          },
          {
            jp: "その <ruby>車<rt>くるま</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu mashina kimniki?",
          },
          {
            jp: "あの <ruby>車<rt>くるま</rt></ruby>も ドイツの ですか。",
            translation: "Anavi mashina ham Germaniyanikimi?",
          },
        ],
      },
    },
    {
      id: 74,
      lesson: 2,
      japanese: "<ruby>机<rt>つくえ</rt></ruby>",
      cleanWord: "机",
      translations: { ru: "стол", uz: "stol" },
      exampleSentences: {
        ru: {
          jp: "この <ruby>机<rt>つくえ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の です！",
          translation: "Этот стол — не учителя. Он мой!",
          grammarInfo:
            "【Разбор】\n\n1. 先生の じゃ ありません — «не учителя».\n\n2. 私の です — «он мой» (существительное опущено).\n\n💡 机 (tsukue) — это именно письменный, рабочий или школьный стол. Обеденный стол называют テーブル (teeburu).",
        },
        uz: {
          jp: "この <ruby>机<rt>つくえ</rt></ruby>は <ruby>先生<rt>せんせい</rt></ruby>の じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の です！",
          translation: "Bu stol — o'qituvchiniki emas. U meniki!",
          grammarInfo:
            "【Tahlil】\n\n1. 先生の じゃ ありません — «o'qituvchini emas».\n\n2. 私の です — «u meniki» (ot tushirib qoldirilgan).\n\n💡 机 (tsukue) — bu aynan yozuv, ish yoki maktab stoli. Ovqatlanish stoli テーブル (teeburu) deyiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>机<rt>つくえ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот стол — мой.",
          },
          {
            jp: "あれは <ruby>先生<rt>せんせい</rt></ruby>の <ruby>机<rt>つくえ</rt></ruby>です。",
            translation: "Вон то — стол учителя.",
          },
          {
            jp: "その <ruby>机<rt>つくえ</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Чей тот стол?",
          },
        ],
        uz: [
          {
            jp: "この <ruby>机<rt>つくえ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu stol meniki.",
          },
          {
            jp: "あれは <ruby>先生<rt>せんせい</rt></ruby>の <ruby>机<rt>つくえ</rt></ruby>です。",
            translation: "Anavi — o'qituvchining stoli.",
          },
          {
            jp: "その <ruby>机<rt>つくえ</rt></ruby>は <ruby>誰<rt>だれ</rt></ruby>の ですか。",
            translation: "Shu stol kimniki?",
          },
        ],
      },
    },
    {
      id: 75,
      lesson: 2,
      japanese: "いす",
      cleanWord: "いす",
      translations: { ru: "стул", uz: "stul" },
      exampleSentences: {
        ru: {
          jp: "その いすは <ruby>王様<rt>おうさま</rt></ruby>の いすです。あなたの じゃ ありません。",
          translation: "Тот стул (у тебя) — трон короля. Не твой.",
          grammarInfo:
            "【Разбор】\n\n1. 王様の — «(принадлежащий) королю» (ousama).\n\n2. あなたの — «твой».\n\n💡 Традиционно в Японии сидели прямо на полу, стулья (いす) вошли в массовый обиход позже.",
        },
        uz: {
          jp: "その いすは <ruby>王様<rt>おうさま</rt></ruby>の いすです。あなたの じゃ ありません。",
          translation: "U stul — qirolning taxti. Seniki emas.",
          grammarInfo:
            "【Tahlil】\n\n1. 王様の — «qirolning» (ousama).\n\n2. あなたの — «seniki».\n\n💡 An'anaviy Yaponiyada odamlar to'g'ridan-to'g'ri polda o'tirishgan, stullar (いす) keyinchalik ommaviy muomalaga kirgan.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "その いすは あなたの ですか。",
            translation: "Тот стул — твой?",
          },
          {
            jp: "あの いすは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Вон тот стул — учителя.",
          },
          {
            jp: "この いすは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Этот стул — мой.",
          },
        ],
        uz: [
          {
            jp: "その いすは あなたの ですか。",
            translation: "Shu stul siznikimi?",
          },
          {
            jp: "あの いすは <ruby>先生<rt>せんせい</rt></ruby>の です。",
            translation: "Anavi stul o'qituvchiniki.",
          },
          {
            jp: "この いすは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Bu stul meniki.",
          },
        ],
      },
    },
    {
      id: 76,
      lesson: 2,
      japanese: "チョコレート",
      cleanWord: "チョコレート",
      translations: { ru: "шоколад", uz: "shokolad" },
      exampleSentences: {
        ru: {
          jp: "この チョコレートは お<ruby>菓子<rt>かし</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>薬<rt>くすり</rt></ruby>です。",
          translation:
            "Этот шоколад — не сладость. Это моё лекарство (от стресса).",
          grammarInfo:
            "【Разбор】\n\n1. お菓子じゃ ありません — «не сладость / не снек» (okashi).\n\n2. 薬です — «лекарство» (kusuri).\n\n💡 14 февраля в Японии именно женщины дарят шоколад мужчинам! Это огромная индустрия.",
        },
        uz: {
          jp: "この チョコレートは お<ruby>菓子<rt>かし</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>薬<rt>くすり</rt></ruby>です。",
          translation:
            "Bu shokolad — shirinlik emas. Bu mening dorim (stressga qarshi).",
          grammarInfo:
            "【Tahlil】\n\n1. お菓子じゃ ありません — «shirinlik emas» (okashi).\n\n2. 薬です — «dori» (kusuri).\n\n💡 Yaponiyada 14-fevralda aynan ayollar erkaklarga shokolad sovg'a qilishadi! Bu ulkan sanoatdir.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは スイスの チョコレートです。",
            translation: "Это швейцарский шоколад.",
          },
          {
            jp: "その チョコレートは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Тот шоколад — мой.",
          },
          {
            jp: "あの チョコレートは <ruby>先生<rt>せんせい</rt></ruby>の ですか。",
            translation: "Вон тот шоколад — учителя?",
          },
        ],
        uz: [
          {
            jp: "これは スイスの チョコレートです。",
            translation: "Bu Shveysariya shokoladi.",
          },
          {
            jp: "その チョコレートは <ruby>私<rt>わたし</rt></ruby>の です。",
            translation: "Shu shokolad meniki.",
          },
          {
            jp: "あの チョコレートは <ruby>先生<rt>せんせい</rt></ruby>の ですか。",
            translation: "Anavi shokolad o'qituvchinikimi?",
          },
        ],
      },
    },
    {
      id: 77,
      lesson: 2,
      japanese: "コーヒー",
      cleanWord: "コーヒー",
      translations: { ru: "кофе", uz: "kofe" },
      exampleSentences: {
        ru: {
          jp: "これは コーヒーじゃ ありません。<ruby>泥水<rt>どろみず</rt></ruby>です。",
          translation: "Это не кофе. Это грязная вода.",
          grammarInfo:
            "【Разбор】\n\n1. コーヒーじゃ ありません — «не кофе».\n\n2. 泥水です — «грязная вода» (doromizu).\n\n💡 Горячий кофе в Японии продается на каждом углу в железных банках прямо в торговых автоматах.",
        },
        uz: {
          jp: "これは コーヒーじゃ ありません。<ruby>泥水<rt>どろみず</rt></ruby>です。",
          translation: "Bu kofe emas. Bu loyqa suv.",
          grammarInfo:
            "【Tahlil】\n\n1. コーヒーじゃ ありません — «kofe emas».\n\n2. 泥水です — «loyqa suv» (doromizu).\n\n💡 Yaponiyada har bir burchakda avtomat-do'konlardan temir bankalarda qaynoq kofe xarid qilish mumkin.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ブラジルの コーヒーです。",
            translation: "Это кофе из Бразилии.",
          },
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の コーヒーです。",
            translation: "Это мой кофе.",
          },
          { jp: "コーヒーですか。", translation: "Это кофе?" },
        ],
        uz: [
          {
            jp: "ブラジルの コーヒーです。",
            translation: "Bu Braziliya kofesi.",
          },
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の コーヒーです。",
            translation: "Bu mening kofem.",
          },
          { jp: "コーヒーですか。", translation: "Kofemi?" },
        ],
      },
    },
    {
      id: 78,
      lesson: 2,
      japanese: "お<ruby>土産<rt>みやげ</rt></ruby>",
      cleanWord: "お土産",
      translations: { ru: "сувенир", uz: "sovg'a" },
      exampleSentences: {
        ru: {
          jp: "これは パリの お<ruby>土産<rt>みやげ</rt></ruby>ですか。…いいえ、スーパーの チョコレートです。",
          translation: "Это сувенир из Парижа? …Нет, шоколад из супермаркета.",
          grammarInfo:
            "【Разбор】\n\n1. パリの お土産 — «сувенир (из) Парижа».\n\n2. スーパーの — «из супермаркета».\n\n💡 Японцы всегда привозят お土産 (обычно съедобные) из поездок для своих коллег. Это негласный закон.",
        },
        uz: {
          jp: "これは パリの お<ruby>土産<rt>みやげ</rt></ruby>ですか。…いいえ、スーパーの チョコレートです。",
          translation:
            "Bu Parijdan sovg'ami? …Yo'q, supermarketdan olingan shokolad.",
          grammarInfo:
            "【Tahlil】\n\n1. パリの お土産 — «Parijdan (kelgan) sovg'a».\n\n2. スーパーの — «supermarketdan (olingan)».\n\n💡 Yaponlar safardan doim hamkasblari uchun お土産 (odatda yeyiladigan) olib kelishadi. Bu yozilmagan qonundir.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の お<ruby>土産<rt>みやげ</rt></ruby>です。",
            translation: "Это сувенир из Японии.",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>への お<ruby>土産<rt>みやげ</rt></ruby>です。",
            translation: "Это сувенир для учителя.",
          },
          {
            jp: "お<ruby>土産<rt>みやげ</rt></ruby>ですか。",
            translation: "Это сувенир?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>日本<rt>にほん</rt></ruby>の お<ruby>土産<rt>みやげ</rt></ruby>です。",
            translation: "Bu Yaponiyadan esdalik sovg'asi.",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>への お<ruby>土産<rt>みやげ</rt></ruby>です。",
            translation: "Bu o'qituvchi uchun sovg'a.",
          },
          {
            jp: "お<ruby>土産<rt>みやげ</rt></ruby>ですか。",
            translation: "Sovg'ami?",
          },
        ],
      },
    },
    {
      id: 79,
      lesson: 2,
      japanese: "<ruby>英語<rt>えいご</rt></ruby>",
      cleanWord: "英語",
      translations: { ru: "английский язык", uz: "ingliz tili" },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>英語<rt>えいご</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>ですか。…いいえ、ハリウッドの <ruby>俳優<rt>はいゆう</rt></ruby>です。",
          translation:
            "Вон тот человек — учитель английского? …Нет, голливудский актёр.",
          grammarInfo:
            "【Разбор】\n\n1. 英語の 先生 — «учитель английского языка».\n\n2. ハリウッドの 俳優 — «голливудский актёр» (haiyuu).\n\n💡 Японцы часто используют английские слова, но произносят их так (катаканой), что носители их не понимают.",
        },
        uz: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は <ruby>英語<rt>えいご</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>ですか。…いいえ、ハリウッドの <ruby>俳優<rt>はいゆう</rt></ruby>です。",
          translation:
            "Anavi odam — ingliz tili o'qituvchisimi? …Yo'q, Gollivud aktyori.",
          grammarInfo:
            "【Tahlil】\n\n1. 英語の 先生 — «ingliz tili o'qituvchisi».\n\n2. ハリウッドの 俳優 — «Gollivud aktyori» (haiyuu).\n\n💡 Yaponlar inglizcha so'zlardan ko'p foydalanishadi, lekin ularni katakanada shunday talaffuz qilishadiki, inglizlar tushunmay qoladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>英語<rt>えいご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "Словарь английского языка.",
          },
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>ですか。",
            translation: "Это газета на английском?",
          },
          {
            jp: "<ruby>英語<rt>えいご</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "Учитель английского языка.",
          },
        ],
        uz: [
          {
            jp: "<ruby>英語<rt>えいご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "Ingliz tili lug'ati.",
          },
          {
            jp: "これは <ruby>英語<rt>えいご</rt></ruby>の <ruby>新聞<rt>しんぶん</rt></ruby>ですか。",
            translation: "Bu ingliz tilidagi gazetam?",
          },
          {
            jp: "<ruby>英語<rt>えいご</rt></ruby>の <ruby>先生<rt>せんせい</rt></ruby>です。",
            translation: "Ingliz tili o'qituvchisi.",
          },
        ],
      },
    },
    {
      id: 80,
      lesson: 2,
      japanese: "<ruby>日本語<rt>にほんご</rt></ruby>",
      cleanWord: "日本語",
      translations: { ru: "японский язык", uz: "yapon tili" },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>日本語<rt>にほんご</rt></ruby>は アニメの <ruby>日本語<rt>にほんご</rt></ruby>です。ビジネスの じゃ ありません。",
          translation: "Мой японский — это язык из аниме. А не для бизнеса.",
          grammarInfo:
            "【Разбор】\n\n1. アニメの 日本語 — «японский (взятый из) аниме».\n\n2. ビジネスの じゃ ありません — «не для бизнеса» (business).\n\n💡 Разговорный язык в аниме часто грубый или излишне эмоциональный. Использовать его с японским начальником — катастрофа.",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>日本語<rt>にほんご</rt></ruby>は アニメの <ruby>日本語<rt>にほんご</rt></ruby>です。ビジネスの じゃ ありません。",
          translation:
            "Mening yapon tilim — bu animedagi til. Biznes uchun emas.",
          grammarInfo:
            "【Tahlil】\n\n1. アニメの 日本語 — «animedan (olingan) yapon tili».\n\n2. ビジネスの じゃ ありません — «biznes uchun emas» (business).\n\n💡 Animedagi so'zlashuv tili ko'pincha qo'pol yoki o'ta emotsional bo'ladi. Yaponiyalik boshliq bilan gaplashganda uni ishlatish — fojiadir.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>日本語<rt>にほんご</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
            translation: "Книга по японскому языку.",
          },
          {
            jp: "これは <ruby>日本語<rt>にほんご</rt></ruby>の CDです。",
            translation: "Это CD по японскому языку.",
          },
          {
            jp: "<ruby>日本語<rt>にほんご</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "Это журнал на японском?",
          },
        ],
        uz: [
          {
            jp: "<ruby>日本語<rt>にほんご</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>です。",
            translation: "Yapon tili kitobi.",
          },
          {
            jp: "これは <ruby>日本語<rt>にほんご</rt></ruby>の CDです。",
            translation: "Bu yapon tili CD si.",
          },
          {
            jp: "<ruby>日本語<rt>にほんご</rt></ruby>の <ruby>雑誌<rt>ざっし</rt></ruby>ですか。",
            translation: "Yapon tilidagi jurnalmi?",
          },
        ],
      },
    },
    {
      id: 81,
      lesson: 2,
      japanese: "〜<ruby>語<rt>ご</rt></ruby>",
      cleanWord: "〜語",
      translations: { ru: "~ язык", uz: "~ tili" },
      exampleSentences: {
        ru: {
          jp: "それは <ruby>何語<rt>なにご</rt></ruby>ですか。…<ruby>猫語<rt>ねこご</rt></ruby>です。",
          translation: "Это на каком языке? …На кошачьем.",
          grammarInfo:
            "【Разбор】\n\n1. 何語 — «какой язык» (вопросительное слово 何 + 語).\n\n2. 猫語 — «кошачий язык» (neko - кошка).\n\n💡 Суффикс 語 можно прикрепить почти к любому существу или стране, чтобы обозначить язык.",
        },
        uz: {
          jp: "それは <ruby>何語<rt>なにご</rt></ruby>ですか。…<ruby>猫語<rt>ねこご</rt></ruby>です。",
          translation: "Bu qaysi tilda? …Mushuklar tilida.",
          grammarInfo:
            "【Tahlil】\n\n1. 何語 — «qaysi til» (so'roq so'zi 何 + 語).\n\n2. 猫語 — «mushuklar tili» (neko - mushuk).\n\n💡 語 qo'shimchasini tilni ifodalash uchun deyarli har qanday mavjudot yoki davlatga qo'shish mumkin.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ロシア<ruby>語<rt>ご</rt></ruby>です。",
            translation: "Русский язык.",
          },
          {
            jp: "ウズベク<ruby>語<rt>ご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "Словарь узбекского языка.",
          },
          {
            jp: "スペイン<ruby>語<rt>ご</rt></ruby>ですか。",
            translation: "Испанский язык?",
          },
        ],
        uz: [
          {
            jp: "ロシア<ruby>語<rt>ご</rt></ruby>です。",
            translation: "Rus tili.",
          },
          {
            jp: "ウズベク<ruby>語<rt>ご</rt></ruby>の <ruby>辞書<rt>じしょ</rt></ruby>です。",
            translation: "O'zbek tili lug'ati.",
          },
          {
            jp: "スペイン<ruby>語<rt>ご</rt></ruby>ですか。",
            translation: "Ispan tilimi?",
          },
        ],
      },
    },
    {
      id: 82,
      lesson: 2,
      japanese: "<ruby>何<rt>なん</rt></ruby>",
      cleanWord: "何",
      translations: { ru: "что?", uz: "nima?" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>何<rt>なん</rt></ruby>ですか。コーヒーですか、お<ruby>茶<rt>ちゃ</rt></ruby>ですか。",
          translation: "Что это? Кофе или чай?",
          grammarInfo:
            "【Разбор】\n\n1. 何ですか — «Что (это)?»\n\n2. コーヒーですか、お茶ですか — Выбор: «Кофе? Чай?».\n\n⚠️ Ошибка: читать как «nani desu ka». Перед です кандзи 何 читается строго как «なん» (nan).",
        },
        uz: {
          jp: "これは <ruby>何<rt>なん</rt></ruby>ですか。コーヒーですか、お<ruby>茶<rt>ちゃ</rt></ruby>ですか。",
          translation: "Bu nima? Kofemi yoki choymi?",
          grammarInfo:
            "【Tahlil】\n\n1. 何ですか — «(Bu) nima?»\n\n2. コーヒーですか、お茶ですか — Tanlov: «Kofemi? Choymi?».\n\n⚠️ Xato: «nani desu ka» deb o'qish. です dan oldin 何 iyeroglifi doim «なん» (nan) deb o'qiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "О чём эта книга?",
          },
          {
            jp: "あれは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Что вон там?",
          },
          {
            jp: "その かばんは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Что это за сумка?",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>何<rt>なん</rt></ruby>の <ruby>本<rt>ほん</rt></ruby>ですか。",
            translation: "Bu nima haqidagi kitob?",
          },
          {
            jp: "あれは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Anavi nima?",
          },
          {
            jp: "その かばんは <ruby>何<rt>なん</rt></ruby>ですか。",
            translation: "Shu qanday sumka?",
          },
        ],
      },
    },
    {
      id: 83,
      lesson: 2,
      japanese: "そう",
      cleanWord: "そう",
      translations: { ru: "так, да", uz: "shunday, ha" },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は スパイですか。…はい、そうです。",
          translation: "Вон тот человек — шпион? …Да, всё так.",
          grammarInfo:
            "【Разбор】\n\n1. はい — «да».\n\n2. そうです — «так (и есть)».\n\n💡 Японцы часто отвечают на вопрос с существительным краткой фразой «はい、そうです» вместо того, чтобы повторять всё слово («Да, он шпион»).",
        },
        uz: {
          jp: "あの <ruby>人<rt>ひと</rt></ruby>は スパイですか。…はい、そうです。",
          translation: "Anavi odam — josusmi? …Ha, shunday.",
          grammarInfo:
            "【Tahlil】\n\n1. はい — «ha».\n\n2. そうです — «shunday».\n\n💡 Yaponlar ot qatnashgan so'roq gaplarga butun so'zni qaytarmasdan, qisqacha «はい、そうです» deb javob berishadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "はい、そうです。", translation: "Да, это так." },
          { jp: "そうですか。", translation: "Вот как. Понятно." },
          {
            jp: "ミラーさんですか。…はい、そうです。",
            translation: "Вы Миллер? ...Да.",
          },
        ],
        uz: [
          { jp: "はい、そうです。", translation: "Ha, shunday." },
          { jp: "そうですか。", translation: "Shunaqami. Tushunarli." },
          {
            jp: "ミラーさんですか。…はい、そうです。",
            translation: "Siz Millermisiz? ...Ha, shunday.",
          },
        ],
      },
    },
    {
      id: 84,
      lesson: 2,
      japanese: "<ruby>違<rt>ちが</rt></ruby>います。",
      cleanWord: "違います。",
      translations: { ru: "нет, это не так", uz: "yo'q, unday emas" },
      exampleSentences: {
        ru: {
          jp: "あなたは バットマンですか。…いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
          translation: "Вы Бэтмен? …Нет, это не так.",
          grammarInfo:
            "【Разбор】\n\n1. いいえ — «нет».\n\n2. 違います — дословно глагол «отличается». Используется в значении «вы не правы / это не так».\n\n💡 Это самый естественный способ отрицательно ответить на вопрос «А это Б?», не повторяя само слово.",
        },
        uz: {
          jp: "あなたは バットマンですか。…いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
          translation: "Siz Betmenmisiz? …Yo'q, unday emas.",
          grammarInfo:
            "【Tahlil】\n\n1. いいえ — «yo'q».\n\n2. 違います — so'zma-so'z «farq qiladi» degan fe'l. «Siz nohaqsiz / unday emas» ma'nosida ishlatiladi.\n\n💡 Bu «A bu Bmi?» degan savolga otni qaytarmasdan inkor javob berishning eng tabiiy usuli.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Нет, вы ошибаетесь.",
          },
          {
            jp: "医者ですか。…いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Вы врач? ...Нет, это не так.",
          },
          {
            jp: "その 傘は わたしのです。…<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Тот зонт мой. ...Нет, не ваш.",
          },
        ],
        uz: [
          {
            jp: "いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Yo'q, noto'g'ri.",
          },
          {
            jp: "医者ですか。…いいえ、<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Shifokormisiz? ...Yo'q, unday emas.",
          },
          {
            jp: "その 傘は わたしのです。…<ruby>違<rt>ちが</rt></ruby>います。",
            translation: "Shu soyabon meniki. ...Yo'q, noto'g'ri.",
          },
        ],
      },
    },
    {
      id: 85,
      lesson: 2,
      japanese: "そうですか。",
      cleanWord: "そうですか。",
      translations: { ru: "вот как", uz: "shunaqami" },
      exampleSentences: {
        ru: {
          jp: "この カメラは １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。…そうですか。さようなら。",
          translation: "Эта камера стоит миллион иен. …Вот как. До свидания.",
          grammarInfo:
            "【Разбор】\n\n1. そうですか — фраза-реакция. Выражает то, что говорящий принял новую информацию.\n\n2. さようなら — «до свидания».\n\n💡 Интонация в «そうですか» в этом значении падает ВНИЗ, а не идёт вверх (как в обычном вопросе).",
        },
        uz: {
          jp: "この カメラは １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。…そうですか。さようなら。",
          translation: "Bu kamera 1 million iyen turadi. …Shunaqami. Xayr.",
          grammarInfo:
            "【Tahlil】\n\n1. そうですか — reaksiya bildirish iborasi. Gapiruvchi yangi ma'lumotni qabul qilganini bildiradi.\n\n2. さようなら — «xayr».\n\n💡 Bu ma'noda «そうですか» iborasining intonatsiyasi (oddiy so'roq gapdan farqli o'laroq) PASTGA tushadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "あ、そうですか。", translation: "А, понятно." },
          {
            jp: "そうですか。ありがとうございます。",
            translation: "Вот как. Спасибо.",
          },
          {
            jp: "わたしは 医者です。…そうですか。",
            translation: "Я врач. ...Понятно.",
          },
        ],
        uz: [
          { jp: "あ、そうですか。", translation: "A, tushunarli." },
          {
            jp: "そうですか。ありがとうございます。",
            translation: "Shunaqami. Rahmat.",
          },
          {
            jp: "わたしは 医者です。…そうですか。",
            translation: "Men shifokorman. ...Tushunarli.",
          },
        ],
      },
    },
    {
      id: 86,
      lesson: 2,
      japanese: "あのう",
      cleanWord: "あのう",
      translations: { ru: "м-м, простите", uz: "m-m, kechirasiz" },
      exampleSentences: {
        ru: {
          jp: "あのう、この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。あなたの じゃ ありません。",
          translation: "Э-э-э... простите, но это мой зонт. Не ваш.",
          grammarInfo:
            "【Разбор】\n\n1. あのう — междометие, выражающее лёгкое замешательство.\n\n💡 Японцы используют «あのう», чтобы смягчить начало разговора, когда хотят возразить или обратиться к незнакомцу. Это звучит намного вежливее, чем резкое вступление.",
        },
        uz: {
          jp: "あのう、この <ruby>傘<rt>かさ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。あなたの じゃ ありません。",
          translation:
            "M-m-m... kechirasiz, bu mening soyabonim. Sizniki emas.",
          grammarInfo:
            "【Tahlil】\n\n1. あのう — biroz ikkilanishni bildiruvchi undov so'z.\n\n💡 Yaponlar notanish odamga murojaat qilishda yoki e'tiroz bildirishda suhbat boshini yumshatish uchun «あのう» dan foydalanishadi. Bu to'g'ridan-to'g'ri gapirishdan ko'ra ancha xushmuomala eshitiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "あのう、すみません。", translation: "М-м... извините." },
          {
            jp: "あのう、ミラーさんですか。",
            translation: "Э-э... вы господин Миллер?",
          },
          {
            jp: "あのう、これは お土産です。",
            translation: "Э-э... вот, это сувенир.",
          },
        ],
        uz: [
          {
            jp: "あのう、すみません。",
            translation: "M-m... kechirasiz.",
          },
          {
            jp: "あのう、ミラーさんですか。",
            translation: "M-m... siz Millermisiz?",
          },
          {
            jp: "あのう、これは お土産です。",
            translation: "M-m... bu esdalik sovg'asi.",
          },
        ],
      },
    },
    {
      id: 87,
      lesson: 2,
      japanese: "えっ",
      cleanWord: "えっ",
      translations: { ru: "что?!", uz: "nima?!" },
      exampleSentences: {
        ru: {
          jp: "わたしは ７０<ruby>歳<rt>さい</rt></ruby>です。…えっ？！",
          translation: "Мне 70 лет. ...Что?!",
          grammarInfo:
            "【Разбор】\n\n1. えっ — междометие удивления, произносится отрывисто (маленькая «tsu» на конце означает резкую остановку звука).\n\n💡 Классическая реакция в аниме, когда герой осознаёт, что совершил фатальную ошибку или услышал шокирующий факт.",
        },
        uz: {
          jp: "わたしは ７０<ruby>歳<rt>さい</rt></ruby>です。…えっ？！",
          translation: "Men 70 yoshdaman. ...Nima?!",
          grammarInfo:
            "【Tahlil】\n\n1. えっ — hayratni bildiruvchi undov so'z, qisqa talaffuz qilinadi (oxiridagi kichik «tsu» tovushning keskin to'xtashini bildiradi).\n\n💡 Animelarda qahramon mudhish xatoga yo'l qo'yganini yoki shok xabarni eshitganini anglab yetgandagi klassik reaksiya.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "えっ、本当ですか。", translation: "Что, правда?" },
          { jp: "えっ、わたしですか。", translation: "А? Это вы мне?" },
          { jp: "えっ、そうですか。", translation: "Да неужели?" },
        ],
        uz: [
          { jp: "えっ、本当ですか。", translation: "Nima, rostdanmi?" },
          { jp: "えっ、わたしですか。", translation: "A, menmi?" },
          {
            jp: "えっ、そうですか。",
            translation: "Nahotki shunday bo'lsa?",
          },
        ],
      },
    },
    {
      id: 88,
      lesson: 2,
      japanese: "どうぞ。",
      cleanWord: "どうぞ。",
      translations: { ru: "пожалуйста", uz: "marhamat" },
      exampleSentences: {
        ru: {
          jp: "わたしの <ruby>名刺<rt>めいし</rt></ruby>です。どうぞ。…えっ、ヤクザですか。",
          translation: "Вот моя визитка. Пожалуйста. ...Что, якудза?!",
          grammarInfo:
            "【Разбор】\n\n1. どうぞ — универсальное слово для того, чтобы предложить кому-то вещь, уступить место или пригласить войти.\n\n💡 Не путать с «пожалуйста», когда вы ПРОСИТЕ о чём-то (для этого используется お願いします - onegaishimasu).",
        },
        uz: {
          jp: "わたしの <ruby>名刺<rt>めいし</rt></ruby>です。どうぞ。…えっ、ヤクザですか。",
          translation: "Mening vizitkam. Marhamat. ...Nima, yakuzamisiz?!",
          grammarInfo:
            "【Tahlil】\n\n1. どうぞ — kimgadir biror narsa taklif qilish, joy berish yoki kirishga taklif qilish uchun universal so'z.\n\n💡 Birovdan biror narsa SO'RAGANDAGI «iltimos» bilan adashtirmang (buning uchun お願いします - onegaishimasu ishlatiladi).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "どうぞ。",
            translation: "Пожалуйста (возьмите/проходите).",
          },
          {
            jp: "これ、どうぞ。",
            translation: "Вот это, пожалуйста (возьмите).",
          },
          {
            jp: "お茶、どうぞ。",
            translation: "Чай, пожалуйста (угощайтесь).",
          },
        ],
        uz: [
          { jp: "どうぞ。", translation: "Marhamat (oling/kiring)." },
          { jp: "これ、どうぞ。", translation: "Buni oling, marhamat." },
          { jp: "お茶、どうぞ。", translation: "Choy iching, marhamat." },
        ],
      },
    },
    {
      id: 89,
      lesson: 2,
      japanese: "どうも ありがとう ございます",
      cleanWord: "どうも ありがとう ございます",
      translations: { ru: "большое спасибо", uz: "katta rahmat" },
      exampleSentences: {
        ru: {
          jp: "これ、１００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。どうぞ。…どうも ありがとう ございます！",
          translation: "Вот 1 миллион иен. Пожалуйста. ...Огромное спасибо!!",
          grammarInfo:
            "【Разбор】\n\n1. どうも — «очень».\n\n2. ありがとうございます — «спасибо» (вежливая форма).\n\n💡 Если сказать просто «ありがとう», это будет звучать по-дружески (невежливо по отношению к старшим).",
        },
        uz: {
          jp: "これ、１００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。どうぞ。…どうも ありがとう ございます！",
          translation: "Mana 1 million iyen. Marhamat. ...Katta rahmat!!",
          grammarInfo:
            "【Tahlil】\n\n1. どうも — «juda / katta».\n\n2. ありがとうございます — «rahmat» (hurmat shakli).\n\n💡 Shunchaki «ありがとう» deyish do'stona eshitiladi (o'zidan kattalarga nisbatan hurmatsizlik bo'lishi mumkin).",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "どうも。", translation: "Спасибо. (коротко)" },
          {
            jp: "ありがとうございます。",
            translation: "Спасибо (вежливо).",
          },
          {
            jp: "どうも ありがとうございます。",
            translation: "Большое спасибо (очень вежливо).",
          },
        ],
        uz: [
          { jp: "どうも。", translation: "Rahmat. (qisqa)" },
          {
            jp: "ありがとうございます。",
            translation: "Rahmat (xushmuomala).",
          },
          {
            jp: "どうも ありがとうございます。",
            translation: "Katta rahmat (juda xushmuomala).",
          },
        ],
      },
    },
    {
      id: 90,
      lesson: 2,
      japanese: "あ",
      cleanWord: "あ",
      translations: { ru: "ах!", uz: "a!" },
      exampleSentences: {
        ru: {
          jp: "あ、わたしの <ruby>車<rt>くるま</rt></ruby>！…あなたの じゃ ありません！",
          translation: "Ах, моя машина! ...Она не твоя! (крик вслед угонщику)",
          grammarInfo:
            "【Разбор】\n\n1. あ — междометие. Произносится, когда человек внезапно что-то замечает или вспоминает.\n\n💡 В японском очень много коротких эмоциональных вскриков, и «あ» — самый частый из них.",
        },
        uz: {
          jp: "あ、わたしの <ruby>車<rt>くるま</rt></ruby>！…あなたの じゃ ありません！",
          translation:
            "A, mening mashinam! ...U seniki emas! (o'g'rining ortidan qichqiriq)",
          grammarInfo:
            "【Tahlil】\n\n1. あ — undov so'z. Odam to'satdan biror narsani payqab qolganda yoki eslaganda aytiladi.\n\n💡 Yapon tilida qisqa hissiy undovlar juda ko'p bo'lib, «あ» shulardan eng ko'p ishlatiladiganidir.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "あ、そうですか。", translation: "А, вот как." },
          { jp: "あ、ミラーさん。", translation: "О, господин Миллер." },
          { jp: "あ、すみません。", translation: "Ой, извините." },
        ],
        uz: [
          { jp: "あ、そうですか。", translation: "A, shunaqami." },
          { jp: "あ、ミラーさん。", translation: "O, Miller janoblari." },
          { jp: "あ、すみません。", translation: "Voy, kechirasiz." },
        ],
      },
    },
    {
      id: 91,
      lesson: 2,
      japanese: "これから お<ruby>世話<rt>せわ</rt></ruby>に なります",
      cleanWord: "これから お世話に なります",
      translations: {
        ru: "надеюсь на поддержку",
        uz: "g'amxo'rligingizdan umidvorman",
      },
      exampleSentences: {
        ru: {
          jp: "わたしは <ruby>猫<rt>ねこ</rt></ruby>の タマです。これから お<ruby>世話<rt>せわ</rt></ruby>に なります。",
          translation:
            "Я кот по имени Тама. С надеждой на вашу поддержку (и корм).",
          grammarInfo:
            "【Разбор】\n\n1. これから — «с этого момента».\n\n2. お世話に なります — устоявшееся выражение «вручаю себя вашим заботам».\n\n💡 Эта фраза ОБЯЗАТЕЛЬНА, когда вы переезжаете к кому-то, поступаете на работу или въезжаете в новое жильё.",
        },
        uz: {
          jp: "わたしは <ruby>猫<rt>ねこ</rt></ruby>の タマです。これから お<ruby>世話<rt>せわ</rt></ruby>に なります。",
          translation:
            "Men Tama ismli mushukman. Bundan buyon g'amxo'rligingizdan umidvorman.",
          grammarInfo:
            "【Tahlil】\n\n1. これから — «bundan buyon».\n\n2. お世話に なります — «o'zimni sizning g'amxo'rligingizga topshiraman» degan qolip ibora.\n\n💡 Bu ibora kimgadir qo'shnichilikka ko'chib o'tganda, ishga kirganda yoki yangi uyga ko'chganda MAJBURIY aytilishi kerak.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これから お世話に なります。",
            translation: "Рассчитываю на вашу поддержку в будущем.",
          },
          {
            jp: "山田です。これから お世話に なります。",
            translation: "Я Ямада. Прошу любить и жаловать.",
          },
          {
            jp: "こちらこそ、これから お世話に なります。",
            translation: "И я тоже надеюсь на вашу поддержку.",
          },
        ],
        uz: [
          {
            jp: "これから お世話に なります。",
            translation: "Kelajakda qo'llab-quvvatlashingizdan umidvorman.",
          },
          {
            jp: "山田です。これから お世話に なります。",
            translation: "Men Yamada. G'amxo'rligingizdan umidvorman.",
          },
          {
            jp: "こちらこそ、これから お世話に なります。",
            translation: "Men ham qo'llab-quvvatlashingizdan umidvorman.",
          },
        ],
      },
    },
    {
      id: 92,
      lesson: 2,
      japanese: "こちらこそ よろしく お<ruby>願<rt>ねが</rt></ruby>いします",
      cleanWord: "こちらこそ よろしく お願いします",
      translations: {
        ru: "мне тоже очень приятно",
        uz: "men ham xursandman",
      },
      exampleSentences: {
        ru: {
          jp: "わたしは <ruby>宇宙人<rt>うちゅうじん</rt></ruby>です。よろしく お<ruby>願<rt>ねが</rt></ruby>いします。…こちらこそ よろしく お<ruby>願<rt>ねが</rt></ruby>いします。",
          translation:
            "Я инопланетянин. Рад знакомству. ...М-мне тоже очень приятно.",
          grammarInfo:
            "【Разбор】\n\n1. こちらこそ — «с моей стороны тоже» (ответ на приветствие).\n\n2. よろしく お願いします — вежливая просьба о хорошем отношении.\n\n💡 Японцы настолько привыкли к этой фразе, что отвечают ею почти на автомате в любой ситуации знакомства.",
        },
        uz: {
          jp: "わたしは <ruby>宇宙人<rt>うちゅうじん</rt></ruby>です。よろしく お<ruby>願<rt>ねが</rt></ruby>いします。…こちらこそ よろしく お<ruby>願<rt>ねが</rt></ruby>いします。",
          translation:
            "Men o'zga sayyoralikman. Tanishganimdan xursandman. ...M-men ham tanishganimdan xursandman.",
          grammarInfo:
            "【Tahlil】\n\n1. こちらこそ — «mening tarafimdan ham» (salomlashishga javob).\n\n2. よろしく お願いします — yaxshi munosabatda bo'lishni xushmuomalalik bilan so'rash.\n\n💡 Yaponlar bu iboraga shunchalik o'rganib qolishganki, tanishuvning har qanday holatida avtomatik ravishda shu javobni qaytarishadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "こちらこそ。", translation: "Мне тоже. (коротко)" },
          {
            jp: "こちらこそ よろしく。",
            translation: "Мне тоже приятно познакомиться.",
          },
          {
            jp: "こちらこそ どうぞ よろしく おねがいします。",
            translation: "И мне очень приятно познакомиться.",
          },
        ],
        uz: [
          { jp: "こちらこそ。", translation: "Men ham. (qisqa)" },
          {
            jp: "こちらこそ よろしく。",
            translation: "Men ham tanishganimdan xursandman.",
          },
          {
            jp: "こちらこそ どうぞ よろしく おねがいします。",
            translation: "Men ham tanishganimdan juda xursandman.",
          },
        ],
      },
    },
    {
      id: 93,
      lesson: 3,
      japanese: "ここ",
      cleanWord: "ここ",
      translations: {
        ru: "здесь, это место (рядом с говорящим)",
        uz: "bu yer, bu joy (gapiruvchiga yaqin)",
      },
      exampleSentences: {
        ru: {
          jp: "ここは トイレですか。いいえ、<ruby>先生<rt>せんせい</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>です。",
          translation: "Здесь туалет? Нет, это кабинет учителя.",
          grammarInfo:
            "【Разбор】\n\n1. ここは — «здесь» + частица темы は.\n\n2. トイレですか — вопрос «туалет?».\n\n3. 先生の 部屋です — «кабинет учителя».\n\n💡 Не путайте ここ (место) и これ (вещь).",
        },
        uz: {
          jp: "ここは トイレですか。いいえ、<ruby>先生<rt>せんせい</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>です。",
          translation: "Bu yer hojatxonami? Yo'q, bu o'qituvchining xonasi.",
          grammarInfo:
            "【Tahlil】\n\n1. ここは — «bu yer» + は mavzu ko'rsatkichi.\n\n2. トイレですか — «hojatxonami?» degan savol.\n\n3. 先生の 部屋です — «o'qituvchining xonasi».\n\n💡 ここ (joy) va これ (narsa) so'zlarini adashtirmang.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ここは <ruby>東京<rt>とうきょう</rt></ruby>です。",
            translation: "Здесь Токио.",
          },
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>は ここです。",
            translation: "Моя комната — здесь.",
          },
          {
            jp: "ここは ロビーじゃ ありません。",
            translation: "Здесь не лобби.",
          },
        ],
        uz: [
          {
            jp: "ここは <ruby>東京<rt>とうきょう</rt></ruby>です。",
            translation: "Bu yer Tokio.",
          },
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>は ここです。",
            translation: "Mening xonam — bu yerda.",
          },
          {
            jp: "ここは ロビーじゃ ありません。",
            translation: "Bu yer lobbi emas.",
          },
        ],
      },
    },
    {
      id: 94,
      lesson: 3,
      japanese: "そこ",
      cleanWord: "そこ",
      translations: {
        ru: "там, то место (рядом со слушателем)",
        uz: "u yer, u joy (tinglovchiga yaqin)",
      },
      exampleSentences: {
        ru: {
          jp: "そこは <ruby>教室<rt>きょうしつ</rt></ruby>じゃ ありません。エレベーターです。",
          translation: "Там не классная комната. Это лифт! (Куда вы идете?)",
          grammarInfo:
            "【Разбор】\n\n1. そこは — «там» (возле собеседника).\n\n2. 教室じゃ ありません — «не аудитория».\n\n3. エレベーターです — «лифт».\n\n💡 そこ указывает на место, близкое к слушателю.",
        },
        uz: {
          jp: "そこは <ruby>教室<rt>きょうしつ</rt></ruby>じゃ ありません。エレベーターです。",
          translation: "U yer sinf xonasi emas. Bu lift! (Qayoqqa ketyapsiz?)",
          grammarInfo:
            "【Tahlil】\n\n1. そこは — «u yer» (tinglovchiga yaqin).\n\n2. 教室じゃ ありません — «sinf xonasi emas».\n\n3. エレベーターです — «lift».\n\n💡 そこ suhbatdoshga yaqin bo'lgan joyni bildiradi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "そこは <ruby>会議室<rt>かいぎしつ</rt></ruby>です。",
            translation: "Там (у вас) переговорная.",
          },
          {
            jp: "<ruby>受付<rt>うけつけ</rt></ruby>は そこです。",
            translation: "Стойка регистрации там.",
          },
          {
            jp: "そこは <ruby>私<rt>わたし</rt></ruby>の <ruby>机<rt>つくえ</rt></ruby>です。",
            translation: "Там мой стол.",
          },
        ],
        uz: [
          {
            jp: "そこは <ruby>会議室<rt>かいぎしつ</rt></ruby>です。",
            translation: "U yerda yig'ilish xonasi.",
          },
          {
            jp: "<ruby>受付<rt>うけつけ</rt></ruby>は そこです。",
            translation: "Qabulxonaning stoli u yerda.",
          },
          {
            jp: "そこは <ruby>私<rt>わたし</rt></ruby>の <ruby>机<rt>つくえ</rt></ruby>です。",
            translation: "U yer mening stolim.",
          },
        ],
      },
    },
    {
      id: 95,
      lesson: 3,
      japanese: "あそこ",
      cleanWord: "あそこ",
      translations: {
        ru: "вон там, то место (далеко от обоих)",
        uz: "anavi yer, uzoq joy (ikkalasidan ham uzoq)",
      },
      exampleSentences: {
        ru: {
          jp: "あそこは <ruby>病院<rt>びょういん</rt></ruby>ですか。「いいえ、<ruby>私<rt>わたし</rt></ruby>の <ruby>家<rt>うち</rt></ruby>です。」",
          translation: "Вон там больница? — «Нет, это мой дом.»",
          grammarInfo:
            "【Разбор】\n\n1. あそこは — «вон там» (далеко от обоих).\n\n2. 病院ですか — «больница?».\n\n3. わたしの 家です — «мой дом».\n\n💡 あそこ используется для мест, равно удаленных от говорящего и слушателя.",
        },
        uz: {
          jp: "あそこは <ruby>病院<rt>びょういん</rt></ruby>ですか。「いいえ、<ruby>私<rt>わたし</rt></ruby>の <ruby>家<rt>うち</rt></ruby>です。」",
          translation: "Anavi yer kasalxonami? — «Yo'q, bu mening uyim.»",
          grammarInfo:
            "【Tahlil】\n\n1. あそこは — «anavi yer» (ikkalasidan ham uzoq).\n\n2. 病院ですか — «kasalxonami?».\n\n3. わたしの 家です — «mening uyim».\n\n💡 あそこ suhbatdoshlarning ikkalasidan ham uzoqda bo'lgan joylar uchun ishlatiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あそこは <ruby>大学<rt>だいがく</rt></ruby>です。",
            translation: "Вон там университет.",
          },
          { jp: "トイレは あそこです。", translation: "Туалет вон там." },
          {
            jp: "あそこは ミラーさんの <ruby>家<rt>うち</rt></ruby>ですか。",
            translation: "Вон там дом Миллера?",
          },
        ],
        uz: [
          {
            jp: "あそこは <ruby>大学<rt>だいがく</rt></ruby>です。",
            translation: "Anavi yerda universitet.",
          },
          {
            jp: "トイレは あそこです。",
            translation: "Hojatxona anavi yerda.",
          },
          {
            jp: "あそこは ミラーさんの <ruby>家<rt>うち</rt></ruby>ですか。",
            translation: "Anavi yerdagi uy Millernikimi?",
          },
        ],
      },
    },
    {
      id: 96,
      lesson: 3,
      japanese: "どこ",
      cleanWord: "どこ",
      translations: {
        ru: "где? какое место?",
        uz: "qayerda? qaysi joy?",
      },
      exampleSentences: {
        ru: {
          jp: "ここは どこですか。<ruby>私<rt>わたし</rt></ruby>は だれですか。",
          translation: "Где я? И кто я? (Утро после корпоратива в Токио).",
          grammarInfo:
            "【Разбор】\n\n1. ここは どこですか — досл. «это место — где?».\n\n2. 私は だれですか — «я кто?».\n\n⚠️ В японском мы спрашиваем «Здесь — это где?», а не «Где я нахожусь?».",
        },
        uz: {
          jp: "ここは どこですか。<ruby>私<rt>わたし</rt></ruby>は だれですか。",
          translation:
            "Men qayerdaman? Men o'zi kimman? (Tokiodagi ziyofatdan keyingi tong).",
          grammarInfo:
            "【Tahlil】\n\n1. ここは どこですか — so'zma-so'z «bu yer qayer?».\n\n2. 私は だれですか — «men kimman?».\n\n⚠️ Yapon tilida «Men qayerdaman?» emas, «Bu yer qayer?» deb so'raladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>会議室<rt>かいぎしつ</rt></ruby>は どこですか。",
            translation: "Где переговорная?",
          },
          {
            jp: "ここは どこですか。",
            translation: "Где мы? (Это какое место?)",
          },
          {
            jp: "カメラの <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は どこですか。",
            translation: "Где отдел фотоаппаратов?",
          },
        ],
        uz: [
          {
            jp: "<ruby>会議室<rt>かいぎしつ</rt></ruby>は どこですか。",
            translation: "Yig'ilish xonasi qayerda?",
          },
          {
            jp: "ここは どこですか。",
            translation: "Biz qayerdamiz? (Bu qanday joy?)",
          },
          {
            jp: "カメラの <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は どこですか。",
            translation: "Kameralar bo'limi qayerda?",
          },
        ],
      },
    },
    {
      id: 97,
      lesson: 3,
      japanese: "こちら",
      cleanWord: "こちら",
      translations: {
        ru: "сюда, здесь (вежливая форма ここ)",
        uz: "bu tomonga, bu yerda (hurmat shakli)",
      },
      exampleSentences: {
        ru: {
          jp: "こちらは １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>です。そちらは １００<ruby>円<rt>えん</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>です。",
          translation:
            "Здесь (у меня) зонт за миллион иен. А там (у вас) — зонт за 100 иен.",
          grammarInfo:
            "【Разбор】\n\n1. こちらは — вежливое «здесь» (в моем направлении).\n\n2. 100万円の 傘 — «зонт за миллион иен».\n\n💡 こちら часто используется продавцами, чтобы указать на товар или направление.",
        },
        uz: {
          jp: "こちらは １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>です。そちらは １００<ruby>円<rt>えん</rt></ruby>の <ruby>傘<rt>かさ</rt></ruby>です。",
          translation:
            "Bu yerda (menda) bir million iyenalik soyabon. U yerda (sizda) esa 100 iyenalik soyabon.",
          grammarInfo:
            "【Tahlil】\n\n1. こちらは — hurmat shaklidagi «bu yer» (mening tomonimda).\n\n2. 100万円の 傘 — «bir million iyenalik soyabon».\n\n💡 こちら ko'pincha sotuvchilar tomonidan tovarni yoki yo'nalishni ko'rsatish uchun ishlatiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "こちらは サントスさんです。",
            translation: "Это господин Сантос.",
          },
          {
            jp: "エレベーターは こちらです。",
            translation: "Лифт в этой стороне.",
          },
          {
            jp: "こちらは フランスの <ruby>靴<rt>くつ</rt></ruby>です。",
            translation: "Это французские туфли.",
          },
        ],
        uz: [
          {
            jp: "こちらは サントスさんです。",
            translation: "Bu kishi Santos janoblari.",
          },
          {
            jp: "エレベーターは こちらです。",
            translation: "Lift shu tomonda.",
          },
          {
            jp: "こちらは フランスの <ruby>靴<rt>くつ</rt></ruby>です。",
            translation: "Bu Fransiya tuflilari.",
          },
        ],
      },
    },
    {
      id: 98,
      lesson: 3,
      japanese: "そちら",
      cleanWord: "そちら",
      translations: {
        ru: "туда, там (вежливая форма そこ)",
        uz: "u tomonga, u yerda (hurmat shakli)",
      },
      exampleSentences: {
        ru: {
          jp: "そちらは スイスの <ruby>時計<rt>とけい</rt></ruby>ですか。いいえ、おもちゃの <ruby>時計<rt>とけい</rt></ruby>です。",
          translation: "Там у вас швейцарские часы? Нет, игрушечные.",
          grammarInfo:
            "【Разбор】\n\n1. そちらは — вежливое «там» (около собеседника).\n\n2. スイスの 時計 — «часы из Швейцарии».\n\n3. おもちゃの 時計 です — «это игрушечные часы».\n\n💡 По телефону そちら может означать «вы» или «ваша компания».",
        },
        uz: {
          jp: "そちらは スイスの <ruby>時計<rt>とけい</rt></ruby>ですか。いいえ、おもちゃの <ruby>時計<rt>とけい</rt></ruby>です。",
          translation: "Sizdagi Shveysariya soatimi? Yo'q, o'yinchoq soat.",
          grammarInfo:
            "【Tahlil】\n\n1. そちらは — hurmat shaklidagi «u yer» (suhbatdoshga yaqin).\n\n2. スイスの 時計 — «Shveysariya soati».\n\n3. おもちゃの 時計 です — «bu o'yinchoq soat».\n\n💡 Telefonda gaplashganda そちら so'zi «siz» yoki «kompaniyangiz» ma'nosida ham keladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "そちらは <ruby>事務所<rt>じむしょ</rt></ruby>ですか。",
            translation: "Там находится офис?",
          },
          {
            jp: "トイレは そちらです。",
            translation: "Туалет в той стороне (рядом с вами).",
          },
          {
            jp: "そちらは <ruby>雨<rt>あめ</rt></ruby>ですか。",
            translation: "У вас там дождь?",
          },
        ],
        uz: [
          {
            jp: "そちらは <ruby>事務所<rt>じむしょ</rt></ruby>ですか。",
            translation: "U yer ofismi?",
          },
          {
            jp: "トイレは そちらです。",
            translation: "Hojatxona u tomonda (sizga yaqin).",
          },
          {
            jp: "そちらは <ruby>雨<rt>あめ</rt></ruby>ですか。",
            translation: "Sizlarda yomg'ir yog'yaptimi?",
          },
        ],
      },
    },
    {
      id: 99,
      lesson: 3,
      japanese: "あちら",
      cleanWord: "あちら",
      translations: {
        ru: "вон туда, вон там (вежливая форма あそこ)",
        uz: "anavi tomonga, anavi yerda (hurmat shakli)",
      },
      exampleSentences: {
        ru: {
          jp: "あちらは トイレですか。いいえ、<ruby>受付<rt>うけつけ</rt></ruby>です。",
          translation:
            "Вон там туалет? Нет, это стойка регистрации! (Не совершайте ошибку).",
          grammarInfo:
            "【Разбор】\n\n1. あちらは — вежливое «вон там».\n\n2. 受付です — «это ресепшен».\n\n💡 Используйте あちら в отелях и компаниях, чтобы звучать интеллигентно.",
        },
        uz: {
          jp: "あちらは トイレですか。いいえ、<ruby>受付<rt>うけつけ</rt></ruby>です。",
          translation:
            "Anavi yer hojatxonami? Yo'q, bu qabul stoli! (Xato qilib qo'ymang).",
          grammarInfo:
            "【Tahlil】\n\n1. あちらは — hurmat shaklidagi «anavi yer».\n\n2. 受付です — «bu qabulxona».\n\n💡 Mehmonxona va kompaniyalarda madaniyatliroq ko'rinish uchun あちら dan foydalaning.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あちらは スミスさんです。",
            translation: "Вон тот человек — господин Смит.",
          },
          {
            jp: "<ruby>階段<rt>かいだん</rt></ruby>は あちらです。",
            translation: "Лестница вон в том направлении.",
          },
          {
            jp: "あちらは <ruby>会議室<rt>かいぎしつ</rt></ruby>です。",
            translation: "Вон там переговорная.",
          },
        ],
        uz: [
          {
            jp: "あちらは スミスさんです。",
            translation: "Anavi shaxs — Smit janoblari.",
          },
          {
            jp: "<ruby>階段<rt>かいだん</rt></ruby>は あちらです。",
            translation: "Zinapoya anavi yo'nalishda.",
          },
          {
            jp: "あちらは <ruby>会議室<rt>かいぎしつ</rt></ruby>です。",
            translation: "Anavi yerda yig'ilish xonasi.",
          },
        ],
      },
    },
    {
      id: 100,
      lesson: 3,
      japanese: "どちら",
      cleanWord: "どちら",
      translations: {
        ru: "куда? где? (вежливая форма どこ)",
        uz: "qayoqqa? qayerda? (hurmat shakli)",
      },
      exampleSentences: {
        ru: {
          jp: "お<ruby>国<rt>くに</rt></ruby>は どちらですか。えっ、<ruby>日本<rt>にほん</rt></ruby>ですか。",
          translation:
            "Откуда вы родом? Э-э, из Японии?! (Шок при виде иностранца, родившегося в Токио).",
          grammarInfo:
            "【Разбор】\n\n1. お国は どちらですか — «откуда вы родом?» (вежливый вопрос).\n\n2. 日本ですか — «из Японии?».\n\n💡 どちら используется для вежливого вопроса о местоположении, стране или компании.",
        },
        uz: {
          jp: "お<ruby>国<rt>くに</rt></ruby>は どちらですか。えっ、<ruby>日本<rt>にほん</rt></ruby>ですか。",
          translation:
            "Qaysi davlatdansiz? I-ye, Yaponiyadanmi?! (Tokioda tug'ilgan chet ellikni ko'rgandagi shok).",
          grammarInfo:
            "【Tahlil】\n\n1. お国は どちらですか — «qaysi davlatdansiz?» (hurmat bilan so'rash).\n\n2. 日本ですか — «Yaponiyadanmi?».\n\n💡 どちら so'zi joylashuv, davlat yoki kompaniya haqida madaniyatli so'rash uchun ishlatiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "お<ruby>国<rt>くに</rt></ruby>は どちらですか。",
            translation: "Из какой вы страны?",
          },
          {
            jp: "エスカレーターは どちらですか。",
            translation: "Где эскалатор?",
          },
          {
            jp: "あなたの <ruby>大学<rt>だいがく</rt></ruby>は どちらですか。",
            translation: "Где находится ваш университет?",
          },
        ],
        uz: [
          {
            jp: "お<ruby>国<rt>くに</rt></ruby>は どちらですか。",
            translation: "Qaysi davlatdansiz?",
          },
          {
            jp: "エスカレーターは どちらですか。",
            translation: "Eskalator qaysi tomonda?",
          },
          {
            jp: "あなたの <ruby>大学<rt>だいがく</rt></ruby>は どちらですか。",
            translation: "Universitetingiz qayerda joylashgan?",
          },
        ],
      },
    },
    {
      id: 101,
      lesson: 3,
      japanese: "<ruby>教室<rt>きょうしつ</rt></ruby>",
      cleanWord: "教室",
      translations: {
        ru: "класс, классная комната",
        uz: "sinf xonasi, dars xonasi",
      },
      exampleSentences: {
        ru: {
          jp: "ここは <ruby>教室<rt>きょうしつ</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>です！",
          translation:
            "Это не классная комната. Это моя спальня! (Когда забыл выключить камеру в Zoom).",
          grammarInfo:
            "【Разбор】\n\n1. ここは 教室じゃ ありません — «здесь не аудитория».\n\n2. 私の 部屋です — «моя комната».\n\n⚠️ Типичная ошибка: забыть じゃ ありません при отрицании существительного.",
        },
        uz: {
          jp: "ここは <ruby>教室<rt>きょうしつ</rt></ruby>じゃ ありません。<ruby>私<rt>わたし</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>です！",
          translation:
            "Bu sinf xonasi emas. Bu mening yotoqxonam! (Zoom kamerasini o'chirish esdan chiqqanda).",
          grammarInfo:
            "【Tahlil】\n\n1. ここは 教室じゃ ありません — «bu yer sinf xonasi emas».\n\n2. 私の 部屋です — «mening xonam».\n\n⚠️ Inkor shaklida じゃ ありません ni unutib qoldirmang.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ここは 日本語の <ruby>教室<rt>きょうしつ</rt></ruby>です。",
            translation: "Здесь класс японского языка.",
          },
          {
            jp: "<ruby>教室<rt>きょうしつ</rt></ruby>は あそこです。",
            translation: "Аудитория вон там.",
          },
          {
            jp: "<ruby>教室<rt>きょうしつ</rt></ruby>は ３<ruby>階<rt>がい</rt></ruby>です。",
            translation: "Класс на третьем этаже.",
          },
        ],
        uz: [
          {
            jp: "ここは 日本語の <ruby>教室<rt>きょうしつ</rt></ruby>です。",
            translation: "Bu yapon tili sinf xonasi.",
          },
          {
            jp: "<ruby>教室<rt>きょうしつ</rt></ruby>は あそこです。",
            translation: "Sinf xonasi anavi yerda.",
          },
          {
            jp: "<ruby>教室<rt>きょうしつ</rt></ruby>は ３<ruby>階<rt>がい</rt></ruby>です。",
            translation: "Sinf xonasi uchinchi qavatda.",
          },
        ],
      },
    },
    {
      id: 102,
      lesson: 3,
      japanese: "<ruby>食堂<rt>しょくどう</rt></ruby>",
      cleanWord: "食堂",
      translations: { ru: "столовая, кафетерий", uz: "oshxona, kafe" },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>の <ruby>食堂<rt>しょくどう</rt></ruby>は <ruby>地下<rt>ちか</rt></ruby>の ９９<ruby>階<rt>かい</rt></ruby>です。",
          translation:
            "Столовая моей фирмы находится на минус 99-м этаже. (Очень глубокий бизнес).",
          grammarInfo:
            "【Разбор】\n\n1. 私の 会社の 食堂 — цепочка の: «столовая (чего?) фирмы (чьей?) моей».\n\n2. 地下の 99階 — «99-й этаж подвала».\n\n💡 В Японии лучшие недорогие кафе часто находятся на подземных этажах (デパ地下).",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>の <ruby>食堂<rt>しょくどう</rt></ruby>は <ruby>地下<rt>ちか</rt></ruby>の ９９<ruby>階<rt>かい</rt></ruby>です。",
          translation:
            "Kompaniyamning oshxonasi yer ostining 99-qavatida. (Juda chuqur biznes).",
          grammarInfo:
            "【Tahlil】\n\n1. 私の 会社の 食堂 — zanjir: «mening (kimning?) kompaniyamning (nimaning?) oshxonasi».\n\n2. 地下の 99階 — «yer osti 99-qavati».\n\n💡 Yaponiyadagi eng zo'r oshxonalar ko'pincha yer osti qavatlarida bo'ladi (デパ地下).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>食堂<rt>しょくどう</rt></ruby>は どこですか。",
            translation: "Где столовая?",
          },
          {
            jp: "ここは <ruby>大学<rt>だいがく</rt></ruby>の <ruby>食堂<rt>しょくどう</rt></ruby>です。",
            translation: "Это университетская столовая.",
          },
          {
            jp: "<ruby>食堂<rt>しょくどう</rt></ruby>は １<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Столовая на первом этаже.",
          },
        ],
        uz: [
          {
            jp: "<ruby>食堂<rt>しょくどう</rt></ruby>は どこですか。",
            translation: "Oshxona qayerda?",
          },
          {
            jp: "ここは <ruby>大学<rt>だいがく</rt></ruby>の <ruby>食堂<rt>しょくどう</rt></ruby>です。",
            translation: "Bu universitet oshxonasi.",
          },
          {
            jp: "<ruby>食堂<rt>しょくどう</rt></ruby>は １<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Oshxona birinchi qavatda.",
          },
        ],
      },
    },
    {
      id: 103,
      lesson: 3,
      japanese: "<ruby>事務所<rt>じむしょ</rt></ruby>",
      cleanWord: "事務所",
      translations: {
        ru: "офис, контора, канцелярия",
        uz: "ofis, idora",
      },
      exampleSentences: {
        ru: {
          jp: "あの <ruby>自動車<rt>じどうしゃ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の <ruby>家<rt>うち</rt></ruby>です。そして、<ruby>事務所<rt>じむしょ</rt></ruby>です。",
          translation:
            "Та машина — мой дом. А еще мой офис. (Реальность токийского таксиста).",
          grammarInfo:
            "【Разбор】\n\n1. あの 自動車は — «вон та машина».\n\n2. 私の 家です — «мой дом».\n\n3. そして、事務所です — «и (также) офис».\n\n💡 事務所 — это именно помещение для работы, контора, а не компания в целом (会社).",
        },
        uz: {
          jp: "あの <ruby>自動車<rt>じどうしゃ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の <ruby>家<rt>うち</rt></ruby>です。そして、<ruby>事務所<rt>じむしょ</rt></ruby>です。",
          translation:
            "Anavi mashina — mening uyim. Va yana mening ofisim. (Tokio taksichisining hayoti).",
          grammarInfo:
            "【Tahlil】\n\n1. あの 自動車は — «anavi mashina».\n\n2. 私の 家です — «mening uyim».\n\n3. そして、事務所です — «va (shuningdek) ofisim».\n\n💡 事務所 — butun bir kompaniya (会社) emas, balki aynan ishlash uchun mo'ljallangan xona yoki idora.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>の <ruby>事務所<rt>じむしょ</rt></ruby>は あそこです。",
            translation: "Офис учителя вон там.",
          },
          {
            jp: "ここは <ruby>事務所<rt>じむしょ</rt></ruby>ですか。",
            translation: "Здесь офис?",
          },
          {
            jp: "<ruby>事務所<rt>じむしょ</rt></ruby>は ２<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Офис на втором этаже.",
          },
        ],
        uz: [
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>の <ruby>事務所<rt>じむしょ</rt></ruby>は あそこです。",
            translation: "Ustozning idorasi anavi yerda.",
          },
          {
            jp: "ここは <ruby>事務所<rt>じむしょ</rt></ruby>ですか。",
            translation: "Bu yer ofismi?",
          },
          {
            jp: "<ruby>事務所<rt>じむしょ</rt></ruby>は ２<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Idora ikkinchi qavatda.",
          },
        ],
      },
    },
    {
      id: 104,
      lesson: 3,
      japanese: "<ruby>会議室<rt>かいぎしつ</rt></ruby>",
      cleanWord: "会議室",
      translations: {
        ru: "переговорная комната, конференц-зал",
        uz: "yigʻilish xonasi, konferensiya zali",
      },
      exampleSentences: {
        ru: {
          jp: "<ruby>会議室<rt>かいぎしつ</rt></ruby>は どこですか。…あの トイレですか。",
          translation:
            "Где переговорная? ...Вон тот туалет? (Стартапы бывают суровыми).",
          grammarInfo:
            "【Разбор】\n\n1. 会議室は どこですか — «где комната для собраний?».\n\n2. あの トイレですか — «тот туалет?».\n\n💡 В японском офисе 會議 (собрания) могут длиться часами, поэтому 会議室 всегда заняты.",
        },
        uz: {
          jp: "<ruby>会議室<rt>かいぎしつ</rt></ruby>は どこですか。…あの トイレですか。",
          translation:
            "Yig'ilish xonasi qayerda? ...Anavi hojatxonami? (Startaplar shunaqa bo'ladi).",
          grammarInfo:
            "【Tahlil】\n\n1. 会議室は どこですか — «majlislar xonasi qayerda?».\n\n2. あの トイレですか — «anavi hojatxona?».\n\n💡 Yapon ofislarida 會議 (yig'ilishlar) soatlab davom etishi mumkin, shuning uchun 会議室 doim band bo'ladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>会議室<rt>かいぎしつ</rt></ruby>は あそこです。",
            translation: "Переговорная вон там.",
          },
          {
            jp: "ここは <ruby>会議室<rt>かいぎしつ</rt></ruby>じゃ ありません。",
            translation: "Здесь не переговорная.",
          },
          {
            jp: "あの <ruby>部屋<rt>へや</rt></ruby>は <ruby>会議室<rt>かいぎしつ</rt></ruby>です。",
            translation: "Та комната — конференц-зал.",
          },
        ],
        uz: [
          {
            jp: "<ruby>会議室<rt>かいぎしつ</rt></ruby>は あそこです。",
            translation: "Yig'ilish xonasi anavi yerda.",
          },
          {
            jp: "ここは <ruby>会議室<rt>かいぎしつ</rt></ruby>じゃ ありません。",
            translation: "Bu yer yig'ilish xonasi emas.",
          },
          {
            jp: "あの <ruby>部屋<rt>へや</rt></ruby>は <ruby>会議室<rt>かいぎしつ</rt></ruby>です。",
            translation: "Anavi xona — konferensiya zali.",
          },
        ],
      },
    },
    {
      id: 105,
      lesson: 3,
      japanese: "<ruby>受付<rt>うけつけ</rt></ruby>",
      cleanWord: "受付",
      translations: {
        ru: "стойка регистрации, приёмная",
        uz: "qabul, roʻyxatga olish stoli",
      },
      exampleSentences: {
        ru: {
          jp: "<ruby>受付<rt>うけつけ</rt></ruby>の <ruby>人<rt>ひと</rt></ruby>は だれですか。…ロボットです。",
          translation:
            "Кто работает на ресепшене? ...Это робот. (В Японии есть такие отели).",
          grammarInfo:
            "【Разбор】\n\n1. 受付の 人は — «человек на ресепшене».\n\n2. だれですか — «кто?».\n\n3. ロボットです — «это робот».\n\n💡 В Японии действительно существует сеть отелей Henn-na Hotel, где гостей регистрируют роботы-динозавры.",
        },
        uz: {
          jp: "<ruby>受付<rt>うけつけ</rt></ruby>の <ruby>人<rt>ひと</rt></ruby>は だれですか。…ロボットです。",
          translation:
            "Qabulxonadagi shaxs kim? ...Bu robot. (Yaponiyada shunday mehmonxonalar bor).",
          grammarInfo:
            "【Tahlil】\n\n1. 受付の 人は — «qabulxonadagi shaxs».\n\n2. だれですか — «kim?».\n\n3. ロボットです — «bu robot».\n\n💡 Yaponiyada haqiqatan ham Henn-na Hotel tarmog'i mavjud bo'lib, u yerda mehmonlarni dinozavr-robotlar ro'yxatga oladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>受付<rt>うけつけ</rt></ruby>は １<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Ресепшен на первом этаже.",
          },
          {
            jp: "<ruby>受付<rt>うけつけ</rt></ruby>は どちらですか。",
            translation: "Где стойка регистрации?",
          },
          {
            jp: "あちらが <ruby>受付<rt>うけつけ</rt></ruby>です。",
            translation: "Ресепшен вон там.",
          },
        ],
        uz: [
          {
            jp: "<ruby>受付<rt>うけつけ</rt></ruby>は １<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Qabul stoli birinchi qavatda.",
          },
          {
            jp: "<ruby>受付<rt>うけつけ</rt></ruby>は どちらですか。",
            translation: "Ro'yxatga olish joyi qayerda?",
          },
          {
            jp: "あちらが <ruby>受付<rt>うけつけ</rt></ruby>です。",
            translation: "Qabul stoli anavi yerda.",
          },
        ],
      },
    },
    {
      id: 106,
      lesson: 3,
      japanese: "ロビー",
      cleanWord: "ロビー",
      translations: {
        ru: "холл, вестибюль, лобби",
        uz: "holl, vestibyul",
      },
      exampleSentences: {
        ru: {
          jp: "ロビーは どこですか。…あの エスカレーターです。",
          translation:
            "Где лобби? ...Вон тот эскалатор. (Архитектор был гением).",
          grammarInfo:
            "【Разбор】\n\n1. ロビーは どこですか — «где холл?».\n\n2. あの エスカレーターです — «это вон тот эскалатор».\n\n💡 Иностранные слова записываются катаканой. Черта ー означает долгое чтение гласной (robī).",
        },
        uz: {
          jp: "ロビーは どこですか。…あの エスカレーターです。",
          translation:
            "Vestibyul qayerda? ...Anavi eskalator. (Arxitektor daho bo'lgan).",
          grammarInfo:
            "【Tahlil】\n\n1. ロビーは どこですか — «holl qayerda?».\n\n2. あの エスカレーターです — «bu anavi eskalator».\n\n💡 Chet tili so'zlari katakanada yoziladi. Chiziqcha ー unlining uzun o'qilishini bildiradi (robii).",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "ロビーは ここです。", translation: "Лобби здесь." },
          {
            jp: "この ホテルの ロビーは ２<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Холл этого отеля на втором этаже.",
          },
          {
            jp: "ロビーは あちらです。",
            translation: "Холл вон в той стороне.",
          },
        ],
        uz: [
          { jp: "ロビーは ここです。", translation: "Holl shu yerda." },
          {
            jp: "この ホテルの ロビーは ２<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Bu mehmonxonaning vestibyuli ikkinchi qavatda.",
          },
          {
            jp: "ロビーは あちらです。",
            translation: "Vestibyul anavi tomonda.",
          },
        ],
      },
    },
    {
      id: 107,
      lesson: 3,
      japanese: "<ruby>部屋<rt>へや</rt></ruby>",
      cleanWord: "部屋",
      translations: { ru: "комната", uz: "xona" },
      exampleSentences: {
        ru: {
          jp: "この <ruby>部屋<rt>へや</rt></ruby>は あなたの じゃ ありません。<ruby>先生<rt>せんせい</rt></ruby>の です！",
          translation:
            "Это не твоя комната. Это комната учителя! (Немедленно выйди).",
          grammarInfo:
            "【Разбор】\n\n1. この 部屋は — «эта комната».\n\n2. あなたの じゃありません — «не твоя» (существительное 部屋 опущено).\n\n3. 先生の です — «принадлежит учителю».\n\n⚠️ Не путайте へや (любая комната) и うち (ваш дом/семья).",
        },
        uz: {
          jp: "この <ruby>部屋<rt>へや</rt></ruby>は あなたの じゃ ありません。<ruby>先生<rt>せんせい</rt></ruby>の です！",
          translation:
            "Bu sening xonang emas. Bu o'qituvchining xonasi! (Darhol chiqib ket).",
          grammarInfo:
            "【Tahlil】\n\n1. この 部屋は — «bu xona».\n\n2. あなたの じゃありません — «seniki emas» (部屋 so'zi tushirib qoldirilgan).\n\n3. 先生の です — «ustozga tegishli».\n\n⚠️ へや (har qanday xona) va うち (uyingiz/oilangiz) so'zlarini adashtirmang.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>は ２<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Моя комната на втором этаже.",
          },
          {
            jp: "ここは だれの <ruby>部屋<rt>へや</rt></ruby>ですか。",
            translation: "Чья это комната?",
          },
          {
            jp: "あの <ruby>部屋<rt>へや</rt></ruby>は <ruby>会議室<rt>かいぎしつ</rt></ruby>です。",
            translation: "Та комната — переговорная.",
          },
        ],
        uz: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>は ２<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Mening xonam ikkinchi qavatda.",
          },
          {
            jp: "ここは だれの <ruby>部屋<rt>へや</rt></ruby>ですか。",
            translation: "Bu kimning xonasi?",
          },
          {
            jp: "あの <ruby>部屋<rt>へや</rt></ruby>は <ruby>会議室<rt>かいぎしつ</rt></ruby>です。",
            translation: "Anavi xona — yig'ilish xonasi.",
          },
        ],
      },
    },
    {
      id: 108,
      lesson: 3,
      japanese: "トイレ",
      cleanWord: "トイレ",
      translations: { ru: "туалет", uz: "hojatxona" },
      exampleSentences: {
        ru: {
          jp: "トイレは どこですか。…あの <ruby>自動販売機<rt>じどうはんばいき</rt></ruby>ですか。",
          translation:
            "Где туалет? ...Вон тот вендинговый автомат? (Очень подозрительно).",
          grammarInfo:
            "【Разбор】\n\n1. トイレは どこですか — самый важный вопрос для туриста.\n\n2. あの 自動販売機ですか — «тот автомат?».\n\n💡 Японские туалеты — это чудо техники с подогревом и звуком журчания воды.",
        },
        uz: {
          jp: "トイレは どこですか。…あの <ruby>自動販売機<rt>じどうはんばいき</rt></ruby>ですか。",
          translation:
            "Hojatxona qayerda? ...Anavi savdo avtomatimi? (Juda shubhali).",
          grammarInfo:
            "【Tahlil】\n\n1. トイレは どこですか — sayyohlar uchun eng muhim savol.\n\n2. あの 自動販売機ですか — «anavi avtomatmi?».\n\n💡 Yapon hojatxonalari — isitish va suv ovozi funksiyalariga ega texnika mo'jizasidir.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "トイレは こちらです。",
            translation: "Туалет в этой стороне.",
          },
          {
            jp: "あの <ruby>部屋<rt>へや</rt></ruby>は トイレです。",
            translation: "Та комната — туалет.",
          },
          {
            jp: "ここは トイレじゃ ありません。",
            translation: "Здесь не туалет.",
          },
        ],
        uz: [
          {
            jp: "トイレは こちらです。",
            translation: "Hojatxona bu tomonda.",
          },
          {
            jp: "あの <ruby>部屋<rt>へや</rt></ruby>は トイレです。",
            translation: "Anavi xona — hojatxona.",
          },
          {
            jp: "ここは トイレじゃ ありません。",
            translation: "Bu yer hojatxona emas.",
          },
        ],
      },
    },
    {
      id: 109,
      lesson: 3,
      japanese: "お<ruby>手洗<rt>てあら</rt></ruby>い",
      cleanWord: "お手洗い",
      translations: {
        ru: "туалет (вежливое выражение)",
        uz: "hojatxona (hurmat shakli)",
      },
      exampleSentences: {
        ru: {
          jp: "お<ruby>手洗<rt>てあら</rt></ruby>いは どちらですか。…ここは <ruby>会社<rt>かいしゃ</rt></ruby>じゃ ありません。わたしの <ruby>家<rt>うち</rt></ruby>です。",
          translation: "Где уборная? ...Мужчина, это не офис. Это мой дом.",
          grammarInfo:
            "【Разбор】\n\n1. お手洗いは — «уборная (досл. мытье рук)».\n\n2. どちらですか — вежливое «где?».\n\n💡 お手洗い звучит гораздо вежливее и мягче, чем トイレ. Рекомендуется использовать в ресторанах.",
        },
        uz: {
          jp: "お<ruby>手洗<rt>てあら</rt></ruby>いは どちらですか。…ここは <ruby>会社<rt>かいしゃ</rt></ruby>じゃ ありません。わたしの <ruby>家<rt>うち</rt></ruby>です。",
          translation:
            "Hojatxona qayerda? ...Birodar, bu ofis emas. Mening uyim.",
          grammarInfo:
            "【Tahlil】\n\n1. お手洗いは — «hojatxona (so'zma-so'z: qo'l yuvish)».\n\n2. どちらですか — hurmat bilan «qayerda?».\n\n💡 お手洗い トイレ ga qaraganda ancha madaniyatli va yumshoq eshitiladi. Restoranlarda tavsiya etiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "お<ruby>手洗<rt>てあら</rt></ruby>いは １<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Уборная на первом этаже.",
          },
          {
            jp: "お<ruby>手洗<rt>てあら</rt></ruby>いは あちらです。",
            translation: "Уборная вон в той стороне.",
          },
          {
            jp: "お<ruby>手洗<rt>てあら</rt></ruby>いは どこですか。",
            translation: "Где находится уборная?",
          },
        ],
        uz: [
          {
            jp: "お<ruby>手洗<rt>てあら</rt></ruby>いは １<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Hojatxona birinchi qavatda.",
          },
          {
            jp: "お<ruby>手洗<rt>てあら</rt></ruby>いは あちらです。",
            translation: "Hojatxona anavi tomonda.",
          },
          {
            jp: "お<ruby>手洗<rt>てあら</rt></ruby>いは どこですか。",
            translation: "Hojatxona qayerda joylashgan?",
          },
        ],
      },
    },
    {
      id: 110,
      lesson: 3,
      japanese: "<ruby>階段<rt>かいだん</rt></ruby>",
      cleanWord: "階段",
      translations: { ru: "лестница", uz: "zinapoya" },
      exampleSentences: {
        ru: {
          jp: "この <ruby>階段<rt>かいだん</rt></ruby>は <ruby>事務所<rt>じむしょ</rt></ruby>の ですか。いいえ、<ruby>私<rt>わたし</rt></ruby>の <ruby>家<rt>うち</rt></ruby>の です。",
          translation: "Это лестница в офис? Нет, это лестница в моем доме.",
          grammarInfo:
            "【Разбор】\n\n1. 事務所の ですか — «принадлежит офису? / ведет в офис?».\n\n2. 私の 家の です — «лестница моего дома».\n\n💡 Эскалатор часто ломается, а вот 階段 (kaidan) всегда работает.",
        },
        uz: {
          jp: "この <ruby>階段<rt>かいだん</rt></ruby>は <ruby>事務所<rt>じむしょ</rt></ruby>の ですか。いいえ、<ruby>私<rt>わたし</rt></ruby>の <ruby>家<rt>うち</rt></ruby>の です。",
          translation:
            "Bu ofisning zinapoyasimi? Yo'q, mening uyimning zinapoyasi.",
          grammarInfo:
            "【Tahlil】\n\n1. 事務所の ですか — «ofisga tegishlimi? / ofisga olib boradimi?».\n\n2. 私の 家の です — «mening uyimning zinapoyasi».\n\n💡 Eskalator tez-tez buzilib turadi, lekin 階段 (kaidan) har doim ishlaydi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>階段<rt>かいだん</rt></ruby>は どこですか。",
            translation: "Где лестница?",
          },
          {
            jp: "<ruby>階段<rt>かいだん</rt></ruby>は あちらです。",
            translation: "Лестница вон там.",
          },
          {
            jp: "この <ruby>階段<rt>かいだん</rt></ruby>は ２<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Эта лестница ведет на 2 этаж.",
          },
        ],
        uz: [
          {
            jp: "<ruby>階段<rt>かいだん</rt></ruby>は どこですか。",
            translation: "Zinapoya qayerda?",
          },
          {
            jp: "<ruby>階段<rt>かいだん</rt></ruby>は あちらです。",
            translation: "Zinapoya anavi tomonda.",
          },
          {
            jp: "この <ruby>階段<rt>かいだん</rt></ruby>は ２<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Bu zinapoya 2-qavatda.",
          },
        ],
      },
    },
    {
      id: 111,
      lesson: 3,
      japanese: "エレベーター",
      cleanWord: "エレベーター",
      translations: { ru: "лифт", uz: "lift" },
      exampleSentences: {
        ru: {
          jp: "この エレベーターは １０００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。",
          translation:
            "Этот лифт стоит 10 миллионов иен. (Покататься бесплатно не получится).",
          grammarInfo:
            "【Разбор】\n\n1. この エレベーターは — «этот лифт».\n\n2. 1000万円です — «10 миллионов иен» (1000 раз по 10 000).\n\n💡 В японских лифтах есть кнопка «закрыть двери» (閉), которую местные нажимают мгновенно, чтобы не ждать.",
        },
        uz: {
          jp: "この エレベーターは １０００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。",
          translation:
            "Bu lift 10 million iyena turadi. (Tekin uchib bo'lmaydi).",
          grammarInfo:
            "【Tahlil】\n\n1. この エレベーターは — «bu lift».\n\n2. 1000万円です — «10 million iyena» (1000 marta 10 000).\n\n💡 Yapon liftlarida eshikni yopish tugmasi (閉) bor, mahalliy aholi kutmaslik uchun uni darhol bosadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "エレベーターは あちらです。",
            translation: "Лифт вон в той стороне.",
          },
          { jp: "エレベーターは どこですか。", translation: "Где лифт?" },
          {
            jp: "あの エレベーターは ドイツの エレベーターです。",
            translation: "Тот лифт — немецкий.",
          },
        ],
        uz: [
          {
            jp: "エレベーターは あちらです。",
            translation: "Lift anavi tomonda.",
          },
          {
            jp: "エレベーターは どこですか。",
            translation: "Lift qayerda?",
          },
          {
            jp: "あの エレベーターは ドイツの エレベーターです。",
            translation: "Anavi lift — Germaniya liftidir.",
          },
        ],
      },
    },
    {
      id: 112,
      lesson: 3,
      japanese: "エスカレーター",
      cleanWord: "エスカレーター",
      translations: { ru: "эскалатор", uz: "eskalator" },
      exampleSentences: {
        ru: {
          jp: "あの エスカレーターは １<ruby>階<rt>かい</rt></ruby>ですか。いいえ、<ruby>地下<rt>ちか</rt></ruby>の １０<ruby>階<rt>かい</rt></ruby>です。",
          translation: "Тот эскалатор едет на 1-й этаж? Нет, на минус 10-й.",
          grammarInfo:
            "【Разбор】\n\n1. 1階ですか — «на первый этаж?».\n\n2. 地下の 10階です — «на 10-й этаж под землей».\n\n💡 В Токио на эскалаторе стоят слева, а в Осаке — справа. Будьте внимательны!",
        },
        uz: {
          jp: "あの エスカレーターは １<ruby>階<rt>かい</rt></ruby>ですか。いいえ、<ruby>地下<rt>ちか</rt></ruby>の １０<ruby>階<rt>かい</rt></ruby>です。",
          translation:
            "Anavi eskalator 1-qavatga olib chiqadimi? Yo'q, yer ostining 10-qavatiga.",
          grammarInfo:
            "【Tahlil】\n\n1. 1階ですか — «birinchi qavatgami?».\n\n2. 地下の 10階です — «yer ostidagi 10-qavatga».\n\n💡 Tokioda eskalatorning chap tomonida turishadi, Osakada esa o'ng tomonda. Ehtiyot bo'ling!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "エスカレーターは どちらですか。",
            translation: "Где находится эскалатор?",
          },
          {
            jp: "エスカレーターは そこです。",
            translation: "Эскалатор там.",
          },
          {
            jp: "この エスカレーターは ２<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Этот эскалатор — на 2 этаж.",
          },
        ],
        uz: [
          {
            jp: "エスカレーターは どちらですか。",
            translation: "Eskalator qaysi tomonda?",
          },
          {
            jp: "エスカレーターは そこです。",
            translation: "Eskalator u yerda.",
          },
          {
            jp: "この エスカレーターは ２<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Bu eskalator 2-qavatga olib chiqadi.",
          },
        ],
      },
    },
    {
      id: 113,
      lesson: 3,
      japanese: "<ruby>自動販売機<rt>じどうはんばいき</rt></ruby>",
      cleanWord: "自動販売機",
      translations: {
        ru: "торговый автомат, вендинговая машина",
        uz: "avtomat savdo mashinasi",
      },
      exampleSentences: {
        ru: {
          jp: "これは コーヒーの <ruby>自動販売機<rt>じどうはんばいき</rt></ruby>じゃ ありません。ネクタイの です。",
          translation:
            "Это не кофейный автомат. Это автомат по продаже галстуков. (Да, такие бывают).",
          grammarInfo:
            "【Разбор】\n\n1. コーヒーの 自動販売機じゃ ありません — «не кофейный вендинговый аппарат».\n\n2. ネクタイの です — «для галстуков».\n\n💡 В Японии более 4 миллионов автоматов. В них можно купить зонты, горячий суп и даже жуков.",
        },
        uz: {
          jp: "これは コーヒーの <ruby>自動販売機<rt>じどうはんばいき</rt></ruby>じゃ ありません。ネクタイの です。",
          translation:
            "Bu kofe avtomati emas. Bu galstuklar avtomati. (Ha, shunaqasi ham bor).",
          grammarInfo:
            "【Tahlil】\n\n1. コーヒーの 自動販売機じゃ ありません — «kofe avtomati emas».\n\n2. ネクタイの です — «galstuklar uchun».\n\n💡 Yaponiyada 4 milliondan ortiq avtomatlar bor. Ularda soyabon, issiq sho'rva va hatto qo'ng'izlarni ham sotib olish mumkin.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>自動販売機<rt>じどうはんばいき</rt></ruby>は １<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Торговый автомат на 1 этаже.",
          },
          {
            jp: "あの <ruby>自動販売機<rt>じどうはんばいき</rt></ruby>は フランスの ワインです。",
            translation: "В том автомате — французское вино.",
          },
          {
            jp: "<ruby>自動販売機<rt>じどうはんばいき</rt></ruby>は どこですか。",
            translation: "Где торговый автомат?",
          },
        ],
        uz: [
          {
            jp: "<ruby>自動販売機<rt>じどうはんばいき</rt></ruby>は １<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Savdo avtomati 1-qavatda.",
          },
          {
            jp: "あの <ruby>自動販売機<rt>じどうはんばいき</rt></ruby>は フランスの ワインです。",
            translation: "Anavi avtomatda Fransiya vinosi bor.",
          },
          {
            jp: "<ruby>自動販売機<rt>じどうはんばいき</rt></ruby>は どこですか。",
            translation: "Savdo mashinasi qayerda?",
          },
        ],
      },
    },
    {
      id: 114,
      lesson: 3,
      japanese: "<ruby>電話<rt>でんわ</rt></ruby>",
      cleanWord: "電話",
      translations: { ru: "телефон", uz: "telefon" },
      exampleSentences: {
        ru: {
          jp: "この <ruby>電話<rt>でんわ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。あなたの じゃ ありません！",
          translation: "Этот телефон — мой. Не твой!",
          grammarInfo:
            "【Разбор】\n\n1. この 電話 — «этот телефон».\n\n2. わたしの です — «мой».\n\n3. あなたの じゃ ありません — «не твой» (существительное 電話 опускается).\n\n💡 Для мобильных телефонов чаще используют слова ケータイ (keitai) или スマホ (sumaho).",
        },
        uz: {
          jp: "この <ruby>電話<rt>でんわ</rt></ruby>は <ruby>私<rt>わたし</rt></ruby>の です。あなたの じゃ ありません！",
          translation: "Bu telefon — meniki. Seniki emas!",
          grammarInfo:
            "【Tahlil】\n\n1. この 電話 — «bu telefon».\n\n2. わたしの です — «mening».\n\n3. あなたの じゃ ありません — «seniki emas» (telefon so'zi tushirib qoldirilgan).\n\n💡 Mobil telefonlar uchun odatda ケータイ (keitai) yoki スマホ (sumaho) so'zlari ishlatiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>電話<rt>でんわ</rt></ruby>は あそこです。",
            translation: "Телефон вон там.",
          },
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>電話<rt>でんわ</rt></ruby>です。",
            translation: "Это мой телефон.",
          },
          {
            jp: "あの <ruby>電話<rt>でんわ</rt></ruby>は だれの <ruby>電話<rt>でんわ</rt></ruby>ですか。",
            translation: "Чей вон тот телефон?",
          },
        ],
        uz: [
          {
            jp: "<ruby>電話<rt>でんわ</rt></ruby>は あそこです。",
            translation: "Telefon anavi yerda.",
          },
          {
            jp: "これは <ruby>私<rt>わたし</rt></ruby>の <ruby>電話<rt>でんわ</rt></ruby>です。",
            translation: "Bu mening telefonim.",
          },
          {
            jp: "あの <ruby>電話<rt>でんわ</rt></ruby>は だれの <ruby>電話<rt>でんわ</rt></ruby>ですか。",
            translation: "Anavi telefon kimniki?",
          },
        ],
      },
    },
    {
      id: 115,
      lesson: 3,
      japanese: "<ruby>国<rt>くに</rt></ruby>",
      cleanWord: "国",
      translations: { ru: "страна", uz: "mamlakat, davlat" },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>国<rt>くに</rt></ruby>は ここです。<ruby>私<rt>わたし</rt></ruby>の ベッドです。",
          translation:
            "Моя страна — здесь. Моя кровать. (Когда не хочется вставать на работу).",
          grammarInfo:
            "【Разбор】\n\n1. わたしの 国は — «моя страна (тема)».\n\n2. ここです — «здесь».\n\n3. わたしの ベッドです — «это моя кровать».\n\n💡 国 (kuni) может метафорически означать родное место или дом.",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>国<rt>くに</rt></ruby>は ここです。<ruby>私<rt>わたし</rt></ruby>の ベッドです。",
          translation:
            "Mening mamlakatim — bu yer. Mening karavotim. (Ishga turgisi kelmaganlar uchun).",
          grammarInfo:
            "【Tahlil】\n\n1. わたしの 国は — «mening mamlakatim (mavzu)».\n\n2. ここです — «bu yerda».\n\n3. わたしの ベッドです — «bu mening karavotim».\n\n💡 国 (kuni) ko'chma ma'noda tug'ilgan joy yoki uyni bildirishi mumkin.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>国<rt>くに</rt></ruby>は ここです。",
            translation: "Моя страна здесь.",
          },
          {
            jp: "フランスは <ruby>国<rt>くに</rt></ruby>です。",
            translation: "Франция — это страна.",
          },
          {
            jp: "スイスの <ruby>国<rt>くに</rt></ruby>の <ruby>時計<rt>とけい</rt></ruby>です。",
            translation: "Часы из страны Швейцария.",
          },
        ],
        uz: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>国<rt>くに</rt></ruby>は ここです。",
            translation: "Mening mamlakatim shu yer.",
          },
          {
            jp: "フランスは <ruby>国<rt>くに</rt></ruby>です。",
            translation: "Fransiya — mamlakat.",
          },
          {
            jp: "スイスの <ruby>国<rt>くに</rt></ruby>の <ruby>時計<rt>とけい</rt></ruby>です。",
            translation: "Shveysariya mamlakatining soati.",
          },
        ],
      },
    },
    {
      id: 116,
      lesson: 3,
      japanese: "お<ruby>国<rt>くに</rt></ruby>",
      cleanWord: "お国",
      translations: {
        ru: "страна (вежливая форма)",
        uz: "mamlakat (hurmat shakli)",
      },
      exampleSentences: {
        ru: {
          jp: "お<ruby>国<rt>くに</rt></ruby>は どちらですか。…えっ、フランスじゃ ありませんか。",
          translation: "Откуда вы родом? ...Э, разве не из Франции?",
          grammarInfo:
            "【Разбор】\n\n1. お国 — вежливое слово для страны собеседника. К своей стране «お» добавлять НЕЛЬЗЯ!\n\n2. どちらですか — «где? / откуда?».\n\n3. フランスじゃ ありませんか — «разве не Франция?».\n\n⚠️ Спрашивать японца «お国は どちらですか» не стоит, если вы в Японии.",
        },
        uz: {
          jp: "お<ruby>国<rt>くに</rt></ruby>は どちらですか。…えっ、フランスじゃ ありませんか。",
          translation: "Qaysi davlatdansiz? ...Iya, Fransiyadan emasmisiz?",
          grammarInfo:
            "【Tahlil】\n\n1. お国 — suhbatdoshning davlati uchun hurmat so'zi. O'z davlatingizga «お» qo'shish MUMKIN EMAS!\n\n2. どちらですか — «qayerdan?».\n\n3. フランスじゃ ありませんか — «Fransiyadan emasmisiz?».\n\n⚠️ Yaponiyada turib yapondan «お国は どちらですか» deb so'rash g'alati.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "お<ruby>国<rt>くに</rt></ruby>は どちらですか。",
            translation: "Из какой вы страны?",
          },
          {
            jp: "お<ruby>国<rt>くに</rt></ruby>は イタリアですか。",
            translation: "Ваша страна — Италия?",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>の お<ruby>国<rt>くに</rt></ruby>は どこですか。",
            translation: "Где находится родина учителя?",
          },
        ],
        uz: [
          {
            jp: "お<ruby>国<rt>くに</rt></ruby>は どちらですか。",
            translation: "Qaysi davlatdansiz?",
          },
          {
            jp: "お<ruby>国<rt>くに</rt></ruby>は イタリアですか。",
            translation: "Davlatingiz Italiyami?",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>の お<ruby>国<rt>くに</rt></ruby>は どこですか。",
            translation: "Ustozning vatani qayerda?",
          },
        ],
      },
    },
    {
      id: 117,
      lesson: 3,
      japanese: "<ruby>会社<rt>かいしゃ</rt></ruby>",
      cleanWord: "会社",
      translations: { ru: "компания, фирма", uz: "kompaniya, firma" },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>は ここですか。いいえ、あちらです。あの トイレです。",
          translation:
            "Моя фирма здесь? Нет, вон там. Вон тот туалет. (Тяжелые будни стартапера).",
          grammarInfo:
            "【Разбор】\n\n1. 私の 会社 — «моя компания».\n\n2. あちらです — «вон там (вежливо)».\n\n3. あの トイレです — «тот туалет».\n\n💡 Японские офисные работники (салариманы) часто работают до поздней ночи.",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>は ここですか。いいえ、あちらです。あの トイレです。",
          translation:
            "Mening kompaniyam shu yerdami? Yo'q, anavi yerda. Anavi hojatxona. (Startapchining og'ir kunlari).",
          grammarInfo:
            "【Tahlil】\n\n1. 私の 会社 — «mening kompaniyam».\n\n2. あちらです — «anavi yerda (hurmat bilan)».\n\n3. あの トイレです — «anavi hojatxona».\n\n💡 Yapon ofis xodimlari ko'pincha kechasigacha ishlaydilar.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ここは トヨタの <ruby>会社<rt>かいしゃ</rt></ruby>です。",
            translation: "Здесь компания Тойота.",
          },
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>は スイスです。",
            translation: "Моя фирма — в Швейцарии.",
          },
          {
            jp: "あなたの <ruby>会社<rt>かいしゃ</rt></ruby>は どちらですか。",
            translation: "Где ваша компания?",
          },
        ],
        uz: [
          {
            jp: "ここは トヨタの <ruby>会社<rt>かいしゃ</rt></ruby>です。",
            translation: "Bu Toyota kompaniyasi.",
          },
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>は スイスです。",
            translation: "Mening kompaniyam Shveysariyada.",
          },
          {
            jp: "あなたの <ruby>会社<rt>かいしゃ</rt></ruby>は どちらですか。",
            translation: "Sizning kompaniyangiz qayerda?",
          },
        ],
      },
    },
    {
      id: 118,
      lesson: 3,
      japanese: "<ruby>家<rt>うち</rt></ruby>",
      cleanWord: "家",
      translations: { ru: "дом, жилище, семья", uz: "uy, hovli, oila" },
      exampleSentences: {
        ru: {
          jp: "ここは あなたの <ruby>家<rt>うち</rt></ruby>ですか。いいえ、<ruby>先生<rt>せんせい</rt></ruby>の <ruby>家<rt>うち</rt></ruby>です。",
          translation:
            "Это твой дом? Нет, это дом учителя! (Что мы тут делаем?)",
          grammarInfo:
            "【Разбор】\n\n1. あなたの 家 — «твой дом».\n\n2. 先生の 家です — «дом учителя».\n\n💡 うち (uchi) — это не только здание (которое いえ), но и свой круг, семья, родной дом.",
        },
        uz: {
          jp: "ここは あなたの <ruby>家<rt>うち</rt></ruby>ですか。いいえ、<ruby>先生<rt>せんせい</rt></ruby>の <ruby>家<rt>うち</rt></ruby>です。",
          translation:
            "Bu sening uyingmi? Yo'q, bu ustozning uyi! (Bu yerda nima qilyapmiz?)",
          grammarInfo:
            "【Tahlil】\n\n1. あなたの 家 — «sening uying».\n\n2. 先生の 家です — «ustozning uyi».\n\n💡 うち (uchi) — faqat bino (いえ) emas, balki o'z oilangiz va uyingiz ma'nosini ham anglatadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>家<rt>うち</rt></ruby>は ここです。",
            translation: "Мой дом здесь.",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>の <ruby>家<rt>うち</rt></ruby>は どちらですか。",
            translation: "Где дом учителя?",
          },
          {
            jp: "ここは だれの <ruby>家<rt>うち</rt></ruby>ですか。",
            translation: "Чей это дом?",
          },
        ],
        uz: [
          {
            jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>家<rt>うち</rt></ruby>は ここです。",
            translation: "Mening uyim shu yerda.",
          },
          {
            jp: "<ruby>先生<rt>せんせい</rt></ruby>の <ruby>家<rt>うち</rt></ruby>は どちらですか。",
            translation: "Ustozning uyi qayerda?",
          },
          {
            jp: "ここは だれの <ruby>家<rt>うち</rt></ruby>ですか。",
            translation: "Bu kimning uyi?",
          },
        ],
      },
    },
    {
      id: 119,
      lesson: 3,
      japanese: "<ruby>靴<rt>くつ</rt></ruby>",
      cleanWord: "靴",
      translations: {
        ru: "обувь, туфли, ботинки",
        uz: "oyoq kiyim, tufli, botinka",
      },
      exampleSentences: {
        ru: {
          jp: "この <ruby>靴<rt>くつ</rt></ruby>は イタリアの <ruby>靴<rt>くつ</rt></ruby>ですか。いいえ、１００<ruby>円<rt>えん</rt></ruby>の <ruby>靴<rt>くつ</rt></ruby>です。",
          translation: "Это итальянские туфли? Нет, это туфли за 100 иен.",
          grammarInfo:
            "【Разбор】\n\n1. イタリアの 靴 — «итальянская обувь (производитель)».\n\n2. 100円の 靴 — «обувь за 100 иен (свойство)».\n\n💡 В Японии всегда снимают обувь при входе в дом, поэтому дырявые носки — это катастрофа.",
        },
        uz: {
          jp: "この <ruby>靴<rt>くつ</rt></ruby>は イタリアの <ruby>靴<rt>くつ</rt></ruby>ですか。いいえ、１００<ruby>円<rt>えん</rt></ruby>の <ruby>靴<rt>くつ</rt></ruby>です。",
          translation: "Bu Italiya tuflisimi? Yo'q, bu 100 iyenalik tufli.",
          grammarInfo:
            "【Tahlil】\n\n1. イタリアの 靴 — «Italiya oyoq kiyimi (ishlab chiqaruvchi)».\n\n2. 100円の 靴 — «100 iyenalik tufli (xususiyat)».\n\n💡 Yaponiyada uyga kirganda doim oyoq kiyim yechiladi, shuning uchun yirtiq paypoq — katta falokat.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>靴<rt>くつ</rt></ruby>の <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は どこですか。",
            translation: "Где обувной отдел?",
          },
          {
            jp: "それは <ruby>私<rt>わたし</rt></ruby>の <ruby>靴<rt>くつ</rt></ruby>です。",
            translation: "Это моя обувь.",
          },
          {
            jp: "フランスの <ruby>靴<rt>くつ</rt></ruby>です。",
            translation: "Обувь из Франции.",
          },
        ],
        uz: [
          {
            jp: "<ruby>靴<rt>くつ</rt></ruby>の <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は どこですか。",
            translation: "Oyoq kiyimlar bo'limi qayerda?",
          },
          {
            jp: "それは <ruby>私<rt>わたし</rt></ruby>の <ruby>靴<rt>くつ</rt></ruby>です。",
            translation: "Bu mening oyoq kiyimim.",
          },
          {
            jp: "フランスの <ruby>靴<rt>くつ</rt></ruby>です。",
            translation: "Fransiya oyoq kiyimi.",
          },
        ],
      },
    },
    {
      id: 120,
      lesson: 3,
      japanese: "ネクタイ",
      cleanWord: "ネクタイ",
      translations: { ru: "галстук", uz: "galstuk" },
      exampleSentences: {
        ru: {
          jp: "その ネクタイは いくらですか。…３００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。",
          translation:
            "Сколько стоит этот галстук? ...Три миллиона иен. (Сделан из слез единорога).",
          grammarInfo:
            "【Разбор】\n\n1. その ネクタイ — «тот галстук» (у собеседника).\n\n2. いくらですか — «сколько стоит?».\n\n3. 300万円 — «3 миллиона иен».\n\n💡 Японские работники в костюмах (サラリーマン) носят галстуки почти круглый год.",
        },
        uz: {
          jp: "その ネクタイは いくらですか。…３００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。",
          translation:
            "Bu galstuk qancha turadi? ...Uch million iyena. (Yakkashoxning ko'z yoshlaridan yasalgan).",
          grammarInfo:
            "【Tahlil】\n\n1. その ネクタイ — «anavi galstuk» (suhbatdoshga yaqin).\n\n2. いくらですか — «qancha turadi?».\n\n3. 300万円 — «3 million iyena».\n\n💡 Yapon ishchilari kostyumda (サラリーマン) yil davomida galstuk taqib yurishadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは <ruby>先生<rt>せんせい</rt></ruby>の ネクタイです。",
            translation: "Это галстук учителя.",
          },
          {
            jp: "ネクタイの <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は ２<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Отдел галстуков на 2 этаже.",
          },
          {
            jp: "あの ネクタイを <ruby>見<rt>み</rt></ruby>せてください。",
            translation: "Покажите вон тот галстук.",
          },
        ],
        uz: [
          {
            jp: "これは <ruby>先生<rt>せんせい</rt></ruby>の ネクタイです。",
            translation: "Bu ustozning galstugi.",
          },
          {
            jp: "ネクタイの <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は ２<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Galstuklar bo'limi 2-qavatda.",
          },
          {
            jp: "あの ネクタイを <ruby>見<rt>み</rt></ruby>せてください。",
            translation: "Anavi galstukni ko'rsating.",
          },
        ],
      },
    },
    {
      id: 121,
      lesson: 3,
      japanese: "ワイン",
      cleanWord: "ワイン",
      translations: { ru: "вино", uz: "vino, sharob" },
      exampleSentences: {
        ru: {
          jp: "これは <ruby>私<rt>わたし</rt></ruby>の ワインです。<ruby>先生<rt>せんせい</rt></ruby>の ワインじゃ ありません。",
          translation: "Это мое вино. Не вино учителя. (Отдай бутылку!).",
          grammarInfo:
            "【Разбор】\n\n1. これは — «это (рядом со мной)».\n\n2. 私の ワインです — «мое вино».\n\n3. 先生の ワインじゃ ありません — «не вино учителя».\n\n💡 В Японии можно купить хорошее французское вино в любом комбини (круглосуточном магазине).",
        },
        uz: {
          jp: "これは <ruby>私<rt>わたし</rt></ruby>の ワインです。<ruby>先生<rt>せんせい</rt></ruby>の ワインじゃ ありません。",
          translation:
            "Bu mening vinom. O'qituvchining vinosi emas. (Butilkani qaytar!).",
          grammarInfo:
            "【Tahlil】\n\n1. これは — «bu (mening oldimda)».\n\n2. 私の ワインです — «mening vinom».\n\n3. 先生の ワインじゃ ありません — «ustozning vinosi emas».\n\n💡 Yaponiyada istalgan konbini do'konidan yaxshi fransuz vinosi topish mumkin.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "フランスの ワインは いくらですか。",
            translation: "Сколько стоит французское вино?",
          },
          {
            jp: "ワインの <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は <ruby>地下<rt>ちか</rt></ruby>です。",
            translation: "Винный отдел находится в подвале.",
          },
          {
            jp: "この ワインを ください。",
            translation: "Дайте это вино, пожалуйста.",
          },
        ],
        uz: [
          {
            jp: "フランスの ワインは いくらですか。",
            translation: "Fransiya vinosi qancha turadi?",
          },
          {
            jp: "ワインの <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は <ruby>地下<rt>ちか</rt></ruby>です。",
            translation: "Vino bo'limi yer osti qavatida.",
          },
          {
            jp: "この ワインを ください。",
            translation: "Shu vinoni bering.",
          },
        ],
      },
    },
    {
      id: 122,
      lesson: 3,
      japanese: "<ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>",
      cleanWord: "売り場",
      translations: {
        ru: "торговый отдел, секция магазина",
        uz: "savdo boʻlimi, doʻkon qismi",
      },
      exampleSentences: {
        ru: {
          jp: "ワインの <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は どこですか。…ここは <ruby>会社<rt>かいしゃ</rt></ruby>です。",
          translation: "Где винный отдел? ...Мужчина, это офис.",
          grammarInfo:
            "【Разбор】\n\n1. ワインの 売り場 — «отдел продаж вина».\n\n2. ここは 会社です — «здесь компания (офис)».\n\n💡 売り場 состоит из 売り (продажа) и 場 (место). Используется в крупных универмагах (デパート).",
        },
        uz: {
          jp: "ワインの <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は どこですか。…ここは <ruby>会社<rt>かいしゃ</rt></ruby>です。",
          translation: "Vino bo'limi qayerda? ...Birodar, bu ofis.",
          grammarInfo:
            "【Tahlil】\n\n1. ワインの 売り場 — «vino savdo bo'limi».\n\n2. ここは 会社です — «bu yer kompaniya (ofis)».\n\n💡 売り場 so'zi 売り (sotish) va 場 (joy) so'zlaridan tashkil topgan. Yirik do'konlarda (デパート) ishlatiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>時計<rt>とけい</rt></ruby>の <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は ３<ruby>階<rt>がい</rt></ruby>です。",
            translation: "Отдел часов на 3 этаже.",
          },
          {
            jp: "カメラの <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は どちらですか。",
            translation: "В какой стороне отдел камер?",
          },
          {
            jp: "<ruby>靴<rt>くつ</rt></ruby>の <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は ここです。",
            translation: "Обувной отдел здесь.",
          },
        ],
        uz: [
          {
            jp: "<ruby>時計<rt>とけい</rt></ruby>の <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は ３<ruby>階<rt>がい</rt></ruby>です。",
            translation: "Soatlar bo'limi 3-qavatda.",
          },
          {
            jp: "カメラの <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は どちらですか。",
            translation: "Kameralar bo'limi qaysi tomonda?",
          },
          {
            jp: "<ruby>靴<rt>くつ</rt></ruby>の <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は ここです。",
            translation: "Oyoq kiyim bo'limi shu yerda.",
          },
        ],
      },
    },
    {
      id: 123,
      lesson: 3,
      japanese: "<ruby>地下<rt>ちか</rt></ruby>",
      cleanWord: "地下",
      translations: {
        ru: "подвал, подземный этаж",
        uz: "yer osti, podval",
      },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>は <ruby>地下<rt>ちか</rt></ruby>の １０<ruby>階<rt>かい</rt></ruby>です。",
          translation: "Моя компания находится на минус 10-м этаже.",
          grammarInfo:
            "【Разбор】\n\n1. 地下の 10階 — «10-й этаж подземелья / подвала».\n\n💡 Японские торговые центры часто имеют огромные подземные этажи с едой (デパ地下 — depachika).",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>は <ruby>地下<rt>ちか</rt></ruby>の １０<ruby>階<rt>かい</rt></ruby>です。",
          translation: "Mening kompaniyam yer ostining 10-qavatida.",
          grammarInfo:
            "【Tahlil】\n\n1. 地下の 10階 — «yer ostining 10-qavati».\n\n💡 Yaponiya savdo markazlarining yer osti qavatlari juda katta va ovqatga boy bo'ladi (デパ地下 — depachika deb ataladi).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>食堂<rt>しょくどう</rt></ruby>は <ruby>地下<rt>ちか</rt></ruby>です。",
            translation: "Столовая в подвале.",
          },
          {
            jp: "<ruby>地下<rt>ちか</rt></ruby>の トイレは どこですか。",
            translation: "Где туалет на цокольном этаже?",
          },
          {
            jp: "<ruby>地下<rt>ちか</rt></ruby>の １<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Минус первый этаж.",
          },
        ],
        uz: [
          {
            jp: "<ruby>食堂<rt>しょくどう</rt></ruby>は <ruby>地下<rt>ちか</rt></ruby>です。",
            translation: "Oshxona yer osti qavatida.",
          },
          {
            jp: "<ruby>地下<rt>ちか</rt></ruby>の トイレは どこですか。",
            translation: "Yer osti qavatidagi hojatxona qayerda?",
          },
          {
            jp: "<ruby>地下<rt>ちか</rt></ruby>の １<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Yer osti birinchi qavati.",
          },
        ],
      },
    },
    {
      id: 124,
      lesson: 3,
      japanese: "～<ruby>階<rt>かい</rt></ruby>",
      cleanWord: "～階",
      translations: {
        ru: "счётный суффикс для этажей",
        uz: "qavatlar uchun sanash qoʻshimchasi",
      },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>は ４０<ruby>階<rt>かい</rt></ruby>です。あなたの <ruby>部屋<rt>へや</rt></ruby>は １<ruby>階<rt>かい</rt></ruby>です。",
          translation:
            "Моя комната на 40-м этаже. А твоя — на 1-м. (Тонкий социальный статус).",
          grammarInfo:
            "【Разбор】\n\n1. 40階 (yonjikkai) — «сороковой этаж».\n\n2. 1階 (ikkai) — «первый этаж».\n\n💡 В Японии первый этаж — это наш первый (на уровне земли), а не второй, как в Англии.",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>は ４０<ruby>階<rt>かい</rt></ruby>です。あなたの <ruby>部屋<rt>へや</rt></ruby>は １<ruby>階<rt>かい</rt></ruby>です。",
          translation:
            "Mening xonam 40-qavatda. Sening xonang esa 1-qavatda. (Ijtimoiy statusning nozik ifodasi).",
          grammarInfo:
            "【Tahlil】\n\n1. 40階 (yonjikkai) — «qirqinchi qavat».\n\n2. 1階 (ikkai) — «birinchi qavat».\n\n💡 Yaponiyada qavatlar pastdan 1 deb sanaladi (Angliyadan farqli o'laroq).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>事務所<rt>じむしょ</rt></ruby>は ２<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Офис на 2 этаже.",
          },
          {
            jp: "<ruby>部屋<rt>へや</rt></ruby>は ４<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Комната на 4 этаже.",
          },
          {
            jp: "エレベーターで ５<ruby>階<rt>かい</rt></ruby>です。",
            translation: "На лифте на 5 этаж.",
          },
        ],
        uz: [
          {
            jp: "<ruby>事務所<rt>じむしょ</rt></ruby>は ２<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Ofis 2-qavatda.",
          },
          {
            jp: "<ruby>部屋<rt>へや</rt></ruby>は ４<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Xona 4-qavatda.",
          },
          {
            jp: "エレベーターで ５<ruby>階<rt>かい</rt></ruby>です。",
            translation: "Lift orqali 5-qavat.",
          },
        ],
      },
    },
    {
      id: 125,
      lesson: 3,
      japanese: "～<ruby>階<rt>がい</rt></ruby>",
      cleanWord: "～階",
      translations: {
        ru: "счётный суффикс для этажей (с озвончением после 3, 6, 8, 10)",
        uz: "qavatlar uchun sanash qoʻshimchasi (3, 6, 8, 10 raqamlaridan keyin)",
      },
      exampleSentences: {
        ru: {
          jp: "エレベーターは ３<ruby>階<rt>がい</rt></ruby>ですか。いいえ、ここです。",
          translation: "Лифт на 3-м этаже? Нет, он здесь.",
          grammarInfo:
            "【Разбор】\n\n1. 3階 (san-gai) — пример озвончения суффикса. Этажи 3 (san-gai) и 何 (nan-gai) читаются с «gai».\n\n⚠️ Обратите внимание: 1階 (ikkai), 6階 (rokkai), 8階 (hakkai), 10階 (jukkai) читаются с удвоением.",
        },
        uz: {
          jp: "エレベーターは ３<ruby>階<rt>がい</rt></ruby>ですか。いいえ、ここです。",
          translation: "Lift 3-qavatdami? Yo'q, shu yerda.",
          grammarInfo:
            "【Tahlil】\n\n1. 3階 (san-gai) — jarangli o'qilish namunasi. 3 (san-gai) va 何 (nan-gai) raqamlaridan keyin «gai» bo'ladi.\n\n⚠️ E'tibor bering: 1階 (ikkai), 6階 (rokkai), 8階 (hakkai), 10階 (jukkai) ikkilangan undosh bilan o'qiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>時計<rt>とけい</rt></ruby>の <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は ３<ruby>階<rt>がい</rt></ruby>です。",
            translation: "Отдел часов на 3 этаже.",
          },
          {
            jp: "３<ruby>階<rt>がい</rt></ruby>の トイレは どこですか。",
            translation: "Где туалет на 3 этаже?",
          },
          {
            jp: "<ruby>受付<rt>うけつけ</rt></ruby>は ３<ruby>階<rt>がい</rt></ruby>です。",
            translation: "Ресепшен на третьем этаже.",
          },
        ],
        uz: [
          {
            jp: "<ruby>時計<rt>とけい</rt></ruby>の <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は ３<ruby>階<rt>がい</rt></ruby>です。",
            translation: "Soatlar bo'limi 3-qavatda.",
          },
          {
            jp: "３<ruby>階<rt>がい</rt></ruby>の トイレは どこですか。",
            translation: "3-qavatdagi hojatxona qayerda?",
          },
          {
            jp: "<ruby>受付<rt>うけつけ</rt></ruby>は ３<ruby>階<rt>がい</rt></ruby>です。",
            translation: "Qabul stoli uchinchi qavatda.",
          },
        ],
      },
    },
    {
      id: 126,
      lesson: 3,
      japanese: "<ruby>何階<rt>なんがい</rt></ruby>",
      cleanWord: "何階",
      translations: { ru: "какой этаж?", uz: "nechanchi qavat?" },
      exampleSentences: {
        ru: {
          jp: "<ruby>時計<rt>とけい</rt></ruby>の <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は <ruby>何階<rt>なんがい</rt></ruby>ですか。…３<ruby>階<rt>がい</rt></ruby>です。１<ruby>階<rt>かい</rt></ruby>じゃ ありません。",
          translation: "На каком этаже отдел часов? ...На 3-м. Не на 1-м.",
          grammarInfo:
            "【Разбор】\n\n1. 売り場は 何階ですか — «на каком этаже отдел?».\n\n2. 3階です — «на 3-м этаже (san-gai)».\n\n💡 何階 всегда читается звонко: nan-gai (не nan-kai).",
        },
        uz: {
          jp: "<ruby>時計<rt>とけい</rt></ruby>の <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は <ruby>何階<rt>なんがい</rt></ruby>ですか。…３<ruby>階<rt>がい</rt></ruby>です。１<ruby>階<rt>かい</rt></ruby>じゃ ありません。",
          translation:
            "Soatlar bo'limi nechanchi qavatda? ...3-qavatda. 1-qavatda emas.",
          grammarInfo:
            "【Tahlil】\n\n1. 売り場は 何階ですか — «savdo bo'limi nechanchi qavatda?».\n\n2. 3階です — «3-qavatda (san-gai)».\n\n💡 何階 har doim jarangli o'qiladi: nan-gai (nan-kai emas).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "カメラの <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は <ruby>何階<rt>なんがい</rt></ruby>ですか。",
            translation: "На каком этаже отдел камер?",
          },
          {
            jp: "あなたの <ruby>会社<rt>かいしゃ</rt></ruby>は <ruby>何階<rt>なんがい</rt></ruby>ですか。",
            translation: "На каком этаже ваша фирма?",
          },
          {
            jp: "<ruby>地下<rt>ちか</rt></ruby> <ruby>何階<rt>なんがい</rt></ruby>ですか。",
            translation: "Какой минус этаж (подземный)?",
          },
        ],
        uz: [
          {
            jp: "カメラの <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は <ruby>何階<rt>なんがい</rt></ruby>ですか。",
            translation: "Kameralar bo'limi nechanchi qavatda?",
          },
          {
            jp: "あなたの <ruby>会社<rt>かいしゃ</rt></ruby>は <ruby>何階<rt>なんがい</rt></ruby>ですか。",
            translation: "Sizning kompaniyangiz nechanchi qavatda?",
          },
          {
            jp: "<ruby>地下<rt>ちか</rt></ruby> <ruby>何階<rt>なんがい</rt></ruby>ですか。",
            translation: "Yer ostining nechanchi qavati?",
          },
        ],
      },
    },
    {
      id: 127,
      lesson: 3,
      japanese: "～<ruby>円<rt>えん</rt></ruby>",
      cleanWord: "～円",
      translations: {
        ru: "~ иен(а/ы) (японская валюта)",
        uz: "~ iyena (Yaponiya valyutasi)",
      },
      exampleSentences: {
        ru: {
          jp: "この <ruby>水<rt>みず</rt></ruby>は １<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。ただの <ruby>水<rt>みず</rt></ruby>じゃ ありません。",
          translation:
            "Эта вода стоит 10 000 иен. Это не просто вода. (Идеальная ловушка для туристов).",
          grammarInfo:
            "【Разбор】\n\n1. この 水は — «эта вода».\n\n2. 1万円 です — «стоит 10 000 иен» (около $70).\n\n3. ただの 水 — «простая вода».\n\n💡 Иена пижется как 円, но читается «эн».",
        },
        uz: {
          jp: "この 水みずは １万まん円えんです。ただの 水みずじゃ ありません。",
          translation:
            "Bu suv 10 000 iyena turadi. Oddiy suv emas. (Sayyohlar uchun ajoyib tuzoq).",
          grammarInfo:
            "【Tahlil】\n\n1. この 水は — «bu suv».\n\n2. 1万円 です — «10 000 iyena turadi» ($70 atrofida).\n\n3. ただの 水 — «oddiy suv».\n\n💡 Iyena 円 deb yoziladi, lekin «en» deb o'qiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この ネクタイは １５００<ruby>円<rt>えん</rt></ruby>です。",
            translation: "Этот галстук стоит 1500 иен.",
          },
          {
            jp: "これは １００<ruby>円<rt>えん</rt></ruby>の ボールペンです。",
            translation: "Это ручка за 100 иен.",
          },
          {
            jp: "その <ruby>靴<rt>くつ</rt></ruby>は ５０００<ruby>円<rt>えん</rt></ruby>です。",
            translation: "Та обувь стоит 5000 иен.",
          },
        ],
        uz: [
          {
            jp: "この ネクタイは １５００<ruby>円<rt>えん</rt></ruby>です。",
            translation: "Bu galstuk 1500 iyena.",
          },
          {
            jp: "これは １００<ruby>円<rt>えん</rt></ruby>の ボールペンです。",
            translation: "Bu 100 iyenalik ruchka.",
          },
          {
            jp: "その <ruby>靴<rt>くつ</rt></ruby>は ５０００<ruby>円<rt>えん</rt></ruby>です。",
            translation: "U oyoq kiyim 5000 iyena.",
          },
        ],
      },
    },
    {
      id: 128,
      lesson: 3,
      japanese: "いくら",
      cleanWord: "いくら",
      translations: {
        ru: "сколько (о цене)?",
        uz: "qancha (narx haqida)?",
      },
      exampleSentences: {
        ru: {
          jp: "すみません、この <ruby>会社<rt>かいしゃ</rt></ruby>は いくらですか。…えっ、１００<ruby>円<rt>えん</rt></ruby>ですか！？",
          translation:
            "Извините, сколько стоит эта компания? ...Что, 100 иен!? (Илон Маск на распродаже).",
          grammarInfo:
            "【Разбор】\n\n1. この 会社は — «эта компания».\n\n2. いくらですか — «сколько стоит?».\n\n💡 いくら всегда означает вопрос цены. Не путайте со словом «икра».",
        },
        uz: {
          jp: "すみません、この <ruby>会社<rt>かいしゃ</rt></ruby>は いくらですか。…えっ、１００<ruby>円<rt>えん</rt></ruby>ですか！？",
          translation:
            "Kechirasiz, bu kompaniya qancha turadi? ...Nima, 100 iyenami!? (Ilon Mask auksionda).",
          grammarInfo:
            "【Tahlil】\n\n1. この 会社は — «bu kompaniya».\n\n2. いくらですか — «qancha turadi?».\n\n💡 いくら doim narxni so'rashda ishlatiladi. Rus tilidan kelgan ikra bilan adashtirmang.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この カメラは いくらですか。",
            translation: "Сколько стоит эта камера?",
          },
          {
            jp: "その ワインは いくらですか。",
            translation: "Сколько стоит то вино?",
          },
          {
            jp: "これは いくらですか。",
            translation: "Сколько это стоит?",
          },
        ],
        uz: [
          {
            jp: "この カメラは いくらですか。",
            translation: "Bu kamera qancha turadi?",
          },
          {
            jp: "その ワインは いくらですか。",
            translation: "U vino qancha turadi?",
          },
          {
            jp: "これは いくらですか。",
            translation: "Bu qancha turadi?",
          },
        ],
      },
    },
    {
      id: 129,
      lesson: 3,
      japanese: "<ruby>百<rt>ひゃく</rt></ruby>",
      cleanWord: "百",
      translations: { ru: "сто", uz: "yuz" },
      exampleSentences: {
        ru: {
          jp: "この ネクタイは １００<ruby>円<rt>えん</rt></ruby>です。あの ネクタイも １００<ruby>円<rt>えん</rt></ruby>です。",
          translation:
            "Этот галстук — 100 иен. И тот галстук — 100 иен. (Потому что мы в магазине Daiso).",
          grammarInfo:
            "【Разбор】\n\n1. も — частица «тоже / также».\n\n2. 100円 (hyaku-en) — «сто иен» (слово «один» не ставится).\n\n⚠️ Обратите внимание на чтения: 300 (san-byaku), 600 (rop-pyaku), 800 (hap-pyaku).",
        },
        uz: {
          jp: "この ネクタイは １００<ruby>円<rt>えん</rt></ruby>です。あの ネクタイも １００<ruby>円<rt>えん</rt></ruby>です。",
          translation:
            "Bu galstuk — 100 iyena. Anavi galstuk ham 100 iyena. (Chunki biz Daiso do'konidamiz).",
          grammarInfo:
            "【Tahlil】\n\n1. も — «ham» degan ma'noni bildiruvchi qo'shimcha.\n\n2. 100円 (hyaku-en) — «yuz iyena» («bir» so'zi qo'shilmaydi).\n\n⚠️ O'qilishiga e'tibor bering: 300 (san-byaku), 600 (rop-pyaku), 800 (hap-pyaku).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "それは ３００<ruby>円<rt>えん</rt></ruby>です。",
            translation: "Это стоит 300 иен.",
          },
          {
            jp: "これは ８００<ruby>円<rt>えん</rt></ruby>です。",
            translation: "Это стоит 800 иен.",
          },
          {
            jp: "この <ruby>本<rt>ほん</rt></ruby>は １００<ruby>円<rt>えん</rt></ruby>です。",
            translation: "Эта книга стоит 100 иен.",
          },
        ],
        uz: [
          {
            jp: "それは ３００<ruby>円<rt>えん</rt></ruby>です。",
            translation: "Bu 300 iyena.",
          },
          {
            jp: "これは ８００<ruby>円<rt>えん</rt></ruby>です。",
            translation: "Bu 800 iyena.",
          },
          {
            jp: "この <ruby>本<rt>ほん</rt></ruby>は １００<ruby>円<rt>えん</rt></ruby>です。",
            translation: "Bu kitob 100 iyena.",
          },
        ],
      },
    },
    {
      id: 130,
      lesson: 3,
      japanese: "<ruby>千<rt>せん</rt></ruby>",
      cleanWord: "千",
      translations: { ru: "тысяча", uz: "ming" },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>靴<rt>くつ</rt></ruby>は １０００<ruby>円<rt>えん</rt></ruby>です。<ruby>先生<rt>せんせい</rt></ruby>の <ruby>靴<rt>くつ</rt></ruby>は １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。",
          translation:
            "Мои ботинки стоят 1000 иен. Ботинки учителя — миллион иен. (Суровая реальность).",
          grammarInfo:
            "【Разбор】\n\n1. 1000円 (sen-en) — «тысяча иен».\n\n2. 100万円 (hyaku-man-en) — «один миллион иен».\n\n⚠️ Обратите внимание: 3000 (san-zen), 8000 (has-sen).",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>靴<rt>くつ</rt></ruby>は １０００<ruby>円<rt>えん</rt></ruby>です。<ruby>先生<rt>せんせい</rt></ruby>の <ruby>靴<rt>くつ</rt></ruby>は １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。",
          translation:
            "Mening poyabzalim 1000 iyena turadi. O'qituvchining poyabzali bir million iyena. (Hayot haqiqati).",
          grammarInfo:
            "【Tahlil】\n\n1. 1000円 (sen-en) — «ming iyena».\n\n2. 100万円 (hyaku-man-en) — «bir million iyena».\n\n⚠️ E'tibor bering: 3000 (san-zen), 8000 (has-sen).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この ワインは ３０００<ruby>円<rt>えん</rt></ruby>です。",
            translation: "Это вино стоит 3000 иен.",
          },
          {
            jp: "８０００<ruby>円<rt>えん</rt></ruby>の <ruby>時計<rt>とけい</rt></ruby>は どこですか。",
            translation: "Где часы за 8000 иен?",
          },
          {
            jp: "これは １０００<ruby>円<rt>えん</rt></ruby>の テレホンカードです。",
            translation: "Это телефонная карточка на 1000 иен.",
          },
        ],
        uz: [
          {
            jp: "この ワインは ３０００<ruby>円<rt>えん</rt></ruby>です。",
            translation: "Bu vino 3000 iyena turadi.",
          },
          {
            jp: "８０００<ruby>円<rt>えん</rt></ruby>の <ruby>時計<rt>とけい</rt></ruby>は どこですか。",
            translation: "8000 iyenalik soat qayerda?",
          },
          {
            jp: "これは １０００<ruby>円<rt>えん</rt></ruby>の テレホンカードです。",
            translation: "Bu 1000 iyenalik telefon kartasi.",
          },
        ],
      },
    },
    {
      id: 131,
      lesson: 3,
      japanese: "<ruby>万<rt>まん</rt></ruby>",
      cleanWord: "万",
      translations: { ru: "десять тысяч", uz: "oʻn ming" },
      exampleSentences: {
        ru: {
          jp: "１<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>ですか。いいえ、１０００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。",
          translation:
            "10 тысяч иен? Нет, 10 миллионов иен. (Неловкий момент на кассе).",
          grammarInfo:
            "【Разбор】\n\n1. 1万円 (ichi-man-en) — базовая купюра Японии (10 000 иен).\n\n2. 1000万円 (issen-man-en) — 10 миллионов (тысяча десятков тысяч).\n\n💡 В Японии считают не тысячами, а десятками тысяч. 1 000 000 — это 100 万 (сто ман).",
        },
        uz: {
          jp: "１<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>ですか。いいえ、１０００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。",
          translation:
            "10 ming iyenami? Yo'q, 10 million iyena. (Kassadagi noqulay holat).",
          grammarInfo:
            "【Tahlil】\n\n1. 1万円 (ichi-man-en) — Yaponiyaning eng katta qog'oz puli (10 000 iyena).\n\n2. 1000万円 (issen-man-en) — 10 million iyena (mingta o'n ming).\n\n💡 Yaponiyada bizdek minglab emas, o'n minglab sanashadi. Bir million bu 100 万.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あの <ruby>車<rt>くるま</rt></ruby>は ３００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。",
            translation: "Та машина стоит 3 000 000 иен.",
          },
          {
            jp: "この コンピューターは １０<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。",
            translation: "Этот компьютер стоит 100 000 иен.",
          },
          {
            jp: "これは １<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>ですか。",
            translation: "Это стоит 10 000 иен?",
          },
        ],
        uz: [
          {
            jp: "あの <ruby>車<rt>くるま</rt></ruby>は ３００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。",
            translation: "Anavi mashina 3 000 000 iyena turadi.",
          },
          {
            jp: "この コンピューターは １０<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>です。",
            translation: "Bu kompyuter 100 000 iyena turadi.",
          },
          {
            jp: "これは １<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>ですか。",
            translation: "Bu 10 000 iyenami?",
          },
        ],
      },
    },
    {
      id: 132,
      lesson: 3,
      japanese: "すみません",
      cleanWord: "すみません",
      translations: {
        ru: "Извините, простите (используется для привлечения внимания или извинения)",
        uz: "Kechirasiz, uzr (e'tibor jalb qilish yoki uzr soʻrash uchun)",
      },
      exampleSentences: {
        ru: {
          jp: "すみません、あなたは だれですか。ここは <ruby>私<rt>わたし</rt></ruby>の <ruby>家<rt>うち</rt></ruby>です！",
          translation: "Извините, вы кто? Это мой дом!",
          grammarInfo:
            "【Разбор】\n\n1. すみません — используется для оклика или извинения.\n\n2. あなたは だれですか — «ты кто такой?».\n\n3. ここは わたしの 家です — «здесь мой дом».\n\n💡 Это самое частое слово в Японии. Им извиняются, благодарят и привлекают внимание.",
        },
        uz: {
          jp: "すみません、あなたは だれですか。ここは <ruby>私<rt>わたし</rt></ruby>の <ruby>家<rt>うち</rt></ruby>です！",
          translation: "Kechirasiz, siz kimsiz? Bu mening uyim!",
          grammarInfo:
            "【Tahlil】\n\n1. すみません — chaqirish yoki uzr so'rash uchun ishlatiladi.\n\n2. あなたは だれですか — «siz kimsiz?».\n\n3. ここは わたしの 家です — «bu mening uyim».\n\n💡 Bu Yaponiyada eng ko'p ishlatiladigan so'z. U uzr so'rash, rahmat aytish va e'tibor jalb qilish uchun ishlatiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "すみません、トイレは どこですか。",
            translation: "Извините, где туалет?",
          },
          {
            jp: "すみません、その <ruby>時計<rt>とけい</rt></ruby>を <ruby>見<rt>み</rt></ruby>せてください。",
            translation: "Извините, покажите те часы.",
          },
          { jp: "あ、すみません。", translation: "Ой, простите." },
        ],
        uz: [
          {
            jp: "すみません、トイレは どこですか。",
            translation: "Kechirasiz, hojatxona qayerda?",
          },
          {
            jp: "すみません、その <ruby>時計<rt>とけい</rt></ruby>を <ruby>見<rt>み</rt></ruby>せてください。",
            translation: "Kechirasiz, o'sha soatni ko'rsating.",
          },
          { jp: "あ、すみません。", translation: "Oh, uzr." },
        ],
      },
    },
    {
      id: 133,
      lesson: 3,
      japanese: "どうも",
      cleanWord: "どうも",
      translations: {
        ru: "Спасибо, благодарю (сокращённая форма благодарности)",
        uz: "Rahmat (qisqartirilgan minnatdorchilik shakli)",
      },
      exampleSentences: {
        ru: {
          jp: "これは １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>の ワインです。…あ、どうも。",
          translation:
            "Это вино за миллион иен. ...А, спасибо. (Скромность 80 уровня).",
          grammarInfo:
            "【Разбор】\n\n1. 100万円の ワイン — «вино за миллион иен».\n\n2. どうも — короткое «спасибо».\n\n💡 どうも часто говорят при получении мелкой услуги.",
        },
        uz: {
          jp: "これは １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>の ワインです。…あ、どうも。",
          translation:
            "Bu bir million iyenalik vino. ...A, rahmat. (Kamtarlikning oliy darajasi).",
          grammarInfo:
            "【Tahlil】\n\n1. 100万円の ワイン — «bir million iyenalik vino».\n\n2. どうも — qisqacha «rahmat».\n\n💡 どうも asosan kichik xizmat qabul qilganda ishlatiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "どうも。", translation: "Спасибо." },
          {
            jp: "どうも すみません。",
            translation: "Большое спасибо (или: сильно извиняюсь).",
          },
          { jp: "あ、どうも。", translation: "А, спасибо." },
        ],
        uz: [
          { jp: "どうも。", translation: "Rahmat." },
          {
            jp: "どうも すみません。",
            translation: "Katta rahmat (yoki: juda uzr).",
          },
          { jp: "あ、どうも。", translation: "A, rahmat." },
        ],
      },
    },
    {
      id: 134,
      lesson: 3,
      japanese: "いらっしゃいませ",
      cleanWord: "いらっしゃいませ",
      translations: {
        ru: "Добро пожаловать! (приветствие в магазинах и ресторанах)",
        uz: "Xush kelibsiz! (doʻkon va restoranlarda salomlashish)",
      },
      exampleSentences: {
        ru: {
          jp: "いらっしゃいませ！ここは <ruby>私<rt>わたし</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>です。<ruby>会社<rt>かいしゃ</rt></ruby>じゃ ありません。",
          translation:
            "Добро пожаловать! Это моя комната. Не офис. (Приветствие незваных гостей).",
          grammarInfo:
            "【Разбор】\n\n1. いらっしゃいませ — дежурное приветствие персонала во всех заведениях Японии.\n\n2. わたしの 部屋 — «моя комната».\n\n💡 На «Ирассяимасэ» покупателю отвечать НЕ нужно. Просто проходите мимо.",
        },
        uz: {
          jp: "いらっしゃいませ！ここは <ruby>私<rt>わたし</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>です。<ruby>会社<rt>かいしゃ</rt></ruby>じゃ ありません。",
          translation:
            "Xush kelibsiz! Bu mening xonam. Ofis emas. (Chaqlirilmagan mehmonlarni kutib olish).",
          grammarInfo:
            "【Tahlil】\n\n1. いらっしゃいませ — Yaponiyadagi barcha do'kon va xizmat ko'rsatish joylarida xodimlarning standart salomi.\n\n2. わたしの 部屋 — «mening xonam».\n\n💡 Xaridor «Irasshaymase» deb aytilganda javob berishi SHART EMAS. Shunchaki o'tib ketavering.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "いらっしゃいませ。",
            translation: "Добро пожаловать. (В магазине)",
          },
          {
            jp: "いらっしゃいませ！",
            translation: "Добро пожаловать! (В ресторане)",
          },
          {
            jp: "いらっしゃいませ。カメラの <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は ３<ruby>階<rt>がい</rt></ruby>です。",
            translation: "Добро пожаловать. Отдел камер на 3-м этаже.",
          },
        ],
        uz: [
          {
            jp: "いらっしゃいませ。",
            translation: "Xush kelibsiz. (Do'konda)",
          },
          {
            jp: "いらっしゃいませ！",
            translation: "Xush kelibsiz! (Restoranda)",
          },
          {
            jp: "いらっしゃいませ。カメラの <ruby>売<rt>う</rt></ruby>り<ruby>場<rt>ば</rt></ruby>は ３<ruby>階<rt>がい</rt></ruby>です。",
            translation: "Xush kelibsiz. Kameralar bo'limi 3-qavatda.",
          },
        ],
      },
    },
    {
      id: 135,
      lesson: 3,
      japanese: "～を<ruby>見<rt>み</rt></ruby>せてください",
      cleanWord: "～を見せてください",
      translations: {
        ru: "Покажите мне, пожалуйста, ~",
        uz: "Menga ~ni ko'rsating, iltimos",
      },
      exampleSentences: {
        ru: {
          jp: "あの １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>の ワインを <ruby>見<rt>み</rt></ruby>せてください。…えっ、コーヒーですか。",
          translation: "Покажите вон то вино за миллион иен. ...А? Это кофе?",
          grammarInfo:
            "【Разбор】\n\n1. ～を 見せてください — конструкция просьбы «покажите».\n\n2. コーヒーですか — «это кофе?».\n\n💡 Фраза, с которой начинается любой шопинг в Японии.",
        },
        uz: {
          jp: "あの １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>の ワインを <ruby>見<rt>み</rt></ruby>せてください。…えっ、コーヒーですか。",
          translation:
            "Anavi bir million iyenalik vinoni ko'rsating. ...A? Bu qahvami?",
          grammarInfo:
            "【Tahlil】\n\n1. ～を 見せてください — «ko'rsating, iltimos» so'rov qolipi.\n\n2. コーヒーですか — «bu qahvami?».\n\n💡 Yaponiyada har qanday xarid shu iboradan boshlanadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "その <ruby>時計<rt>とけい</rt></ruby>を <ruby>見<rt>み</rt></ruby>せてください。",
            translation: "Покажите те часы, пожалуйста.",
          },
          {
            jp: "カメラを <ruby>見<rt>み</rt></ruby>せてください。",
            translation: "Покажите камеру, пожалуйста.",
          },
          {
            jp: "スイスの <ruby>時計<rt>とけい</rt></ruby>を <ruby>見<rt>み</rt></ruby>せてください。",
            translation: "Покажите швейцарские часы.",
          },
        ],
        uz: [
          {
            jp: "その <ruby>時計<rt>とけい</rt></ruby>を <ruby>見<rt>み</rt></ruby>せてください。",
            translation: "O'sha soatni ko'rsating, iltimos.",
          },
          {
            jp: "カメラを <ruby>見<rt>み</rt></ruby>せてください。",
            translation: "Kamerani ko'rsating, iltimos.",
          },
          {
            jp: "スイスの <ruby>時計<rt>とけい</rt></ruby>を <ruby>見<rt>み</rt></ruby>せてください。",
            translation: "Shveysariya soatlarini ko'rsating.",
          },
        ],
      },
    },
    {
      id: 136,
      lesson: 3,
      japanese: "じゃ",
      cleanWord: "じゃ",
      translations: {
        ru: "Тогда, ну (разговорное сокращение от では)",
        uz: "Unda, xo'sh (では ning suhbat shakli)",
      },
      exampleSentences: {
        ru: {
          jp: "この <ruby>車<rt>くるま</rt></ruby>は １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>ですか。…じゃ、あの <ruby>時計<rt>とけい</rt></ruby>を ください。",
          translation:
            "Эта машина стоит миллион иен? ...Тогда дайте вон те часы.",
          grammarInfo:
            "【Разбор】\n\n1. 100万円 — «миллион иен».\n\n2. じゃ — «ну тогда» (вводное слово, когда вы меняете решение).\n\n💡 Разговорное слово. В строгом бизнес-стиле говорят では (dewa).",
        },
        uz: {
          jp: "この <ruby>車<rt>くるま</rt></ruby>は １００<ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby>ですか。…じゃ、あの <ruby>時計<rt>とけい</rt></ruby>を ください。",
          translation:
            "Bu mashina bir million iyenami? ...Unda, anavi soatni bering.",
          grammarInfo:
            "【Tahlil】\n\n1. 100万円 — «bir million iyena».\n\n2. じゃ — «unda / bunday holda» (qaroringizni o'zgartirganda aytiladigan kirish so'zi).\n\n💡 So'zlashuv uslubidagi so'z, qat'iy biznes uslubida では (dewa) deyiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "じゃ、これを ください。",
            translation: "Тогда дайте вот это.",
          },
          {
            jp: "じゃ、あの ネクタイを ください。",
            translation: "Тогда дайте тот галстук.",
          },
          {
            jp: "じゃ、ワインを ください。",
            translation: "Тогда дайте вина.",
          },
        ],
        uz: [
          {
            jp: "じゃ、これを ください。",
            translation: "Unda shuni bering.",
          },
          {
            jp: "じゃ、あの ネクタイを ください。",
            translation: "Unda, anavi galstukni bering.",
          },
          {
            jp: "じゃ、ワインを ください。",
            translation: "Unda vino bering.",
          },
        ],
      },
    },
    {
      id: 137,
      lesson: 3,
      japanese: "～をください",
      cleanWord: "～をください",
      translations: {
        ru: "Дайте мне, пожалуйста, ~",
        uz: "Menga ~ bering, iltimos",
      },
      exampleSentences: {
        ru: {
          jp: "その １００<ruby>円<rt>えん</rt></ruby>の <ruby>時計<rt>とけい</rt></ruby>を ください。スイスの ですか！？",
          translation: "Дайте мне те часы за 100 иен. Они что, швейцарские!?",
          grammarInfo:
            "【Разбор】\n\n1. その 100円の 時計 — «те часы за 100 иен».\n\n2. ～を ください — «дайте, пожалуйста» (стандартная фраза при покупке).\n\n3. スイスの ですか — «они из Швейцарии?».\n\n💡 Частица を (o) указывает на объект, который вы просите дать.",
        },
        uz: {
          jp: "その １００<ruby>円<rt>えん</rt></ruby>の <ruby>時計<rt>とけい</rt></ruby>を ください。スイスの ですか！？",
          translation:
            "Menga anavi 100 iyenalik soatni bering. Nima, Shveysariyanikimi!?",
          grammarInfo:
            "【Tahlil】\n\n1. その 100円の 時計 — «anavi 100 iyenalik soat».\n\n2. ～を ください — «bering, iltimos» (xarid qilishdagi standart ibora).\n\n3. スイスの ですか — «Shveysariyadanmi?».\n\n💡 を (o) qo'shimchasi siz so'rayotgan narsani ko'rsatadi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これを ください。",
            translation: "Дайте это, пожалуйста.",
          },
          {
            jp: "あの <ruby>時計<rt>とけい</rt></ruby>を ください。",
            translation: "Дайте те часы, пожалуйста.",
          },
          {
            jp: "イタリアの <ruby>靴<rt>くつ</rt></ruby>を ください。",
            translation: "Дайте итальянскую обувь.",
          },
        ],
        uz: [
          {
            jp: "これを ください。",
            translation: "Shuni bering, iltimos.",
          },
          {
            jp: "あの <ruby>時計<rt>とけい</rt></ruby>を ください。",
            translation: "Anavi soatni bering, iltimos.",
          },
          {
            jp: "イタリアの <ruby>靴<rt>くつ</rt></ruby>を ください。",
            translation: "Italyancha tufli bering.",
          },
        ],
      },
    },
    {
      id: 138,
      lesson: 3,
      japanese: "イタリア",
      cleanWord: "イタリア",
      translations: { ru: "Италия", uz: "Italiya" },
      exampleSentences: {
        ru: {
          jp: "これは イタリアの <ruby>車<rt>くるま</rt></ruby>です。<ruby>先生<rt>せんせい</rt></ruby>の です。",
          translation:
            "Это итальянская машина. Машина учителя. (Сенсей явно не беден).",
          grammarInfo:
            "【Разбор】\n\n1. イタリアの 車 — «итальянская машина» (страна + の + объект означает происхождение/марку).\n\n2. 先生の です — «принадлежит учителю».\n\n💡 В Японии ездить на импортных машинах (Ferrari, BMW) — признак огромного статуса.",
        },
        uz: {
          jp: "これは イタリアの <ruby>車<rt>くるま</rt></ruby>です。<ruby>先生<rt>せんせい</rt></ruby>の です。",
          translation:
            "Bu italyan mashinasi. Ustozning mashinasi. (Ustozning boyligi aniq).",
          grammarInfo:
            "【Tahlil】\n\n1. イタリアの 車 — «Italiya mashinasi» (davlat + の + obyekt kelib chiqishni/markani bildiradi).\n\n2. 先生の です — «ustozniki».\n\n💡 Yaponiyada import mashinalarni (Ferrari, BMW) haydash — katta nufuz belgisi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "これは イタリアの ワインです。",
            translation: "Это итальянское вино.",
          },
          {
            jp: "イタリアの ネクタイは どこですか。",
            translation: "Где итальянские галстуки?",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は イタリアの <ruby>人<rt>ひと</rt></ruby>です。",
            translation: "Тот человек — итальянец.",
          },
        ],
        uz: [
          {
            jp: "これは イタリアの ワインです。",
            translation: "Bu italyan vinosi.",
          },
          {
            jp: "イタリアの ネクタイは どこですか。",
            translation: "Italiya galstuklari qayerda?",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は イタリアの <ruby>人<rt>ひと</rt></ruby>です。",
            translation: "Anavi shaxs italiyalik.",
          },
        ],
      },
    },
    {
      id: 139,
      lesson: 3,
      japanese: "スイス",
      cleanWord: "スイス",
      translations: { ru: "Швейцария", uz: "Shveysariya" },
      exampleSentences: {
        ru: {
          jp: "この <ruby>時計<rt>とけい</rt></ruby>は スイスの ですか。いいえ、スーパーの です。",
          translation: "Эти часы — швейцарские? Нет, из супермаркета.",
          grammarInfo:
            "【Разбор】\n\n1. スイスの (時計) — «швейцарские (часы)».\n\n2. スーパーの (時計) — «часы из супермаркета».\n\n💡 Швейцарские часы за 10 долларов? Только в японском драгсторе.",
        },
        uz: {
          jp: "この <ruby>時計<rt>とけい</rt></ruby>は スイスの ですか。いいえ、スーパーの です。",
          translation: "Bu Shveysariya soatimi? Yo'q, supermarketniki.",
          grammarInfo:
            "【Tahlil】\n\n1. スイスの (時計) — «Shveysariya (soati)».\n\n2. スーパーの (時計) — «supermarket soati».\n\n💡 10 dollarlik Shveysariya soati? Faqat Yaponiyadagi supermarketda.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "スイスの <ruby>時計<rt>とけい</rt></ruby>は スイスの です。",
            translation: "Швейцарские часы из Швейцарии.",
          },
          {
            jp: "これは スイスの カメラですか。",
            translation: "Это швейцарская камера?",
          },
          {
            jp: "マリアさんは スイスの <ruby>人<rt>ひと</rt></ruby>です。",
            translation: "Мария — швейцарка.",
          },
        ],
        uz: [
          {
            jp: "スイスの <ruby>時計<rt>とけい</rt></ruby>は スイスの です。",
            translation: "Shveysariya soati Shveysariyaniki.",
          },
          {
            jp: "これは スイスの カメラですか。",
            translation: "Bu Shveysariya kamerami?",
          },
          {
            jp: "マリアさんは スイスの <ruby>人<rt>ひと</rt></ruby>です。",
            translation: "Mariya shveysariyalik.",
          },
        ],
      },
    },
    {
      id: 140,
      lesson: 3,
      japanese: "フランス",
      cleanWord: "フランス",
      translations: { ru: "Франция", uz: "Fransiya" },
      exampleSentences: {
        ru: {
          jp: "フランスの ワインですか。いいえ、コーヒーです。",
          translation:
            "Это французское вино? Нет, это кофе. (Настолько темное).",
          grammarInfo:
            "【Разбор】\n\n1. フランスの ワイン — «вино из Франции».\n\n2. コーヒーです — «(это) кофе».\n\n💡 Японцы любят Францию; многие японские пекарни имеют французские названия.",
        },
        uz: {
          jp: "フランスの ワインですか。いいえ、コーヒーです。",
          translation:
            "Bu Fransiya vinosimi? Yo'q, bu kofe. (Shunchalik to'q rangda).",
          grammarInfo:
            "【Tahlil】\n\n1. フランスの ワイン — «Fransiya vinosi».\n\n2. コーヒーです — «(bu) kofe».\n\n💡 Yaponlar Fransiyani yaxshi ko'rishadi, ko'plab yapon novvoyxonalarining nomlari fransuzcha bo'ladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あの <ruby>靴<rt>くつ</rt></ruby>は フランスの です。",
            translation: "Та обувь — французская.",
          },
          {
            jp: "ここは フランスの <ruby>会社<rt>かいしゃ</rt></ruby>です。",
            translation: "Здесь французская компания.",
          },
          {
            jp: "お<ruby>国<rt>くに</rt></ruby>は フランスですか。",
            translation: "Вы из Франции?",
          },
        ],
        uz: [
          {
            jp: "あの <ruby>靴<rt>くつ</rt></ruby>は フランスの です。",
            translation: "Anavi oyoq kiyim Fransiyaniki.",
          },
          {
            jp: "ここは フランスの <ruby>会社<rt>かいしゃ</rt></ruby>です。",
            translation: "Bu yer Fransiya kompaniyasi.",
          },
          {
            jp: "お<ruby>国<rt>くに</rt></ruby>は フランスですか。",
            translation: "Davlatingiz Fransiyami?",
          },
        ],
      },
    },
    {
      id: 141,
      lesson: 3,
      japanese: "ジャカルタ",
      cleanWord: "ジャカルタ",
      translations: { ru: "Джакарта", uz: "Jakarta" },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>は <ruby>東京<rt>とうきょう</rt></ruby>じゃ ありません。ジャカルタです。",
          translation: "Моя компания не в Токио. Она в Джакарте.",
          grammarInfo:
            "【Разбор】\n\n1. わたしの 会社は — «моя компания».\n\n2. ジャカルタです — «находится в Джакарте».\n\n💡 Многие японские корпорации имеют огромные офисы в Юго-Восточной Азии.",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>は <ruby>東京<rt>とうきょう</rt></ruby>じゃ ありません。ジャカルタです。",
          translation: "Mening kompaniyam Tokioda emas. Jakartada.",
          grammarInfo:
            "【Tahlil】\n\n1. わたしの 会社は — «mening kompaniyam».\n\n2. ジャカルタです — «Jakartada joylashgan».\n\n💡 Ko'pgina yapon korporatsiyalarining Janubi-Sharqiy Osiyoda ulkan ofislari bor.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ジャカルタは どこですか。",
            translation: "Где находится Джакарта?",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は ジャカルタの <ruby>人<rt>ひと</rt></ruby>です。",
            translation: "Тот человек из Джакарты.",
          },
          {
            jp: "これは ジャカルタの コンピューターです。",
            translation: "Это компьютер из Джакарты.",
          },
        ],
        uz: [
          {
            jp: "ジャカルタは どこですか。",
            translation: "Jakarta qayerda joylashgan?",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は ジャカルタの <ruby>人<rt>ひと</rt></ruby>です。",
            translation: "Anavi shaxs Jakartadan.",
          },
          {
            jp: "これは ジャカルタの コンピューターです。",
            translation: "Bu Jakartada ishlab chiqarilgan kompyuter.",
          },
        ],
      },
    },
    {
      id: 142,
      lesson: 3,
      japanese: "バンコク",
      cleanWord: "バンコク",
      translations: { ru: "Бангкок", uz: "Bangkok" },
      exampleSentences: {
        ru: {
          jp: "この <ruby>傘<rt>かさ</rt></ruby>は バンコクの ですか。いいえ、<ruby>私<rt>わたし</rt></ruby>の です。",
          translation: "Этот зонт из Бангкока? Нет, он мой.",
          grammarInfo:
            "【Разбор】\n\n1. バンコクの ですか — «из Бангкока?».\n\n2. わたしの です — «мой».\n\n💡 Забавная путаница между происхождением предмета и его принадлежностью.",
        },
        uz: {
          jp: "この <ruby>傘<rt>かさ</rt></ruby>は バンコクの ですか。いいえ、<ruby>私<rt>わたし</rt></ruby>の です。",
          translation: "Bu soyabon Bankokdanmi? Yo'q, meniki.",
          grammarInfo:
            "【Tahlil】\n\n1. バンコクの ですか — «Bankokdanmi?».\n\n2. わたしの です — «meniki».\n\n💡 Buyumning kelib chiqishi va uning kimga tegishli ekanligi o'rtasidagi qiziqarli chalkashlik.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "バンコクの <ruby>会社<rt>かいしゃ</rt></ruby>は どこですか。",
            translation: "Где компания из Бангкока?",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は バンコクの <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "Тот человек — студент из Бангкока.",
          },
          {
            jp: "バンコクの カメラを <ruby>見<rt>み</rt></ruby>せてください。",
            translation: "Покажите камеры из Бангкока.",
          },
        ],
        uz: [
          {
            jp: "バンコクの <ruby>会社<rt>かいしゃ</rt></ruby>は どこですか。",
            translation: "Bankokning kompaniyasi qayerda?",
          },
          {
            jp: "あの <ruby>人<rt>ひと</rt></ruby>は バンコクの <ruby>学生<rt>がくせい</rt></ruby>です。",
            translation: "Anavi odam Bankoklik talaba.",
          },
          {
            jp: "バンコクの カメラを <ruby>見<rt>み</rt></ruby>せてください。",
            translation: "Bankok kameralarini ko'rsating.",
          },
        ],
      },
    },
    {
      id: 143,
      lesson: 3,
      japanese: "ベルリン",
      cleanWord: "ベルリン",
      translations: { ru: "Берлин", uz: "Берлин" },
      exampleSentences: {
        ru: {
          jp: "ベルリンの ワインを ください。…えっ、<ruby>水<rt>みず</rt></ruby>ですか。",
          translation: "Дайте мне берлинское вино. ...А? Это вода?",
          grammarInfo:
            "【Разбор】\n\n1. ベルリンの ワイン — «вино из Берлина».\n\n2. 水ですか — «это вода?».\n\n💡 Германия славится пивом, а вот с вином в Берлине могут быть неожиданности.",
        },
        uz: {
          jp: "ベルリンの ワインを ください。…えっ、<ruby>水<rt>みず</rt></ruby>ですか。",
          translation: "Menga Berlin vinosini bering. ...A? Bu suvmi?",
          grammarInfo:
            "【Tahlil】\n\n1. ベルリンの ワイン — «Berlin vinosi».\n\n2. 水ですか — «bu suvmi?».\n\n💡 Germaniya pivosi bilan mashhur, Berlindagi vino esa kutilmagan syurprizlar taqdim etishi mumkin.",
        },
      },
      dictionaryExamples: {
        ru: [
          { jp: "ここは ベルリンです。", translation: "Это Берлин." },
          {
            jp: "ベルリンは <ruby>国<rt>くに</rt></ruby>じゃ ありません。",
            translation: "Берлин — это не страна.",
          },
          {
            jp: "ベルリンの <ruby>会社<rt>かいしゃ</rt></ruby>です。",
            translation: "Компания из Берлина.",
          },
        ],
        uz: [
          { jp: "ここは ベルリンです。", translation: "Bu yer Berlin." },
          {
            jp: "ベルリンは <ruby>国<rt>くに</rt></ruby>じゃ ありません。",
            translation: "Berlin — davlat emas.",
          },
          {
            jp: "ベルリンの <ruby>会社<rt>かいしゃ</rt></ruby>です。",
            translation: "Berlin kompaniyasi.",
          },
        ],
      },
    },
    {
      id: 144,
      lesson: 3,
      japanese: "<ruby>新大阪<rt>しんおおさか</rt></ruby>",
      cleanWord: "新大阪",
      translations: {
        ru: "Син-Осака (станция синкансена)",
        uz: "Shin-Osaka (shinkansen stansiyasi)",
      },
      exampleSentences: {
        ru: {
          jp: "ここは <ruby>新大阪<rt>しんおおさか</rt></ruby>ですか。<ruby>東京<rt>とうきょう</rt></ruby>じゃ ありませんか！",
          translation:
            "Это станция Син-Осака? А разве не Токио?! (Когда проспал свою остановку).",
          grammarInfo:
            "【Разбор】\n\n1. ここは 新大阪ですか — «здесь (станция) Син-Осака?».\n\n2. 東京じゃ ありませんか — «разве это не Токио?».\n\n💡 Главная ловушка для туристов: скоростные поезда синкансэн останавливаются только на станции Син-Осака (Новая Осака), а не на главной станции Осака.",
        },
        uz: {
          jp: "ここは <ruby>新大阪<rt>しんおおさか</rt></ruby>ですか。<ruby>東京<rt>とうきょう</rt></ruby>じゃ ありませんか！",
          translation:
            "Bu Shin-Osaka bekatimi? Axir Tokio emaskmidi?! (Bekatidan o'tib ketganda).",
          grammarInfo:
            "【Tahlil】\n\n1. ここは 新大阪ですか — «bu yer Shin-Osaka bekatimi?».\n\n2. 東京じゃ ありませんか — «bu Tokio emasmi?».\n\n💡 Sayyohlar uchun asosiy tuzoq: shinkansen tezyurar poezdlari asosiy Osaka bekatida emas, balki faqat Shin-Osaka (Yangi Osaka) bekatida to'xtaydi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ここは <ruby>新大阪<rt>しんおおさか</rt></ruby>ですか。",
            translation: "Здесь Син-Осака?",
          },
          {
            jp: "<ruby>新大阪<rt>しんおおさか</rt></ruby>は あそこです。",
            translation: "Син-Осака вон там.",
          },
          {
            jp: "<ruby>新大阪<rt>しんおおさか</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>です。",
            translation: "Компания из Син-Осаки.",
          },
        ],
        uz: [
          {
            jp: "ここは <ruby>新大阪<rt>しんおおさか</rt></ruby>ですか。",
            translation: "Bu yer Shin-Osakami?",
          },
          {
            jp: "<ruby>新大阪<rt>しんおおさか</rt></ruby>は あそこです。",
            translation: "Shin-Osaka anavi yerda.",
          },
          {
            jp: "<ruby>新大阪<rt>しんおおさか</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>です。",
            translation: "Shin-Osakadagi kompaniya.",
          },
        ],
      },
    },
    {
      id: 145,
      lesson: 4,
      japanese: "<ruby>起<rt>お</rt></ruby>きます",
      cleanWord: "起きます",
      translations: { ru: "вставать, просыпаться", uz: "turmoq, uyg'onmoq" },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>毎朝<rt>まいあさ</rt></ruby> 4<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。<ruby>富士山<rt>ふじさん</rt></ruby>の <ruby>写真<rt>しゃしん</rt></ruby>を <ruby>撮<rt>と</rt></ruby>りますから。",
          translation:
            "Я встаю каждое утро в 4 часа. Потому что фотографирую Фудзи.",
          grammarInfo:
            "1. 私は — «я» + тематическая частица は\n\n2. 毎朝 (まいあさ) — «каждое утро», наречие времени\n\n3. 4時に — «в 4 часа», частица に указывает на точное время действия\n\n4. 起きます — глагол «вставать» в форме ます (настоящее/будущее)\n\n💡 Частица に обязательна с точным временем (4時に), но НЕ используется с 毎朝, 今日, 明日!",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>毎朝<rt>まいあさ</rt></ruby> 4<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。<ruby>富士山<rt>ふじさん</rt></ruby>の <ruby>写真<rt>しゃしん</rt></ruby>を <ruby>撮<rt>と</rt></ruby>りますから。",
          translation:
            "Men har kuni ertalab soat 4 da turaman. Fuji togʻini suratga olaman-da.",
          grammarInfo:
            "1. 私は — «men» + mavzu yuklamasi は\n\n2. 毎朝 (まいあさ) — «har kuni ertalab», vaqt ravishi\n\n3. 4時に — «soat 4 da», に yuklamasi aniq vaqtni bildiradi\n\n4. 起きます — «turmoq» fe'li ます shaklida (hozirgi/kelasi zamon)\n\n💡 に yuklamasi aniq vaqt bilan ishlatiladi (4時に), lekin 毎朝, 今日, 明日 bilan ISHLATILMAYDI!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>日本<rt>にほん</rt></ruby>の サラリーマンは 6<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。",
            translation: "Японские офисные работники встают в 6 часов.",
          },
          {
            jp: "<ruby>日曜日<rt>にちようび</rt></ruby>は 12<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。",
            translation: "В воскресенье я встаю в 12 часов.",
          },
          {
            jp: "<ruby>猫<rt>ねこ</rt></ruby>は 5<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。<ruby>私<rt>わたし</rt></ruby>も 5<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。",
            translation: "Кот встаёт в 5 часов. Я тоже встаю в 5 часов.",
          },
        ],
        uz: [
          {
            jp: "<ruby>日本<rt>にほん</rt></ruby>の サラリーマンは 6<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。",
            translation: "Yaponiyaning ofis xodimlari soat 6 da turadi.",
          },
          {
            jp: "<ruby>日曜日<rt>にちようび</rt></ruby>は 12<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。",
            translation: "Yakshanba kuni soat 12 da turaman.",
          },
          {
            jp: "<ruby>猫<rt>ねこ</rt></ruby>は 5<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。<ruby>私<rt>わたし</rt></ruby>も 5<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。",
            translation: "Mushuk soat 5 da turadi. Men ham soat 5 da turaman.",
          },
        ],
      },
    },
    {
      id: 146,
      lesson: 4,
      japanese: "<ruby>寝<rt>ね</rt></ruby>ます",
      cleanWord: "寝ます",
      translations: { ru: "спать, ложиться спать", uz: "uxlamoq, yotmoq" },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>毎晩<rt>まいばん</rt></ruby> 2<ruby>時<rt>じ</rt></ruby>に <ruby>寝<rt>ね</rt></ruby>ます。アニメを <ruby>見<rt>み</rt></ruby>ますから。",
          translation:
            "Я ложусь спать каждый вечер в 2 часа. Потому что смотрю аниме.",
          grammarInfo:
            "1. 毎晩 (まいばん) — «каждый вечер», наречие времени, БЕЗ частицы に\n\n2. 2時に — «в 2 часа», точное время + に\n\n3. 寝ます — глагол «ложиться спать» в форме ます\n\n4. ～から — «потому что», объясняет причину\n\n⚠️ Не путай 寝ます (ложиться спать) с 休みます (отдыхать). 寝ます = именно про сон!",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>毎晩<rt>まいばん</rt></ruby> 2<ruby>時<rt>じ</rt></ruby>に <ruby>寝<rt>ね</rt></ruby>ます。アニメを <ruby>見<rt>み</rt></ruby>ますから。",
          translation:
            "Men har kecha soat 2 da uxlayman. Chunki anime ko'raman.",
          grammarInfo:
            "1. 毎晩 (まいばん) — «har kecha», vaqt ravishi, に YUKLAMASIZ\n\n2. 2時に — «soat 2 da», aniq vaqt + に\n\n3. 寝ます — «uxlamoq» fe'li ます shaklida\n\n4. ～から — «chunki», sababni tushuntiradi\n\n⚠️ 寝ます (uxlamoq) bilan 休みます (dam olmoq) ni aralashtirmang. 寝ます = faqat uyqu haqida!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>学生<rt>がくせい</rt></ruby>は <ruby>毎晩<rt>まいばん</rt></ruby> 1<ruby>時<rt>じ</rt></ruby>に <ruby>寝<rt>ね</rt></ruby>ます。",
            translation:
              "Японские студенты ложатся спать в час ночи каждый день.",
          },
          {
            jp: "<ruby>今晩<rt>こんばん</rt></ruby>は 9<ruby>時<rt>じ</rt></ruby>に <ruby>寝<rt>ね</rt></ruby>ます。",
            translation: "Сегодня вечером лягу спать в 9.",
          },
          {
            jp: "<ruby>赤<rt>あか</rt></ruby>ちゃんは <ruby>午後<rt>ごご</rt></ruby> 8<ruby>時<rt>じ</rt></ruby>に <ruby>寝<rt>ね</rt></ruby>ます。",
            translation: "Малыш ложится спать в 8 часов вечера.",
          },
        ],
        uz: [
          {
            jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>学生<rt>がくせい</rt></ruby>は <ruby>毎晩<rt>まいばん</rt></ruby> 1<ruby>時<rt>じ</rt></ruby>に <ruby>寝<rt>ね</rt></ruby>ます。",
            translation: "Yaponiya talabalari har kecha soat 1 da yotishadi.",
          },
          {
            jp: "<ruby>今晩<rt>こんばん</rt></ruby>は 9<ruby>時<rt>じ</rt></ruby>に <ruby>寝<rt>ね</rt></ruby>ます。",
            translation: "Bugun kechqurun soat 9 da uxlayman.",
          },
          {
            jp: "<ruby>赤<rt>あか</rt></ruby>ちゃんは <ruby>午後<rt>ごご</rt></ruby> 8<ruby>時<rt>じ</rt></ruby>に <ruby>寝<rt>ね</rt></ruby>ます。",
            translation: "Chaqaloq kechqurun soat 8 da uxlaydi.",
          },
        ],
      },
    },
    {
      id: 147,
      lesson: 4,
      japanese: "<ruby>働<rt>はたら</rt></ruby>きます",
      cleanWord: "働きます",
      translations: { ru: "работать", uz: "ishlamoq" },
      exampleSentences: {
        ru: {
          jp: "<ruby>田中<rt>たなか</rt></ruby>さんは <ruby>朝<rt>あさ</rt></ruby> 7<ruby>時<rt>じ</rt></ruby>から <ruby>夜<rt>よる</rt></ruby> 11<ruby>時<rt>じ</rt></ruby>まで <ruby>働<rt>はたら</rt></ruby>きます。たいへんですね。",
          translation: "Танака-сан работает с 7 утра до 11 ночи. Нелегко, да?",
          grammarInfo:
            "1. 朝 7時から — «с 7 утра», から указывает начало\n\n2. 夜 11時まで — «до 11 ночи», まで указывает конец\n\n3. 働きます — глагол «работать» в форме ます\n\n4. たいへんですね — «нелегко, да?», выражение сочувствия\n\n💡 В Японии 16-часовой рабочий день — не редкость. Слово 過労死 (кароси) — «смерть от переработки» — есть только в японском!",
        },
        uz: {
          jp: "<ruby>田中<rt>たなか</rt></ruby>さんは <ruby>朝<rt>あさ</rt></ruby> 7<ruby>時<rt>じ</rt></ruby>から <ruby>夜<rt>よる</rt></ruby> 11<ruby>時<rt>じ</rt></ruby>まで <ruby>働<rt>はたら</rt></ruby>きます。たいへんですね。",
          translation:
            "Tanaka-san ertalab soat 7 dan kechasi 11 gacha ishlaydi. Qiyin-a?",
          grammarInfo:
            "1. 朝 7時から — «ertalab 7 dan», から boshlanishni bildiradi\n\n2. 夜 11時まで — «kechasi 11 gacha», まで tugashni bildiradi\n\n3. 働きます — «ishlamoq» fe'li ます shaklida\n\n4. たいへんですね — «qiyin-a?», hamdardlik ifodalaydi\n\n💡 Yaponiyada 16 soatlik ish kuni — odatiy hol. 過労死 (karoshi) — «ortiqcha ishlashdan oʻlim» soʻzi faqat yapon tilida bor!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>父<rt>ちち</rt></ruby>は <ruby>銀行<rt>ぎんこう</rt></ruby>で <ruby>働<rt>はたら</rt></ruby>きます。",
            translation: "Мой отец работает в банке.",
          },
          {
            jp: "<ruby>月曜日<rt>げつようび</rt></ruby>から <ruby>土曜日<rt>どようび</rt></ruby>まで <ruby>働<rt>はたら</rt></ruby>きます。",
            translation: "Работаю с понедельника по субботу.",
          },
          {
            jp: "ロボットは 24<ruby>時間<rt>じかん</rt></ruby> <ruby>働<rt>はたら</rt></ruby>きます。",
            translation: "Робот работает 24 часа.",
          },
        ],
        uz: [
          {
            jp: "<ruby>父<rt>ちち</rt></ruby>は <ruby>銀行<rt>ぎんこう</rt></ruby>で <ruby>働<rt>はたら</rt></ruby>きます。",
            translation: "Otam bankda ishlaydi.",
          },
          {
            jp: "<ruby>月曜日<rt>げつようび</rt></ruby>から <ruby>土曜日<rt>どようび</rt></ruby>まで <ruby>働<rt>はたら</rt></ruby>きます。",
            translation: "Dushanbadan shanbagacha ishlayman.",
          },
          {
            jp: "ロボットは 24<ruby>時間<rt>じかん</rt></ruby> <ruby>働<rt>はたら</rt></ruby>きます。",
            translation: "Robot 24 soat ishlaydi.",
          },
        ],
      },
    },
    {
      id: 148,
      lesson: 4,
      japanese: "<ruby>休<rt>やす</rt></ruby>みます",
      cleanWord: "休みます",
      translations: { ru: "отдыхать", uz: "dam olmoq" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本人<rt>にほんじん</rt></ruby>は あまり <ruby>休<rt>やす</rt></ruby>みません。<ruby>有給<rt>ゆうきゅう</rt></ruby>は 50% だけです。",
          translation:
            "Японцы почти не отдыхают. Используют только 50% отпуска.",
          grammarInfo:
            "1. 日本人は — «японцы» + は\n\n2. あまり〜ません — «почти не…», отрицание с наречием あまり\n\n3. 休みません — отрицательная форма глагола 休みます\n\n4. だけ — «только»\n\n💡 В Японии работники часто не берут весь отпуск — боятся подвести коллег. Это называется 空気を読む (читать атмосферу)!",
        },
        uz: {
          jp: "<ruby>日本人<rt>にほんじん</rt></ruby>は あまり <ruby>休<rt>やす</rt></ruby>みません。<ruby>有給<rt>ゆうきゅう</rt></ruby>は 50% だけです。",
          translation:
            "Yaponlar deyarli dam olmaydi. Ta'tilning faqat 50% ini ishlatadi.",
          grammarInfo:
            "1. 日本人は — «yaponlar» + は\n\n2. あまり〜ません — «deyarli…-maydi», inkor ravish bilan\n\n3. 休みません — 休みます fe'lining inkor shakli\n\n4. だけ — «faqat»\n\n💡 Yaponiyada xodimlar koʻpincha toʻliq ta'tilni olmaydi — hamkasblarini tashvishga solishdan qoʻrqadi. Buni 空気を読む (havoyi oʻqimoq) deyishadi!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>日曜日<rt>にちようび</rt></ruby>は <ruby>休<rt>やす</rt></ruby>みます。",
            translation: "В воскресенье отдыхаю.",
          },
          {
            jp: "<ruby>今日<rt>きょう</rt></ruby>は <ruby>休<rt>やす</rt></ruby>みません。<ruby>仕事<rt>しごと</rt></ruby>です。",
            translation: "Сегодня не отдыхаю. Работа.",
          },
          {
            jp: "<ruby>昼<rt>ひる</rt></ruby> 12<ruby>時<rt>じ</rt></ruby>から 1<ruby>時<rt>じ</rt></ruby>まで <ruby>休<rt>やす</rt></ruby>みます。",
            translation: "Отдыхаю с 12 до часу дня.",
          },
        ],
        uz: [
          {
            jp: "<ruby>日曜日<rt>にちようび</rt></ruby>は <ruby>休<rt>やす</rt></ruby>みます。",
            translation: "Yakshanba kuni dam olaman.",
          },
          {
            jp: "<ruby>今日<rt>きょう</rt></ruby>は <ruby>休<rt>やす</rt></ruby>みません。<ruby>仕事<rt>しごと</rt></ruby>です。",
            translation: "Bugun dam olmayman. Ish bor.",
          },
          {
            jp: "<ruby>昼<rt>ひる</rt></ruby> 12<ruby>時<rt>じ</rt></ruby>から 1<ruby>時<rt>じ</rt></ruby>まで <ruby>休<rt>やす</rt></ruby>みます。",
            translation: "Kunduz soat 12 dan 1 gacha dam olaman.",
          },
        ],
      },
    },
    {
      id: 149,
      lesson: 4,
      japanese: "<ruby>勉強<rt>べんきょう</rt></ruby>します",
      cleanWord: "勉強します",
      translations: { ru: "учиться, заниматься", uz: "o'qimoq, dars qilmoq" },
      exampleSentences: {
        ru: {
          jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>毎晩<rt>まいばん</rt></ruby> <ruby>日本語<rt>にほんご</rt></ruby>を <ruby>勉強<rt>べんきょう</rt></ruby>します。<ruby>夢<rt>ゆめ</rt></ruby>は <ruby>日本<rt>にほん</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>です。",
          translation:
            "Я каждый вечер учу японский. Моя мечта — японская компания.",
          grammarInfo:
            "1. 毎晩 — «каждый вечер», без に\n\n2. 日本語を — «японский язык» + を (объект действия)\n\n3. 勉強します — глагол-する «учиться», форма ます\n\n4. 夢は〜です — «мечта — это…», конструкция AはBです\n\n💡 勉強 — это «します-глагол»: существительное + します. Другие примеры: 仕事します, 電話します.",
        },
        uz: {
          jp: "<ruby>私<rt>わたし</rt></ruby>は <ruby>毎晩<rt>まいばん</rt></ruby> <ruby>日本語<rt>にほんご</rt></ruby>を <ruby>勉強<rt>べんきょう</rt></ruby>します。<ruby>夢<rt>ゆめ</rt></ruby>は <ruby>日本<rt>にほん</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>です。",
          translation:
            "Men har kecha yapon tilini oʻrganyapman. Orzuim — Yaponiya kompaniyasi.",
          grammarInfo:
            "1. 毎晩 — «har kecha», に siz\n\n2. 日本語を — «yapon tili» + を (harakat obyekti)\n\n3. 勉強します — «oʻqimoq» する-fe'l, ます shakli\n\n4. 夢は〜です — «orzuim — bu…», AはBです konstruksiyasi\n\n💡 勉強 — bu «します-fe'l»: ot + します. Boshqa misollar: 仕事します, 電話します.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>図書館<rt>としょかん</rt></ruby>で <ruby>勉強<rt>べんきょう</rt></ruby>します。",
            translation: "Занимаюсь в библиотеке.",
          },
          {
            jp: "<ruby>朝<rt>あさ</rt></ruby> 6<ruby>時<rt>じ</rt></ruby>から 8<ruby>時<rt>じ</rt></ruby>まで <ruby>勉強<rt>べんきょう</rt></ruby>します。",
            translation: "Учусь с 6 до 8 утра.",
          },
          {
            jp: "<ruby>土曜日<rt>どようび</rt></ruby>と <ruby>日曜日<rt>にちようび</rt></ruby>は <ruby>勉強<rt>べんきょう</rt></ruby>しません。",
            translation: "В субботу и воскресенье не занимаюсь.",
          },
        ],
        uz: [
          {
            jp: "<ruby>図書館<rt>としょかん</rt></ruby>で <ruby>勉強<rt>べんきょう</rt></ruby>します。",
            translation: "Kutubxonada dars qilaman.",
          },
          {
            jp: "<ruby>朝<rt>あさ</rt></ruby> 6<ruby>時<rt>じ</rt></ruby>から 8<ruby>時<rt>じ</rt></ruby>まで <ruby>勉強<rt>べんきょう</rt></ruby>します。",
            translation: "Ertalab soat 6 dan 8 gacha oʻqiyman.",
          },
          {
            jp: "<ruby>土曜日<rt>どようび</rt></ruby>と <ruby>日曜日<rt>にちようび</rt></ruby>は <ruby>勉強<rt>べんきょう</rt></ruby>しません。",
            translation: "Shanba va yakshanba kuni dars qilmayman.",
          },
        ],
      },
    },
    {
      id: 150,
      lesson: 4,
      japanese: "<ruby>終<rt>お</rt></ruby>わります",
      cleanWord: "終わります",
      translations: { ru: "заканчиваться", uz: "tugamoq" },
      exampleSentences: {
        ru: {
          jp: "<ruby>仕事<rt>しごと</rt></ruby>は <ruby>夜<rt>よる</rt></ruby> 10<ruby>時<rt>じ</rt></ruby>に <ruby>終<rt>お</rt></ruby>わります。<ruby>電車<rt>でんしゃ</rt></ruby>は もう ありません。",
          translation: "Работа заканчивается в 10 ночи. Поездов уже нет.",
          grammarInfo:
            "1. 仕事は — «работа» + は (тема предложения)\n\n2. 夜 10時に — «в 10 вечера», точное время + に\n\n3. 終わります — «заканчивается», глагол в форме ます\n\n4. もう ありません — «уже нет»\n\n⚠️ 終わります — непереходный (заканчивается само). «Я заканчиваю» = другая конструкция. На этом уровне используйте 終わります как «(что-то) заканчивается».",
        },
        uz: {
          jp: "<ruby>仕事<rt>しごと</rt></ruby>は <ruby>夜<rt>よる</rt></ruby> 10<ruby>時<rt>じ</rt></ruby>に <ruby>終<rt>お</rt></ruby>わります。<ruby>電車<rt>でんしゃ</rt></ruby>は もう ありません。",
          translation: "Ish kechasi soat 10 da tugaydi. Poyezdlar endi yoʻq.",
          grammarInfo:
            "1. 仕事は — «ish» + は (gap mavzusi)\n\n2. 夜 10時に — «kechasi 10 da», aniq vaqt + に\n\n3. 終わります — «tugaydi», fe'l ます shaklida\n\n4. もう ありません — «endi yoʻq»\n\n⚠️ 終わります — oʻzi tugaydigan fe'l (oʻtimsiz). «Men tugataman» = boshqa konstruksiya. Bu darajada 終わります ni «(nimadir) tugaydi» deb ishlating.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>授業<rt>じゅぎょう</rt></ruby>は 3<ruby>時<rt>じ</rt></ruby>に <ruby>終<rt>お</rt></ruby>わります。",
            translation: "Занятия заканчиваются в 3 часа.",
          },
          {
            jp: "<ruby>昼休<rt>ひるやす</rt></ruby>みは 1<ruby>時<rt>じ</rt></ruby>に <ruby>終<rt>お</rt></ruby>わります。",
            translation: "Обеденный перерыв заканчивается в час.",
          },
          {
            jp: "<ruby>日本<rt>にほん</rt></ruby>の テレビは <ruby>朝<rt>あさ</rt></ruby> 1<ruby>時<rt>じ</rt></ruby>に <ruby>終<rt>お</rt></ruby>わります。",
            translation: "Японское ТВ заканчивает вещание в час ночи.",
          },
        ],
        uz: [
          {
            jp: "<ruby>授業<rt>じゅぎょう</rt></ruby>は 3<ruby>時<rt>じ</rt></ruby>に <ruby>終<rt>お</rt></ruby>わります。",
            translation: "Darslar soat 3 da tugaydi.",
          },
          {
            jp: "<ruby>昼休<rt>ひるやす</rt></ruby>みは 1<ruby>時<rt>じ</rt></ruby>に <ruby>終<rt>お</rt></ruby>わります。",
            translation: "Tushlik tanaffusi soat 1 da tugaydi.",
          },
          {
            jp: "<ruby>日本<rt>にほん</rt></ruby>の テレビは <ruby>朝<rt>あさ</rt></ruby> 1<ruby>時<rt>じ</rt></ruby>に <ruby>終<rt>お</rt></ruby>わります。",
            translation: "Yaponiya televideniyesi kechasi soat 1 da tugaydi.",
          },
        ],
      },
    },
    {
      id: 151,
      lesson: 4,
      japanese: "デパート",
      cleanWord: "デパート",
      translations: { ru: "универмаг", uz: "univermag" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の デパートの <ruby>地下<rt>ちか</rt></ruby>は <ruby>食<rt>た</rt></ruby>べ<ruby>物<rt>もの</rt></ruby>の <ruby>天国<rt>てんごく</rt></ruby>です。",
          translation: "Подвал японского универмага — это рай еды.",
          grammarInfo:
            "1. 日本の — «японский», の связывает существительные\n\n2. デパートの地下 — «подвал универмага», の показывает принадлежность\n\n3. 食べ物の天国です — «рай еды», AはBです\n\n💡 «Дэпатика» (デパ地下) — подвальный этаж японских универмагов. Там сотни видов еды, бесплатные пробники — это целая культура!",
        },
        uz: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の デパートの <ruby>地下<rt>ちか</rt></ruby>は <ruby>食<rt>た</rt></ruby>べ<ruby>物<rt>もの</rt></ruby>の <ruby>天国<rt>てんごく</rt></ruby>です。",
          translation:
            "Yaponiya univermagining yerto'lasi — oziq-ovqat jannati.",
          grammarInfo:
            "1. 日本の — «yaponiyaning», の otlarni bogʻlaydi\n\n2. デパートの地下 — «univermag yerto'lasi», の tegishlilikni bildiradi\n\n3. 食べ物の天国です — «ovqat jannati», AはBです\n\n💡 «Depatika» (デパ地下) — yapon univermaglarining yerto'la qavati. U yerda yuzlab ovqat turlari, bepul tatib koʻrish — bu butun bir madaniyat!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "デパートは 10<ruby>時<rt>じ</rt></ruby>から 8<ruby>時<rt>じ</rt></ruby>まで です。",
            translation: "Универмаг работает с 10 до 8.",
          },
          {
            jp: "<ruby>あの<rt></rt></ruby> デパートは <ruby>有名<rt>ゆうめい</rt></ruby>です。",
            translation: "Тот универмаг знаменит.",
          },
          {
            jp: "<ruby>日曜日<rt>にちようび</rt></ruby>は デパートで <ruby>買<rt>か</rt></ruby>い<ruby>物<rt>もの</rt></ruby>します。",
            translation: "В воскресенье хожу за покупками в универмаг.",
          },
        ],
        uz: [
          {
            jp: "デパートは 10<ruby>時<rt>じ</rt></ruby>から 8<ruby>時<rt>じ</rt></ruby>まで です。",
            translation: "Univermag soat 10 dan 8 gacha ishlaydi.",
          },
          {
            jp: "あの デパートは <ruby>有名<rt>ゆうめい</rt></ruby>です。",
            translation: "Anavi univermag mashhur.",
          },
          {
            jp: "<ruby>日曜日<rt>にちようび</rt></ruby>は デパートで <ruby>買<rt>か</rt></ruby>い<ruby>物<rt>もの</rt></ruby>します。",
            translation: "Yakshanba kuni univermagda xarid qilaman.",
          },
        ],
      },
    },
    {
      id: 152,
      lesson: 4,
      japanese: "<ruby>銀行<rt>ぎんこう</rt></ruby>",
      cleanWord: "銀行",
      translations: { ru: "банк", uz: "bank" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>銀行<rt>ぎんこう</rt></ruby>は 3<ruby>時<rt>じ</rt></ruby>に <ruby>終<rt>お</rt></ruby>わります。3<ruby>時<rt>じ</rt></ruby>です！",
          translation: "Японские банки закрываются в 3 часа. В три часа!",
          grammarInfo:
            "1. 日本の銀行は — «японские банки» + は\n\n2. 3時に — «в 3 часа», время + に\n\n3. 終わります — «заканчивают работу»\n\n💡 Да, японские банки реально закрываются в 15:00. Банкоматы иногда тоже «спят» ночью. Культурный шок для иностранцев!",
        },
        uz: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>銀行<rt>ぎんこう</rt></ruby>は 3<ruby>時<rt>じ</rt></ruby>に <ruby>終<rt>お</rt></ruby>わります。3<ruby>時<rt>じ</rt></ruby>です！",
          translation: "Yaponiya banklari soat 3 da yopiladi. Soat 3 da!",
          grammarInfo:
            "1. 日本の銀行は — «yaponiya banklari» + は\n\n2. 3時に — «soat 3 da», vaqt + に\n\n3. 終わります — «ishini tugatadi»\n\n💡 Ha, yapon banklari haqiqatan soat 15:00 da yopiladi. Bankomatlar ham baʼzan kechasi «uxlaydi». Chet elliklar uchun madaniy shok!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>銀行<rt>ぎんこう</rt></ruby>は <ruby>午前<rt>ごぜん</rt></ruby> 9<ruby>時<rt>じ</rt></ruby>から です。",
            translation: "Банк работает с 9 утра.",
          },
          {
            jp: "<ruby>銀行<rt>ぎんこう</rt></ruby>は <ruby>土曜日<rt>どようび</rt></ruby>と <ruby>日曜日<rt>にちようび</rt></ruby>は <ruby>休<rt>やす</rt></ruby>みです。",
            translation: "Банк не работает в субботу и воскресенье.",
          },
          {
            jp: "<ruby>駅<rt>えき</rt></ruby>の <ruby>前<rt>まえ</rt></ruby>に <ruby>銀行<rt>ぎんこう</rt></ruby>が あります。",
            translation: "Перед станцией есть банк.",
          },
        ],
        uz: [
          {
            jp: "<ruby>銀行<rt>ぎんこう</rt></ruby>は <ruby>午前<rt>ごぜん</rt></ruby> 9<ruby>時<rt>じ</rt></ruby>から です。",
            translation: "Bank ertalab soat 9 dan ishlaydi.",
          },
          {
            jp: "<ruby>銀行<rt>ぎんこう</rt></ruby>は <ruby>土曜日<rt>どようび</rt></ruby>と <ruby>日曜日<rt>にちようび</rt></ruby>は <ruby>休<rt>やす</rt></ruby>みです。",
            translation: "Bank shanba va yakshanba dam oladi.",
          },
          {
            jp: "<ruby>駅<rt>えき</rt></ruby>の <ruby>前<rt>まえ</rt></ruby>に <ruby>銀行<rt>ぎんこう</rt></ruby>が あります。",
            translation: "Stansiya oldida bank bor.",
          },
        ],
      },
    },
    {
      id: 153,
      lesson: 4,
      japanese: "<ruby>郵便局<rt>ゆうびんきょく</rt></ruby>",
      cleanWord: "郵便局",
      translations: { ru: "почта", uz: "pochta" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>郵便局<rt>ゆうびんきょく</rt></ruby>は <ruby>銀行<rt>ぎんこう</rt></ruby>です。お<ruby>金<rt>かね</rt></ruby>も ゆうびんきょく です。",
          translation: "Японская почта — это ещё и банк. Деньги тоже на почте.",
          grammarInfo:
            "1. 日本の郵便局は — «японская почта» + は\n\n2. 銀行です — «это банк», AはBです\n\n3. も — «тоже», частица\n\n💡 Япония — единственная страна, где на почте можно не только отправить посылку, но и открыть счёт, застраховаться и даже взять кредит!",
        },
        uz: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>郵便局<rt>ゆうびんきょく</rt></ruby>は <ruby>銀行<rt>ぎんこう</rt></ruby>です。お<ruby>金<rt>かね</rt></ruby>も ゆうびんきょく です。",
          translation: "Yaponiya pochtasi — bu bank ham. Pul ham pochtada.",
          grammarInfo:
            "1. 日本の郵便局は — «yaponiya pochtasi» + は\n\n2. 銀行です — «bu bank», AはBです\n\n3. も — «ham», yuklama\n\n💡 Yaponiya — dunyoda yagona mamlakat, u yerda pochtada jo'natma yuborishdan tashqari, hisob ochish, sug'urta qilish va hatto kredit olish mumkin!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>郵便局<rt>ゆうびんきょく</rt></ruby>は <ruby>何時<rt>なんじ</rt></ruby>から <ruby>何時<rt>なんじ</rt></ruby>までですか。",
            translation: "Почта работает с какого до какого часа?",
          },
          {
            jp: "<ruby>郵便局<rt>ゆうびんきょく</rt></ruby>は 5<ruby>時<rt>じ</rt></ruby>に <ruby>終<rt>お</rt></ruby>わります。",
            translation: "Почта закрывается в 5.",
          },
          {
            jp: "この <ruby>郵便局<rt>ゆうびんきょく</rt></ruby>は <ruby>土曜日<rt>どようび</rt></ruby>も <ruby>働<rt>はたら</rt></ruby>きます。",
            translation: "Эта почта работает и в субботу.",
          },
        ],
        uz: [
          {
            jp: "<ruby>郵便局<rt>ゆうびんきょく</rt></ruby>は <ruby>何時<rt>なんじ</rt></ruby>から <ruby>何時<rt>なんじ</rt></ruby>までですか。",
            translation: "Pochta soat nechadan nechagacha ishlaydi?",
          },
          {
            jp: "<ruby>郵便局<rt>ゆうびんきょく</rt></ruby>は 5<ruby>時<rt>じ</rt></ruby>に <ruby>終<rt>お</rt></ruby>わります。",
            translation: "Pochta soat 5 da yopiladi.",
          },
          {
            jp: "この <ruby>郵便局<rt>ゆうびんきょく</rt></ruby>は <ruby>土曜日<rt>どようび</rt></ruby>も <ruby>働<rt>はたら</rt></ruby>きます。",
            translation: "Bu pochta shanba kuni ham ishlaydi.",
          },
        ],
      },
    },
    {
      id: 154,
      lesson: 4,
      japanese: "<ruby>図書館<rt>としょかん</rt></ruby>",
      cleanWord: "図書館",
      translations: { ru: "библиотека", uz: "kutubxona" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>図書館<rt>としょかん</rt></ruby>は しずかです。<ruby>本当<rt>ほんとう</rt></ruby>に しずかです。ゼロ dB です。",
          translation:
            "Японские библиотеки тихие. По-настоящему тихие. Ноль децибел.",
          grammarInfo:
            "1. 日本の図書館は — «японские библиотеки» + は\n\n2. しずかです — «тихо/тихие», な-прилагательное + です\n\n3. 本当に — «действительно, по-настоящему», наречие\n\n💡 В японских библиотеках настолько тихо, что слышно, как люди моргают. Телефоны запрещены. Кашлять — почти преступление!",
        },
        uz: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>図書館<rt>としょかん</rt></ruby>は しずかです。<ruby>本当<rt>ほんとう</rt></ruby>に しずかです。ゼロ dB です。",
          translation:
            "Yaponiya kutubxonalari jim. Haqiqatan jim. Nol detsibel.",
          grammarInfo:
            "1. 日本の図書館は — «yaponiya kutubxonalari» + は\n\n2. しずかです — «jim», な-sifat + です\n\n3. 本当に — «haqiqatan», ravish\n\n💡 Yapon kutubxonalarida shunday jimlikki, odamlarning koʻz yumib ochishi eshitiladi. Telefonlar taqiqlangan. Yoʻtalish — deyarli jinoyat!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>図書館<rt>としょかん</rt></ruby>で <ruby>勉強<rt>べんきょう</rt></ruby>します。",
            translation: "Занимаюсь в библиотеке.",
          },
          {
            jp: "<ruby>図書館<rt>としょかん</rt></ruby>は 9<ruby>時<rt>じ</rt></ruby>から 5<ruby>時<rt>じ</rt></ruby>までです。",
            translation: "Библиотека работает с 9 до 5.",
          },
          {
            jp: "<ruby>大学<rt>だいがく</rt></ruby>の <ruby>図書館<rt>としょかん</rt></ruby>は <ruby>大<rt>おお</rt></ruby>きいです。",
            translation: "Университетская библиотека большая.",
          },
        ],
        uz: [
          {
            jp: "<ruby>図書館<rt>としょかん</rt></ruby>で <ruby>勉強<rt>べんきょう</rt></ruby>します。",
            translation: "Kutubxonada dars qilaman.",
          },
          {
            jp: "<ruby>図書館<rt>としょかん</rt></ruby>は 9<ruby>時<rt>じ</rt></ruby>から 5<ruby>時<rt>じ</rt></ruby>までです。",
            translation: "Kutubxona soat 9 dan 5 gacha ishlaydi.",
          },
          {
            jp: "<ruby>大学<rt>だいがく</rt></ruby>の <ruby>図書館<rt>としょかん</rt></ruby>は <ruby>大<rt>おお</rt></ruby>きいです。",
            translation: "Universitet kutubxonasi katta.",
          },
        ],
      },
    },
    {
      id: 155,
      lesson: 4,
      japanese: "<ruby>美術館<rt>びじゅつかん</rt></ruby>",
      cleanWord: "美術館",
      translations: { ru: "музей искусств", uz: "san'at muzeyi" },
      exampleSentences: {
        ru: {
          jp: "<ruby>東京<rt>とうきょう</rt></ruby>の <ruby>美術館<rt>びじゅつかん</rt></ruby>は <ruby>月曜日<rt>げつようび</rt></ruby> <ruby>休<rt>やす</rt></ruby>みです。<ruby>月曜日<rt>げつようび</rt></ruby>に <ruby>行<rt>い</rt></ruby>きません！",
          translation:
            "Музеи Токио закрыты в понедельник. Не ходите в понедельник!",
          grammarInfo:
            "1. 東京の美術館は — «музеи Токио» + は\n\n2. 月曜日 — «понедельник», день недели\n\n3. 休みです — «выходной/закрыт», существительное + です\n\n4. 行きません — «не хожу/не ходите», отрицание глагола\n\n💡 Почти все музеи Японии закрыты в понедельник. Запомните это, если поедете в Японию — иначе потеряете целый день!",
        },
        uz: {
          jp: "<ruby>東京<rt>とうきょう</rt></ruby>の <ruby>美術館<rt>びじゅつかん</rt></ruby>は <ruby>月曜日<rt>げつようび</rt></ruby> <ruby>休<rt>やす</rt></ruby>みです。<ruby>月曜日<rt>げつようび</rt></ruby>に <ruby>行<rt>い</rt></ruby>きません！",
          translation:
            "Tokio muzeylari dushanba kuni yopiq. Dushanba kuni bormang!",
          grammarInfo:
            "1. 東京の美術館は — «Tokio muzeylari» + は\n\n2. 月曜日 — «dushanba», hafta kuni\n\n3. 休みです — «dam olish kuni/yopiq», ot + です\n\n4. 行きません — «bormayman/bormang», fe'l inkori\n\n💡 Yaponiyaning deyarli barcha muzeylari dushanbada yopiq. Yaponiyaga borsangiz, buni esda tuting — aks holda butun kuningizni yoʻqotasiz!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "この <ruby>美術館<rt>びじゅつかん</rt></ruby>は <ruby>有名<rt>ゆうめい</rt></ruby>です。",
            translation: "Этот музей искусств знаменит.",
          },
          {
            jp: "<ruby>美術館<rt>びじゅつかん</rt></ruby>は 10<ruby>時<rt>じ</rt></ruby>から 6<ruby>時<rt>じ</rt></ruby>までです。",
            translation: "Музей работает с 10 до 6.",
          },
          {
            jp: "<ruby>日曜日<rt>にちようび</rt></ruby>に <ruby>美術館<rt>びじゅつかん</rt></ruby>に <ruby>行<rt>い</rt></ruby>きます。",
            translation: "В воскресенье иду в музей.",
          },
        ],
        uz: [
          {
            jp: "この <ruby>美術館<rt>びじゅつかん</rt></ruby>は <ruby>有名<rt>ゆうめい</rt></ruby>です。",
            translation: "Bu san'at muzeyi mashhur.",
          },
          {
            jp: "<ruby>美術館<rt>びじゅつかん</rt></ruby>は 10<ruby>時<rt>じ</rt></ruby>から 6<ruby>時<rt>じ</rt></ruby>までです。",
            translation: "Muzey soat 10 dan 6 gacha ishlaydi.",
          },
          {
            jp: "<ruby>日曜日<rt>にちようび</rt></ruby>に <ruby>美術館<rt>びじゅつかん</rt></ruby>に <ruby>行<rt>い</rt></ruby>きます。",
            translation: "Yakshanba kuni muzeyga boraman.",
          },
        ],
      },
    },
    {
      id: 156,
      lesson: 4,
      japanese: "<ruby>今<rt>いま</rt></ruby>",
      cleanWord: "今",
      translations: { ru: "сейчас", uz: "hozir" },
      exampleSentences: {
        ru: {
          jp: "<ruby>今<rt>いま</rt></ruby> <ruby>東京<rt>とうきょう</rt></ruby>は <ruby>午前<rt>ごぜん</rt></ruby> 3<ruby>時<rt>じ</rt></ruby>です。でも <ruby>電車<rt>でんしゃ</rt></ruby>に <ruby>人<rt>ひと</rt></ruby>が います。",
          translation: "Сейчас в Токио 3 часа ночи. Но в поездах есть люди.",
          grammarInfo:
            "1. 今 — «сейчас», наречие времени, без частицы に\n\n2. 東京は — «в Токио» + は\n\n3. 午前 3時です — «3 часа утра», 午前 = до полудня\n\n4. でも — «но», союз\n\n💡 今 никогда не требует частицу に! Просто 今 + предложение.",
        },
        uz: {
          jp: "<ruby>今<rt>いま</rt></ruby> <ruby>東京<rt>とうきょう</rt></ruby>は <ruby>午前<rt>ごぜん</rt></ruby> 3<ruby>時<rt>じ</rt></ruby>です。でも <ruby>電車<rt>でんしゃ</rt></ruby>に <ruby>人<rt>ひと</rt></ruby>が います。",
          translation:
            "Hozir Tokioda tunda soat 3. Lekin poyezdlarda odamlar bor.",
          grammarInfo:
            "1. 今 — «hozir», vaqt ravishi, に yuklamasiz\n\n2. 東京は — «Tokioda» + は\n\n3. 午前 3時です — «tunda soat 3», 午前 = tushlikkacha\n\n4. でも — «lekin», bogʻlovchi\n\n💡 今 hech qachon に yuklamasini talab qilmaydi! Shunchaki 今 + gap.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>今<rt>いま</rt></ruby> <ruby>何時<rt>なんじ</rt></ruby>ですか。",
            translation: "Сколько сейчас времени?",
          },
          {
            jp: "<ruby>今<rt>いま</rt></ruby> <ruby>勉強<rt>べんきょう</rt></ruby>しています。",
            translation: "Сейчас занимаюсь.",
          },
          {
            jp: "<ruby>今<rt>いま</rt></ruby> <ruby>日本<rt>にほん</rt></ruby>は <ruby>冬<rt>ふゆ</rt></ruby>です。",
            translation: "Сейчас в Японии зима.",
          },
        ],
        uz: [
          {
            jp: "<ruby>今<rt>いま</rt></ruby> <ruby>何時<rt>なんじ</rt></ruby>ですか。",
            translation: "Hozir soat necha?",
          },
          {
            jp: "<ruby>今<rt>いま</rt></ruby> <ruby>勉強<rt>べんきょう</rt></ruby>しています。",
            translation: "Hozir dars qilyapman.",
          },
          {
            jp: "<ruby>今<rt>いま</rt></ruby> <ruby>日本<rt>にほん</rt></ruby>は <ruby>冬<rt>ふゆ</rt></ruby>です。",
            translation: "Hozir Yaponiyada qish.",
          },
        ],
      },
    },
    {
      id: 157,
      lesson: 4,
      japanese: "〜<ruby>時<rt>じ</rt></ruby>",
      cleanWord: "〜時",
      translations: { ru: "~ час(ов)", uz: "soat ~" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>学校<rt>がっこう</rt></ruby>は 8<ruby>時<rt>じ</rt></ruby> 30<ruby>分<rt>ぷん</rt></ruby>からです。アメリカは 7<ruby>時<rt>じ</rt></ruby>からです。",
          translation: "Японская школа — с 8:30. Американская — с 7.",
          grammarInfo:
            "1. 〜時 — счётный суффикс для часов: 1時, 2時, 3時...\n\n2. 8時30分から — «с 8:30», から = начало\n\n3. ～からです — «начинается с…»\n\n⚠️ Особые чтения: 4時 = よじ (не «ёнじи»!), 7時 = しちじ, 9時 = くじ. Запомните эти исключения!",
        },
        uz: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>学校<rt>がっこう</rt></ruby>は 8<ruby>時<rt>じ</rt></ruby> 30<ruby>分<rt>ぷん</rt></ruby>からです。アメリカは 7<ruby>時<rt>じ</rt></ruby>からです。",
          translation: "Yaponiya maktabi soat 8:30 dan. Amerikada soat 7 dan.",
          grammarInfo:
            "1. 〜時 — soatlar uchun qoʻshimcha: 1時, 2時, 3時...\n\n2. 8時30分から — «8:30 dan», から = boshlanish\n\n3. ～からです — «…dan boshlanadi»\n\n⚠️ Maxsus oʻqilishlar: 4時 = よじ (「よんじ」 emas!), 7時 = しちじ, 9時 = くじ. Bu istisnolarni yodlang!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>今<rt>いま</rt></ruby> 3<ruby>時<rt>じ</rt></ruby>です。",
            translation: "Сейчас 3 часа.",
          },
          {
            jp: "7<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。",
            translation: "Встаю в 7 часов.",
          },
          {
            jp: "<ruby>会議<rt>かいぎ</rt></ruby>は 10<ruby>時<rt>じ</rt></ruby>からです。",
            translation: "Собрание с 10 часов.",
          },
        ],
        uz: [
          {
            jp: "<ruby>今<rt>いま</rt></ruby> 3<ruby>時<rt>じ</rt></ruby>です。",
            translation: "Hozir soat 3.",
          },
          {
            jp: "7<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。",
            translation: "Soat 7 da turaman.",
          },
          {
            jp: "<ruby>会議<rt>かいぎ</rt></ruby>は 10<ruby>時<rt>じ</rt></ruby>からです。",
            translation: "Yigʻilish soat 10 dan.",
          },
        ],
      },
    },
    {
      id: 158,
      lesson: 4,
      japanese: "〜<ruby>分<rt>ふん</rt></ruby>",
      cleanWord: "〜分",
      translations: { ru: "~ минут(а)", uz: "~ daqiqa" },
      exampleSentences: {
        ru: {
          jp: "<ruby>新幹線<rt>しんかんせん</rt></ruby>は <ruby>東京<rt>とうきょう</rt></ruby>から <ruby>大阪<rt>おおさか</rt></ruby>まで 2<ruby>時間<rt>じかん</rt></ruby> 30<ruby>分<rt>ぷん</rt></ruby>です。<ruby>飛行機<rt>ひこうき</rt></ruby>は 1<ruby>時間<rt>じかん</rt></ruby> 15<ruby>分<rt>ふん</rt></ruby>です。",
          translation:
            "Синкансэн от Токио до Осаки — 2 часа 30 минут. Самолёт — 1 час 15 минут.",
          grammarInfo:
            "1. ～分 — счётный суффикс для минут\n\n2. ～から～まで — «от…до…»\n\n3. 2時間30分 — «2 часа 30 минут», 時間 = часы (длительность)\n\n💡 Чтение ～分: 2分 = にふん, 5分 = ごふん. НО: 1分 = いっぷん, 3分 = さんぷん, 6分 = ろっぷん, 8分 = はっぷん, 10分 = じゅっぷん.",
        },
        uz: {
          jp: "<ruby>新幹線<rt>しんかんせん</rt></ruby>は <ruby>東京<rt>とうきょう</rt></ruby>から <ruby>大阪<rt>おおさか</rt></ruby>まで 2<ruby>時間<rt>じかん</rt></ruby> 30<ruby>分<rt>ぷん</rt></ruby>です。<ruby>飛行機<rt>ひこうき</rt></ruby>は 1<ruby>時間<rt>じかん</rt></ruby> 15<ruby>分<rt>ふん</rt></ruby>です。",
          translation:
            "Shinkansen Tokiodan Osakagacha 2 soat 30 daqiqa. Samolyot — 1 soat 15 daqiqa.",
          grammarInfo:
            "1. ～分 — daqiqalar uchun qoʻshimcha\n\n2. ～から～まで — «…dan…gacha»\n\n3. 2時間30分 — «2 soat 30 daqiqa», 時間 = soat (davomiylik)\n\n💡 ～分 oʻqilishi: 2分 = にふん, 5分 = ごふん. LEKIN: 1分 = いっぷん, 3分 = さんぷん, 6分 = ろっぷん, 8分 = はっぷん, 10分 = じゅっぷん.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>今<rt>いま</rt></ruby> 3<ruby>時<rt>じ</rt></ruby> 15<ruby>分<rt>ふん</rt></ruby>です。",
            translation: "Сейчас 3 часа 15 минут.",
          },
          {
            jp: "5<ruby>分<rt>ふん</rt></ruby> <ruby>休<rt>やす</rt></ruby>みます。",
            translation: "Отдыхаю 5 минут.",
          },
          {
            jp: "<ruby>駅<rt>えき</rt></ruby>まで 20<ruby>分<rt>ぷん</rt></ruby>です。",
            translation: "До станции 20 минут.",
          },
        ],
        uz: [
          {
            jp: "<ruby>今<rt>いま</rt></ruby> 3<ruby>時<rt>じ</rt></ruby> 15<ruby>分<rt>ふん</rt></ruby>です。",
            translation: "Hozir soat 3 dan 15 daqiqa oʻtdi.",
          },
          {
            jp: "5<ruby>分<rt>ふん</rt></ruby> <ruby>休<rt>やす</rt></ruby>みます。",
            translation: "5 daqiqa dam olaman.",
          },
          {
            jp: "<ruby>駅<rt>えき</rt></ruby>まで 20<ruby>分<rt>ぷん</rt></ruby>です。",
            translation: "Stansiyagacha 20 daqiqa.",
          },
        ],
      },
    },
    {
      id: 159,
      lesson: 4,
      japanese: "〜<ruby>分<rt>ぷん</rt></ruby>",
      cleanWord: "〜分",
      translations: {
        ru: "~ минут(а) (после 1,3,4,6,8,10)",
        uz: "~ daqiqa (1,3,4,6,8,10 dan keyin)",
      },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>電車<rt>でんしゃ</rt></ruby>は 1<ruby>分<rt>ぷん</rt></ruby>も おくれません。1<ruby>分<rt>ぷん</rt></ruby>も！",
          translation:
            "Японские поезда не опаздывают ни на 1 минуту. Ни на одну!",
          grammarInfo:
            "1. ～分 (ぷん) — после 1, 3, 4, 6, 8, 10 читается «пун»: いっぷん, さんぷん, よんぷん...\n\n2. 1分も — «даже на 1 минуту», も усиливает отрицание\n\n3. おくれません — «не опаздывает»\n\n💡 Среднее опоздание японских поездов — 18 секунд в ГОД. Если поезд опаздывает на 1 минуту, компания выдаёт справку для работодателя!",
        },
        uz: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>電車<rt>でんしゃ</rt></ruby>は 1<ruby>分<rt>ぷん</rt></ruby>も おくれません。1<ruby>分<rt>ぷん</rt></ruby>も！",
          translation:
            "Yaponiya poyezdlari 1 daqiqa ham kechmaydi. 1 daqiqa ham!",
          grammarInfo:
            "1. ～分 (ぷん) — 1, 3, 4, 6, 8, 10 dan keyin «pun» oʻqiladi: いっぷん, さんぷん, よんぷん...\n\n2. 1分も — «1 daqiqa ham», も inkorni kuchaytiradi\n\n3. おくれません — «kechmaydi»\n\n💡 Yapon poyezdlarining oʻrtacha kechikishi — YILIGA 18 soniya. Agar poyezd 1 daqiqa kechsa, kompaniya ish beruvchi uchun maʼlumotnoma beradi!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "いっ<ruby>分<rt>ぷん</rt></ruby> <ruby>待<rt>ま</rt></ruby>ってください。",
            translation: "Подождите одну минуту, пожалуйста.",
          },
          {
            jp: "3<ruby>分<rt>ぷん</rt></ruby>で <ruby>終<rt>お</rt></ruby>わります。",
            translation: "Закончу за 3 минуты.",
          },
          {
            jp: "10<ruby>分<rt>ぷん</rt></ruby> おくれます。すみません。",
            translation: "Опоздаю на 10 минут. Простите.",
          },
        ],
        uz: [
          {
            jp: "いっ<ruby>分<rt>ぷん</rt></ruby> <ruby>待<rt>ま</rt></ruby>ってください。",
            translation: "1 daqiqa kuting, iltimos.",
          },
          {
            jp: "3<ruby>分<rt>ぷん</rt></ruby>で <ruby>終<rt>お</rt></ruby>わります。",
            translation: "3 daqiqada tugataman.",
          },
          {
            jp: "10<ruby>分<rt>ぷん</rt></ruby> おくれます。すみません。",
            translation: "10 daqiqa kechikaman. Kechirasiz.",
          },
        ],
      },
    },
    {
      id: 160,
      lesson: 4,
      japanese: "<ruby>何時<rt>なんじ</rt></ruby>",
      cleanWord: "何時",
      translations: { ru: "который час?", uz: "soat necha?" },
      exampleSentences: {
        ru: {
          jp: "すみません、<ruby>今<rt>いま</rt></ruby> <ruby>何時<rt>なんじ</rt></ruby>ですか。— <ruby>午前<rt>ごぜん</rt></ruby> 4<ruby>時<rt>じ</rt></ruby>です。— ええ！？",
          translation: "Простите, который час? — 4 утра. — Что?!",
          grammarInfo:
            "1. すみません — «простите/извините», вежливое обращение\n\n2. 今 何時ですか — «сейчас который час?», стандартный вопрос\n\n3. 午前 4時です — «4 часа утра», ответ\n\n💡 何時 (なんじ) — вопросительное слово «который час?». В вопросе частица か стоит в конце. Отвечаем: 〜時です.",
        },
        uz: {
          jp: "すみません、<ruby>今<rt>いま</rt></ruby> <ruby>何時<rt>なんじ</rt></ruby>ですか。— <ruby>午前<rt>ごぜん</rt></ruby> 4<ruby>時<rt>じ</rt></ruby>です。— ええ！？",
          translation: "Kechirasiz, soat necha? — Ertalab 4. — Nima?!",
          grammarInfo:
            "1. すみません — «kechirasiz», muloyim murojaat\n\n2. 今 何時ですか — «hozir soat necha?», standart savol\n\n3. 午前 4時です — «ertalab soat 4», javob\n\n💡 何時 (なんじ) — «soat necha?» soʻroq soʻzi. Savolda か oxirida turadi. Javob: 〜時です.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>銀行<rt>ぎんこう</rt></ruby>は <ruby>何時<rt>なんじ</rt></ruby>からですか。",
            translation: "Банк с какого часа?",
          },
          {
            jp: "<ruby>何時<rt>なんじ</rt></ruby>に <ruby>寝<rt>ね</rt></ruby>ますか。",
            translation: "Во сколько ложитесь спать?",
          },
          {
            jp: "<ruby>明日<rt>あした</rt></ruby> <ruby>何時<rt>なんじ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きますか。",
            translation: "Во сколько завтра встаёте?",
          },
        ],
        uz: [
          {
            jp: "<ruby>銀行<rt>ぎんこう</rt></ruby>は <ruby>何時<rt>なんじ</rt></ruby>からですか。",
            translation: "Bank soat nechadan ishlaydi?",
          },
          {
            jp: "<ruby>何時<rt>なんじ</rt></ruby>に <ruby>寝<rt>ね</rt></ruby>ますか。",
            translation: "Soat nechada uxlaysiz?",
          },
          {
            jp: "<ruby>明日<rt>あした</rt></ruby> <ruby>何時<rt>なんじ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きますか。",
            translation: "Ertaga soat nechada turasiz?",
          },
        ],
      },
    },
    {
      id: 161,
      lesson: 4,
      japanese: "<ruby>何分<rt>なんぷん</rt></ruby>",
      cleanWord: "何分",
      translations: { ru: "сколько минут?", uz: "necha daqiqa?" },
      exampleSentences: {
        ru: {
          jp: "<ruby>駅<rt>えき</rt></ruby>まで <ruby>何分<rt>なんぷん</rt></ruby>ですか。— 2<ruby>分<rt>ふん</rt></ruby>です。— <ruby>日本<rt>にほん</rt></ruby>は すごいですね！",
          translation:
            "До станции сколько минут? — 2 минуты. — Япония потрясающая!",
          grammarInfo:
            "1. 駅まで — «до станции», まで = конечная точка\n\n2. 何分ですか — «сколько минут?», вопросительное слово\n\n3. 2分です — «2 минуты», ответ\n\n💡 В Японии станции метро через каждые 2-3 минуты ходьбы. В Токио 882 станции — больше, чем в любом городе мира!",
        },
        uz: {
          jp: "<ruby>駅<rt>えき</rt></ruby>まで <ruby>何分<rt>なんぷん</rt></ruby>ですか。— 2<ruby>分<rt>ふん</rt></ruby>です。— <ruby>日本<rt>にほん</rt></ruby>は すごいですね！",
          translation:
            "Stansiyagacha necha daqiqa? — 2 daqiqa. — Yaponiya ajoyib-a!",
          grammarInfo:
            "1. 駅まで — «stansiyagacha», まで = tugash nuqtasi\n\n2. 何分ですか — «necha daqiqa?», soʻroq soʻzi\n\n3. 2分です — «2 daqiqa», javob\n\n💡 Yaponiyada metro stansiyalari har 2-3 daqiqalik yurish masofasida. Tokioda 882 ta stansiya bor — dunyodagi har qanday shahardan koʻp!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>昼休<rt>ひるやす</rt></ruby>みは <ruby>何分<rt>なんぷん</rt></ruby>ですか。",
            translation: "Обеденный перерыв — сколько минут?",
          },
          {
            jp: "<ruby>空港<rt>くうこう</rt></ruby>まで <ruby>何分<rt>なんぷん</rt></ruby>ですか。",
            translation: "До аэропорта сколько минут?",
          },
          {
            jp: "テストは <ruby>何分<rt>なんぷん</rt></ruby>ですか。",
            translation: "Тест — сколько минут?",
          },
        ],
        uz: [
          {
            jp: "<ruby>昼休<rt>ひるやす</rt></ruby>みは <ruby>何分<rt>なんぷん</rt></ruby>ですか。",
            translation: "Tushlik tanaffusi necha daqiqa?",
          },
          {
            jp: "<ruby>空港<rt>くうこう</rt></ruby>まで <ruby>何分<rt>なんぷん</rt></ruby>ですか。",
            translation: "Aeroportgacha necha daqiqa?",
          },
          {
            jp: "テストは <ruby>何分<rt>なんぷん</rt></ruby>ですか。",
            translation: "Test necha daqiqa?",
          },
        ],
      },
    },
    {
      id: 162,
      lesson: 4,
      japanese: "<ruby>午前<rt>ごぜん</rt></ruby>",
      cleanWord: "午前",
      translations: { ru: "до полудня (a.m.)", uz: "tushlikkacha (a.m.)" },
      exampleSentences: {
        ru: {
          jp: "<ruby>築地<rt>つきじ</rt></ruby>の <ruby>市場<rt>いちば</rt></ruby>は <ruby>午前<rt>ごぜん</rt></ruby> 5<ruby>時<rt>じ</rt></ruby>から です。おすしは <ruby>午前<rt>ごぜん</rt></ruby> 5<ruby>時<rt>じ</rt></ruby>が いちばん です！",
          translation:
            "Рынок Цукидзи работает с 5 утра. Суши в 5 утра — лучшие!",
          grammarInfo:
            "1. 午前 — «до полудня / утро», ставится ПЕРЕД временем\n\n2. 午前 5時から — «с 5 утра»\n\n3. いちばん — «самый лучший/номер один»\n\n💡 午前 ставится ПЕРЕД числом: 午前 9時 (правильно) ≠ 9時午前 (неправильно). Порядок: 午前/午後 → 時 → 分.",
        },
        uz: {
          jp: "<ruby>築地<rt>つきじ</rt></ruby>の <ruby>市場<rt>いちば</rt></ruby>は <ruby>午前<rt>ごぜん</rt></ruby> 5<ruby>時<rt>じ</rt></ruby>から です。おすしは <ruby>午前<rt>ごぜん</rt></ruby> 5<ruby>時<rt>じ</rt></ruby>が いちばん です！",
          translation:
            "Tsukiji bozori ertalab soat 5 dan ishlaydi. Soat 5 dagi sushi — eng mazali!",
          grammarInfo:
            "1. 午前 — «tushlikkacha / ertalab», vaqt OLDIDAN qoʻyiladi\n\n2. 午前 5時から — «ertalab 5 dan»\n\n3. いちばん — «eng yaxshi / birinchi»\n\n💡 午前 son OLDIDA turadi: 午前 9時 (toʻgʻri) ≠ 9時午前 (notoʻgʻri). Tartib: 午前/午後 → 時 → 分.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>午前<rt>ごぜん</rt></ruby> 9<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。",
            translation: "Встаю в 9 утра.",
          },
          {
            jp: "<ruby>銀行<rt>ぎんこう</rt></ruby>は <ruby>午前<rt>ごぜん</rt></ruby> 9<ruby>時<rt>じ</rt></ruby>からです。",
            translation: "Банк работает с 9 утра.",
          },
          {
            jp: "<ruby>午前<rt>ごぜん</rt></ruby> 7<ruby>時<rt>じ</rt></ruby>から <ruby>午前<rt>ごぜん</rt></ruby> 8<ruby>時<rt>じ</rt></ruby>まで <ruby>勉強<rt>べんきょう</rt></ruby>します。",
            translation: "Учусь с 7 до 8 утра.",
          },
        ],
        uz: [
          {
            jp: "<ruby>午前<rt>ごぜん</rt></ruby> 9<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。",
            translation: "Ertalab soat 9 da turaman.",
          },
          {
            jp: "<ruby>銀行<rt>ぎんこう</rt></ruby>は <ruby>午前<rt>ごぜん</rt></ruby> 9<ruby>時<rt>じ</rt></ruby>からです。",
            translation: "Bank ertalab soat 9 dan ishlaydi.",
          },
          {
            jp: "<ruby>午前<rt>ごぜん</rt></ruby> 7<ruby>時<rt>じ</rt></ruby>から <ruby>午前<rt>ごぜん</rt></ruby> 8<ruby>時<rt>じ</rt></ruby>まで <ruby>勉強<rt>べんきょう</rt></ruby>します。",
            translation: "Ertalab soat 7 dan 8 gacha oʻqiyman.",
          },
        ],
      },
    },
    {
      id: 163,
      lesson: 4,
      japanese: "<ruby>午後<rt>ごご</rt></ruby>",
      cleanWord: "午後",
      translations: {
        ru: "после полудня (p.m.)",
        uz: "tushlikdan keyin (p.m.)",
      },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>は <ruby>午後<rt>ごご</rt></ruby> 3<ruby>時<rt>じ</rt></ruby>に おやつ<ruby>休<rt>やす</rt></ruby>み が あります。",
          translation:
            "В японских компаниях в 3 часа дня есть перерыв на сладости.",
          grammarInfo:
            "1. 午後 — «после полудня», p.m.\n\n2. 午後 3時に — «в 3 часа дня»\n\n3. おやつ休み — «перерыв на закуску/сладости»\n\n💡 午後 и 午前 — антонимы. 午 = «полдень». 前 = «до», 後 = «после». Буквально: 午前 = «до полудня», 午後 = «после полудня».",
        },
        uz: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>は <ruby>午後<rt>ごご</rt></ruby> 3<ruby>時<rt>じ</rt></ruby>に おやつ<ruby>休<rt>やす</rt></ruby>み が あります。",
          translation:
            "Yaponiya kompaniyalarida kunduzi soat 3 da shirinlik tanaffusi bor.",
          grammarInfo:
            "1. 午後 — «tushdan keyin», p.m.\n\n2. 午後 3時に — «kunduzi soat 3 da»\n\n3. おやつ休み — «shirinlik tanaffusi»\n\n💡 午後 va 午前 — qarama-qarshi soʻzlar. 午 = «tush». 前 = «oldin», 後 = «keyin». Toʻgʻridan-toʻgʻri: 午前 = «tushdan oldin», 午後 = «tushdan keyin».",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>午後<rt>ごご</rt></ruby> 2<ruby>時<rt>じ</rt></ruby>に <ruby>会議<rt>かいぎ</rt></ruby>が あります。",
            translation: "В 2 часа дня собрание.",
          },
          {
            jp: "<ruby>午後<rt>ごご</rt></ruby> 6<ruby>時<rt>じ</rt></ruby>に <ruby>仕事<rt>しごと</rt></ruby>が <ruby>終<rt>お</rt></ruby>わります。",
            translation: "В 6 вечера работа заканчивается.",
          },
          {
            jp: "<ruby>午後<rt>ごご</rt></ruby>は <ruby>図書館<rt>としょかん</rt></ruby>で <ruby>勉強<rt>べんきょう</rt></ruby>します。",
            translation: "После обеда занимаюсь в библиотеке.",
          },
        ],
        uz: [
          {
            jp: "<ruby>午後<rt>ごご</rt></ruby> 2<ruby>時<rt>じ</rt></ruby>に <ruby>会議<rt>かいぎ</rt></ruby>が あります。",
            translation: "Kunduzi soat 2 da yigʻilish bor.",
          },
          {
            jp: "<ruby>午後<rt>ごご</rt></ruby> 6<ruby>時<rt>じ</rt></ruby>に <ruby>仕事<rt>しごと</rt></ruby>が <ruby>終<rt>お</rt></ruby>わります。",
            translation: "Kechqurun soat 6 da ish tugaydi.",
          },
          {
            jp: "<ruby>午後<rt>ごご</rt></ruby>は <ruby>図書館<rt>としょかん</rt></ruby>で <ruby>勉強<rt>べんきょう</rt></ruby>します。",
            translation: "Tushdan keyin kutubxonada dars qilaman.",
          },
        ],
      },
    },
    {
      id: 164,
      lesson: 4,
      japanese: "<ruby>朝<rt>あさ</rt></ruby>",
      cleanWord: "朝",
      translations: { ru: "утро", uz: "ertalab" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>朝<rt>あさ</rt></ruby>は ラッシュアワーです。<ruby>電車<rt>でんしゃ</rt></ruby>の <ruby>人<rt>ひと</rt></ruby>は 200% です。",
          translation: "Утро в Японии — это час пик. Загрузка поездов — 200%.",
          grammarInfo:
            "1. 朝 — «утро», без に (период дня, не точное время)\n\n2. ラッシュアワー — «час пик» (от англ. rush hour)\n\n3. 200% — загрузка вагона\n\n💡 朝 используется БЕЗ に: 朝 起きます (правильно). Но: 7時に 起きます (с точным временем — に нужна).",
        },
        uz: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>朝<rt>あさ</rt></ruby>は ラッシュアワーです。<ruby>電車<rt>でんしゃ</rt></ruby>の <ruby>人<rt>ひと</rt></ruby>は 200% です。",
          translation:
            "Yaponiyada ertalab — «rush hour». Poyezdlardagi odamlar — 200%.",
          grammarInfo:
            "1. 朝 — «ertalab», に siz (kun davri, aniq vaqt emas)\n\n2. ラッシュアワー — «rush hour» (inglizchadan)\n\n3. 200% — vagon yuklamasi\n\n💡 朝 に siz ishlatiladi: 朝 起きます (toʻgʻri). Lekin: 7時に 起きます (aniq vaqt bilan — に kerak).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>朝<rt>あさ</rt></ruby> 6<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。",
            translation: "Встаю в 6 утра.",
          },
          {
            jp: "<ruby>朝<rt>あさ</rt></ruby> ごはんは パンです。",
            translation: "На завтрак — хлеб.",
          },
          {
            jp: "<ruby>朝<rt>あさ</rt></ruby>は いつも コーヒーを <ruby>飲<rt>の</rt></ruby>みます。",
            translation: "Утром всегда пью кофе.",
          },
        ],
        uz: [
          {
            jp: "<ruby>朝<rt>あさ</rt></ruby> 6<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。",
            translation: "Ertalab soat 6 da turaman.",
          },
          {
            jp: "<ruby>朝<rt>あさ</rt></ruby> ごはんは パンです。",
            translation: "Nonushta — non.",
          },
          {
            jp: "<ruby>朝<rt>あさ</rt></ruby>は いつも コーヒーを <ruby>飲<rt>の</rt></ruby>みます。",
            translation: "Ertalab doim kofe ichaman.",
          },
        ],
      },
    },
    {
      id: 165,
      lesson: 4,
      japanese: "<ruby>昼<rt>ひる</rt></ruby>",
      cleanWord: "昼",
      translations: { ru: "день, полдень", uz: "kunduz, tush" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の サラリーマンは <ruby>昼<rt>ひる</rt></ruby> 15<ruby>分<rt>ふん</rt></ruby>で ごはんを <ruby>食<rt>た</rt></ruby>べます。",
          translation: "Японские офисные работники обедают за 15 минут.",
          grammarInfo:
            "1. 昼 — «днём/в обед», без に\n\n2. 15分で — «за 15 минут», で = за какое-то время\n\n3. ごはんを食べます — «едят/обедают»\n\n💡 昼 (ひる) = «день/полдень». 昼ごはん = «обед» (буквально «дневная еда»). Часто сокращают до просто 昼.",
        },
        uz: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の サラリーマンは <ruby>昼<rt>ひる</rt></ruby> 15<ruby>分<rt>ふん</rt></ruby>で ごはんを <ruby>食<rt>た</rt></ruby>べます。",
          translation: "Yaponiya ofis xodimlari tushlikni 15 daqiqada yeydi.",
          grammarInfo:
            "1. 昼 — «kunduz/tushda», に siz\n\n2. 15分で — «15 daqiqada», で = qancha vaqtda\n\n3. ごはんを食べます — «ovqat yeydi»\n\n💡 昼 (ひる) = «kunduz/tush». 昼ごはん = «tushlik» (toʻgʻridan-toʻgʻri «kunduzgi ovqat»). Koʻpincha shunchaki 昼 deb qisqartiladi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>昼<rt>ひる</rt></ruby> 12<ruby>時<rt>じ</rt></ruby>に <ruby>昼<rt>ひる</rt></ruby>ごはんを <ruby>食<rt>た</rt></ruby>べます。",
            translation: "В 12 часов дня обедаю.",
          },
          {
            jp: "<ruby>昼<rt>ひる</rt></ruby>は <ruby>暑<rt>あつ</rt></ruby>いです。",
            translation: "Днём жарко.",
          },
          {
            jp: "<ruby>昼<rt>ひる</rt></ruby> <ruby>休<rt>やす</rt></ruby>みは 1<ruby>時間<rt>じかん</rt></ruby>です。",
            translation: "Обеденный перерыв — 1 час.",
          },
        ],
        uz: [
          {
            jp: "<ruby>昼<rt>ひる</rt></ruby> 12<ruby>時<rt>じ</rt></ruby>に <ruby>昼<rt>ひる</rt></ruby>ごはんを <ruby>食<rt>た</rt></ruby>べます。",
            translation: "Soat 12 da tushlik qilaman.",
          },
          {
            jp: "<ruby>昼<rt>ひる</rt></ruby>は <ruby>暑<rt>あつ</rt></ruby>いです。",
            translation: "Kunduz issiq.",
          },
          {
            jp: "<ruby>昼<rt>ひる</rt></ruby> <ruby>休<rt>やす</rt></ruby>みは 1<ruby>時間<rt>じかん</rt></ruby>です。",
            translation: "Tushlik tanaffusi 1 soat.",
          },
        ],
      },
    },
    {
      id: 166,
      lesson: 4,
      japanese: "<ruby>晩<rt>ばん</rt></ruby> / <ruby>夜<rt>よる</rt></ruby>",
      cleanWord: "晩 / 夜",
      translations: { ru: "вечер, ночь", uz: "kechqurun, tun" },
      exampleSentences: {
        ru: {
          jp: "<ruby>東京<rt>とうきょう</rt></ruby>の <ruby>夜<rt>よる</rt></ruby>は <ruby>昼<rt>ひる</rt></ruby>より にぎやかです。ネオンの <ruby>街<rt>まち</rt></ruby>です。",
          translation: "Ночной Токио оживлённее дневного. Город неона.",
          grammarInfo:
            "1. 夜 — «ночь/вечер», без に\n\n2. 晩 и 夜 — синонимы. 晩 чаще в составе слов (今晩, 毎晩), 夜 — самостоятельно\n\n3. にぎやか — «оживлённый, шумный»\n\n💡 晩 (ばん) используют в выражениях: 今晩 (сегодня вечером), 毎晩 (каждый вечер). 夜 (よる) — чаще отдельно: 夜 寝ます.",
        },
        uz: {
          jp: "<ruby>東京<rt>とうきょう</rt></ruby>の <ruby>夜<rt>よる</rt></ruby>は <ruby>昼<rt>ひる</rt></ruby>より にぎやかです。ネオンの <ruby>街<rt>まち</rt></ruby>です。",
          translation: "Tokioning kechasi kunduzdan jonliroq. Neon shahri.",
          grammarInfo:
            "1. 夜 — «kecha/tun», に siz\n\n2. 晩 va 夜 — sinonim. 晩 koʻpincha birikmalar ichida (今晩, 毎晩), 夜 — mustaqil\n\n3. にぎやか — «jonli, shovqinli»\n\n💡 晩 (ばん) iboralarda ishlatiladi: 今晩 (bugun kechqurun), 毎晩 (har kecha). 夜 (よる) — koʻpincha alohida: 夜 寝ます.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>晩<rt>ばん</rt></ruby>ごはんは 7<ruby>時<rt>じ</rt></ruby>です。",
            translation: "Ужин в 7 часов.",
          },
          {
            jp: "<ruby>夜<rt>よる</rt></ruby> 11<ruby>時<rt>じ</rt></ruby>に <ruby>寝<rt>ね</rt></ruby>ます。",
            translation: "Ложусь спать в 11 ночи.",
          },
          {
            jp: "<ruby>金曜日<rt>きんようび</rt></ruby>の <ruby>夜<rt>よる</rt></ruby>は いつも カラオケです。",
            translation: "В пятницу вечером всегда хожу в караоке.",
          },
        ],
        uz: [
          {
            jp: "<ruby>晩<rt>ばん</rt></ruby>ごはんは 7<ruby>時<rt>じ</rt></ruby>です。",
            translation: "Kechki ovqat soat 7 da.",
          },
          {
            jp: "<ruby>夜<rt>よる</rt></ruby> 11<ruby>時<rt>じ</rt></ruby>に <ruby>寝<rt>ね</rt></ruby>ます。",
            translation: "Kechasi soat 11 da uxlayman.",
          },
          {
            jp: "<ruby>金曜日<rt>きんようび</rt></ruby>の <ruby>夜<rt>よる</rt></ruby>は いつも カラオケです。",
            translation: "Juma kechasi doim karaoke.",
          },
        ],
      },
    },
    {
      id: 167,
      lesson: 4,
      japanese: "<ruby>月曜日<rt>げつようび</rt></ruby>",
      cleanWord: "月曜日",
      translations: { ru: "понедельник", uz: "dushanba" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>で <ruby>月曜日<rt>げつようび</rt></ruby>は 「サザエさんシンドローム」の <ruby>日<rt>ひ</rt></ruby>です。",
          translation: "В Японии понедельник — день «синдрома Садзаэ-сан».",
          grammarInfo:
            "1. 月曜日は — «понедельник» + は\n\n2. ～の日 — «день чего-то»\n\n3. サザエさんシンドローム — «синдром Садзаэ-сан» — японское название «воскресной тоски»\n\n💡 «Садзаэ-сан» — аниме, идущее с 1969 года. Японцы говорят: «Когда начинается Садзаэ-сан (воскресенье вечером), становится грустно, потому что завтра понедельник».",
        },
        uz: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>で <ruby>月曜日<rt>げつようび</rt></ruby>は 「サザエさんシンドローム」の <ruby>日<rt>ひ</rt></ruby>です。",
          translation: "Yaponiyada dushanba — «Sazae-san sindromi» kuni.",
          grammarInfo:
            "1. 月曜日は — «dushanba» + は\n\n2. ～の日 — «…ning kuni»\n\n3. サザエさんシンドローム — «Sazae-san sindromi» — «yakshanba qayg'usi»ning yaponcha nomi\n\n💡 «Sazae-san» — 1969 yildan beri koʻrsatilayotgan anime. Yaponlar aytadi: «Sazae-san boshlanganida (yakshanba kechqurun), gʻamgin boʻlaman, chunki ertaga dushanba».",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>月曜日<rt>げつようび</rt></ruby>は <ruby>仕事<rt>しごと</rt></ruby>です。",
            translation: "В понедельник — работа.",
          },
          {
            jp: "<ruby>月曜日<rt>げつようび</rt></ruby>から <ruby>金曜日<rt>きんようび</rt></ruby>まで <ruby>働<rt>はたら</rt></ruby>きます。",
            translation: "Работаю с понедельника по пятницу.",
          },
          {
            jp: "<ruby>美術館<rt>びじゅつかん</rt></ruby>は <ruby>月曜日<rt>げつようび</rt></ruby> <ruby>休<rt>やす</rt></ruby>みです。",
            translation: "Музей в понедельник закрыт.",
          },
        ],
        uz: [
          {
            jp: "<ruby>月曜日<rt>げつようび</rt></ruby>は <ruby>仕事<rt>しごと</rt></ruby>です。",
            translation: "Dushanba kuni — ish.",
          },
          {
            jp: "<ruby>月曜日<rt>げつようび</rt></ruby>から <ruby>金曜日<rt>きんようび</rt></ruby>まで <ruby>働<rt>はたら</rt></ruby>きます。",
            translation: "Dushanbadan jumagacha ishlayman.",
          },
          {
            jp: "<ruby>美術館<rt>びじゅつかん</rt></ruby>は <ruby>月曜日<rt>げつようび</rt></ruby> <ruby>休<rt>やす</rt></ruby>みです。",
            translation: "Muzey dushanba kuni yopiq.",
          },
        ],
      },
    },
    {
      id: 168,
      lesson: 4,
      japanese: "<ruby>火曜日<rt>かようび</rt></ruby>",
      cleanWord: "火曜日",
      translations: { ru: "вторник", uz: "seshanba" },
      exampleSentences: {
        ru: {
          jp: "<ruby>火曜日<rt>かようび</rt></ruby>は 「<ruby>火<rt>ひ</rt></ruby>」の <ruby>日<rt>ひ</rt></ruby>です。<ruby>火星<rt>かせい</rt></ruby>の <ruby>日<rt>ひ</rt></ruby>です。マーズデーです！",
          translation: "Вторник — день «огня». День Марса. Mars day!",
          grammarInfo:
            "1. 火曜日 — «вторник», 火 = огонь\n\n2. 火星 — «Марс» (планета), буквально «огненная звезда»\n\n3. ～の日 — «день чего-то»\n\n💡 Дни недели в японском — это планеты! 月 = Луна (пн), 火 = Марс (вт), 水 = Меркурий (ср), 木 = Юпитер (чт), 金 = Венера (пт), 土 = Сатурн (сб), 日 = Солнце (вс).",
        },
        uz: {
          jp: "<ruby>火曜日<rt>かようび</rt></ruby>は 「<ruby>火<rt>ひ</rt></ruby>」の <ruby>日<rt>ひ</rt></ruby>です。<ruby>火星<rt>かせい</rt></ruby>の <ruby>日<rt>ひ</rt></ruby>です。マーズデーです！",
          translation: "Seshanba — «olov» kuni. Mars sayyorasi kuni. Mars day!",
          grammarInfo:
            "1. 火曜日 — «seshanba», 火 = olov\n\n2. 火星 — «Mars» (sayyora), toʻgʻridan-toʻgʻri «olovli yulduz»\n\n3. ～の日 — «…ning kuni»\n\n💡 Yapon tilida hafta kunlari — sayyoralar! 月 = Oy (du), 火 = Mars (se), 水 = Merkuriy (chor), 木 = Yupiter (pay), 金 = Venera (ju), 土 = Saturn (sha), 日 = Quyosh (yak).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>火曜日<rt>かようび</rt></ruby>に <ruby>日本語<rt>にほんご</rt></ruby>の テストが あります。",
            translation: "Во вторник тест по японскому.",
          },
          {
            jp: "<ruby>火曜日<rt>かようび</rt></ruby>と <ruby>木曜日<rt>もくようび</rt></ruby>は <ruby>日本語<rt>にほんご</rt></ruby>の <ruby>授業<rt>じゅぎょう</rt></ruby>です。",
            translation: "Во вторник и четверг — урок японского.",
          },
          {
            jp: "<ruby>来週<rt>らいしゅう</rt></ruby>の <ruby>火曜日<rt>かようび</rt></ruby>は <ruby>休<rt>やす</rt></ruby>みです。",
            translation: "В следующий вторник — выходной.",
          },
        ],
        uz: [
          {
            jp: "<ruby>火曜日<rt>かようび</rt></ruby>に <ruby>日本語<rt>にほんご</rt></ruby>の テストが あります。",
            translation: "Seshanba kuni yapon tili testi bor.",
          },
          {
            jp: "<ruby>火曜日<rt>かようび</rt></ruby>と <ruby>木曜日<rt>もくようび</rt></ruby>は <ruby>日本語<rt>にほんご</rt></ruby>の <ruby>授業<rt>じゅぎょう</rt></ruby>です。",
            translation: "Seshanba va payshanba — yapon tili darsi.",
          },
          {
            jp: "<ruby>来週<rt>らいしゅう</rt></ruby>の <ruby>火曜日<rt>かようび</rt></ruby>は <ruby>休<rt>やす</rt></ruby>みです。",
            translation: "Keyingi seshanba — dam olish kuni.",
          },
        ],
      },
    },
    {
      id: 169,
      lesson: 4,
      japanese: "<ruby>水曜日<rt>すいようび</rt></ruby>",
      cleanWord: "水曜日",
      translations: { ru: "среда", uz: "chorshanba" },
      exampleSentences: {
        ru: {
          jp: "<ruby>水曜日<rt>すいようび</rt></ruby>は <ruby>週<rt>しゅう</rt></ruby>の まんなか です。「<ruby>水<rt>みず</rt></ruby>」の <ruby>日<rt>ひ</rt></ruby>、リフレッシュの <ruby>日<rt>ひ</rt></ruby>です。",
          translation: "Среда — середина недели. День «воды», день обновления.",
          grammarInfo:
            "1. 水曜日 — «среда», 水 = вода\n\n2. 週の まんなか — «середина недели»\n\n3. リフレッシュ — «обновление» (от англ. refresh)\n\n💡 Во многих японских компаниях среда — «ノー残業デー» (No Overtime Day). В этот день все должны уходить вовремя!",
        },
        uz: {
          jp: "<ruby>水曜日<rt>すいようび</rt></ruby>は <ruby>週<rt>しゅう</rt></ruby>の まんなか です。「<ruby>水<rt>みず</rt></ruby>」の <ruby>日<rt>ひ</rt></ruby>、リフレッシュの <ruby>日<rt>ひ</rt></ruby>です。",
          translation:
            "Chorshanba — hafta oʻrtasi. «Suv» kuni, yangilanish kuni.",
          grammarInfo:
            "1. 水曜日 — «chorshanba», 水 = suv\n\n2. 週の まんなか — «hafta oʻrtasi»\n\n3. リフレッシュ — «yangilanish» (inglizchadan refresh)\n\n💡 Koʻplab yapon kompaniyalarida chorshanba — «ノー残業デー» (No Overtime Day). Bu kunda hamma oʻz vaqtida ketishi kerak!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>水曜日<rt>すいようび</rt></ruby>は <ruby>早<rt>はや</rt></ruby>く <ruby>終<rt>お</rt></ruby>わります。",
            translation: "В среду заканчиваю рано.",
          },
          {
            jp: "<ruby>水曜日<rt>すいようび</rt></ruby>に <ruby>映画<rt>えいが</rt></ruby>を <ruby>見<rt>み</rt></ruby>ます。",
            translation: "В среду смотрю фильм.",
          },
          {
            jp: "<ruby>水曜日<rt>すいようび</rt></ruby>は <ruby>休<rt>やす</rt></ruby>みです。",
            translation: "В среду — выходной.",
          },
        ],
        uz: [
          {
            jp: "<ruby>水曜日<rt>すいようび</rt></ruby>は <ruby>早<rt>はや</rt></ruby>く <ruby>終<rt>お</rt></ruby>わります。",
            translation: "Chorshanba kuni erta tugataman.",
          },
          {
            jp: "<ruby>水曜日<rt>すいようび</rt></ruby>に <ruby>映画<rt>えいが</rt></ruby>を <ruby>見<rt>み</rt></ruby>ます。",
            translation: "Chorshanba kuni kino koʻraman.",
          },
          {
            jp: "<ruby>水曜日<rt>すいようび</rt></ruby>は <ruby>休<rt>やす</rt></ruby>みです。",
            translation: "Chorshanba — dam olish kuni.",
          },
        ],
      },
    },
    {
      id: 170,
      lesson: 4,
      japanese: "<ruby>木曜日<rt>もくようび</rt></ruby>",
      cleanWord: "木曜日",
      translations: { ru: "четверг", uz: "payshanba" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>では <ruby>木曜日<rt>もくようび</rt></ruby>の <ruby>夜<rt>よる</rt></ruby>に テレビドラマが <ruby>多<rt>おお</rt></ruby>いです。",
          translation: "В Японии в четверг вечером много телесериалов.",
          grammarInfo:
            "1. 木曜日 — «четверг», 木 = дерево\n\n2. ～の夜に — «вечером в…»\n\n3. 多いです — «много»\n\n💡 木 = дерево, Юпитер. Мнемоника: «ЧЕТверг — ЧЕТыре кольца у дерева». Или: Jupiter = дерево (木) = четверг.",
        },
        uz: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>では <ruby>木曜日<rt>もくようび</rt></ruby>の <ruby>夜<rt>よる</rt></ruby>に テレビドラマが <ruby>多<rt>おお</rt></ruby>いです。",
          translation: "Yaponiyada payshanba kechasi koʻp teleseriallar bor.",
          grammarInfo:
            "1. 木曜日 — «payshanba», 木 = daraxt\n\n2. ～の夜に — «…kechasi»\n\n3. 多いです — «koʻp»\n\n💡 木 = daraxt, Yupiter. Eslatma: Jupiter = daraxt (木) = payshanba. Hafta kunlarini sayyoralar bilan eslab qoling!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>木曜日<rt>もくようび</rt></ruby>に <ruby>会議<rt>かいぎ</rt></ruby>が あります。",
            translation: "В четверг — собрание.",
          },
          {
            jp: "<ruby>木曜日<rt>もくようび</rt></ruby>は <ruby>忙<rt>いそが</rt></ruby>しいです。",
            translation: "Четверг — загруженный день.",
          },
          {
            jp: "<ruby>来週<rt>らいしゅう</rt></ruby>の <ruby>木曜日<rt>もくようび</rt></ruby>に <ruby>勉強<rt>べんきょう</rt></ruby>します。",
            translation: "В следующий четверг буду заниматься.",
          },
        ],
        uz: [
          {
            jp: "<ruby>木曜日<rt>もくようび</rt></ruby>に <ruby>会議<rt>かいぎ</rt></ruby>が あります。",
            translation: "Payshanba kuni yigʻilish bor.",
          },
          {
            jp: "<ruby>木曜日<rt>もくようび</rt></ruby>は <ruby>忙<rt>いそが</rt></ruby>しいです。",
            translation: "Payshanba — band kun.",
          },
          {
            jp: "<ruby>来週<rt>らいしゅう</rt></ruby>の <ruby>木曜日<rt>もくようび</rt></ruby>に <ruby>勉強<rt>べんきょう</rt></ruby>します。",
            translation: "Keyingi payshanba oʻqiyman.",
          },
        ],
      },
    },
    {
      id: 171,
      lesson: 4,
      japanese: "<ruby>金曜日<rt>きんようび</rt></ruby>",
      cleanWord: "金曜日",
      translations: { ru: "пятница", uz: "juma" },
      exampleSentences: {
        ru: {
          jp: "<ruby>金曜日<rt>きんようび</rt></ruby>の <ruby>夜<rt>よる</rt></ruby>、<ruby>新宿<rt>しんじゅく</rt></ruby>は すごいです。サラリーマンが たくさん います。",
          translation:
            "В пятницу вечером Синдзюку — невероятен. Толпы офисных работников.",
          grammarInfo:
            "1. 金曜日の夜 — «пятничный вечер»\n\n2. 新宿は すごいです — «Синдзюку невероятен»\n\n3. たくさん います — «много (людей)»\n\n💡 金 = золото, Венера. Пятница в Японии — «華金» (ханакин, «золотая/цветущая пятница»): вечер пятницы, когда все идут пить после работы.",
        },
        uz: {
          jp: "<ruby>金曜日<rt>きんようび</rt></ruby>の <ruby>夜<rt>よる</rt></ruby>、<ruby>新宿<rt>しんじゅく</rt></ruby>は すごいです。サラリーマンが たくさん います。",
          translation:
            "Juma kechasi Shinjuku — ajoyib. Ofis xodimlarining olomon.",
          grammarInfo:
            "1. 金曜日の夜 — «juma kechasi»\n\n2. 新宿は すごいです — «Shinjuku ajoyib»\n\n3. たくさん います — «koʻp (odam)»\n\n💡 金 = oltin, Venera. Yaponiyada juma — «華金» (hanakin, «oltin/gullab-yashnagan juma»): juma kechasi, hamma ishdan keyin ichishga boradi.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>金曜日<rt>きんようび</rt></ruby>は <ruby>映画<rt>えいが</rt></ruby>を <ruby>見<rt>み</rt></ruby>ます。",
            translation: "В пятницу смотрю фильм.",
          },
          {
            jp: "<ruby>金曜日<rt>きんようび</rt></ruby>の <ruby>夜<rt>よる</rt></ruby>は カラオケに <ruby>行<rt>い</rt></ruby>きます。",
            translation: "В пятницу вечером иду в караоке.",
          },
          {
            jp: "やった！<ruby>金曜日<rt>きんようび</rt></ruby>です！",
            translation: "Ура! Пятница!",
          },
        ],
        uz: [
          {
            jp: "<ruby>金曜日<rt>きんようび</rt></ruby>は <ruby>映画<rt>えいが</rt></ruby>を <ruby>見<rt>み</rt></ruby>ます。",
            translation: "Juma kuni kino koʻraman.",
          },
          {
            jp: "<ruby>金曜日<rt>きんようび</rt></ruby>の <ruby>夜<rt>よる</rt></ruby>は カラオケに <ruby>行<rt>い</rt></ruby>きます。",
            translation: "Juma kechasi karaokega boraman.",
          },
          {
            jp: "やった！<ruby>金曜日<rt>きんようび</rt></ruby>です！",
            translation: "Yashsha! Juma!",
          },
        ],
      },
    },
    {
      id: 172,
      lesson: 4,
      japanese: "<ruby>土曜日<rt>どようび</rt></ruby>",
      cleanWord: "土曜日",
      translations: { ru: "суббота", uz: "shanba" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>子供<rt>こども</rt></ruby>は <ruby>土曜日<rt>どようび</rt></ruby>も <ruby>勉強<rt>べんきょう</rt></ruby>します。<ruby>塾<rt>じゅく</rt></ruby>に <ruby>行<rt>い</rt></ruby>きます。",
          translation:
            "Японские дети учатся и в субботу. Ходят в «дзюку» (частную школу).",
          grammarInfo:
            "1. 土曜日も — «и в субботу тоже», も = тоже\n\n2. 勉強します — «учатся»\n\n3. 塾に行きます — «идут в дзюку»\n\n💡 70% японских школьников ходят в дзюку (塾) — частные вечерние школы, часто до 10 вечера. Даже в субботу. Конкуренция за место в хорошем университете — жёсткая.",
        },
        uz: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>子供<rt>こども</rt></ruby>は <ruby>土曜日<rt>どようび</rt></ruby>も <ruby>勉強<rt>べんきょう</rt></ruby>します。<ruby>塾<rt>じゅく</rt></ruby>に <ruby>行<rt>い</rt></ruby>きます。",
          translation:
            "Yapon bolalari shanba kuni ham oʻqiydi. «Juku» (xususiy maktab)ga boradi.",
          grammarInfo:
            "1. 土曜日も — «shanba kuni ham», も = ham\n\n2. 勉強します — «oʻqiydi»\n\n3. 塾に行きます — «jukuga boradi»\n\n💡 Yapon maktab oʻquvchilarining 70% juku (塾) ga boradi — xususiy kechki maktablar, koʻpincha kechasi 10 gacha. Hatto shanba kuni ham. Yaxshi universitetga kirish uchun raqobat — juda kuchli.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>土曜日<rt>どようび</rt></ruby>は <ruby>休<rt>やす</rt></ruby>みです。",
            translation: "В субботу — выходной.",
          },
          {
            jp: "<ruby>土曜日<rt>どようび</rt></ruby>に <ruby>友達<rt>ともだち</rt></ruby>と <ruby>会<rt>あ</rt></ruby>います。",
            translation: "В субботу встречаюсь с другом.",
          },
          {
            jp: "<ruby>土曜日<rt>どようび</rt></ruby>は <ruby>朝<rt>あさ</rt></ruby> 10<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。",
            translation: "В субботу встаю в 10.",
          },
        ],
        uz: [
          {
            jp: "<ruby>土曜日<rt>どようび</rt></ruby>は <ruby>休<rt>やす</rt></ruby>みです。",
            translation: "Shanba — dam olish kuni.",
          },
          {
            jp: "<ruby>土曜日<rt>どようび</rt></ruby>に <ruby>友達<rt>ともだち</rt></ruby>と <ruby>会<rt>あ</rt></ruby>います。",
            translation: "Shanba kuni doʻstim bilan uchrashaman.",
          },
          {
            jp: "<ruby>土曜日<rt>どようび</rt></ruby>は <ruby>朝<rt>あさ</rt></ruby> 10<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。",
            translation: "Shanba kuni ertalab soat 10 da turaman.",
          },
        ],
      },
    },
    {
      id: 173,
      lesson: 4,
      japanese: "<ruby>日曜日<rt>にちようび</rt></ruby>",
      cleanWord: "日曜日",
      translations: { ru: "воскресенье", uz: "yakshanba" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日曜日<rt>にちようび</rt></ruby>の <ruby>原宿<rt>はらじゅく</rt></ruby>は コスプレの <ruby>世界<rt>せかい</rt></ruby>です。<ruby>何<rt>なん</rt></ruby>でも あります。",
          translation: "Воскресная Харадзюку — мир косплея. Там есть всё.",
          grammarInfo:
            "1. 日曜日の原宿 — «воскресная Харадзюку», の = принадлежность\n\n2. コスプレの世界 — «мир косплея»\n\n3. 何でも あります — «есть всё что угодно»\n\n💡 日 = Солнце. Воскресенье — «день солнца» (Sunday!). В Харадзюку по воскресеньям можно увидеть невероятные костюмы — от готических лолит до аниме-персонажей.",
        },
        uz: {
          jp: "<ruby>日曜日<rt>にちようび</rt></ruby>の <ruby>原宿<rt>はらじゅく</rt></ruby>は コスプレの <ruby>世界<rt>せかい</rt></ruby>です。<ruby>何<rt>なん</rt></ruby>でも あります。",
          translation:
            "Yakshanba kungi Harajuku — kosplay dunyosi. U yerda hamma narsa bor.",
          grammarInfo:
            "1. 日曜日の原宿 — «yakshanbadagi Harajuku», の = tegishlilik\n\n2. コスプレの世界 — «kosplay dunyosi»\n\n3. 何でも あります — «hamma narsa bor»\n\n💡 日 = Quyosh. Yakshanba — «quyosh kuni» (Sunday!). Harajukuda yakshanba kunlari ajoyib kostyumlarni koʻrish mumkin — gotik lolitalardan anime qahramonlarigacha.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>日曜日<rt>にちようび</rt></ruby>は <ruby>何<rt>なに</rt></ruby>を しますか。",
            translation: "Что делаете в воскресенье?",
          },
          {
            jp: "<ruby>日曜日<rt>にちようび</rt></ruby>は ゆっくり <ruby>休<rt>やす</rt></ruby>みます。",
            translation: "В воскресенье отдыхаю не спеша.",
          },
          {
            jp: "<ruby>日曜日<rt>にちようび</rt></ruby>に <ruby>家族<rt>かぞく</rt></ruby>と デパートに <ruby>行<rt>い</rt></ruby>きます。",
            translation: "В воскресенье иду с семьёй в универмаг.",
          },
        ],
        uz: [
          {
            jp: "<ruby>日曜日<rt>にちようび</rt></ruby>は <ruby>何<rt>なに</rt></ruby>を しますか。",
            translation: "Yakshanba kuni nima qilasiz?",
          },
          {
            jp: "<ruby>日曜日<rt>にちようび</rt></ruby>は ゆっくり <ruby>休<rt>やす</rt></ruby>みます。",
            translation: "Yakshanba kuni bemalol dam olaman.",
          },
          {
            jp: "<ruby>日曜日<rt>にちようび</rt></ruby>に <ruby>家族<rt>かぞく</rt></ruby>と デパートに <ruby>行<rt>い</rt></ruby>きます。",
            translation: "Yakshanba kuni oilam bilan univermagga boraman.",
          },
        ],
      },
    },
    {
      id: 174,
      lesson: 4,
      japanese: "<ruby>何曜日<rt>なんようび</rt></ruby>",
      cleanWord: "何曜日",
      translations: { ru: "какой день недели?", uz: "haftaning qaysi kuni?" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本語<rt>にほんご</rt></ruby>の <ruby>授業<rt>じゅぎょう</rt></ruby>は <ruby>何曜日<rt>なんようび</rt></ruby>ですか。— <ruby>毎日<rt>まいにち</rt></ruby>です！",
          translation: "Урок японского — в какой день? — Каждый день!",
          grammarInfo:
            "1. 何曜日ですか — «какой день недели?», вопросительное слово\n\n2. 毎日 — «каждый день»\n\n3. Ответ на 何曜日: 月曜日です, 火曜日です и т.д.\n\n💡 何 (なん/なに) — универсальное «что/какой». 何時 = который час, 何曜日 = какой день, 何分 = сколько минут. Запомните этот паттерн!",
        },
        uz: {
          jp: "<ruby>日本語<rt>にほんご</rt></ruby>の <ruby>授業<rt>じゅぎょう</rt></ruby>は <ruby>何曜日<rt>なんようび</rt></ruby>ですか。— <ruby>毎日<rt>まいにち</rt></ruby>です！",
          translation: "Yapon tili darsi haftaning qaysi kuni? — Har kuni!",
          grammarInfo:
            "1. 何曜日ですか — «haftaning qaysi kuni?», soʻroq soʻzi\n\n2. 毎日 — «har kuni»\n\n3. 何曜日 ga javob: 月曜日です, 火曜日です va h.k.\n\n💡 何 (なん/なに) — universal «nima/qaysi». 何時 = soat necha, 何曜日 = qaysi kun, 何分 = necha daqiqa. Bu patternni yodlang!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>今日<rt>きょう</rt></ruby>は <ruby>何曜日<rt>なんようび</rt></ruby>ですか。",
            translation: "Сегодня какой день недели?",
          },
          {
            jp: "テストは <ruby>何曜日<rt>なんようび</rt></ruby>ですか。",
            translation: "Тест в какой день?",
          },
          {
            jp: "<ruby>休<rt>やす</rt></ruby>みは <ruby>何曜日<rt>なんようび</rt></ruby>ですか。",
            translation: "Выходной — в какой день?",
          },
        ],
        uz: [
          {
            jp: "<ruby>今日<rt>きょう</rt></ruby>は <ruby>何曜日<rt>なんようび</rt></ruby>ですか。",
            translation: "Bugun haftaning qaysi kuni?",
          },
          {
            jp: "テストは <ruby>何曜日<rt>なんようび</rt></ruby>ですか。",
            translation: "Test qaysi kunda?",
          },
          {
            jp: "<ruby>休<rt>やす</rt></ruby>みは <ruby>何曜日<rt>なんようび</rt></ruby>ですか。",
            translation: "Dam olish kuni qachon?",
          },
        ],
      },
    },
    {
      id: 175,
      lesson: 4,
      japanese: "おととい",
      cleanWord: "おととい",
      translations: { ru: "позавчера", uz: "o'tgan kun" },
      exampleSentences: {
        ru: {
          jp: "おとといは <ruby>東京<rt>とうきょう</rt></ruby>に いました。<ruby>今日<rt>きょう</rt></ruby>は <ruby>大阪<rt>おおさか</rt></ruby>に います。<ruby>新幹線<rt>しんかんせん</rt></ruby>は すごいです。",
          translation:
            "Позавчера был в Токио. Сегодня — в Осаке. Синкансэн потрясающий.",
          grammarInfo:
            "1. おととい — «позавчера», без に\n\n2. ～にいました — «был в…», прошедшее время\n\n3. 今日は～にいます — «сегодня нахожусь в…»\n\n💡 Запомните ряд: おととい → きのう → きょう → あした → あさって (позавчера → вчера → сегодня → завтра → послезавтра). に НЕ нужна!",
        },
        uz: {
          jp: "おとといは <ruby>東京<rt>とうきょう</rt></ruby>に いました。<ruby>今日<rt>きょう</rt></ruby>は <ruby>大阪<rt>おおさか</rt></ruby>に います。<ruby>新幹線<rt>しんかんせん</rt></ruby>は すごいです。",
          translation:
            "Oʻtgan kuni Tokioda edim. Bugun Osakadaman. Shinkansen ajoyib.",
          grammarInfo:
            "1. おととい — «oʻtgan kun», に siz\n\n2. ～にいました — «…da edi», oʻtgan zamon\n\n3. 今日は～にいます — «bugun …daman»\n\n💡 Tartibni yodlang: おととい → きのう → きょう → あした → あさって (oʻtgan kun → kecha → bugun → ertaga → indinga). に kerak EMAS!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "おとといは <ruby>休<rt>やす</rt></ruby>みでした。",
            translation: "Позавчера был выходной.",
          },
          {
            jp: "おととい <ruby>映画<rt>えいが</rt></ruby>を <ruby>見<rt>み</rt></ruby>ました。",
            translation: "Позавчера смотрел фильм.",
          },
          {
            jp: "おとといから <ruby>雨<rt>あめ</rt></ruby>です。",
            translation: "С позавчера идёт дождь.",
          },
        ],
        uz: [
          {
            jp: "おとといは <ruby>休<rt>やす</rt></ruby>みでした。",
            translation: "Oʻtgan kuni dam olish kuni edi.",
          },
          {
            jp: "おととい <ruby>映画<rt>えいが</rt></ruby>を <ruby>見<rt>み</rt></ruby>ました。",
            translation: "Oʻtgan kuni kino koʻrdim.",
          },
          {
            jp: "おとといから <ruby>雨<rt>あめ</rt></ruby>です。",
            translation: "Oʻtgan kundan beri yomgʻir yogyapti.",
          },
        ],
      },
    },
    {
      id: 176,
      lesson: 4,
      japanese: "<ruby>昨日<rt>きのう</rt></ruby>",
      cleanWord: "昨日",
      translations: { ru: "вчера", uz: "kecha" },
      exampleSentences: {
        ru: {
          jp: "<ruby>昨日<rt>きのう</rt></ruby> <ruby>日本語<rt>にほんご</rt></ruby>の <ruby>夢<rt>ゆめ</rt></ruby>を <ruby>見<rt>み</rt></ruby>ました。<ruby>日本語<rt>にほんご</rt></ruby>で <ruby>話<rt>はな</rt></ruby>しました！",
          translation:
            "Вчера видел сон на японском. Говорил по-японски во сне!",
          grammarInfo:
            "1. 昨日 — «вчера», без に\n\n2. 夢を見ました — «видел сон», прошедшее время\n\n3. 日本語で — «на японском языке», で = средство/язык\n\n💡 Когда вы начинаете видеть сны на японском — это знак, что мозг начал «думать» на нём. Великий момент для изучающего!",
        },
        uz: {
          jp: "<ruby>昨日<rt>きのう</rt></ruby> <ruby>日本語<rt>にほんご</rt></ruby>の <ruby>夢<rt>ゆめ</rt></ruby>を <ruby>見<rt>み</rt></ruby>ました。<ruby>日本語<rt>にほんご</rt></ruby>で <ruby>話<rt>はな</rt></ruby>しました！",
          translation:
            "Kecha yapon tilida tush koʻrdim. Tushimda yaponcha gapirdim!",
          grammarInfo:
            "1. 昨日 — «kecha», に siz\n\n2. 夢を見ました — «tush koʻrdi», oʻtgan zamon\n\n3. 日本語で — «yapon tilida», で = vosita/til\n\n💡 Yapon tilida tush koʻra boshlaganingizda — bu miyangiz unda «oʻylay» boshlaganining belgisi. Til oʻrganuvchi uchun buyuk lahza!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>昨日<rt>きのう</rt></ruby>は <ruby>何<rt>なに</rt></ruby>を しましたか。",
            translation: "Что делали вчера?",
          },
          {
            jp: "<ruby>昨日<rt>きのう</rt></ruby> <ruby>寿司<rt>すし</rt></ruby>を <ruby>食<rt>た</rt></ruby>べました。",
            translation: "Вчера ел суши.",
          },
          {
            jp: "<ruby>昨日<rt>きのう</rt></ruby>は 12<ruby>時<rt>じ</rt></ruby>に <ruby>寝<rt>ね</rt></ruby>ました。",
            translation: "Вчера лёг спать в 12.",
          },
        ],
        uz: [
          {
            jp: "<ruby>昨日<rt>きのう</rt></ruby>は <ruby>何<rt>なに</rt></ruby>を しましたか。",
            translation: "Kecha nima qildingiz?",
          },
          {
            jp: "<ruby>昨日<rt>きのう</rt></ruby> <ruby>寿司<rt>すし</rt></ruby>を <ruby>食<rt>た</rt></ruby>べました。",
            translation: "Kecha sushi yedim.",
          },
          {
            jp: "<ruby>昨日<rt>きのう</rt></ruby>は 12<ruby>時<rt>じ</rt></ruby>に <ruby>寝<rt>ね</rt></ruby>ました。",
            translation: "Kecha soat 12 da uxladim.",
          },
        ],
      },
    },
    {
      id: 177,
      lesson: 4,
      japanese: "<ruby>今日<rt>きょう</rt></ruby>",
      cleanWord: "今日",
      translations: { ru: "сегодня", uz: "bugun" },
      exampleSentences: {
        ru: {
          jp: "<ruby>今日<rt>きょう</rt></ruby>は いい <ruby>日<rt>ひ</rt></ruby>です。<ruby>日本語<rt>にほんご</rt></ruby>を <ruby>勉強<rt>べんきょう</rt></ruby>しますから！",
          translation: "Сегодня хороший день. Потому что учу японский!",
          grammarInfo:
            "1. 今日は — «сегодня» + は, без に\n\n2. いい日 — «хороший день»\n\n3. ～から — «потому что»\n\n⚠️ НЕ путайте: 今日は (きょうは) = «сегодня…» и こんにちは = «здравствуйте». Пишутся одинаково, но читаются по-разному!",
        },
        uz: {
          jp: "<ruby>今日<rt>きょう</rt></ruby>は いい <ruby>日<rt>ひ</rt></ruby>です。<ruby>日本語<rt>にほんご</rt></ruby>を <ruby>勉強<rt>べんきょう</rt></ruby>しますから！",
          translation: "Bugun yaxshi kun. Chunki yapon tilini oʻrganyapman!",
          grammarInfo:
            "1. 今日は — «bugun» + は, に siz\n\n2. いい日 — «yaxshi kun»\n\n3. ～から — «chunki»\n\n⚠️ Aralashtirib yubormang: 今日は (きょうは) = «bugun…» va こんにちは = «salom». Bir xil yoziladi, lekin turlicha oʻqiladi!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>今日<rt>きょう</rt></ruby>は <ruby>何曜日<rt>なんようび</rt></ruby>ですか。",
            translation: "Сегодня какой день?",
          },
          {
            jp: "<ruby>今日<rt>きょう</rt></ruby> <ruby>何時<rt>なんじ</rt></ruby>に <ruby>終<rt>お</rt></ruby>わりますか。",
            translation: "Во сколько сегодня заканчиваете?",
          },
          {
            jp: "<ruby>今日<rt>きょう</rt></ruby>は <ruby>忙<rt>いそが</rt></ruby>しいです。",
            translation: "Сегодня занят.",
          },
        ],
        uz: [
          {
            jp: "<ruby>今日<rt>きょう</rt></ruby>は <ruby>何曜日<rt>なんようび</rt></ruby>ですか。",
            translation: "Bugun haftaning qaysi kuni?",
          },
          {
            jp: "<ruby>今日<rt>きょう</rt></ruby> <ruby>何時<rt>なんじ</rt></ruby>に <ruby>終<rt>お</rt></ruby>わりますか。",
            translation: "Bugun soat nechada tugatysiz?",
          },
          {
            jp: "<ruby>今日<rt>きょう</rt></ruby>は <ruby>忙<rt>いそが</rt></ruby>しいです。",
            translation: "Bugun bandman.",
          },
        ],
      },
    },
    {
      id: 178,
      lesson: 4,
      japanese: "あした",
      cleanWord: "あした",
      translations: { ru: "завтра", uz: "ertaga" },
      exampleSentences: {
        ru: {
          jp: "あしたは <ruby>日本語<rt>にほんご</rt></ruby>の テストです。<ruby>今<rt>いま</rt></ruby> <ruby>午前<rt>ごぜん</rt></ruby> 3<ruby>時<rt>じ</rt></ruby>です。まだ <ruby>勉強<rt>べんきょう</rt></ruby>します。",
          translation:
            "Завтра тест по японскому. Сейчас 3 часа ночи. Ещё учусь.",
          grammarInfo:
            "1. あしたは — «завтра» + は, без に\n\n2. テストです — «тест», AはBです\n\n3. まだ — «ещё, всё ещё»\n\n💡 あした можно записать кандзи: 明日. Но на начальном уровне обычно пишут хираганой. Оба варианта правильные!",
        },
        uz: {
          jp: "あしたは <ruby>日本語<rt>にほんご</rt></ruby>の テストです。<ruby>今<rt>いま</rt></ruby> <ruby>午前<rt>ごぜん</rt></ruby> 3<ruby>時<rt>じ</rt></ruby>です。まだ <ruby>勉強<rt>べんきょう</rt></ruby>します。",
          translation:
            "Ertaga yapon tili testi. Hozir tunda soat 3. Hali oʻqiyapman.",
          grammarInfo:
            "1. あしたは — «ertaga» + は, に siz\n\n2. テストです — «test», AはBです\n\n3. まだ — «hali, hamon»\n\n💡 あした ni kandzida yozish mumkin: 明日. Lekin boshlangʻich darajada odatda xiraganada yoziladi. Ikkala variant ham toʻgʻri!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あした <ruby>何時<rt>なんじ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きますか。",
            translation: "Во сколько завтра встаёте?",
          },
          {
            jp: "あしたは <ruby>休<rt>やす</rt></ruby>みです。",
            translation: "Завтра выходной.",
          },
          {
            jp: "あした <ruby>東京<rt>とうきょう</rt></ruby>に <ruby>行<rt>い</rt></ruby>きます。",
            translation: "Завтра еду в Токио.",
          },
        ],
        uz: [
          {
            jp: "あした <ruby>何時<rt>なんじ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きますか。",
            translation: "Ertaga soat nechada turasiz?",
          },
          {
            jp: "あしたは <ruby>休<rt>やす</rt></ruby>みです。",
            translation: "Ertaga dam olish kuni.",
          },
          {
            jp: "あした <ruby>東京<rt>とうきょう</rt></ruby>に <ruby>行<rt>い</rt></ruby>きます。",
            translation: "Ertaga Tokioga boraman.",
          },
        ],
      },
    },
    {
      id: 179,
      lesson: 4,
      japanese: "あさって",
      cleanWord: "あさって",
      translations: { ru: "послезавтра", uz: "indinga" },
      exampleSentences: {
        ru: {
          jp: "あさって <ruby>日本<rt>にほん</rt></ruby>に <ruby>行<rt>い</rt></ruby>きます！パスポートは... ありますか？",
          translation: "Послезавтра лечу в Японию! Паспорт... есть?",
          grammarInfo:
            "1. あさって — «послезавтра», без に\n\n2. 日本に行きます — «еду в Японию»\n\n3. ありますか — «есть ли?», вопрос о наличии\n\n💡 あさって — только хираганой, кандзи обычно не используют. Это слово чисто японское (和語), не китайского происхождения.",
        },
        uz: {
          jp: "あさって <ruby>日本<rt>にほん</rt></ruby>に <ruby>行<rt>い</rt></ruby>きます！パスポートは... ありますか？",
          translation: "Indinga Yaponiyaga boraman! Pasport... bormi?",
          grammarInfo:
            "1. あさって — «indinga», に siz\n\n2. 日本に行きます — «Yaponiyaga boraman»\n\n3. ありますか — «bormi?», mavjudlik haqida savol\n\n💡 あさって — faqat xiraganada yoziladi, kandzi odatda ishlatilmaydi. Bu soʻz sof yaponcha (和語), xitoycha kelib chiqishi yoʻq.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "あさっては <ruby>金曜日<rt>きんようび</rt></ruby>です。",
            translation: "Послезавтра — пятница.",
          },
          {
            jp: "あさって <ruby>友達<rt>ともだち</rt></ruby>が <ruby>来<rt>き</rt></ruby>ます。",
            translation: "Послезавтра придёт друг.",
          },
          {
            jp: "あさっての テストは <ruby>何時<rt>なんじ</rt></ruby>からですか。",
            translation: "Послезавтрашний тест — с какого часа?",
          },
        ],
        uz: [
          {
            jp: "あさっては <ruby>金曜日<rt>きんようび</rt></ruby>です。",
            translation: "Indinga — juma.",
          },
          {
            jp: "あさって <ruby>友達<rt>ともだち</rt></ruby>が <ruby>来<rt>き</rt></ruby>ます。",
            translation: "Indinga doʻstim keladi.",
          },
          {
            jp: "あさっての テストは <ruby>何時<rt>なんじ</rt></ruby>からですか。",
            translation: "Indingagi test soat nechadan?",
          },
        ],
      },
    },
    {
      id: 180,
      lesson: 4,
      japanese: "<ruby>今朝<rt>けさ</rt></ruby>",
      cleanWord: "今朝",
      translations: { ru: "сегодня утром", uz: "bugun ertalab" },
      exampleSentences: {
        ru: {
          jp: "<ruby>今朝<rt>けさ</rt></ruby> 5<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きました。<ruby>地震<rt>じしん</rt></ruby>でした！",
          translation: "Сегодня утром встал в 5. Было землетрясение!",
          grammarInfo:
            "1. 今朝 — «сегодня утром», без に\n\n2. 5時に起きました — «встал в 5», прошедшее время\n\n3. 地震でした — «было землетрясение», でした = прошедшее от です\n\n💡 В Японии происходит около 1500 землетрясений в год. Японцы шутят: «Если проснулся от землетрясения — это не будильник, это Япония».",
        },
        uz: {
          jp: "<ruby>今朝<rt>けさ</rt></ruby> 5<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きました。<ruby>地震<rt>じしん</rt></ruby>でした！",
          translation: "Bugun ertalab soat 5 da turdim. Yer silkinishi boʻldi!",
          grammarInfo:
            "1. 今朝 — «bugun ertalab», に siz\n\n2. 5時に起きました — «soat 5 da turdi», oʻtgan zamon\n\n3. 地震でした — «zilzila boʻldi», でした = です ning oʻtgan zamoni\n\n💡 Yaponiyada yiliga taxminan 1500 ta zilzila sodir boʻladi. Yaponlar hazillashadi: «Zilziladan uyg'onsangiz — bu budilnik emas, bu Yaponiya».",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>今朝<rt>けさ</rt></ruby> コーヒーを <ruby>飲<rt>の</rt></ruby>みました。",
            translation: "Сегодня утром пил кофе.",
          },
          {
            jp: "<ruby>今朝<rt>けさ</rt></ruby>は <ruby>寒<rt>さむ</rt></ruby>いです。",
            translation: "Сегодня утром холодно.",
          },
          {
            jp: "<ruby>今朝<rt>けさ</rt></ruby> <ruby>何時<rt>なんじ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きましたか。",
            translation: "Во сколько встали сегодня утром?",
          },
        ],
        uz: [
          {
            jp: "<ruby>今朝<rt>けさ</rt></ruby> コーヒーを <ruby>飲<rt>の</rt></ruby>みました。",
            translation: "Bugun ertalab kofe ichdim.",
          },
          {
            jp: "<ruby>今朝<rt>けさ</rt></ruby>は <ruby>寒<rt>さむ</rt></ruby>いです。",
            translation: "Bugun ertalab sovuq.",
          },
          {
            jp: "<ruby>今朝<rt>けさ</rt></ruby> <ruby>何時<rt>なんじ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きましたか。",
            translation: "Bugun ertalab soat nechada turdingiz?",
          },
        ],
      },
    },
    {
      id: 181,
      lesson: 4,
      japanese: "<ruby>今晩<rt>こんばん</rt></ruby>",
      cleanWord: "今晩",
      translations: { ru: "сегодня вечером", uz: "bugun kechqurun" },
      exampleSentences: {
        ru: {
          jp: "<ruby>今晩<rt>こんばん</rt></ruby> <ruby>居酒屋<rt>いざかや</rt></ruby>に <ruby>行<rt>い</rt></ruby>きませんか。— <ruby>行<rt>い</rt></ruby>きましょう！",
          translation: "Не пойти ли сегодня вечером в идзакаю? — Пойдём!",
          grammarInfo:
            "1. 今晩 — «сегодня вечером», без に\n\n2. ～に行きませんか — «не хотите ли пойти?», вежливое приглашение\n\n3. 行きましょう — «давайте пойдём!», предложение\n\n💡 今晩は (こんばんは) = «добрый вечер». Это буквально «(что касается) этого вечера…» — незаконченное предложение, ставшее приветствием!",
        },
        uz: {
          jp: "<ruby>今晩<rt>こんばん</rt></ruby> <ruby>居酒屋<rt>いざかや</rt></ruby>に <ruby>行<rt>い</rt></ruby>きませんか。— <ruby>行<rt>い</rt></ruby>きましょう！",
          translation: "Bugun kechqurun izakayaga bormaymizmi? — Boraylik!",
          grammarInfo:
            "1. 今晩 — «bugun kechqurun», に siz\n\n2. ～に行きませんか — «bormaymizmi?», muloyim taklif\n\n3. 行きましょう — «boraylik!», taklif\n\n💡 今晩は (こんばんは) = «xayrli kech». Bu toʻgʻridan-toʻgʻri «(bu kechaga kelsak)…» — tugallanmagan gap boʻlib, salomlashuvga aylangan!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>今晩<rt>こんばん</rt></ruby> <ruby>何<rt>なに</rt></ruby>を しますか。",
            translation: "Что делаете сегодня вечером?",
          },
          {
            jp: "<ruby>今晩<rt>こんばん</rt></ruby> <ruby>映画<rt>えいが</rt></ruby>を <ruby>見<rt>み</rt></ruby>ます。",
            translation: "Сегодня вечером смотрю фильм.",
          },
          {
            jp: "<ruby>今晩<rt>こんばん</rt></ruby>は <ruby>早<rt>はや</rt></ruby>く <ruby>寝<rt>ね</rt></ruby>ます。",
            translation: "Сегодня вечером лягу спать рано.",
          },
        ],
        uz: [
          {
            jp: "<ruby>今晩<rt>こんばん</rt></ruby> <ruby>何<rt>なに</rt></ruby>を しますか。",
            translation: "Bugun kechqurun nima qilasiz?",
          },
          {
            jp: "<ruby>今晩<rt>こんばん</rt></ruby> <ruby>映画<rt>えいが</rt></ruby>を <ruby>見<rt>み</rt></ruby>ます。",
            translation: "Bugun kechqurun kino koʻraman.",
          },
          {
            jp: "<ruby>今晩<rt>こんばん</rt></ruby>は <ruby>早<rt>はや</rt></ruby>く <ruby>寝<rt>ね</rt></ruby>ます。",
            translation: "Bugun kechqurun erta uxlayman.",
          },
        ],
      },
    },
    {
      id: 182,
      lesson: 4,
      japanese: "〜から",
      cleanWord: "〜から",
      translations: { ru: "с, от (начало)", uz: "-dan (boshlanish)" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の コンビニは <ruby>朝<rt>あさ</rt></ruby>から <ruby>朝<rt>あさ</rt></ruby>まで <ruby>働<rt>はたら</rt></ruby>きます。24<ruby>時間<rt>じかん</rt></ruby>です！",
          translation: "Японские комбини работают с утра до утра. 24 часа!",
          grammarInfo:
            "1. ～から — «с, от», начальная точка (времени или места)\n\n2. 朝から朝まで — «с утра до утра», から…まで = пара\n\n3. 24時間 — «24 часа»\n\n💡 から〜まで — всегда пара. Но можно использовать и по отдельности: 9時から働きます (работаю с 9). 5時まで働きます (работаю до 5).",
        },
        uz: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の コンビニは <ruby>朝<rt>あさ</rt></ruby>から <ruby>朝<rt>あさ</rt></ruby>まで <ruby>働<rt>はたら</rt></ruby>きます。24<ruby>時間<rt>じかん</rt></ruby>です！",
          translation:
            "Yaponiya konbinilari ertalabdan ertalabgacha ishlaydi. 24 soat!",
          grammarInfo:
            "1. ～から — «-dan», boshlanish nuqtasi (vaqt yoki joy)\n\n2. 朝から朝まで — «ertalabdan ertalabgacha», から…まで = juftlik\n\n3. 24時間 — «24 soat»\n\n💡 から〜まで — doim juftlik. Lekin alohida ham ishlatish mumkin: 9時から働きます (9 dan ishlayman). 5時まで働きます (5 gacha ishlayman).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "9<ruby>時<rt>じ</rt></ruby>から <ruby>仕事<rt>しごと</rt></ruby>です。",
            translation: "С 9 часов — работа.",
          },
          {
            jp: "<ruby>月曜日<rt>げつようび</rt></ruby>から <ruby>金曜日<rt>きんようび</rt></ruby>まで <ruby>勉強<rt>べんきょう</rt></ruby>します。",
            translation: "С понедельника по пятницу учусь.",
          },
          {
            jp: "<ruby>何時<rt>なんじ</rt></ruby>から ですか。",
            translation: "С какого часа?",
          },
        ],
        uz: [
          {
            jp: "9<ruby>時<rt>じ</rt></ruby>から <ruby>仕事<rt>しごと</rt></ruby>です。",
            translation: "Soat 9 dan — ish.",
          },
          {
            jp: "<ruby>月曜日<rt>げつようび</rt></ruby>から <ruby>金曜日<rt>きんようび</rt></ruby>まで <ruby>勉強<rt>べんきょう</rt></ruby>します。",
            translation: "Dushanbadan jumagacha oʻqiyman.",
          },
          {
            jp: "<ruby>何時<rt>なんじ</rt></ruby>から ですか。",
            translation: "Soat nechadan?",
          },
        ],
      },
    },
    {
      id: 183,
      lesson: 4,
      japanese: "〜まで",
      cleanWord: "〜まで",
      translations: { ru: "до (конец)", uz: "-gacha (tugash)" },
      exampleSentences: {
        ru: {
          jp: "<ruby>東京<rt>とうきょう</rt></ruby>の <ruby>電車<rt>でんしゃ</rt></ruby>は <ruby>午前<rt>ごぜん</rt></ruby> 1<ruby>時<rt>じ</rt></ruby>まで です。1<ruby>時<rt>じ</rt></ruby>から 5<ruby>時<rt>じ</rt></ruby>まで — タクシーだけ です。",
          translation:
            "Токийские поезда ходят до часу ночи. С часу до 5 — только такси.",
          grammarInfo:
            "1. ～まで — «до», конечная точка\n\n2. 午前 1時まで — «до часу ночи»\n\n3. タクシーだけ — «только такси», だけ = только\n\n⚠️ まで ≠ に. まで — «до какого-то момента» (граница). に — «в конкретное время» (точка). 5時まで работаю (до 5). 5時に ухожу (в 5).",
        },
        uz: {
          jp: "<ruby>東京<rt>とうきょう</rt></ruby>の <ruby>電車<rt>でんしゃ</rt></ruby>は <ruby>午前<rt>ごぜん</rt></ruby> 1<ruby>時<rt>じ</rt></ruby>まで です。1<ruby>時<rt>じ</rt></ruby>から 5<ruby>時<rt>じ</rt></ruby>まで — タクシーだけ です。",
          translation:
            "Tokio poyezdlari tunda soat 1 gacha ishlaydi. 1 dan 5 gacha — faqat taksi.",
          grammarInfo:
            "1. ～まで — «-gacha», tugash nuqtasi\n\n2. 午前 1時まで — «tunda soat 1 gacha»\n\n3. タクシーだけ — «faqat taksi», だけ = faqat\n\n⚠️ まで ≠ に. まで — «qandaydir lahzagacha» (chegara). に — «aniq vaqtda» (nuqta). 5時まで ishlayman (5 gacha). 5時に ketaman (5 da).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "5<ruby>時<rt>じ</rt></ruby>まで <ruby>働<rt>はたら</rt></ruby>きます。",
            translation: "Работаю до 5.",
          },
          {
            jp: "<ruby>金曜日<rt>きんようび</rt></ruby>まで <ruby>待<rt>ま</rt></ruby>ってください。",
            translation: "Подождите до пятницы.",
          },
          {
            jp: "<ruby>何時<rt>なんじ</rt></ruby>まで ですか。",
            translation: "До какого часа?",
          },
        ],
        uz: [
          {
            jp: "5<ruby>時<rt>じ</rt></ruby>まで <ruby>働<rt>はたら</rt></ruby>きます。",
            translation: "Soat 5 gacha ishlayman.",
          },
          {
            jp: "<ruby>金曜日<rt>きんようび</rt></ruby>まで <ruby>待<rt>ま</rt></ruby>ってください。",
            translation: "Jumagacha kuting, iltimos.",
          },
          {
            jp: "<ruby>何時<rt>なんじ</rt></ruby>まで ですか。",
            translation: "Soat nechagacha?",
          },
        ],
      },
    },
    {
      id: 184,
      lesson: 4,
      japanese: "〜と〜",
      cleanWord: "〜と〜",
      translations: { ru: "и (для существительных)", uz: "va (otlar uchun)" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>朝<rt>あさ</rt></ruby>ごはんは ごはんと みそしると <ruby>魚<rt>さかな</rt></ruby>です。",
          translation: "Японский завтрак — это рис, мисо-суп и рыба.",
          grammarInfo:
            "1. ～と～ — «и», ТОЛЬКО для существительных\n\n2. ごはんと みそしると 魚 — «рис, мисо-суп и рыба», три слова через と\n\n3. ～です — AはBです\n\n⚠️ と соединяет ТОЛЬКО существительные! Нельзя: *食べますと飲みます (глаголы). Для глаголов — другие конструкции (позже).",
        },
        uz: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>朝<rt>あさ</rt></ruby>ごはんは ごはんと みそしると <ruby>魚<rt>さかな</rt></ruby>です。",
          translation: "Yapon nonushtasi — guruch, miso sho'rva va baliq.",
          grammarInfo:
            "1. ～と～ — «va», FAQAT otlar uchun\n\n2. ごはんと みそしると 魚 — «guruch, miso shoʻrva va baliq», uchta soʻz と orqali\n\n3. ～です — AはBです\n\n⚠️ と FAQAT otlarni bogʻlaydi! Notoʻgʻri: *食べますと飲みます (feʻllar). Feʻllar uchun — boshqa konstruksiyalar (keyinroq).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "コーヒーと ケーキを おねがいします。",
            translation: "Кофе и торт, пожалуйста.",
          },
          {
            jp: "<ruby>土曜日<rt>どようび</rt></ruby>と <ruby>日曜日<rt>にちようび</rt></ruby>は <ruby>休<rt>やす</rt></ruby>みです。",
            translation: "Суббота и воскресенье — выходные.",
          },
          {
            jp: "<ruby>父<rt>ちち</rt></ruby>と <ruby>母<rt>はは</rt></ruby>は <ruby>日本<rt>にほん</rt></ruby>に います。",
            translation: "Отец и мать в Японии.",
          },
        ],
        uz: [
          {
            jp: "コーヒーと ケーキを おねがいします。",
            translation: "Kofe va tort, iltimos.",
          },
          {
            jp: "<ruby>土曜日<rt>どようび</rt></ruby>と <ruby>日曜日<rt>にちようび</rt></ruby>は <ruby>休<rt>やす</rt></ruby>みです。",
            translation: "Shanba va yakshanba — dam olish kunlari.",
          },
          {
            jp: "<ruby>父<rt>ちち</rt></ruby>と <ruby>母<rt>はは</rt></ruby>は <ruby>日本<rt>にほん</rt></ruby>に います。",
            translation: "Otam va onam Yaponiyada.",
          },
        ],
      },
    },
    {
      id: 185,
      lesson: 4,
      japanese: "たいへんですね",
      cleanWord: "たいへんですね",
      translations: { ru: "Нелегко, да?", uz: "Qiyin-a?" },
      exampleSentences: {
        ru: {
          jp: "— <ruby>毎日<rt>まいにち</rt></ruby> 14<ruby>時間<rt>じかん</rt></ruby> <ruby>働<rt>はたら</rt></ruby>きます。— たいへんですね！",
          translation: "— Работаю 14 часов каждый день. — Нелегко, да!",
          grammarInfo:
            "1. たいへんですね — «нелегко / тяжело, да?», выражение сочувствия\n\n2. ね — частица согласия/сочувствия на конце\n\n3. 毎日 14時間 — «каждый день 14 часов»\n\n💡 Это одна из самых ПОЛЕЗНЫХ фраз в японском. Японцы постоянно используют её, чтобы показать, что они сочувствуют. Используйте активно!",
        },
        uz: {
          jp: "— <ruby>毎日<rt>まいにち</rt></ruby> 14<ruby>時間<rt>じかん</rt></ruby> <ruby>働<rt>はたら</rt></ruby>きます。— たいへんですね！",
          translation: "— Har kuni 14 soat ishlayman. — Qiyin-a!",
          grammarInfo:
            "1. たいへんですね — «qiyin / ogʻir-a?», hamdardlik ifodalaydi\n\n2. ね — gapning oxirida rozilik/hamdardlik yuklamasi\n\n3. 毎日 14時間 — «har kuni 14 soat»\n\n💡 Bu yapon tilidagi eng FOYDALI iboralardan biri. Yaponlar doimiy ravishda ishlatadi — hamdardlik koʻrsatish uchun. Faol ishlating!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "— <ruby>朝<rt>あさ</rt></ruby> 5<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。— たいへんですね。",
            translation: "— Встаю в 5 утра. — Нелегко, да.",
          },
          {
            jp: "— テストは <ruby>毎週<rt>まいしゅう</rt></ruby>です。— たいへんですね。",
            translation: "— Тесты каждую неделю. — Непросто, да.",
          },
          {
            jp: "— <ruby>子供<rt>こども</rt></ruby>が 5<ruby>人<rt>にん</rt></ruby>います。— たいへんですね！",
            translation: "— У меня 5 детей. — Ну и нелегко же вам!",
          },
        ],
        uz: [
          {
            jp: "— <ruby>朝<rt>あさ</rt></ruby> 5<ruby>時<rt>じ</rt></ruby>に <ruby>起<rt>お</rt></ruby>きます。— たいへんですね。",
            translation: "— Ertalab 5 da turaman. — Qiyin-a.",
          },
          {
            jp: "— テストは <ruby>毎週<rt>まいしゅう</rt></ruby>です。— たいへんですね。",
            translation: "— Testlar har hafta. — Ogʻir-a.",
          },
          {
            jp: "— <ruby>子供<rt>こども</rt></ruby>が 5<ruby>人<rt>にん</rt></ruby>います。— たいへんですね！",
            translation: "— 5 ta farzandim bor. — Qiyin-a!",
          },
        ],
      },
    },
    {
      id: 186,
      lesson: 4,
      japanese: "ええと",
      cleanWord: "ええと",
      translations: { ru: "э-э, м-м", uz: "m-m, nima edi" },
      exampleSentences: {
        ru: {
          jp: "— <ruby>電話番号<rt>でんわばんごう</rt></ruby>は？ — ええと... 090-1234-5678 です。",
          translation: "— Номер телефона? — Э-э... 090-1234-5678.",
          grammarInfo:
            "1. ええと — междометие-заполнитель паузы, «э-э / м-м»\n\n2. 電話番号 — «номер телефона»\n\n3. ～は？ — краткая форма вопроса (= ～は何ですか)\n\n💡 В японском есть несколько «заполнителей»: ええと (когда думаете), あのう (когда обращаетесь к кому-то), ちょっと (когда затрудняетесь ответить).",
        },
        uz: {
          jp: "— <ruby>電話番号<rt>でんわばんごう</rt></ruby>は？ — ええと... 090-1234-5678 です。",
          translation: "— Telefon raqamingiz? — M-m... 090-1234-5678.",
          grammarInfo:
            "1. ええと — toʻldiruv undovi, «m-m / nima edi»\n\n2. 電話番号 — «telefon raqami»\n\n3. ～は？ — savolning qisqa shakli (= ～は何ですか)\n\n💡 Yapon tilida bir nechta «toʻldiruvchilar» bor: ええと (oʻylaganingizda), あのう (kimgadir murojaat qilganingizda), ちょっと (javob berishga qiynalganingizda).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "ええと、<ruby>何時<rt>なんじ</rt></ruby>でしたか。",
            translation: "Э-э, который был час?",
          },
          {
            jp: "ええと、<ruby>今日<rt>きょう</rt></ruby>は <ruby>水曜日<rt>すいようび</rt></ruby>です。",
            translation: "М-м, сегодня среда.",
          },
          {
            jp: "ええと、<ruby>名前<rt>なまえ</rt></ruby>は... タナカです。",
            translation: "Э-э, имя... Танака.",
          },
        ],
        uz: [
          {
            jp: "ええと、<ruby>何時<rt>なんじ</rt></ruby>でしたか。",
            translation: "M-m, soat necha edi?",
          },
          {
            jp: "ええと、<ruby>今日<rt>きょう</rt></ruby>は <ruby>水曜日<rt>すいようび</rt></ruby>です。",
            translation: "Nima edi, bugun chorshanba.",
          },
          {
            jp: "ええと、<ruby>名前<rt>なまえ</rt></ruby>は... タナカです。",
            translation: "M-m, ismi... Tanaka.",
          },
        ],
      },
    },
    {
      id: 187,
      lesson: 4,
      japanese: "お<ruby>願<rt>ねが</rt></ruby>いします",
      cleanWord: "お願いします",
      translations: { ru: "Пожалуйста (просьба)", uz: "Iltimos (murojaat)" },
      exampleSentences: {
        ru: {
          jp: "すみません、<ruby>水<rt>みず</rt></ruby>を お<ruby>願<rt>ねが</rt></ruby>いします。— かしこまりました。",
          translation: "Простите, воду, пожалуйста. — Слушаюсь.",
          grammarInfo:
            "1. お願いします — «пожалуйста», при заказе или просьбе\n\n2. 水を — «воду» + を (объект)\n\n3. かしこまりました — «слушаюсь» (ответ обслуживающего персонала)\n\n💡 お願いします — одна из первых фраз, которую нужно знать в Японии. Работает ВЕЗДЕ: в ресторане, магазине, такси, на почте. Универсальное «пожалуйста» при просьбе.",
        },
        uz: {
          jp: "すみません、<ruby>水<rt>みず</rt></ruby>を お<ruby>願<rt>ねが</rt></ruby>いします。— かしこまりました。",
          translation: "Kechirasiz, suv, iltimos. — Tushundim.",
          grammarInfo:
            "1. お願いします — «iltimos», buyurtma yoki soʻrov qilganda\n\n2. 水を — «suv» + を (obyekt)\n\n3. かしこまりました — «tushundim» (xizmat xodimining javobi)\n\n💡 お願いします — Yaponiyada birinchi bilishingiz kerak boʻlgan iboralardan biri. HAMMA JOYDA ishlaydi: restoranda, doʻkonda, taksida, pochtada. Universal «iltimos».",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "コーヒーを お<ruby>願<rt>ねが</rt></ruby>いします。",
            translation: "Кофе, пожалуйста.",
          },
          {
            jp: "これを お<ruby>願<rt>ねが</rt></ruby>いします。",
            translation: "Вот это, пожалуйста.",
          },
          {
            jp: "<ruby>名前<rt>なまえ</rt></ruby>と <ruby>電話番号<rt>でんわばんごう</rt></ruby>を お<ruby>願<rt>ねが</rt></ruby>いします。",
            translation: "Имя и номер телефона, пожалуйста.",
          },
        ],
        uz: [
          {
            jp: "コーヒーを お<ruby>願<rt>ねが</rt></ruby>いします。",
            translation: "Kofe, iltimos.",
          },
          {
            jp: "これを お<ruby>願<rt>ねが</rt></ruby>いします。",
            translation: "Mana buni, iltimos.",
          },
          {
            jp: "<ruby>名前<rt>なまえ</rt></ruby>と <ruby>電話番号<rt>でんわばんごう</rt></ruby>を お<ruby>願<rt>ねが</rt></ruby>いします。",
            translation: "Ism va telefon raqamini, iltimos.",
          },
        ],
      },
    },
    {
      id: 188,
      lesson: 4,
      japanese: "かしこまりました",
      cleanWord: "かしこまりました",
      translations: { ru: "Слушаюсь; Понял", uz: "Tushundim; Xo'p bo'ladi" },
      exampleSentences: {
        ru: {
          jp: "— ラーメンを お<ruby>願<rt>ねが</rt></ruby>いします。— かしこまりました。<ruby>少々<rt>しょうしょう</rt></ruby> お<ruby>待<rt>ま</rt></ruby>ちください。",
          translation: "— Рамен, пожалуйста. — Слушаюсь. Подождите немного.",
          grammarInfo:
            "1. かしこまりました — «слушаюсь/понял», ОЧЕНЬ вежливый ответ\n\n2. 少々お待ちください — «подождите немного, пожалуйста»\n\n3. Используется в сфере обслуживания: рестораны, отели, магазины\n\n💡 Иерархия вежливости ответа «понял»: わかった (друзья) → わかりました (нормально) → かしこまりました (максимальная вежливость, сервис).",
        },
        uz: {
          jp: "— ラーメンを お<ruby>願<rt>ねが</rt></ruby>いします。— かしこまりました。<ruby>少々<rt>しょうしょう</rt></ruby> お<ruby>待<rt>ま</rt></ruby>ちください。",
          translation: "— Ramen, iltimos. — Tushundim. Ozgina kuting.",
          grammarInfo:
            "1. かしこまりました — «tushundim/xoʻp boʻladi», JUDA hurmatli javob\n\n2. 少々お待ちください — «ozgina kuting, iltimos»\n\n3. Xizmat sohasida ishlatiladi: restoranlar, mehmonxonalar, doʻkonlar\n\n💡 «Tushundim» javobining hurmat darajasi: わかった (doʻstlar) → わかりました (oddiy) → かしこまりました (eng hurmatli, xizmat sohasi).",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "— お<ruby>水<rt>みず</rt></ruby>を ください。— かしこまりました。",
            translation: "— Воды, пожалуйста. — Слушаюсь.",
          },
          {
            jp: "— 2<ruby>名<rt>めい</rt></ruby>です。— かしこまりました。こちらへ どうぞ。",
            translation: "— Нас двое. — Понял. Сюда, пожалуйста.",
          },
          {
            jp: "— <ruby>予約<rt>よやく</rt></ruby>を お<ruby>願<rt>ねが</rt></ruby>いします。— かしこまりました。",
            translation: "— Бронирование, пожалуйста. — Слушаюсь.",
          },
        ],
        uz: [
          {
            jp: "— お<ruby>水<rt>みず</rt></ruby>を ください。— かしこまりました。",
            translation: "— Suv bering. — Xoʻp boʻladi.",
          },
          {
            jp: "— 2<ruby>名<rt>めい</rt></ruby>です。— かしこまりました。こちらへ どうぞ。",
            translation: "— 2 kishimiz. — Tushundim. Bu yoqqa marhamat.",
          },
          {
            jp: "— <ruby>予約<rt>よやく</rt></ruby>を お<ruby>願<rt>ねが</rt></ruby>いします。— かしこまりました。",
            translation: "— Band qilmoqchiman. — Xoʻp boʻladi.",
          },
        ],
      },
    },
    {
      id: 189,
      lesson: 4,
      japanese: "<ruby>番号<rt>ばんごう</rt></ruby>",
      cleanWord: "番号",
      translations: { ru: "номер", uz: "raqam" },
      exampleSentences: {
        ru: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>電話番号<rt>でんわばんごう</rt></ruby>は 11<ruby>桁<rt>けた</rt></ruby>です。090 から <ruby>始<rt>はじ</rt></ruby>まります。",
          translation: "Японские номера телефонов — 11 цифр. Начинаются с 090.",
          grammarInfo:
            "1. 番号 — «номер», существительное\n\n2. 電話番号 — «номер телефона», 電話 + 番号\n\n3. 11桁 — «11 цифр/разрядов»\n\n💡 番号 используется для любых номеров: 電話番号 (телефон), 部屋の番号 (комнаты), 学生番号 (студенческий). Универсальное слово!",
        },
        uz: {
          jp: "<ruby>日本<rt>にほん</rt></ruby>の <ruby>電話番号<rt>でんわばんごう</rt></ruby>は 11<ruby>桁<rt>けた</rt></ruby>です。090 から <ruby>始<rt>はじ</rt></ruby>まります。",
          translation:
            "Yaponiya telefon raqamlari 11 xonali. 090 dan boshlanadi.",
          grammarInfo:
            "1. 番号 — «raqam», ot\n\n2. 電話番号 — «telefon raqami», 電話 + 番号\n\n3. 11桁 — «11 xona/razryad»\n\n💡 番号 har qanday raqamlar uchun ishlatiladi: 電話番号 (telefon), 部屋の番号 (xona), 学生番号 (talaba). Universal soʻz!",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>電話番号<rt>でんわばんごう</rt></ruby>は <ruby>何番<rt>なんばん</rt></ruby>ですか。",
            translation: "Какой у вас номер телефона?",
          },
          {
            jp: "<ruby>部屋<rt>へや</rt></ruby>の <ruby>番号<rt>ばんごう</rt></ruby>は 305 です。",
            translation: "Номер комнаты — 305.",
          },
          {
            jp: "<ruby>番号<rt>ばんごう</rt></ruby>を お<ruby>願<rt>ねが</rt></ruby>いします。",
            translation: "Номер, пожалуйста.",
          },
        ],
        uz: [
          {
            jp: "<ruby>電話番号<rt>でんわばんごう</rt></ruby>は <ruby>何番<rt>なんばん</rt></ruby>ですか。",
            translation: "Telefon raqamingiz necha?",
          },
          {
            jp: "<ruby>部屋<rt>へや</rt></ruby>の <ruby>番号<rt>ばんごう</rt></ruby>は 305 です。",
            translation: "Xona raqami — 305.",
          },
          {
            jp: "<ruby>番号<rt>ばんごう</rt></ruby>を お<ruby>願<rt>ねが</rt></ruby>いします。",
            translation: "Raqamni ayting, iltimos.",
          },
        ],
      },
    },
    {
      id: 190,
      lesson: 4,
      japanese: "<ruby>何番<rt>なんばん</rt></ruby>",
      cleanWord: "何番",
      translations: { ru: "какой номер?", uz: "nechanchi raqam?" },
      exampleSentences: {
        ru: {
          jp: "すみません、<ruby>東京<rt>とうきょう</rt></ruby>タワーは <ruby>何番<rt>なんばん</rt></ruby>の バスですか。",
          translation: "Простите, какой номер автобуса до Токийской башни?",
          grammarInfo:
            "1. 何番 — «какой номер?», вопросительное слово\n\n2. 何番の バス — «автобус какого номера?»\n\n3. すみません — «простите» (при обращении)\n\n💡 何番 — спрашивает конкретный номер. 何番ですか = «какой номер?». Ответ: 〜番です (номер такой-то). Пример: 3番のバスです.",
        },
        uz: {
          jp: "すみません、<ruby>東京<rt>とうきょう</rt></ruby>タワーは <ruby>何番<rt>なんばん</rt></ruby>の バスですか。",
          translation: "Kechirasiz, Tokio minorasiga nechanchi avtobus boradi?",
          grammarInfo:
            "1. 何番 — «nechanchi raqam?», soʻroq soʻzi\n\n2. 何番のバス — «nechanchi avtobusmi?»\n\n3. すみません — «kechirasiz» (murojaat qilganda)\n\n💡 何番 — aniq raqamni soʻraydi. 何番ですか = «qaysi raqam?». Javob: 〜番です (shunday raqam). Masalan: 3番のバスです.",
        },
      },
      dictionaryExamples: {
        ru: [
          {
            jp: "<ruby>電話番号<rt>でんわばんごう</rt></ruby>は <ruby>何番<rt>なんばん</rt></ruby>ですか。",
            translation: "Какой номер телефона?",
          },
          {
            jp: "これは <ruby>何番<rt>なんばん</rt></ruby>ですか。",
            translation: "Это какой номер?",
          },
          {
            jp: "<ruby>部屋<rt>へや</rt></ruby>は <ruby>何番<rt>なんばん</rt></ruby>ですか。",
            translation: "Какой номер комнаты?",
          },
        ],
        uz: [
          {
            jp: "<ruby>電話番号<rt>でんわばんごう</rt></ruby>は <ruby>何番<rt>なんばん</rt></ruby>ですか。",
            translation: "Telefon raqami necha?",
          },
          {
            jp: "これは <ruby>何番<rt>なんばん</rt></ruby>ですか。",
            translation: "Bu nechanchi raqam?",
          },
          {
            jp: "<ruby>部屋<rt>へや</rt></ruby>は <ruby>何番<rt>なんばん</rt></ruby>ですか。",
            translation: "Xona raqami necha?",
          },
        ],
      },
    },
  ];

  // Remove accidental duplicated vocabulary entries by id.
  // Keeps the first occurrence to preserve intended lesson mapping.
  (function dedupeWordsDataById() {
    var seenIds = {};
    var uniqueWords = [];

    wordsData.forEach(function (word) {
      if (!word || typeof word.id !== "number") return;
      if (seenIds[word.id]) return;
      seenIds[word.id] = true;
      uniqueWords.push(word);
    });

    wordsData.length = 0;
    Array.prototype.push.apply(wordsData, uniqueWords);
  })();

  // ============================================
  // HIRAGANA DATA
  // ============================================
  const hiraganaData = {
    basic: [
      { char: "あ", romaji: "a" },
      { char: "い", romaji: "i" },
      { char: "う", romaji: "u" },
      { char: "え", romaji: "e" },
      { char: "お", romaji: "o" },
      { char: "か", romaji: "ka" },
      { char: "き", romaji: "ki" },
      { char: "く", romaji: "ku" },
      { char: "け", romaji: "ke" },
      { char: "こ", romaji: "ko" },
      { char: "さ", romaji: "sa" },
      { char: "し", romaji: "shi" },
      { char: "す", romaji: "su" },
      { char: "せ", romaji: "se" },
      { char: "そ", romaji: "so" },
      { char: "た", romaji: "ta" },
      { char: "ち", romaji: "chi" },
      { char: "つ", romaji: "tsu" },
      { char: "て", romaji: "te" },
      { char: "と", romaji: "to" },
      { char: "な", romaji: "na" },
      { char: "に", romaji: "ni" },
      { char: "ぬ", romaji: "nu" },
      { char: "ね", romaji: "ne" },
      { char: "の", romaji: "no" },
      { char: "は", romaji: "ha" },
      { char: "ひ", romaji: "hi" },
      { char: "ふ", romaji: "fu" },
      { char: "へ", romaji: "he" },
      { char: "ほ", romaji: "ho" },
      { char: "ま", romaji: "ma" },
      { char: "み", romaji: "mi" },
      { char: "む", romaji: "mu" },
      { char: "め", romaji: "me" },
      { char: "も", romaji: "mo" },
      { char: "や", romaji: "ya" },
      { char: "ゆ", romaji: "yu" },
      { char: "よ", romaji: "yo" },
      { char: "ら", romaji: "ra" },
      { char: "り", romaji: "ri" },
      { char: "る", romaji: "ru" },
      { char: "れ", romaji: "re" },
      { char: "ろ", romaji: "ro" },
      { char: "わ", romaji: "wa" },
      { char: "を", romaji: "wo" },
      { char: "ん", romaji: "n" },
    ],
    dakuten: [
      { char: "が", romaji: "ga" },
      { char: "ぎ", romaji: "gi" },
      { char: "ぐ", romaji: "gu" },
      { char: "げ", romaji: "ge" },
      { char: "ご", romaji: "go" },
      { char: "ざ", romaji: "za" },
      { char: "じ", romaji: "ji" },
      { char: "ず", romaji: "zu" },
      { char: "ぜ", romaji: "ze" },
      { char: "ぞ", romaji: "zo" },
      { char: "だ", romaji: "da" },
      { char: "ぢ", romaji: "di" },
      { char: "づ", romaji: "du" },
      { char: "で", romaji: "de" },
      { char: "ど", romaji: "do" },
      { char: "ば", romaji: "ba" },
      { char: "び", romaji: "bi" },
      { char: "ぶ", romaji: "bu" },
      { char: "べ", romaji: "be" },
      { char: "ぼ", romaji: "bo" },
      { char: "ぱ", romaji: "pa" },
      { char: "ぴ", romaji: "pi" },
      { char: "ぷ", romaji: "pu" },
      { char: "ぺ", romaji: "pe" },
      { char: "ぽ", romaji: "po" },
    ],
    combo: [
      { char: "きゃ", romaji: "kya" },
      { char: "きゅ", romaji: "kyu" },
      { char: "きょ", romaji: "kyo" },
      { char: "しゃ", romaji: "sha" },
      { char: "しゅ", romaji: "shu" },
      { char: "しょ", romaji: "sho" },
      { char: "ちゃ", romaji: "cha" },
      { char: "ちゅ", romaji: "chu" },
      { char: "ちょ", romaji: "cho" },
      { char: "にゃ", romaji: "nya" },
      { char: "にゅ", romaji: "nyu" },
      { char: "にょ", romaji: "nyo" },
      { char: "ひゃ", romaji: "hya" },
      { char: "ひゅ", romaji: "hyu" },
      { char: "ひょ", romaji: "hyo" },
      { char: "みゃ", romaji: "mya" },
      { char: "みゅ", romaji: "myu" },
      { char: "みょ", romaji: "myo" },
      { char: "りゃ", romaji: "rya" },
      { char: "りゅ", romaji: "ryu" },
      { char: "りょ", romaji: "ryo" },
      { char: "ぎゃ", romaji: "gya" },
      { char: "ぎゅ", romaji: "gyu" },
      { char: "ぎょ", romaji: "gyo" },
      { char: "じゃ", romaji: "ja" },
      { char: "じゅ", romaji: "ju" },
      { char: "じょ", romaji: "jo" },
      { char: "びゃ", romaji: "bya" },
      { char: "びゅ", romaji: "byu" },
      { char: "びょ", romaji: "byo" },
      { char: "ぴゃ", romaji: "pya" },
      { char: "ぴゅ", romaji: "pyu" },
      { char: "ぴょ", romaji: "pyo" },
    ],
  };

  // ============================================
  // KATAKANA DATA
  // ============================================
  const katakanaData = {
    basic: [
      { char: "ア", romaji: "a" },
      { char: "イ", romaji: "i" },
      { char: "ウ", romaji: "u" },
      { char: "エ", romaji: "e" },
      { char: "オ", romaji: "o" },
      { char: "カ", romaji: "ka" },
      { char: "キ", romaji: "ki" },
      { char: "ク", romaji: "ku" },
      { char: "ケ", romaji: "ke" },
      { char: "コ", romaji: "ko" },
      { char: "サ", romaji: "sa" },
      { char: "シ", romaji: "shi" },
      { char: "ス", romaji: "su" },
      { char: "セ", romaji: "se" },
      { char: "ソ", romaji: "so" },
      { char: "タ", romaji: "ta" },
      { char: "チ", romaji: "chi" },
      { char: "ツ", romaji: "tsu" },
      { char: "テ", romaji: "te" },
      { char: "ト", romaji: "to" },
      { char: "ナ", romaji: "na" },
      { char: "ニ", romaji: "ni" },
      { char: "ヌ", romaji: "nu" },
      { char: "ネ", romaji: "ne" },
      { char: "ノ", romaji: "no" },
      { char: "ハ", romaji: "ha" },
      { char: "ヒ", romaji: "hi" },
      { char: "フ", romaji: "fu" },
      { char: "ヘ", romaji: "he" },
      { char: "ホ", romaji: "ho" },
      { char: "マ", romaji: "ma" },
      { char: "ミ", romaji: "mi" },
      { char: "ム", romaji: "mu" },
      { char: "メ", romaji: "me" },
      { char: "モ", romaji: "mo" },
      { char: "ヤ", romaji: "ya" },
      { char: "ユ", romaji: "yu" },
      { char: "ヨ", romaji: "yo" },
      { char: "ラ", romaji: "ra" },
      { char: "リ", romaji: "ri" },
      { char: "ル", romaji: "ru" },
      { char: "レ", romaji: "re" },
      { char: "ロ", romaji: "ro" },
      { char: "ワ", romaji: "wa" },
      { char: "ヲ", romaji: "wo" },
      { char: "ン", romaji: "n" },
    ],
    dakuten: [
      { char: "ガ", romaji: "ga" },
      { char: "ギ", romaji: "gi" },
      { char: "グ", romaji: "gu" },
      { char: "ゲ", romaji: "ge" },
      { char: "ゴ", romaji: "go" },
      { char: "ザ", romaji: "za" },
      { char: "ジ", romaji: "ji" },
      { char: "ズ", romaji: "zu" },
      { char: "ゼ", romaji: "ze" },
      { char: "ゾ", romaji: "zo" },
      { char: "ダ", romaji: "da" },
      { char: "ヂ", romaji: "di" },
      { char: "ヅ", romaji: "du" },
      { char: "デ", romaji: "de" },
      { char: "ド", romaji: "do" },
      { char: "バ", romaji: "ba" },
      { char: "ビ", romaji: "bi" },
      { char: "ブ", romaji: "bu" },
      { char: "ベ", romaji: "be" },
      { char: "ボ", romaji: "bo" },
      { char: "パ", romaji: "pa" },
      { char: "ピ", romaji: "pi" },
      { char: "プ", romaji: "pu" },
      { char: "ペ", romaji: "pe" },
      { char: "ポ", romaji: "po" },
    ],
    combo: [
      { char: "キャ", romaji: "kya" },
      { char: "キュ", romaji: "kyu" },
      { char: "キョ", romaji: "kyo" },
      { char: "シャ", romaji: "sha" },
      { char: "シュ", romaji: "shu" },
      { char: "ショ", romaji: "sho" },
      { char: "チャ", romaji: "cha" },
      { char: "チュ", romaji: "chu" },
      { char: "チョ", romaji: "cho" },
      { char: "ニャ", romaji: "nya" },
      { char: "ニュ", romaji: "nyu" },
      { char: "ニョ", romaji: "nyo" },
      { char: "ヒャ", romaji: "hya" },
      { char: "ヒュ", romaji: "hyu" },
      { char: "ヒョ", romaji: "hyo" },
      { char: "ミャ", romaji: "mya" },
      { char: "ミュ", romaji: "myu" },
      { char: "ミョ", romaji: "myo" },
      { char: "リャ", romaji: "rya" },
      { char: "リュ", romaji: "ryu" },
      { char: "リョ", romaji: "ryo" },
      { char: "ギャ", romaji: "gya" },
      { char: "ギュ", romaji: "gyu" },
      { char: "ギョ", romaji: "gyo" },
      { char: "ジャ", romaji: "ja" },
      { char: "ジュ", romaji: "ju" },
      { char: "ジョ", romaji: "jo" },
      { char: "ビャ", romaji: "bya" },
      { char: "ビュ", romaji: "byu" },
      { char: "ビョ", romaji: "byo" },
      { char: "ピャ", romaji: "pya" },
      { char: "ピュ", romaji: "pyu" },
      { char: "ピョ", romaji: "pyo" },
    ],
  };

  // ============================================
  // KANJI DATA (Lesson 1 - Minna no Nihongo)
  // ============================================
  const kanjiData = [
    {
      kanji: "日",
      reading: "ひ / にち / じつ",
      romaji: "hi / nichi / jitsu",
      meanings: { ru: "день, солнце", uz: "kun, quyosh" },
      lesson: 1,
    },
    {
      kanji: "月",
      reading: "つき / げつ / がつ",
      romaji: "tsuki / getsu / gatsu",
      meanings: { ru: "луна, месяц", uz: "oy, oy" },
      lesson: 1,
    },
    {
      kanji: "木",
      reading: "き / もく / ぼく",
      romaji: "ki / moku / boku",
      meanings: { ru: "дерево", uz: "daraxt" },
      lesson: 1,
    },
    {
      kanji: "山",
      reading: "やま / さん",
      romaji: "yama / san",
      meanings: { ru: "гора", uz: "tog'" },
      lesson: 1,
    },
    {
      kanji: "川",
      reading: "かわ / せん",
      romaji: "kawa / sen",
      meanings: { ru: "река", uz: "daryo" },
      lesson: 1,
    },
    {
      kanji: "田",
      reading: "た / でん",
      romaji: "ta / den",
      meanings: { ru: "рисовое поле", uz: "sholi maydoni" },
      lesson: 1,
    },
    {
      kanji: "人",
      reading: "ひと / じん / にん",
      romaji: "hito / jin / nin",
      meanings: { ru: "человек", uz: "odam" },
      lesson: 1,
    },
    {
      kanji: "口",
      reading: "くち / こう",
      romaji: "kuchi / kou",
      meanings: { ru: "рот, вход", uz: "ogʻiz, kirish" },
      lesson: 1,
    },
    {
      kanji: "車",
      reading: "くるま / しゃ",
      romaji: "kuruma / sha",
      meanings: { ru: "машина, колесо", uz: "mashina, gʻildirak" },
      lesson: 1,
    },
    {
      kanji: "門",
      reading: "かど / もん",
      romaji: "kado / mon",
      meanings: { ru: "ворота", uz: "darvoza" },
      lesson: 1,
    },
    {
      kanji: "火",
      reading: "ひ / か",
      romaji: "hi / ka",
      meanings: { ru: "огонь", uz: "olov" },
      lesson: 2,
    },
    {
      kanji: "水",
      reading: "みず / すい",
      romaji: "mizu / sui",
      meanings: { ru: "вода", uz: "suv" },
      lesson: 2,
    },
    {
      kanji: "金",
      reading: "かね / きん",
      romaji: "kane / kin",
      meanings: { ru: "золото, деньги", uz: "oltin, pul" },
      lesson: 2,
    },
    {
      kanji: "土",
      reading: "つち / ど",
      romaji: "tsuchi / do",
      meanings: { ru: "земля, почва", uz: "yer, tuproq" },
      lesson: 2,
    },
    {
      kanji: "子",
      reading: "こ / し",
      romaji: "ko / shi",
      meanings: { ru: "ребёнок", uz: "bola" },
      lesson: 2,
    },
    {
      kanji: "女",
      reading: "おんな / じょ",
      romaji: "onna / jo",
      meanings: { ru: "женщина, девушка", uz: "ayol, qiz" },
      lesson: 2,
    },
    {
      kanji: "学",
      reading: "がく / まなぶ",
      romaji: "gaku / manabu",
      meanings: { ru: "учёба, изучать", uz: "o'qish, o'rganmoq" },
      lesson: 2,
    },
    {
      kanji: "生",
      reading: "せい / いきる",
      romaji: "sei / ikiru",
      meanings: { ru: "жизнь, рождаться", uz: "hayot, tug'ilmoq" },
      lesson: 2,
    },
    {
      kanji: "先",
      reading: "さき / せん",
      romaji: "saki / sen",
      meanings: { ru: "раньше, впереди", uz: "oldin, avval" },
      lesson: 2,
    },
    {
      kanji: "私",
      reading: "わたし / し",
      romaji: "watashi / shi",
      meanings: { ru: "я, личный", uz: "men, shaxsiy" },
      lesson: 2,
    },
    {
      kanji: "一",
      reading: "いち",
      romaji: "ichi",
      meanings: { ru: "один", uz: "bir" },
      lesson: 3,
    },
    {
      kanji: "二",
      reading: "に",
      romaji: "ni",
      meanings: { ru: "два", uz: "ikki" },
      lesson: 3,
    },
    {
      kanji: "三",
      reading: "さん",
      romaji: "san",
      meanings: { ru: "три", uz: "uch" },
      lesson: 3,
    },
    {
      kanji: "四",
      reading: "よん / し",
      romaji: "yon / shi",
      meanings: { ru: "четыре", uz: "to'rt" },
      lesson: 3,
    },
    {
      kanji: "五",
      reading: "ご",
      romaji: "go",
      meanings: { ru: "пять", uz: "besh" },
      lesson: 3,
    },
    {
      kanji: "六",
      reading: "ろく",
      romaji: "roku",
      meanings: { ru: "шесть", uz: "olti" },
      lesson: 3,
    },
    {
      kanji: "七",
      reading: "なな / しち",
      romaji: "nana / shichi",
      meanings: { ru: "семь", uz: "yetti" },
      lesson: 3,
    },
    {
      kanji: "八",
      reading: "はち",
      romaji: "hachi",
      meanings: { ru: "восемь", uz: "sakkiz" },
      lesson: 3,
    },
    {
      kanji: "九",
      reading: "きゅう / く",
      romaji: "kyuu / ku",
      meanings: { ru: "девять", uz: "to'qqiz" },
      lesson: 3,
    },
    {
      kanji: "十",
      reading: "じゅう",
      romaji: "juu",
      meanings: { ru: "десять", uz: "o'n" },
      lesson: 3,
    },
    {
      kanji: "百",
      reading: "ひゃく",
      romaji: "hyaku",
      meanings: { ru: "сто", uz: "yuz" },
      lesson: 3,
    },
    {
      kanji: "千",
      reading: "せん",
      romaji: "sen",
      meanings: { ru: "тысяча", uz: "ming" },
      lesson: 3,
    },
    {
      kanji: "万",
      reading: "まん",
      romaji: "man",
      meanings: { ru: "десять тысяч", uz: "o'n ming" },
      lesson: 3,
    },
    {
      kanji: "円",
      reading: "えん",
      romaji: "en",
      meanings: { ru: "иена", uz: "iyena" },
      lesson: 3,
    },
    {
      kanji: "年",
      reading: "ねん",
      romaji: "nen",
      meanings: { ru: "год", uz: "yil" },
      lesson: 3,
    },
    {
      kanji: "上",
      reading: "うえ / じょう",
      romaji: "ue / jou",
      meanings: { ru: "верх, наверху", uz: "ust, yuqorida" },
      lesson: 4,
    },
    {
      kanji: "下",
      reading: "した / か",
      romaji: "shita / ka",
      meanings: { ru: "низ, под", uz: "past, ostida" },
      lesson: 4,
    },
    {
      kanji: "中",
      reading: "なか / ちゅう",
      romaji: "naka / chuu",
      meanings: { ru: "середина, внутри", uz: "o`rta, ichida" },
      lesson: 4,
    },
    {
      kanji: "大",
      reading: "おお / だい",
      romaji: "oo / dai",
      meanings: { ru: "большой, крупный", uz: "katta, yirik" },
      lesson: 4,
    },
    {
      kanji: "小",
      reading: "ちい / しょう",
      romaji: "chii / shou",
      meanings: { ru: "маленький, мелкий", uz: "kichik, mayda" },
      lesson: 4,
    },
    {
      kanji: "本",
      reading: "ほん",
      romaji: "hon",
      meanings: { ru: "книга, основа", uz: "kitob, asos" },
      lesson: 4,
    },
    {
      kanji: "半",
      reading: "はん",
      romaji: "han",
      meanings: { ru: "половина", uz: "yarim" },
      lesson: 4,
    },
    {
      kanji: "分",
      reading: "ふん / ぶん",
      romaji: "fun / bun",
      meanings: { ru: "минута, часть", uz: "daqiqa, qism" },
      lesson: 4,
    },
    {
      kanji: "力",
      reading: "ちから / りょく",
      romaji: "chikara / ryoku",
      meanings: { ru: "сила, мощь", uz: "kuch, quvvat" },
      lesson: 4,
    },
    {
      kanji: "何",
      reading: "なに / なん",
      romaji: "nani / nan",
      meanings: { ru: "что, какой", uz: "nima, qanday" },
      lesson: 4,
    },
    {
      kanji: "明",
      reading: "あかるい / めい",
      romaji: "akarui / mei",
      meanings: { ru: "светлый, ясный", uz: "yorug', ravshan" },
      lesson: 5,
    },
    {
      kanji: "休",
      reading: "やすむ / きゅう",
      romaji: "yasumu / kyuu",
      meanings: { ru: "отдых, отдыхать", uz: "dam, dam olmoq" },
      lesson: 5,
    },
    {
      kanji: "体",
      reading: "からだ / たい",
      romaji: "karada / tai",
      meanings: { ru: "тело, организм", uz: "tana, organizm" },
      lesson: 5,
    },
    {
      kanji: "好",
      reading: "すき / こう",
      romaji: "suki / kou",
      meanings: { ru: "любить, нравиться", uz: "yoqtirmoq, sevmoq" },
      lesson: 5,
    },
    {
      kanji: "男",
      reading: "おとこ / だん",
      romaji: "otoko / dan",
      meanings: { ru: "мужчина, мужской", uz: "erkak, erkakcha" },
      lesson: 5,
    },
    {
      kanji: "林",
      reading: "はやし / りん",
      romaji: "hayashi / rin",
      meanings: { ru: "роща, лесок", uz: "to'qay, kichik o'rmon" },
      lesson: 5,
    },
    {
      kanji: "森",
      reading: "もり / しん",
      romaji: "mori / shin",
      meanings: { ru: "лес, чаща", uz: "o'rmon, qalin daraxtzor" },
      lesson: 5,
    },
    {
      kanji: "間",
      reading: "あいだ / ま / かん",
      romaji: "aida / ma / kan",
      meanings: { ru: "между, промежуток", uz: "orasi, tanaffus" },
      lesson: 5,
    },
    {
      kanji: "畑",
      reading: "はたけ",
      romaji: "hatake",
      meanings: { ru: "поле, огород", uz: "dala, ekin maydoni" },
      lesson: 5,
    },
    {
      kanji: "岩",
      reading: "いわ / がん",
      romaji: "iwa / gan",
      meanings: { ru: "скала, камень", uz: "qoya, tosh" },
      lesson: 5,
    },
    {
      kanji: "目",
      reading: "め / もく",
      romaji: "me / moku",
      meanings: { ru: "глаз, взгляд", uz: "koʻz, nigoh" },
      lesson: 6,
    },
    {
      kanji: "耳",
      reading: "みみ / じ",
      romaji: "mimi / ji",
      meanings: { ru: "ухо, слух", uz: "quloq, eshitish" },
      lesson: 6,
    },
    {
      kanji: "手",
      reading: "て / しゅ",
      romaji: "te / shu",
      meanings: { ru: "рука, кисть", uz: "qoʻl, kaft" },
      lesson: 6,
    },
    {
      kanji: "足",
      reading: "あし / そく",
      romaji: "ashi / soku",
      meanings: { ru: "нога, ступня", uz: "oyoq, panja" },
      lesson: 6,
    },
    {
      kanji: "雨",
      reading: "あめ / う",
      romaji: "ame / u",
      meanings: { ru: "дождь", uz: "yomgʻir" },
      lesson: 6,
    },
    {
      kanji: "竹",
      reading: "たけ / ちく",
      romaji: "take / chiku",
      meanings: { ru: "бамбук", uz: "bambuk" },
      lesson: 6,
    },
    {
      kanji: "米",
      reading: "こめ / べい",
      romaji: "kome / bei",
      meanings: { ru: "рис", uz: "guruch" },
      lesson: 6,
    },
    {
      kanji: "貝",
      reading: "かい",
      romaji: "kai",
      meanings: { ru: "ракушка, моллюск", uz: "chigʻanoq, mollyuska" },
      lesson: 6,
    },
    {
      kanji: "石",
      reading: "いし / せき",
      romaji: "ishi / seki",
      meanings: { ru: "камень", uz: "tosh" },
      lesson: 6,
    },
    {
      kanji: "糸",
      reading: "いと / し",
      romaji: "ito / shi",
      meanings: { ru: "нить", uz: "ip" },
      lesson: 6,
    },
    {
      kanji: "花",
      reading: "はな / か",
      romaji: "hana / ka",
      meanings: { ru: "цветок, цветы", uz: "gul, gullar" },
      lesson: 7,
    },
    {
      kanji: "茶",
      reading: "ちゃ / さ",
      romaji: "cha / sa",
      meanings: { ru: "чай", uz: "choy" },
      lesson: 7,
    },
    {
      kanji: "肉",
      reading: "にく",
      romaji: "niku",
      meanings: { ru: "мясо", uz: "go'sht" },
      lesson: 7,
    },
    {
      kanji: "文",
      reading: "ぶん / もん / ふみ",
      romaji: "bun / mon / fumi",
      meanings: { ru: "текст, предложение", uz: "matn, jumla" },
      lesson: 7,
    },
    {
      kanji: "字",
      reading: "じ / あざ",
      romaji: "ji / aza",
      meanings: { ru: "буква, знак", uz: "harf, belgi" },
      lesson: 7,
    },
    {
      kanji: "物",
      reading: "もの / ぶつ",
      romaji: "mono / butsu",
      meanings: { ru: "вещь, предмет", uz: "narsa, buyum" },
      lesson: 7,
    },
    {
      kanji: "牛",
      reading: "うし / ぎゅう",
      romaji: "ushi / gyuu",
      meanings: { ru: "корова, бык", uz: "sigir, buqa" },
      lesson: 7,
    },
    {
      kanji: "馬",
      reading: "うま / ば",
      romaji: "uma / ba",
      meanings: { ru: "лошадь, конь", uz: "ot, yilqi" },
      lesson: 7,
    },
    {
      kanji: "鳥",
      reading: "とり / ちょう",
      romaji: "tori / chou",
      meanings: { ru: "птица", uz: "qush" },
      lesson: 7,
    },
    {
      kanji: "魚",
      reading: "さかな / ぎょ",
      romaji: "sakana / gyo",
      meanings: { ru: "рыба", uz: "baliq" },
      lesson: 7,
    },
    {
      kanji: "新",
      reading: "しん / あたらしい / あらた",
      romaji: "shin / atarashii / arata",
      meanings: { ru: "новый, свежий", uz: "yangi" },
      lesson: 8,
    },
    {
      kanji: "古",
      reading: "こ / ふるい",
      romaji: "ko / furui",
      meanings: { ru: "старый, древний", uz: "eski, qadimiy" },
      lesson: 8,
    },
    {
      kanji: "長",
      reading: "ちょう / ながい",
      romaji: "chou / nagai",
      meanings: { ru: "длинный", uz: "uzun" },
      lesson: 8,
    },
    {
      kanji: "短",
      reading: "たん / みじかい",
      romaji: "tan / mijikai",
      meanings: { ru: "короткий", uz: "qisqa" },
      lesson: 8,
    },
    {
      kanji: "高",
      reading: "こう / たかい",
      romaji: "kou / takai",
      meanings: { ru: "высокий, дорогой", uz: "baland, qimmat" },
      lesson: 8,
    },
    {
      kanji: "安",
      reading: "あん / やすい",
      romaji: "an / yasui",
      meanings: { ru: "дешёвый, спокойный", uz: "arzon, tinch" },
      lesson: 8,
    },
    {
      kanji: "低",
      reading: "てい / ひくい",
      romaji: "tei / hikui",
      meanings: { ru: "низкий", uz: "past" },
      lesson: 8,
    },
    {
      kanji: "暗",
      reading: "あん / くらい",
      romaji: "an / kurai",
      meanings: { ru: "тёмный", uz: "qorong'i" },
      lesson: 8,
    },
    {
      kanji: "多",
      reading: "た / おおい",
      romaji: "ta / ooi",
      meanings: { ru: "много, многочисленный", uz: "ko'p" },
      lesson: 8,
    },
    {
      kanji: "少",
      reading: "しょう / すくない / すこし",
      romaji: "shou / sukunai / sukoshi",
      meanings: { ru: "мало, немного", uz: "oz, biroz" },
      lesson: 8,
    },
    {
      kanji: "行",
      reading: "いく / おこなう",
      romaji: "iku / okonau",
      meanings: { ru: "идти, совершать", uz: "borish, bajarish" },
      lesson: 9,
    },
    {
      kanji: "来",
      reading: "くる / くる",
      romaji: "kuru / kuru",
      meanings: {
        ru: "приходить, наступать",
        uz: "kelmoq, kelib qolmoq",
      },
      lesson: 9,
    },
    {
      kanji: "帰",
      reading: "かえる",
      romaji: "kaeru",
      meanings: {
        ru: "возвращаться, возвращать",
        uz: "qaytmoq, qaytarmoq",
      },
      lesson: 9,
    },
    {
      kanji: "食",
      reading: "たべる / しょく",
      romaji: "taberu / shoku",
      meanings: { ru: "есть, пища", uz: "yemoq, ovqat" },
      lesson: 9,
    },
    {
      kanji: "飲",
      reading: "のむ",
      romaji: "nomu",
      meanings: {
        ru: "пить, употреблять",
        uz: "ichmoq, iste'mol qilmoq",
      },
      lesson: 9,
    },
    {
      kanji: "見",
      reading: "みる / けん",
      romaji: "miru / ken",
      meanings: { ru: "смотреть, видеть", uz: "ko'rmoq, ko'rish" },
      lesson: 9,
    },
    {
      kanji: "聞",
      reading: "きく",
      romaji: "kiku",
      meanings: { ru: "слушать, спрашивать", uz: "eshitmoq, so'ramoq" },
      lesson: 9,
    },
    {
      kanji: "読",
      reading: "よむ",
      romaji: "yomu",
      meanings: { ru: "читать, прочтение", uz: "o'qimoq, o'qish" },
      lesson: 9,
    },
    {
      kanji: "書",
      reading: "かく / しょ",
      romaji: "kaku / sho",
      meanings: { ru: "писать, письмо", uz: "yozmoq, yozuv" },
      lesson: 9,
    },
    {
      kanji: "話",
      reading: "はなす / はなし",
      romaji: "hanasu / hanashi",
      meanings: { ru: "говорить, разговор", uz: "gapirmoq, suhbat" },
      lesson: 9,
    },
    {
      kanji: "買",
      reading: "かう",
      romaji: "kau",
      meanings: { ru: "покупать, покупка", uz: "sotib olmoq, xarid" },
      lesson: 9,
    },
    {
      kanji: "教",
      reading: "おしえる / きょう",
      romaji: "oshieru / kyou",
      meanings: { ru: "учить, обучение", uz: "o'rgatmoq, ta'lim" },
      lesson: 9,
    },
    {
      kanji: "朝",
      reading: "あさ",
      romaji: "asa",
      meanings: { ru: "утро", uz: "ertalab" },
      lesson: 10,
    },
    {
      kanji: "昼",
      reading: "ひる",
      romaji: "hiru",
      meanings: { ru: "день, полдень", uz: "kunduz, peshin" },
      lesson: 10,
    },
    {
      kanji: "夜",
      reading: "よる / よ",
      romaji: "yoru / yo",
      meanings: { ru: "ночь, вечер", uz: "tun, kech" },
      lesson: 10,
    },
    {
      kanji: "晩",
      reading: "ばん",
      romaji: "ban",
      meanings: { ru: "вечер", uz: "kechqurun" },
      lesson: 10,
    },
    {
      kanji: "夕",
      reading: "ゆう",
      romaji: "yuu",
      meanings: { ru: "вечер", uz: "oqshom" },
      lesson: 10,
    },
    {
      kanji: "方",
      reading: "かた / ほう",
      romaji: "kata / hou",
      meanings: { ru: "сторона, направление", uz: "tomon, yo'nalish" },
      lesson: 10,
    },
    {
      kanji: "午",
      reading: "ご",
      romaji: "go",
      meanings: { ru: "полдень", uz: "peshin" },
      lesson: 10,
    },
    {
      kanji: "前",
      reading: "まえ / ぜん",
      romaji: "mae / zen",
      meanings: { ru: "перед, до", uz: "oldin, avval" },
      lesson: 10,
    },
    {
      kanji: "後",
      reading: "あと / ご",
      romaji: "ato / go",
      meanings: { ru: "после, сзади", uz: "keyin, orqa" },
      lesson: 10,
    },
    {
      kanji: "毎",
      reading: "まい",
      romaji: "mai",
      meanings: { ru: "каждый", uz: "har" },
      lesson: 10,
    },
    {
      kanji: "週",
      reading: "しゅう",
      romaji: "shuu",
      meanings: { ru: "неделя", uz: "hafta" },
      lesson: 10,
    },
    {
      kanji: "曜",
      reading: "よう",
      romaji: "you",
      meanings: { ru: "день недели", uz: "hafta kuni" },
      lesson: 10,
    },
    {
      kanji: "作",
      reading: "さく / つくる",
      romaji: "saku / tsukuru",
      meanings: { ru: "делать, создавать", uz: "qilmoq, yaratmoq" },
      lesson: 11,
    },
    {
      kanji: "泳",
      reading: "えい / およぐ",
      romaji: "ei / oyogu",
      meanings: { ru: "плавать", uz: "suzmoq" },
      lesson: 11,
    },
    {
      kanji: "油",
      reading: "ゆ / あぶら",
      romaji: "yu / abura",
      meanings: { ru: "масло, нефть", uz: "yog', neft" },
      lesson: 11,
    },
    {
      kanji: "海",
      reading: "かい / うみ",
      romaji: "kai / umi",
      meanings: { ru: "море, океан", uz: "dengiz, okean" },
      lesson: 11,
    },
    {
      kanji: "酒",
      reading: "しゅ / さけ",
      romaji: "shu / sake",
      meanings: { ru: "алкоголь, сакэ", uz: "spirtli ichimlik, sake" },
      lesson: 11,
    },
    {
      kanji: "待",
      reading: "たい / まつ",
      romaji: "tai / matsu",
      meanings: { ru: "ждать, ожидать", uz: "kutmoq, kutish" },
      lesson: 11,
    },
    {
      kanji: "校",
      reading: "こう",
      romaji: "kou",
      meanings: { ru: "школа", uz: "maktab" },
      lesson: 11,
    },
    {
      kanji: "時",
      reading: "じ / とき",
      romaji: "ji / toki",
      meanings: { ru: "время, час", uz: "vaqt, soat" },
      lesson: 11,
    },
    {
      kanji: "言",
      reading: "げん / いう",
      romaji: "gen / iu",
      meanings: { ru: "говорить, слово", uz: "aytmoq, so'z" },
      lesson: 11,
    },
    {
      kanji: "計",
      reading: "けい / はかる",
      romaji: "kei / hakaru",
      meanings: { ru: "считать, измерять", uz: "hisoblamoq, o'lchamoq" },
      lesson: 11,
    },
    {
      kanji: "語",
      reading: "ご / かたる",
      romaji: "go / kataru",
      meanings: { ru: "язык, слово", uz: "til, so'z" },
      lesson: 11,
    },
    {
      kanji: "飯",
      reading: "はん / めし",
      romaji: "han / meshi",
      meanings: { ru: "рис, еда", uz: "guruch, ovqat" },
      lesson: 11,
    },
    {
      kanji: "宅",
      reading: "たく",
      romaji: "taku",
      meanings: { ru: "дом, жильё", uz: "uy, turar joy" },
      lesson: 12,
    },
    {
      kanji: "客",
      reading: "きゃく",
      romaji: "kyaku",
      meanings: { ru: "гость, клиент", uz: "mehmon, mijoz" },
      lesson: 12,
    },
    {
      kanji: "室",
      reading: "しつ",
      romaji: "shitsu",
      meanings: { ru: "комната, кабинет", uz: "xona, kabinet" },
      lesson: 12,
    },
    {
      kanji: "家",
      reading: "いえ / うち / か",
      romaji: "ie / uchi / ka",
      meanings: { ru: "дом, семья", uz: "uy, oila" },
      lesson: 12,
    },
    {
      kanji: "英",
      reading: "えい",
      romaji: "ei",
      meanings: { ru: "Англия, английский", uz: "Angliya, ingliz" },
      lesson: 12,
    },
    {
      kanji: "薬",
      reading: "くすり / やく",
      romaji: "kusuri / yaku",
      meanings: { ru: "лекарство, медицина", uz: "dori, tibbiyot" },
      lesson: 12,
    },
    {
      kanji: "会",
      reading: "かい / あう",
      romaji: "kai / au",
      meanings: {
        ru: "встреча, встречаться",
        uz: "uchrashuv, yig'ilmoq",
      },
      lesson: 12,
    },
    {
      kanji: "今",
      reading: "いま / こん",
      romaji: "ima / kon",
      meanings: { ru: "сейчас, теперь", uz: "hozir, endi" },
      lesson: 12,
    },
    {
      kanji: "雪",
      reading: "ゆき / せつ",
      romaji: "yuki / setsu",
      meanings: { ru: "снег", uz: "qor" },
      lesson: 12,
    },
    {
      kanji: "曇",
      reading: "くもり / どん",
      romaji: "kumori / don",
      meanings: { ru: "пасмурно, облачно", uz: "bulutli, xira" },
      lesson: 12,
    },
    {
      kanji: "電",
      reading: "でん",
      romaji: "den",
      meanings: { ru: "электричество", uz: "elektr, tok" },
      lesson: 12,
    },
    {
      kanji: "売",
      reading: "うる / ばい",
      romaji: "uru / bai",
      meanings: { ru: "продавать, продажа", uz: "sotmoq, savdo" },
      lesson: 12,
    },
    {
      kanji: "広",
      reading: "ひろ(い) / こう",
      romaji: "hiro(i) / kou",
      meanings: { ru: "широкий, просторный", uz: "keng, kenglik" },
      lesson: 13,
    },
    {
      kanji: "店",
      reading: "みせ / てん",
      romaji: "mise / ten",
      meanings: { ru: "магазин, лавка", uz: "do'kon, magazin" },
      lesson: 13,
    },
    {
      kanji: "度",
      reading: "たび / ど",
      romaji: "tabi / do",
      meanings: { ru: "раз, степень", uz: "marta, daraja" },
      lesson: 13,
    },
    {
      kanji: "病",
      reading: "やまい / びょう",
      romaji: "yamai / byou",
      meanings: { ru: "болезнь", uz: "kasallik" },
      lesson: 13,
    },
    {
      kanji: "疲",
      reading: "つか(れる)",
      romaji: "tsuka(reru)",
      meanings: { ru: "усталость", uz: "charchoq" },
      lesson: 13,
    },
    {
      kanji: "痛",
      reading: "いた(い) / つう",
      romaji: "ita(i) / tsuu",
      meanings: { ru: "боль, болезненный", uz: "og'riq, og'riqli" },
      lesson: 13,
    },
    {
      kanji: "屋",
      reading: "や / おく",
      romaji: "ya / oku",
      meanings: { ru: "лавка, дом", uz: "do'kon, uy" },
      lesson: 13,
    },
    {
      kanji: "国",
      reading: "くに / こく",
      romaji: "kuni / koku",
      meanings: { ru: "страна, государство", uz: "mamlakat, davlat" },
      lesson: 13,
    },
    {
      kanji: "回",
      reading: "まわ(る) / かい",
      romaji: "mawa(ru) / kai",
      meanings: { ru: "раз, вращаться", uz: "marta, aylanish" },
      lesson: 13,
    },
    {
      kanji: "困",
      reading: "こま(る)",
      romaji: "koma(ru)",
      meanings: {
        ru: "затруднение, быть в беде",
        uz: "qiyinchilik, qiynalmoq",
      },
      lesson: 13,
    },
    {
      kanji: "開",
      reading: "ひら(く) / あ(ける) / かい",
      romaji: "hira(ku) / a(keru) / kai",
      meanings: { ru: "открывать, открытие", uz: "ochmoq, ochilish" },
      lesson: 13,
    },
    {
      kanji: "閉",
      reading: "し(める) / と(じる) / へい",
      romaji: "shi(meru) / to(jiru) / hei",
      meanings: { ru: "закрывать, закрытие", uz: "yopmoq, yopilish" },
      lesson: 13,
    },
    {
      kanji: "近",
      reading: "ちか(い) / きん",
      romaji: "chika(i) / kin",
      meanings: { ru: "близкий, рядом", uz: "yaqin, yaqinida" },
      lesson: 14,
    },
    {
      kanji: "遠",
      reading: "とお(い) / えん",
      romaji: "too(i) / en",
      meanings: { ru: "далёкий, далеко", uz: "uzo'q, olis" },
      lesson: 14,
    },
    {
      kanji: "速",
      reading: "はや(い) / そく",
      romaji: "haya(i) / soku",
      meanings: { ru: "быстрый, скорость", uz: "tez, tezlik" },
      lesson: 14,
    },
    {
      kanji: "遅",
      reading: "おそ(い) / ち",
      romaji: "oso(i) / chi",
      meanings: { ru: "медленный, опаздывать", uz: "sekin, kechikmoq" },
      lesson: 14,
    },
    {
      kanji: "道",
      reading: "みち / どう",
      romaji: "michi / dou",
      meanings: { ru: "дорога, путь", uz: "yo'l, yo'nalish" },
      lesson: 14,
    },
    {
      kanji: "青",
      reading: "あお / せい",
      romaji: "ao / sei",
      meanings: { ru: "синий, зелёный", uz: "ko'k, yashil" },
      lesson: 14,
    },
    {
      kanji: "晴",
      reading: "は(れる) / せい",
      romaji: "ha(reru) / sei",
      meanings: {
        ru: "ясная погода, проясняться",
        uz: "ochiq havo, ochilmoq",
      },
      lesson: 14,
    },
    {
      kanji: "静",
      reading: "しず(か) / せい",
      romaji: "shizu(ka) / sei",
      meanings: { ru: "тихий, спокойный", uz: "tinch, sokin" },
      lesson: 14,
    },
    {
      kanji: "寺",
      reading: "てら / じ",
      romaji: "tera / ji",
      meanings: { ru: "храм (буддийский)", uz: "ibodatxona (buddist)" },
      lesson: 14,
    },
    {
      kanji: "持",
      reading: "も(つ) / じ",
      romaji: "mo(tsu) / ji",
      meanings: { ru: "держать, иметь", uz: "ushlamoq, ega bo‘lmoq" },
      lesson: 14,
    },
    {
      kanji: "荷",
      reading: "に / に",
      romaji: "ni / ni",
      meanings: { ru: "багаж, груз", uz: "yuk, bagaj" },
      lesson: 14,
    },
    {
      kanji: "歌",
      reading: "うた / か",
      romaji: "uta / ka",
      meanings: { ru: "песня, петь", uz: "qo'shiq, kuylamoq" },
      lesson: 14,
    },
    {
      kanji: "友",
      reading: "とも / ゆう",
      romaji: "tomo / yuu",
      meanings: { ru: "друг", uz: "do'st" },
      lesson: 15,
    },
    {
      kanji: "父",
      reading: "ちち / とう",
      romaji: "chichi / tou",
      meanings: { ru: "отец", uz: "ota" },
      lesson: 15,
    },
    {
      kanji: "母",
      reading: "はは / ぼ",
      romaji: "haha / bo",
      meanings: { ru: "мать", uz: "ona" },
      lesson: 15,
    },
    {
      kanji: "兄",
      reading: "あに / きょう",
      romaji: "ani / kyou",
      meanings: { ru: "старший брат", uz: "aka" },
      lesson: 15,
    },
    {
      kanji: "姉",
      reading: "あね / し",
      romaji: "ane / shi",
      meanings: { ru: "старшая сестра", uz: "opa" },
      lesson: 15,
    },
    {
      kanji: "弟",
      reading: "おとうと / だい",
      romaji: "otouto / dai",
      meanings: { ru: "младший брат", uz: "uka" },
      lesson: 15,
    },
    {
      kanji: "妹",
      reading: "いもうと / まい",
      romaji: "imouto / mai",
      meanings: { ru: "младшая сестра", uz: "singil" },
      lesson: 15,
    },
    {
      kanji: "夫",
      reading: "おっと / ふ",
      romaji: "otto / fu",
      meanings: { ru: "муж", uz: "er" },
      lesson: 15,
    },
    {
      kanji: "妻",
      reading: "つま / さい",
      romaji: "tsuma / sai",
      meanings: { ru: "жена", uz: "xotin" },
      lesson: 15,
    },
    {
      kanji: "彼",
      reading: "かれ / ひ",
      romaji: "kare / hi",
      meanings: { ru: "он, парень", uz: "u, yigit" },
      lesson: 15,
    },
    {
      kanji: "主",
      reading: "ぬし / しゅ",
      romaji: "nushi / shu",
      meanings: { ru: "хозяин, главный", uz: "egasi, asosiy" },
      lesson: 15,
    },
    {
      kanji: "奥",
      reading: "おく",
      romaji: "oku",
      meanings: { ru: "глубина, супруга", uz: "ichkarisi, xotin" },
      lesson: 15,
    },
    {
      kanji: "元",
      reading: "もと / がん",
      romaji: "moto / gan",
      meanings: { ru: "основа, начало", uz: "asos, boshlanish" },
      lesson: 16,
    },
    {
      kanji: "気",
      reading: "き",
      romaji: "ki",
      meanings: { ru: "дух, настроение", uz: "ruh, kayfiyat" },
      lesson: 16,
    },
    {
      kanji: "有",
      reading: "ある / ゆう",
      romaji: "aru / yuu",
      meanings: { ru: "иметься, быть", uz: "bo'lmoq, mavjud bo'lmoq" },
      lesson: 16,
    },
    {
      kanji: "名",
      reading: "な / めい",
      romaji: "na / mei",
      meanings: { ru: "имя, название", uz: "ism, nom" },
      lesson: 16,
    },
    {
      kanji: "親",
      reading: "おや / しん",
      romaji: "oya / shin",
      meanings: { ru: "родитель, близкий", uz: "ota-ona, yaqin" },
      lesson: 16,
    },
    {
      kanji: "切",
      reading: "きる / せつ",
      romaji: "kiru / setsu",
      meanings: { ru: "резать, обрывать", uz: "kesmoq, uzmoq" },
      lesson: 16,
    },
    {
      kanji: "便",
      reading: "べん / びん",
      romaji: "ben / bin",
      meanings: { ru: "удобство, почта", uz: "qulaylik, pochta" },
      lesson: 16,
    },
    {
      kanji: "利",
      reading: "り",
      romaji: "ri",
      meanings: { ru: "польза, выгода", uz: "foyda, naf" },
      lesson: 16,
    },
    {
      kanji: "不",
      reading: "ふ",
      romaji: "fu",
      meanings: { ru: "не-, отрицание", uz: "no-, inkor" },
      lesson: 16,
    },
    {
      kanji: "若",
      reading: "わかい / じゃく",
      romaji: "wakai / jaku",
      meanings: { ru: "молодой, юный", uz: "yosh, navqiron" },
      lesson: 16,
    },
    {
      kanji: "早",
      reading: "はやい / そう",
      romaji: "hayai / sou",
      meanings: { ru: "ранний, быстрый", uz: "erta, tez" },
      lesson: 16,
    },
    {
      kanji: "忙",
      reading: "いそがしい / ぼう",
      romaji: "isogashii / bou",
      meanings: { ru: "занятой, суетливый", uz: "band, shoshqaloq" },
      lesson: 16,
    },
    {
      kanji: "出",
      reading: "でる / だす",
      romaji: "deru / dasu",
      meanings: { ru: "выходить, выпускать", uz: "chiqmoq, chiqarmoq" },
      lesson: 17,
    },
    {
      kanji: "入",
      reading: "いる / はいる",
      romaji: "iru / hairu",
      meanings: { ru: "входить, вставлять", uz: "kirmoq, solmoq" },
      lesson: 17,
    },
    {
      kanji: "乗",
      reading: "のる / のせる",
      romaji: "noru / noseru",
      meanings: { ru: "садиться, сажать", uz: "minmoq, mindirmoq" },
      lesson: 17,
    },
    {
      kanji: "降",
      reading: "おりる / ふる",
      romaji: "oriru / furu",
      meanings: { ru: "сходить, идти", uz: "tushmoq, yog`moq" },
      lesson: 17,
    },
    {
      kanji: "着",
      reading: "きる / つく",
      romaji: "kiru / tsuku",
      meanings: { ru: "надевать, прибывать", uz: "kiymoq, yetib kelmoq" },
      lesson: 17,
    },
    {
      kanji: "渡",
      reading: "わたる / わたす",
      romaji: "wataru / watasu",
      meanings: {
        ru: "переходить, передавать",
        uz: "kesib o`tmoq, topshirmoq",
      },
      lesson: 17,
    },
    {
      kanji: "通",
      reading: "とおる / かよう",
      romaji: "tooru / kayou",
      meanings: { ru: "проходить, ходить", uz: "o'tmoq, qatnamoq" },
      lesson: 17,
    },
    {
      kanji: "走",
      reading: "はしる",
      romaji: "hashiru",
      meanings: { ru: "бежать", uz: "yugurmoq" },
      lesson: 17,
    },
    {
      kanji: "歩",
      reading: "あるく",
      romaji: "aruku",
      meanings: { ru: "ходить, шагать", uz: "yurmoq, qadam tashlamoq" },
      lesson: 17,
    },
    {
      kanji: "止",
      reading: "とまる / とめる",
      romaji: "tomaru / tomeru",
      meanings: {
        ru: "останавливаться, останавливать",
        uz: "to'xtamoq, to'xtatmoq",
      },
      lesson: 17,
    },
    {
      kanji: "動",
      reading: "うごく / うごかす",
      romaji: "ugoku / ugokasu",
      meanings: {
        ru: "двигаться, двигать",
        uz: "harakatlanmoq, harakatga keltirmoq",
      },
      lesson: 17,
    },
    {
      kanji: "働",
      reading: "はたらく",
      romaji: "hataraku",
      meanings: {
        ru: "работать, трудиться",
        uz: "ishlamoq, mehnat qilmoq",
      },
      lesson: 17,
    },
    {
      kanji: "右",
      reading: "みぎ / う",
      romaji: "migi / u",
      meanings: { ru: "право, правый", uz: "o'ng, o'ng tomon" },
      lesson: 18,
    },
    {
      kanji: "左",
      reading: "ひだり / さ",
      romaji: "hidari / sa",
      meanings: { ru: "лево, левый", uz: "chap, chap tomon" },
      lesson: 18,
    },
    {
      kanji: "東",
      reading: "ひがし / とう",
      romaji: "higashi / tou",
      meanings: { ru: "восток", uz: "sharq" },
      lesson: 18,
    },
    {
      kanji: "西",
      reading: "にし / せい",
      romaji: "nishi / sei",
      meanings: { ru: "запад", uz: "g`arb" },
      lesson: 18,
    },
    {
      kanji: "北",
      reading: "きた / ほく",
      romaji: "kita / hoku",
      meanings: { ru: "север", uz: "shimol" },
      lesson: 18,
    },
    {
      kanji: "南",
      reading: "みなみ / なん",
      romaji: "minami / nan",
      meanings: { ru: "юг", uz: "janub" },
      lesson: 18,
    },
    {
      kanji: "外",
      reading: "そと / がい",
      romaji: "soto / gai",
      meanings: { ru: "снаружи, внешний", uz: "tashqarida, tashqi" },
      lesson: 18,
    },
    {
      kanji: "内",
      reading: "うち / ない",
      romaji: "uchi / nai",
      meanings: { ru: "внутри, внутренний", uz: "ichida, ichki" },
      lesson: 18,
    },
    {
      kanji: "部",
      reading: "ぶ",
      romaji: "bu",
      meanings: { ru: "отдел, часть", uz: "bo'lim, qism" },
      lesson: 18,
    },
    {
      kanji: "駅",
      reading: "えき",
      romaji: "eki",
      meanings: { ru: "станция", uz: "bekat" },
      lesson: 18,
    },
    {
      kanji: "社",
      reading: "しゃ / やしろ",
      romaji: "sha / yashiro",
      meanings: {
        ru: "компания, святилище",
        uz: "kompaniya, ziyoratgoh",
      },
      lesson: 18,
    },
    {
      kanji: "院",
      reading: "いん",
      romaji: "in",
      meanings: { ru: "учреждение, больница", uz: "muassasa, shifoxona" },
      lesson: 18,
    },
    {
      kanji: "地",
      reading: "ち / じ",
      romaji: "chi / ji",
      meanings: { ru: "земля, место", uz: "yer, joy" },
      lesson: 19,
    },
    {
      kanji: "鉄",
      reading: "てつ",
      romaji: "tetsu",
      meanings: { ru: "железо", uz: "temir" },
      lesson: 19,
    },
    {
      kanji: "工",
      reading: "こう / く",
      romaji: "kou / ku",
      meanings: { ru: "ремесло, работа", uz: "hunarmandchilik, ish" },
      lesson: 19,
    },
    {
      kanji: "場",
      reading: "ば / じょう",
      romaji: "ba / jou",
      meanings: { ru: "место, площадка", uz: "joy, maydon" },
      lesson: 19,
    },
    {
      kanji: "図",
      reading: "ず / と",
      romaji: "zu / to",
      meanings: { ru: "схема, рисунок", uz: "chizma, rasm" },
      lesson: 19,
    },
    {
      kanji: "館",
      reading: "かん",
      romaji: "kan",
      meanings: { ru: "здание, учреждение", uz: "bino, muassasa" },
      lesson: 19,
    },
    {
      kanji: "公",
      reading: "こう / おおやけ",
      romaji: "kou / ooyake",
      meanings: { ru: "общественный, официальный", uz: "jamoat, rasmiy" },
      lesson: 19,
    },
    {
      kanji: "園",
      reading: "えん / その",
      romaji: "en / sono",
      meanings: { ru: "сад, парк", uz: "bog" },
      lesson: 19,
    },
    {
      kanji: "住",
      reading: "じゅう / す",
      romaji: "juu / su",
      meanings: { ru: "жить, проживание", uz: "yashamoq, turar" },
      lesson: 19,
    },
    {
      kanji: "所",
      reading: "しょ / ところ",
      romaji: "sho / tokoro",
      meanings: { ru: "место", uz: "joy" },
      lesson: 19,
    },
    {
      kanji: "番",
      reading: "ばん",
      romaji: "ban",
      meanings: { ru: "номер, очередь", uz: "raqam, navbat" },
      lesson: 19,
    },
    {
      kanji: "号",
      reading: "ごう",
      romaji: "gou",
      meanings: { ru: "номер, знак", uz: "raqam, belgi" },
      lesson: 19,
    },
    {
      kanji: "市",
      reading: "し",
      romaji: "shi",
      meanings: { ru: "город, рынок", uz: "shahar, bozor" },
      lesson: 20,
    },
    {
      kanji: "町",
      reading: "まち / ちょう",
      romaji: "machi / chou",
      meanings: { ru: "городок, квартал", uz: "shaharcha, mahalla" },
      lesson: 20,
    },
    {
      kanji: "村",
      reading: "むら / そん",
      romaji: "mura / son",
      meanings: { ru: "деревня, село", uz: "qishloq, ovul" },
      lesson: 20,
    },
    {
      kanji: "区",
      reading: "く",
      romaji: "ku",
      meanings: { ru: "район, округ", uz: "tuman, okrug" },
      lesson: 20,
    },
    {
      kanji: "都",
      reading: "と / みやこ",
      romaji: "to / miyako",
      meanings: { ru: "столица, мегаполис", uz: "poytaxt, metropol" },
      lesson: 20,
    },
    {
      kanji: "府",
      reading: "ふ",
      romaji: "fu",
      meanings: { ru: "префектура, ведомство", uz: "prefektura, idora" },
      lesson: 20,
    },
    {
      kanji: "県",
      reading: "けん",
      romaji: "ken",
      meanings: { ru: "префектура", uz: "prefektura" },
      lesson: 20,
    },
    {
      kanji: "島",
      reading: "しま / とう",
      romaji: "shima / tou",
      meanings: { ru: "остров", uz: "orol" },
      lesson: 20,
    },
    {
      kanji: "京",
      reading: "きょう / けい",
      romaji: "kyou / kei",
      meanings: { ru: "столица, Кё", uz: "poytaxt, Kyou" },
      lesson: 20,
    },
    {
      kanji: "様",
      reading: "さま",
      romaji: "sama",
      meanings: { ru: "господин, форма", uz: "janob, shakl" },
      lesson: 20,
    },
    {
      kanji: "練",
      reading: "れん / ねる",
      romaji: "ren / neru",
      meanings: {
        ru: "тренировать, практика",
        uz: "mashq qilmoq, amaliyot",
      },
      lesson: 21,
    },
    {
      kanji: "習",
      reading: "しゅう / ならう",
      romaji: "shuu / narau",
      meanings: { ru: "учиться, изучать", uz: "o'rganmoq, o'qimoq" },
      lesson: 21,
    },
    {
      kanji: "勉",
      reading: "べん",
      romaji: "ben",
      meanings: { ru: "усердие, старание", uz: "tirishqoqlik, urinish" },
      lesson: 21,
    },
    {
      kanji: "強",
      reading: "きょう / つよい",
      romaji: "kyou / tsuyoi",
      meanings: { ru: "сильный, усиливать", uz: "kuchli, kuchaytirmoq" },
      lesson: 21,
    },
    {
      kanji: "研",
      reading: "けん / とぐ",
      romaji: "ken / togu",
      meanings: { ru: "шлифовать, исследовать", uz: "charxlash, tadqiq" },
      lesson: 21,
    },
    {
      kanji: "究",
      reading: "きゅう / きわめる",
      romaji: "kyuu / kiwameru",
      meanings: {
        ru: "исследовать, углублять",
        uz: "tadqiq qilmoq, chuqurlashtirmoq",
      },
      lesson: 21,
    },
    {
      kanji: "留",
      reading: "りゅう / とめる",
      romaji: "ryuu / tomeru",
      meanings: {
        ru: "оставлять, задерживать",
        uz: "qoldirmoq, ushlab qolmoq",
      },
      lesson: 21,
    },
    {
      kanji: "質",
      reading: "しつ",
      romaji: "shitsu",
      meanings: { ru: "качество, сущность", uz: "sifat, mohiyat" },
      lesson: 21,
    },
    {
      kanji: "問",
      reading: "もん / とう",
      romaji: "mon / tou",
      meanings: { ru: "вопрос, спрашивать", uz: "savol, so'ramoq" },
      lesson: 21,
    },
    {
      kanji: "題",
      reading: "だい",
      romaji: "dai",
      meanings: { ru: "тема, задача", uz: "mavzu, masala" },
      lesson: 21,
    },
    {
      kanji: "答",
      reading: "とう / こたえ / こたえる",
      romaji: "tou / kotae / kotaeru",
      meanings: { ru: "ответ, отвечать", uz: "javob, javob bermoq" },
      lesson: 21,
    },
    {
      kanji: "宿",
      reading: "しゅく / やど / やどる",
      romaji: "shuku / yado / yadoru",
      meanings: { ru: "жильё, ночлег", uz: "turar joy, tunash" },
      lesson: 21,
    },
    {
      kanji: "政",
      reading: "せい / まつりごと",
      romaji: "sei / matsurigoto",
      meanings: { ru: "политика, управление", uz: "siyosat, boshqaruv" },
      lesson: 22,
    },
    {
      kanji: "治",
      reading: "ち / おさめる / なおる",
      romaji: "chi / osameru / naoru",
      meanings: { ru: "управлять, лечить", uz: "boshqarmoq, davolamoq" },
      lesson: 22,
    },
    {
      kanji: "経",
      reading: "けい / へる",
      romaji: "kei / heru",
      meanings: { ru: "экономика, проходить", uz: "iqtisod, o'tmoq" },
      lesson: 22,
    },
    {
      kanji: "済",
      reading: "さい / すむ",
      romaji: "sai / sumu",
      meanings: {
        ru: "закончиться, спасение",
        uz: "tugamoq, qutqarilish",
      },
      lesson: 22,
    },
    {
      kanji: "歴",
      reading: "れき",
      romaji: "reki",
      meanings: { ru: "история, биография", uz: "tarix, tarjimai hol" },
      lesson: 22,
    },
    {
      kanji: "史",
      reading: "し",
      romaji: "shi",
      meanings: { ru: "история, летопись", uz: "tarix, yilnoma" },
      lesson: 22,
    },
    {
      kanji: "育",
      reading: "いく / そだつ / そだてる",
      romaji: "iku / sodatsu / sodateru",
      meanings: { ru: "воспитывать, расти", uz: "tarbiyalamoq, o'smoq" },
      lesson: 22,
    },
    {
      kanji: "化",
      reading: "か / ばける",
      romaji: "ka / bakeru",
      meanings: {
        ru: "изменение, превращаться",
        uz: "o'zgarish, aylanmoq",
      },
      lesson: 22,
    },
    {
      kanji: "理",
      reading: "り",
      romaji: "ri",
      meanings: { ru: "логика, причина", uz: "mantiq, sabab" },
      lesson: 22,
    },
    {
      kanji: "科",
      reading: "か",
      romaji: "ka",
      meanings: { ru: "раздел, предмет", uz: "bo'lim, fan" },
      lesson: 22,
    },
    {
      kanji: "数",
      reading: "すう / かず / かぞえる",
      romaji: "suu / kazu / kazoeru",
      meanings: { ru: "число, считать", uz: "son, sanamoq" },
      lesson: 22,
    },
    {
      kanji: "医",
      reading: "い",
      romaji: "i",
      meanings: { ru: "медицина, врач", uz: "tibbiyot, shifokor" },
      lesson: 22,
    },
  ];

  // ============================================
  // HIRAGANA WORDS QUIZ DATA
  // ============================================
  const hiraganaWordsQuiz = [
    {
      word: "さくら",
      reading: "sakura",
      meanings: { ru: "сакура, вишня", uz: "sakura, olcha" },
      info: {
        ru: "базовые слоги さ, く, ら",
        uz: "oddiy bo'g'inlar さ, く, ら",
      },
    },
    {
      word: "がいこく",
      reading: "gaikoku",
      meanings: { ru: "заграница", uz: "chet el" },
      info: { ru: "дакутэн が", uz: "dakuten が" },
    },
    {
      word: "きょう",
      reading: "kyou",
      meanings: { ru: "сегодня", uz: "bugun" },
      info: {
        ru: "комбинация きょ + долгая おう",
        uz: "kombinatsiya きょ + uzun おう",
      },
    },
    {
      word: "きって",
      reading: "kitte",
      meanings: { ru: "марка (почтовая)", uz: "pochta markasi" },
      info: {
        ru: "っ — удвоение согласного tt",
        uz: "っ — undosh ikkilanishi tt",
      },
    },
    {
      word: "せんせい",
      reading: "sensei",
      meanings: { ru: "учитель, преподаватель", uz: "o'qituvchi" },
      info: { ru: "ん + долгая えい", uz: "ん + uzun えい" },
    },
    {
      word: "さんぽ",
      reading: "sanpo",
      meanings: { ru: "прогулка", uz: "sayr" },
      info: { ru: "ん + хандакутэн ぽ", uz: "ん + handakuten ぽ" },
    },
    {
      word: "おとうさん",
      reading: "otousan",
      meanings: { ru: "отец (вежл.)", uz: "ota (hurmatli)" },
      info: { ru: "долгая おう + ん", uz: "uzun おう + ん" },
    },
    {
      word: "しゃしん",
      reading: "shashin",
      meanings: { ru: "фотография", uz: "surat, fotosurat" },
      info: { ru: "комбинация しゃ + ん", uz: "kombinatsiya しゃ + ん" },
    },
    {
      word: "みず",
      reading: "mizu",
      meanings: { ru: "вода", uz: "suv" },
      info: { ru: "дакутэн ず", uz: "dakuten ず" },
    },
    {
      word: "りょこう",
      reading: "ryokou",
      meanings: { ru: "путешествие", uz: "sayohat" },
      info: {
        ru: "комбинация りょ + долгая おう",
        uz: "kombinatsiya りょ + uzun おう",
      },
    },
    {
      word: "いっぱい",
      reading: "ippai",
      meanings: { ru: "много, полный", uz: "ko'p, to'la" },
      info: { ru: "っ + хандакутэн ぱ", uz: "っ + handakuten ぱ" },
    },
    {
      word: "なつ",
      reading: "natsu",
      meanings: { ru: "лето", uz: "yoz" },
      info: {
        ru: "базовый слог な + つ (tsu)",
        uz: "oddiy な + つ (tsu)",
      },
    },
    {
      word: "でんわ",
      reading: "denwa",
      meanings: { ru: "телефон", uz: "telefon" },
      info: { ru: "дакутэн で + ん", uz: "dakuten で + ん" },
    },
    {
      word: "ちゅうがく",
      reading: "chuugaku",
      meanings: { ru: "средняя школа", uz: "o'rta maktab" },
      info: {
        ru: "комбинация ちゅ + долгая うう + дакутэн が",
        uz: "kombinatsiya ちゅ + uzun うう + dakuten が",
      },
    },
    {
      word: "ふゆ",
      reading: "fuyu",
      meanings: { ru: "зима", uz: "qish" },
      info: { ru: "базовый слог ふ (fu)", uz: "oddiy bo'g'in ふ (fu)" },
    },
    {
      word: "ざっし",
      reading: "zasshi",
      meanings: { ru: "журнал", uz: "jurnal" },
      info: {
        ru: "дакутэн ざ + っ (удвоение ss)",
        uz: "dakuten ざ + っ (ikkilanish ss)",
      },
    },
    {
      word: "きゅう",
      reading: "kyuu",
      meanings: { ru: "девять", uz: "to'qqiz" },
      info: {
        ru: "комбинация きゅ + долгая うう",
        uz: "kombinatsiya きゅ + uzun うう",
      },
    },
    {
      word: "はな",
      reading: "hana",
      meanings: { ru: "цветок; нос", uz: "gul; burun" },
      info: { ru: "базовые слоги は, な", uz: "oddiy bo'g'inlar は, な" },
    },
    {
      word: "ごはん",
      reading: "gohan",
      meanings: { ru: "рис; еда", uz: "guruch; ovqat" },
      info: { ru: "дакутэн ご + ん", uz: "dakuten ご + ん" },
    },
    {
      word: "しゅくだい",
      reading: "shukudai",
      meanings: { ru: "домашнее задание", uz: "uy vazifasi" },
      info: {
        ru: "комбинация しゅ + дакутэн だ",
        uz: "kombinatsiya しゅ + dakuten だ",
      },
    },
    {
      word: "まち",
      reading: "machi",
      meanings: { ru: "город, городок", uz: "shahar" },
      info: {
        ru: "базовые слоги ま, ち (chi)",
        uz: "oddiy bo'g'inlar ま, ち (chi)",
      },
    },
    {
      word: "びょういん",
      reading: "byouin",
      meanings: { ru: "больница", uz: "kasalxona" },
      info: {
        ru: "дакутэн び + комбинация びょ + долгая おう",
        uz: "dakuten び + kombinatsiya びょ + uzun おう",
      },
    },
    {
      word: "きっぷ",
      reading: "kippu",
      meanings: { ru: "билет", uz: "chipta" },
      info: { ru: "っ + хандакутэн ぷ", uz: "っ + handakuten ぷ" },
    },
    {
      word: "ひる",
      reading: "hiru",
      meanings: { ru: "полдень, день", uz: "tush, kunduz" },
      info: { ru: "базовые слоги ひ, る", uz: "oddiy bo'g'inlar ひ, る" },
    },
    {
      word: "じゅぎょう",
      reading: "jugyou",
      meanings: { ru: "урок, занятие", uz: "dars" },
      info: {
        ru: "комбинации じゅ, ぎょ + долгая おう",
        uz: "kombinatsiyalar じゅ, ぎょ + uzun おう",
      },
    },
    {
      word: "うみ",
      reading: "umi",
      meanings: { ru: "море", uz: "dengiz" },
      info: { ru: "базовые слоги う, み", uz: "oddiy bo'g'inlar う, み" },
    },
    {
      word: "てんぷら",
      reading: "tenpura",
      meanings: { ru: "тэмпура", uz: "tempura" },
      info: { ru: "ん + хандакутэн ぷ", uz: "ん + handakuten ぷ" },
    },
    {
      word: "りょうり",
      reading: "ryouri",
      meanings: { ru: "кулинария, готовка", uz: "pazandachilik" },
      info: {
        ru: "комбинация りょ + долгая おう",
        uz: "kombinatsiya りょ + uzun おう",
      },
    },
    {
      word: "やっと",
      reading: "yatto",
      meanings: { ru: "наконец, с трудом", uz: "nihoyat" },
      info: {
        ru: "っ — удвоение согласного tt",
        uz: "っ — undosh ikkilanishi tt",
      },
    },
    {
      word: "かぜ",
      reading: "kaze",
      meanings: { ru: "ветер; простуда", uz: "shamol; shamollash" },
      info: { ru: "дакутэн ぜ", uz: "dakuten ぜ" },
    },
    {
      word: "にゅういん",
      reading: "nyuuin",
      meanings: { ru: "госпитализация", uz: "kasalxonaga yotish" },
      info: {
        ru: "комбинация にゅ + долгая うう + ん",
        uz: "kombinatsiya にゅ + uzun うう + ん",
      },
    },
    {
      word: "そら",
      reading: "sora",
      meanings: { ru: "небо", uz: "osmon" },
      info: { ru: "базовые слоги そ, ら", uz: "oddiy bo'g'inlar そ, ら" },
    },
    {
      word: "ぜんぶ",
      reading: "zenbu",
      meanings: { ru: "всё, целиком", uz: "hammasi" },
      info: { ru: "дакутэн ぜ, ぶ + ん", uz: "dakuten ぜ, ぶ + ん" },
    },
    {
      word: "ちょっと",
      reading: "chotto",
      meanings: { ru: "немного, чуть-чуть", uz: "biroz, ozgina" },
      info: {
        ru: "комбинация ちょ + っ (удвоение tt)",
        uz: "kombinatsiya ちょ + っ (ikkilanish tt)",
      },
    },
    {
      word: "おかあさん",
      reading: "okaasan",
      meanings: { ru: "мама (вежл.)", uz: "ona (hurmatli)" },
      info: { ru: "долгая ああ + ん", uz: "uzun ああ + ん" },
    },
    {
      word: "えんぴつ",
      reading: "enpitsu",
      meanings: { ru: "карандаш", uz: "qalam" },
      info: { ru: "ん + хандакутэн ぴ", uz: "ん + handakuten ぴ" },
    },
    {
      word: "やま",
      reading: "yama",
      meanings: { ru: "гора", uz: "tog'" },
      info: { ru: "базовые слоги や, ま", uz: "oddiy bo'g'inlar や, ま" },
    },
    {
      word: "だいがく",
      reading: "daigaku",
      meanings: { ru: "университет", uz: "universitet" },
      info: { ru: "дакутэн だ, が", uz: "dakuten だ, が" },
    },
    {
      word: "ひゃく",
      reading: "hyaku",
      meanings: { ru: "сто", uz: "yuz" },
      info: { ru: "комбинация ひゃ", uz: "kombinatsiya ひゃ" },
    },
    {
      word: "いっしょ",
      reading: "issho",
      meanings: { ru: "вместе", uz: "birga" },
      info: { ru: "っ + комбинация しょ", uz: "っ + kombinatsiya しょ" },
    },
    {
      word: "くも",
      reading: "kumo",
      meanings: { ru: "облако", uz: "bulut" },
      info: { ru: "базовые слоги く, も", uz: "oddiy bo'g'inlar く, も" },
    },
    {
      word: "ぎんこう",
      reading: "ginkou",
      meanings: { ru: "банк", uz: "bank" },
      info: {
        ru: "дакутэн ぎ + ん + долгая おう",
        uz: "dakuten ぎ + ん + uzun おう",
      },
    },
    {
      word: "みょうじ",
      reading: "myouji",
      meanings: { ru: "фамилия", uz: "familiya" },
      info: {
        ru: "комбинация みょ + долгая おう",
        uz: "kombinatsiya みょ + uzun おう",
      },
    },
    {
      word: "あさ",
      reading: "asa",
      meanings: { ru: "утро", uz: "ertalab" },
      info: { ru: "базовые слоги あ, さ", uz: "oddiy bo'g'inlar あ, さ" },
    },
    {
      word: "ぶた",
      reading: "buta",
      meanings: { ru: "свинья", uz: "cho'chqa" },
      info: { ru: "дакутэн ぶ", uz: "dakuten ぶ" },
    },
    {
      word: "おちゃ",
      reading: "ocha",
      meanings: { ru: "чай (японский)", uz: "choy" },
      info: { ru: "комбинация ちゃ", uz: "kombinatsiya ちゃ" },
    },
    {
      word: "にっぽん",
      reading: "nippon",
      meanings: { ru: "Япония", uz: "Yaponiya" },
      info: {
        ru: "っ + хандакутэн ぽ + ん",
        uz: "っ + handakuten ぽ + ん",
      },
    },
    {
      word: "よる",
      reading: "yoru",
      meanings: { ru: "ночь", uz: "tun, kecha" },
      info: { ru: "базовые слоги よ, る", uz: "oddiy bo'g'inlar よ, る" },
    },
    {
      word: "しゅっちょう",
      reading: "shucchou",
      meanings: { ru: "командировка", uz: "xizmat safari" },
      info: {
        ru: "комбинации しゅ, ちょ + っ + долгая おう",
        uz: "kombinatsiyalar しゅ, ちょ + っ + uzun おう",
      },
    },
    {
      word: "いぬ",
      reading: "inu",
      meanings: { ru: "собака", uz: "it, kuchuk" },
      info: { ru: "базовые слоги い, ぬ", uz: "oddiy bo'g'inlar い, ぬ" },
    },
    {
      word: "でぐち",
      reading: "deguchi",
      meanings: { ru: "выход", uz: "chiqish" },
      info: { ru: "дакутэн で, ぐ", uz: "dakuten で, ぐ" },
    },
    {
      word: "しゅうまつ",
      reading: "shuumatsu",
      meanings: { ru: "выходные", uz: "dam olish kunlari" },
      info: {
        ru: "комбинация しゅ + долгая うう",
        uz: "kombinatsiya しゅ + uzun うう",
      },
    },
    {
      word: "にっき",
      reading: "nikki",
      meanings: { ru: "дневник", uz: "kundalik" },
      info: {
        ru: "っ — удвоение согласного kk",
        uz: "っ — undosh ikkilanishi kk",
      },
    },
    {
      word: "おおきい",
      reading: "ookii",
      meanings: { ru: "большой", uz: "katta" },
      info: {
        ru: "долгая おお + долгая いい",
        uz: "uzun おお + uzun いい",
      },
    },
    {
      word: "しんぱい",
      reading: "shinpai",
      meanings: { ru: "беспокойство", uz: "tashvish, xavotir" },
      info: { ru: "ん + хандакутэн ぱ", uz: "ん + handakuten ぱ" },
    },
    {
      word: "きょうしつ",
      reading: "kyoushitsu",
      meanings: { ru: "классная комната", uz: "sinf xonasi" },
      info: {
        ru: "комбинация きょ + долгая おう",
        uz: "kombinatsiya きょ + uzun おう",
      },
    },
    {
      word: "かぎ",
      reading: "kagi",
      meanings: { ru: "ключ", uz: "kalit" },
      info: { ru: "дакутэн ぎ", uz: "dakuten ぎ" },
    },
    {
      word: "りゅうがく",
      reading: "ryuugaku",
      meanings: { ru: "учёба за рубежом", uz: "chet elda o'qish" },
      info: {
        ru: "комбинация りゅ + долгая うう + дакутэн が",
        uz: "kombinatsiya りゅ + uzun うう + dakuten が",
      },
    },
    {
      word: "はっぴゃく",
      reading: "happyaku",
      meanings: { ru: "восемьсот", uz: "sakkiz yuz" },
      info: {
        ru: "っ + хандакутэн ぴ + комбинация ぴゃ",
        uz: "っ + handakuten ぴ + kombinatsiya ぴゃ",
      },
    },
    {
      word: "おんがく",
      reading: "ongaku",
      meanings: { ru: "музыка", uz: "musiqa" },
      info: { ru: "ん + дакутэн が", uz: "ん + dakuten が" },
    },
    {
      word: "ねこ",
      reading: "neko",
      meanings: { ru: "кот, кошка", uz: "mushuk" },
      info: { ru: "базовые слоги ね, こ", uz: "oddiy bo'g'inlar ね, こ" },
    },
    {
      word: "しょくどう",
      reading: "shokudou",
      meanings: { ru: "столовая", uz: "oshxona" },
      info: {
        ru: "комбинация しょ + долгая おう",
        uz: "kombinatsiya しょ + uzun おう",
      },
    },
    {
      word: "まっすぐ",
      reading: "massugu",
      meanings: { ru: "прямо", uz: "to'g'ri" },
      info: {
        ru: "っ (удвоение ss) + дакутэн ぐ",
        uz: "っ (ikkilanish ss) + dakuten ぐ",
      },
    },
    {
      word: "おにいさん",
      reading: "oniisan",
      meanings: { ru: "старший брат (вежл.)", uz: "aka (hurmatli)" },
      info: { ru: "долгая いい + ん", uz: "uzun いい + ん" },
    },
    {
      word: "きゃく",
      reading: "kyaku",
      meanings: { ru: "гость, клиент", uz: "mehmon" },
      info: { ru: "комбинация きゃ", uz: "kombinatsiya きゃ" },
    },
    {
      word: "ぶんがく",
      reading: "bungaku",
      meanings: { ru: "литература", uz: "adabiyot" },
      info: { ru: "дакутэн ぶ, が + ん", uz: "dakuten ぶ, が + ん" },
    },
    {
      word: "ちゃいろ",
      reading: "chairo",
      meanings: { ru: "коричневый цвет", uz: "jigarrang" },
      info: { ru: "комбинация ちゃ", uz: "kombinatsiya ちゃ" },
    },
    {
      word: "がっき",
      reading: "gakki",
      meanings: { ru: "музыкальный инструмент", uz: "musiqa asbobi" },
      info: {
        ru: "дакутэн が + っ (удвоение kk)",
        uz: "dakuten が + っ (ikkilanish kk)",
      },
    },
    {
      word: "こうえん",
      reading: "kouen",
      meanings: { ru: "парк", uz: "bog', park" },
      info: { ru: "долгая おう + ん", uz: "uzun おう + ん" },
    },
    {
      word: "ぎゅうにゅう",
      reading: "gyuunyuu",
      meanings: { ru: "молоко", uz: "sut" },
      info: {
        ru: "комбинации ぎゅ, にゅ + дакутэн ぎ + долгая うう",
        uz: "kombinatsiyalar ぎゅ, にゅ + dakuten ぎ + uzun うう",
      },
    },
    {
      word: "かわ",
      reading: "kawa",
      meanings: { ru: "река", uz: "daryo" },
      info: { ru: "базовые слоги か, わ", uz: "oddiy bo'g'inlar か, わ" },
    },
    {
      word: "ざんねん",
      reading: "zannen",
      meanings: { ru: "к сожалению; жаль", uz: "afsuski" },
      info: {
        ru: "дакутэн ざ + ん (дважды)",
        uz: "dakuten ざ + ん (ikki marta)",
      },
    },
    {
      word: "ちゅうしゃ",
      reading: "chuusha",
      meanings: { ru: "укол; парковка", uz: "ukol; to'xtash joyi" },
      info: {
        ru: "комбинации ちゅ, しゃ + долгая うう",
        uz: "kombinatsiyalar ちゅ, しゃ + uzun うう",
      },
    },
    {
      word: "もっと",
      reading: "motto",
      meanings: { ru: "ещё, больше", uz: "yana, ko'proq" },
      info: {
        ru: "っ — удвоение согласного tt",
        uz: "っ — undosh ikkilanishi tt",
      },
    },
    {
      word: "おねえさん",
      reading: "oneesan",
      meanings: { ru: "старшая сестра (вежл.)", uz: "opa (hurmatli)" },
      info: { ru: "долгая ええ + ん", uz: "uzun ええ + ん" },
    },
    {
      word: "しっぱい",
      reading: "shippai",
      meanings: { ru: "неудача, провал", uz: "muvaffaqiyatsizlik" },
      info: {
        ru: "っ (удвоение pp) + хандакутэн ぱ",
        uz: "っ (ikkilanish pp) + handakuten ぱ",
      },
    },
    {
      word: "みっつ",
      reading: "mittsu",
      meanings: { ru: "три (штуки)", uz: "uchta" },
      info: {
        ru: "っ — удвоение согласного tt",
        uz: "っ — undosh ikkilanishi tt",
      },
    },
    {
      word: "がんばる",
      reading: "ganbaru",
      meanings: { ru: "стараться, не сдаваться", uz: "harakat qilmoq" },
      info: { ru: "дакутэн が, ば + ん", uz: "dakuten が, ば + ん" },
    },
    {
      word: "きんようび",
      reading: "kinyoubi",
      meanings: { ru: "пятница", uz: "juma" },
      info: { ru: "ん + долгая おう", uz: "ん + uzun おう" },
    },
    {
      word: "しゅっぱつ",
      reading: "shuppatsu",
      meanings: { ru: "отправление", uz: "jo'nash" },
      info: {
        ru: "комбинация しゅ + っ (удвоение pp) + хандакутэн ぱ",
        uz: "kombinatsiya しゅ + っ (ikkilanish pp) + handakuten ぱ",
      },
    },
    {
      word: "たかい",
      reading: "takai",
      meanings: { ru: "высокий; дорогой", uz: "baland; qimmat" },
      info: {
        ru: "базовые слоги た, か + い-прилагательное",
        uz: "oddiy bo'g'inlar た, か + い-sifat",
      },
    },
    {
      word: "じてんしゃ",
      reading: "jitensha",
      meanings: { ru: "велосипед", uz: "velosiped" },
      info: {
        ru: "дакутэн じ + ん + комбинация しゃ",
        uz: "dakuten じ + ん + kombinatsiya しゃ",
      },
    },
    {
      word: "いっしゅうかん",
      reading: "isshuukan",
      meanings: { ru: "одна неделя", uz: "bir hafta" },
      info: {
        ru: "っ + комбинация しゅ + долгая うう + ん",
        uz: "っ + kombinatsiya しゅ + uzun うう + ん",
      },
    },
    {
      word: "おおい",
      reading: "ooi",
      meanings: { ru: "многочисленный", uz: "ko'p" },
      info: { ru: "долгая おお", uz: "uzun おお" },
    },
    {
      word: "べんきょう",
      reading: "benkyou",
      meanings: { ru: "учёба, занятие", uz: "o'qish, o'rganish" },
      info: {
        ru: "дакутэн べ + ん + комбинация きょ + долгая おう",
        uz: "dakuten べ + ん + kombinatsiya きょ + uzun おう",
      },
    },
    {
      word: "なまえ",
      reading: "namae",
      meanings: { ru: "имя", uz: "ism, nom" },
      info: {
        ru: "базовые слоги な, ま, え",
        uz: "oddiy bo'g'inlar な, ま, え",
      },
    },
    {
      word: "じゅっぷん",
      reading: "juppun",
      meanings: { ru: "десять минут", uz: "o'n daqiqa" },
      info: {
        ru: "комбинация じゅ + っ (удвоение pp) + хандакутэн ぷ + ん",
        uz: "kombinatsiya じゅ + っ (ikkilanish pp) + handakuten ぷ + ん",
      },
    },
    {
      word: "にちようび",
      reading: "nichiyoubi",
      meanings: { ru: "воскресенье", uz: "yakshanba" },
      info: { ru: "долгая おう", uz: "uzun おう" },
    },
    {
      word: "どようび",
      reading: "doyoubi",
      meanings: { ru: "суббота", uz: "shanba" },
      info: {
        ru: "дакутэн ど + долгая おう",
        uz: "dakuten ど + uzun おう",
      },
    },
    {
      word: "にほんご",
      reading: "nihongo",
      meanings: { ru: "японский язык", uz: "yapon tili" },
      info: { ru: "ん + дакутэн ご", uz: "ん + dakuten ご" },
    },
    {
      word: "みっか",
      reading: "mikka",
      meanings: {
        ru: "третье число; три дня",
        uz: "uchinchi kun; uch kun",
      },
      info: {
        ru: "っ — удвоение согласного kk",
        uz: "っ — undosh ikkilanishi kk",
      },
    },
    {
      word: "ひこうき",
      reading: "hikouki",
      meanings: { ru: "самолёт", uz: "samolyot" },
      info: { ru: "долгая おう", uz: "uzun おう" },
    },
    {
      word: "ちいさい",
      reading: "chiisai",
      meanings: { ru: "маленький", uz: "kichik" },
      info: {
        ru: "долгая いい + い-прилагательное",
        uz: "uzun いい + い-sifat",
      },
    },
    {
      word: "すずしい",
      reading: "suzushii",
      meanings: { ru: "прохладный", uz: "salqin" },
      info: {
        ru: "дакутэн ず + долгая いい",
        uz: "dakuten ず + uzun いい",
      },
    },
    {
      word: "りょかん",
      reading: "ryokan",
      meanings: { ru: "японская гостиница", uz: "yapon mehmonxonasi" },
      info: { ru: "комбинация りょ + ん", uz: "kombinatsiya りょ + ん" },
    },
    {
      word: "はっきり",
      reading: "hakkiri",
      meanings: { ru: "чётко, ясно", uz: "aniq, ravshan" },
      info: {
        ru: "っ — удвоение согласного kk",
        uz: "っ — undosh ikkilanishi kk",
      },
    },
    {
      word: "ちゃわん",
      reading: "chawan",
      meanings: { ru: "чашка (для чая/риса)", uz: "piyola, kosa" },
      info: { ru: "комбинация ちゃ + ん", uz: "kombinatsiya ちゃ + ん" },
    },
    {
      word: "しょうがっこう",
      reading: "shougakkou",
      meanings: { ru: "начальная школа", uz: "boshlang'ich maktab" },
      info: {
        ru: "комбинация しょ + долгая おう + っ (kk) + долгая おう",
        uz: "kombinatsiya しょ + uzun おう + っ (kk) + uzun おう",
      },
    },
    {
      word: "かっぱ",
      reading: "kappa",
      meanings: { ru: "дождевик; каппа", uz: "yomg'irpush" },
      info: {
        ru: "っ (удвоение pp) + хандакутэн ぱ",
        uz: "っ (ikkilanish pp) + handakuten ぱ",
      },
    },
    {
      word: "げんき",
      reading: "genki",
      meanings: { ru: "бодрый, здоровый", uz: "sog'lom, tetik" },
      info: { ru: "дакутэн げ + ん", uz: "dakuten げ + ん" },
    },
  ];

  // ============================================
  // KATAKANA WORDS QUIZ DATA
  // ============================================
  const katakanaWordsQuiz = [
    {
      word: "カメラ",
      reading: "kamera",
      meanings: { ru: "фотоаппарат", uz: "kamera" },
      info: {
        ru: "Базовые слоги カ-ме-ра",
        uz: "Asosiy bo'g'inlar カ-メ-ラ",
      },
    },
    {
      word: "ギター",
      reading: "gitaa",
      meanings: { ru: "гитара", uz: "gitara" },
      info: {
        ru: "ギ — дакутэн + ー — длинная гласная",
        uz: "ギ — dakuten + ー — uzun unli",
      },
    },
    {
      word: "パン",
      reading: "pan",
      meanings: { ru: "хлеб", uz: "non" },
      info: {
        ru: "パ — хандакутэн. Из порт. pão",
        uz: "パ — handakuten. Portug. tilidan: pão",
      },
    },
    {
      word: "シャツ",
      reading: "shatsu",
      meanings: { ru: "рубашка", uz: "ko'ylak" },
      info: {
        ru: "シャ — комбинация shi + ya",
        uz: "シャ — kombinatsiya shi + ya",
      },
    },
    {
      word: "カップ",
      reading: "kappu",
      meanings: { ru: "чашка", uz: "piyola" },
      info: {
        ru: "ッ — удвоение согласной p",
        uz: "ッ — p undoshini ikkilantirish",
      },
    },
    {
      word: "レモン",
      reading: "remon",
      meanings: { ru: "лимон", uz: "limon" },
      info: {
        ru: "ン — слоговое н в конце",
        uz: "ン — so'z oxirida bo'g'in n",
      },
    },
    {
      word: "コーヒー",
      reading: "koohii",
      meanings: { ru: "кофе", uz: "qahva" },
      info: {
        ru: "ー — две длинные гласные: oo и ii",
        uz: "ー — ikkita uzun unli: oo va ii",
      },
    },
    {
      word: "ティッシュ",
      reading: "tisshu",
      meanings: { ru: "салфетка", uz: "salfetka" },
      info: {
        ru: "ティ — особая комбинация + ッ удвоение",
        uz: "ティ — maxsus kombinatsiya + ッ ikkilantirish",
      },
    },
    {
      word: "アンケート",
      reading: "ankeeto",
      meanings: { ru: "анкета", uz: "so'rovnoma" },
      info: {
        ru: "ン + ー. Из франц. enquête",
        uz: "ン + ー. Fransuz tilidan: enquête",
      },
    },
    {
      word: "ソファ",
      reading: "sofa",
      meanings: { ru: "диван", uz: "divan" },
      info: {
        ru: "Базовые слоги ソ-ファ",
        uz: "Asosiy bo'g'inlar ソ-ファ",
      },
    },
    {
      word: "ゼリー",
      reading: "zerii",
      meanings: { ru: "желе", uz: "jele" },
      info: {
        ru: "ゼ — дакутэн + ー длинная гласная",
        uz: "ゼ — dakuten + ー uzun unli",
      },
    },
    {
      word: "スプーン",
      reading: "supuun",
      meanings: { ru: "ложка", uz: "qoshiq" },
      info: {
        ru: "ー длинная гласная + ン слоговое н",
        uz: "ー uzun unli + ン bo'g'in n",
      },
    },
    {
      word: "キャンプ",
      reading: "kyanpu",
      meanings: { ru: "кемпинг", uz: "lager" },
      info: {
        ru: "キャ — комбинация + ン слоговое н",
        uz: "キャ — kombinatsiya + ン bo'g'in n",
      },
    },
    {
      word: "ベッド",
      reading: "beddo",
      meanings: { ru: "кровать", uz: "karavot" },
      info: {
        ru: "ッ — удвоение согласной d",
        uz: "ッ — d undoshini ikkilantirish",
      },
    },
    {
      word: "テーマ",
      reading: "teema",
      meanings: { ru: "тема", uz: "mavzu" },
      info: {
        ru: "ー длинная гласная. Из нем. Thema",
        uz: "ー uzun unli. Nemis tilidan: Thema",
      },
    },
    {
      word: "フォーク",
      reading: "fooku",
      meanings: { ru: "вилка", uz: "vilka" },
      info: {
        ru: "フォ — особая комбинация fo + ー",
        uz: "フォ — maxsus kombinatsiya fo + ー",
      },
    },
    {
      word: "ナイフ",
      reading: "naifu",
      meanings: { ru: "нож", uz: "pichoq" },
      info: {
        ru: "Базовые слоги ナ-イ-フ",
        uz: "Asosiy bo'g'inlar ナ-イ-フ",
      },
    },
    {
      word: "ジュース",
      reading: "juusu",
      meanings: { ru: "сок", uz: "sharbat" },
      info: {
        ru: "ジュ — комбинация ji + yu + ー",
        uz: "ジュ — kombinatsiya ji + yu + ー",
      },
    },
    {
      word: "ネクタイ",
      reading: "nekutai",
      meanings: { ru: "галстук", uz: "galstuk" },
      info: {
        ru: "Базовые слоги ネ-ク-タ-イ",
        uz: "Asosiy bo'g'inlar ネ-ク-タ-イ",
      },
    },
    {
      word: "バス",
      reading: "basu",
      meanings: { ru: "автобус", uz: "avtobus" },
      info: {
        ru: "バ — дакутэн (ハ → バ)",
        uz: "バ — dakuten (ハ → バ)",
      },
    },
    {
      word: "ページ",
      reading: "peeji",
      meanings: { ru: "страница", uz: "sahifa" },
      info: {
        ru: "ペ — хандакутэн + ー длинная гласная",
        uz: "ペ — handakuten + ー uzun unli",
      },
    },
    {
      word: "チョコレート",
      reading: "chokoreeto",
      meanings: { ru: "шоколад", uz: "shokolad" },
      info: {
        ru: "チョ — комбинация + ー длинная гласная",
        uz: "チョ — kombinatsiya + ー uzun unli",
      },
    },
    {
      word: "ロッカー",
      reading: "rokkaa",
      meanings: { ru: "шкафчик", uz: "shkafcha" },
      info: {
        ru: "ッ удвоение k + ー длинная гласная",
        uz: "ッ k ikkilantirish + ー uzun unli",
      },
    },
    {
      word: "エレベーター",
      reading: "erebeetaa",
      meanings: { ru: "лифт", uz: "lift" },
      info: {
        ru: "ー — длинная гласная, длинное слово",
        uz: "ー — uzun unli, uzun so'z",
      },
    },
    {
      word: "ウェブ",
      reading: "webu",
      meanings: { ru: "веб", uz: "veb" },
      info: {
        ru: "ウェ — особая комбинация we",
        uz: "ウェ — maxsus kombinatsiya we",
      },
    },
    {
      word: "カルテ",
      reading: "karute",
      meanings: { ru: "медкарта", uz: "tibbiy karta" },
      info: {
        ru: "Базовые слоги. Из нем. Karte",
        uz: "Asosiy bo'g'inlar. Nemis tilidan: Karte",
      },
    },
    {
      word: "ガス",
      reading: "gasu",
      meanings: { ru: "газ", uz: "gaz" },
      info: {
        ru: "ガ — дакутэн (カ → ガ)",
        uz: "ガ — dakuten (カ → ガ)",
      },
    },
    {
      word: "ピアノ",
      reading: "piano",
      meanings: { ru: "пианино", uz: "pianino" },
      info: {
        ru: "ピ — хандакутэн (ヒ → ピ)",
        uz: "ピ — handakuten (ヒ → ピ)",
      },
    },
    {
      word: "ニュース",
      reading: "nyuusu",
      meanings: { ru: "новости", uz: "yangiliklar" },
      info: {
        ru: "ニュ — комбинация ni + yu + ー",
        uz: "ニュ — kombinatsiya ni + yu + ー",
      },
    },
    {
      word: "マッチ",
      reading: "macchi",
      meanings: { ru: "спичка", uz: "gugurt" },
      info: {
        ru: "ッ — удвоение согласной ch",
        uz: "ッ — ch undoshini ikkilantirish",
      },
    },
    {
      word: "ランドセル",
      reading: "randoseru",
      meanings: { ru: "школьный ранец", uz: "maktab sumkasi" },
      info: {
        ru: "ン слоговое н. Из голл. ransel",
        uz: "ン bo'g'in n. Golland tilidan: ransel",
      },
    },
    {
      word: "セーター",
      reading: "seetaa",
      meanings: { ru: "свитер", uz: "sviter" },
      info: {
        ru: "ー — две длинные гласные: ee и aa",
        uz: "ー — ikkita uzun unli: ee va aa",
      },
    },
    {
      word: "ディスコ",
      reading: "disuko",
      meanings: { ru: "дискотека", uz: "diskoteka" },
      info: {
        ru: "ディ — особая комбинация di",
        uz: "ディ — maxsus kombinatsiya di",
      },
    },
    {
      word: "ホテル",
      reading: "hoteru",
      meanings: { ru: "гостиница", uz: "mehmonxona" },
      info: {
        ru: "Базовые слоги ホ-テ-ル",
        uz: "Asosiy bo'g'inlar ホ-テ-ル",
      },
    },
    {
      word: "ドア",
      reading: "doa",
      meanings: { ru: "дверь", uz: "eshik" },
      info: {
        ru: "ド — дакутэн (ト → ド)",
        uz: "ド — dakuten (ト → ド)",
      },
    },
    {
      word: "パスポート",
      reading: "pasupooto",
      meanings: { ru: "паспорт", uz: "pasport" },
      info: {
        ru: "パ хандакутэн + ー длинная гласная",
        uz: "パ handakuten + ー uzun unli",
      },
    },
    {
      word: "シャワー",
      reading: "shawaa",
      meanings: { ru: "душ", uz: "dush" },
      info: {
        ru: "シャ — комбинация + ー длинная гласная",
        uz: "シャ — kombinatsiya + ー uzun unli",
      },
    },
    {
      word: "コップ",
      reading: "koppu",
      meanings: { ru: "стакан", uz: "stakan" },
      info: {
        ru: "ッ — удвоение согласной p",
        uz: "ッ — p undoshini ikkilantirish",
      },
    },
    {
      word: "レストラン",
      reading: "resutoran",
      meanings: { ru: "ресторан", uz: "restoran" },
      info: {
        ru: "ン — слоговое н в конце слова",
        uz: "ン — so'z oxirida bo'g'in n",
      },
    },
    {
      word: "スキー",
      reading: "sukii",
      meanings: { ru: "лыжи", uz: "chang'i" },
      info: { ru: "ー — длинная гласная ii", uz: "ー — uzun unli ii" },
    },
    {
      word: "ヴァイオリン",
      reading: "vaiorin",
      meanings: { ru: "скрипка", uz: "skripka" },
      info: {
        ru: "ヴァ — особая комбинация va + ン",
        uz: "ヴァ — maxsus kombinatsiya va + ン",
      },
    },
    {
      word: "メモ",
      reading: "memo",
      meanings: { ru: "записка", uz: "eslatma" },
      info: {
        ru: "Базовые слоги メ-モ (короткое слово)",
        uz: "Asosiy bo'g'inlar メ-モ (qisqa so'z)",
      },
    },
    {
      word: "ボタン",
      reading: "botan",
      meanings: { ru: "пуговица", uz: "tugma" },
      info: {
        ru: "ボ — дакутэн + ン слоговое н",
        uz: "ボ — dakuten + ン bo'g'in n",
      },
    },
    {
      word: "スリッパ",
      reading: "surippa",
      meanings: { ru: "тапочки", uz: "tapochka" },
      info: {
        ru: "ッ удвоение p + パ хандакутэн",
        uz: "ッ p ikkilantirish + パ handakuten",
      },
    },
    {
      word: "リュック",
      reading: "ryukku",
      meanings: { ru: "рюкзак", uz: "ryukzak" },
      info: {
        ru: "リュ — комбинация + ッ удвоение k",
        uz: "リュ — kombinatsiya + ッ k ikkilantirish",
      },
    },
    {
      word: "カレー",
      reading: "karee",
      meanings: { ru: "карри", uz: "karri" },
      info: { ru: "ー — длинная гласная ee", uz: "ー — uzun unli ee" },
    },
    {
      word: "クロワッサン",
      reading: "kurowassan",
      meanings: { ru: "круассан", uz: "kruassan" },
      info: {
        ru: "ッ удвоение + ン. Из франц. croissant",
        uz: "ッ ikkilantirish + ン. Fransuz tilidan: croissant",
      },
    },
    {
      word: "ダム",
      reading: "damu",
      meanings: { ru: "дамба", uz: "to'g'on" },
      info: {
        ru: "ダ — дакутэн (タ → ダ)",
        uz: "ダ — dakuten (タ → ダ)",
      },
    },
    {
      word: "フィルム",
      reading: "firumu",
      meanings: { ru: "плёнка", uz: "plyonka" },
      info: {
        ru: "フィ — особая комбинация fi",
        uz: "フィ — maxsus kombinatsiya fi",
      },
    },
    {
      word: "キッチン",
      reading: "kicchin",
      meanings: { ru: "кухня", uz: "oshxona" },
      info: {
        ru: "ッ удвоение ch + ン слоговое н",
        uz: "ッ ch ikkilantirish + ン bo'g'in n",
      },
    },
    {
      word: "タクシー",
      reading: "takushii",
      meanings: { ru: "такси", uz: "taksi" },
      info: { ru: "ー — длинная гласная ii", uz: "ー — uzun unli ii" },
    },
    {
      word: "シェフ",
      reading: "shefu",
      meanings: { ru: "шеф-повар", uz: "bosh oshpaz" },
      info: {
        ru: "シェ — особая комбинация she. Из франц. chef",
        uz: "シェ — maxsus kombinatsiya she. Fransuz tilidan: chef",
      },
    },
    {
      word: "マスク",
      reading: "masuku",
      meanings: { ru: "маска", uz: "niqob" },
      info: {
        ru: "Базовые слоги マ-ス-ク",
        uz: "Asosiy bo'g'inlar マ-ス-ク",
      },
    },
    {
      word: "ゴム",
      reading: "gomu",
      meanings: { ru: "резина", uz: "rezina" },
      info: {
        ru: "ゴ — дакутэн (コ → ゴ)",
        uz: "ゴ — dakuten (コ → ゴ)",
      },
    },
    {
      word: "プール",
      reading: "puuru",
      meanings: { ru: "бассейн", uz: "basseyn" },
      info: {
        ru: "ー длинная гласная uu + プ хандакутэн",
        uz: "ー uzun unli uu + プ handakuten",
      },
    },
    {
      word: "キャベツ",
      reading: "kyabetsu",
      meanings: { ru: "капуста", uz: "karam" },
      info: {
        ru: "キャ — комбинация ki + ya",
        uz: "キャ — kombinatsiya ki + ya",
      },
    },
    {
      word: "インターネット",
      reading: "intaanetto",
      meanings: { ru: "интернет", uz: "internet" },
      info: {
        ru: "ン + ー + ッ — три явления в одном слове",
        uz: "ン + ー + ッ — bitta so'zda uchta hodisa",
      },
    },
    {
      word: "ハム",
      reading: "hamu",
      meanings: { ru: "ветчина", uz: "vetchinaʼ" },
      info: {
        ru: "Базовые слоги ハ-ム (короткое слово)",
        uz: "Asosiy bo'g'inlar ハ-ム (qisqa so'z)",
      },
    },
    {
      word: "ビル",
      reading: "biru",
      meanings: { ru: "здание", uz: "bino" },
      info: {
        ru: "ビ — дакутэн (ヒ → ビ)",
        uz: "ビ — dakuten (ヒ → ビ)",
      },
    },
    {
      word: "ケーキ",
      reading: "keeki",
      meanings: { ru: "торт", uz: "tort" },
      info: { ru: "ー — длинная гласная ee", uz: "ー — uzun unli ee" },
    },
    {
      word: "チャンネル",
      reading: "channeru",
      meanings: { ru: "канал (ТВ)", uz: "kanal" },
      info: {
        ru: "チャ комбинация + ン слоговое н",
        uz: "チャ kombinatsiya + ン bo'g'in n",
      },
    },
    {
      word: "ジェット",
      reading: "jetto",
      meanings: { ru: "реактивный", uz: "reaktiv" },
      info: {
        ru: "ジェ — особая комбинация je + ッ удвоение",
        uz: "ジェ — maxsus kombinatsiya je + ッ ikkilantirish",
      },
    },
    {
      word: "カステラ",
      reading: "kasutera",
      meanings: { ru: "кастелла (бисквит)", uz: "kastella torti" },
      info: {
        ru: "Базовые слоги. Из порт. castela",
        uz: "Asosiy bo'g'inlar. Portug. tilidan: castela",
      },
    },
    {
      word: "バッグ",
      reading: "baggu",
      meanings: { ru: "сумка", uz: "sumka" },
      info: {
        ru: "ッ удвоение g + バ グ дакутэн",
        uz: "ッ g ikkilantirish + バ グ dakuten",
      },
    },
    {
      word: "ノート",
      reading: "nooto",
      meanings: { ru: "тетрадь", uz: "daftar" },
      info: { ru: "ー — длинная гласная oo", uz: "ー — uzun unli oo" },
    },
    {
      word: "ウィンドウ",
      reading: "windou",
      meanings: { ru: "окно (комп.)", uz: "oyna (komp.)" },
      info: {
        ru: "ウィ — особая комбинация wi + ン",
        uz: "ウィ — maxsus kombinatsiya wi + ン",
      },
    },
    {
      word: "ズボン",
      reading: "zubon",
      meanings: { ru: "брюки", uz: "shim" },
      info: {
        ru: "ズ дакутэн + ン. Из франц. jupon",
        uz: "ズ dakuten + ン. Fransuz tilidan: jupon",
      },
    },
    {
      word: "テーブル",
      reading: "teeburu",
      meanings: { ru: "стол", uz: "stol" },
      info: { ru: "ー — длинная гласная ee", uz: "ー — uzun unli ee" },
    },
    {
      word: "デュエット",
      reading: "dyuetto",
      meanings: { ru: "дуэт", uz: "duet" },
      info: {
        ru: "デュ — особая комбинация dyu + ッ",
        uz: "デュ — maxsus kombinatsiya dyu + ッ",
      },
    },
    {
      word: "エンジン",
      reading: "enjin",
      meanings: { ru: "двигатель", uz: "dvigatel" },
      info: {
        ru: "ン — слоговое н (дважды) + ジ дакутэн",
        uz: "ン — bo'g'in n (ikki marta) + ジ dakuten",
      },
    },
    {
      word: "パーティー",
      reading: "paatii",
      meanings: { ru: "вечеринка", uz: "ziyofat" },
      info: {
        ru: "パ хандакутэн + ー + ティ особая комбинация",
        uz: "パ handakuten + ー + ティ maxsus kombinatsiya",
      },
    },
    {
      word: "ミュージック",
      reading: "myuujikku",
      meanings: { ru: "музыка", uz: "musiqa" },
      info: {
        ru: "ミュ комбинация + ー + ジ дакутэн + ッ удвоение",
        uz: "ミュ kombinatsiya + ー + ジ dakuten + ッ ikkilantirish",
      },
    },
    {
      word: "カヌー",
      reading: "kanuu",
      meanings: { ru: "каноэ", uz: "kano" },
      info: { ru: "ー — длинная гласная uu", uz: "ー — uzun unli uu" },
    },
    {
      word: "ジャム",
      reading: "jamu",
      meanings: { ru: "джем", uz: "murabbo" },
      info: {
        ru: "ジャ — комбинация ji + ya (дакутэн)",
        uz: "ジャ — kombinatsiya ji + ya (dakuten)",
      },
    },
    {
      word: "チケット",
      reading: "chiketto",
      meanings: { ru: "билет", uz: "chipta" },
      info: {
        ru: "ッ — удвоение согласной t",
        uz: "ッ — t undoshini ikkilantirish",
      },
    },
    {
      word: "ボランティア",
      reading: "borantia",
      meanings: { ru: "волонтёр", uz: "ko'ngilli" },
      info: {
        ru: "ボ дакутэн + ン + ティ особая комбинация",
        uz: "ボ dakuten + ン + ティ maxsus kombinatsiya",
      },
    },
    {
      word: "サラダ",
      reading: "sarada",
      meanings: { ru: "салат", uz: "salat" },
      info: {
        ru: "Базовые слоги サ-ラ-ダ (ダ дакутэн)",
        uz: "Asosiy bo'g'inlar サ-ラ-ダ (ダ dakuten)",
      },
    },
    {
      word: "ギャラリー",
      reading: "gyararii",
      meanings: { ru: "галерея", uz: "galereya" },
      info: {
        ru: "ギャ — комбинация (дакутэн) + ー",
        uz: "ギャ — kombinatsiya (dakuten) + ー",
      },
    },
    {
      word: "スーツ",
      reading: "suutsu",
      meanings: { ru: "костюм", uz: "kostyum" },
      info: { ru: "ー — длинная гласная uu", uz: "ー — uzun unli uu" },
    },
    {
      word: "オブラート",
      reading: "oburaato",
      meanings: { ru: "облатка", uz: "oblat" },
      info: {
        ru: "ー длинная гласная. Из голл. oblaat",
        uz: "ー uzun unli. Golland tilidan: oblaat",
      },
    },
    {
      word: "ビール",
      reading: "biiru",
      meanings: { ru: "пиво", uz: "pivo" },
      info: {
        ru: "ビ дакутэн + ー длинная гласная",
        uz: "ビ dakuten + ー uzun unli",
      },
    },
    {
      word: "ショッピング",
      reading: "shoppingu",
      meanings: { ru: "шопинг", uz: "xarid" },
      info: {
        ru: "ショ комбинация + ッ удвоение + ン + グ дакутэн",
        uz: "ショ kombinatsiya + ッ ikkilantirish + ン + グ dakuten",
      },
    },
    {
      word: "ペン",
      reading: "pen",
      meanings: { ru: "ручка", uz: "ruchka" },
      info: {
        ru: "ペ — хандакутэн + ン слоговое н",
        uz: "ペ — handakuten + ン bo'g'in n",
      },
    },
    {
      word: "トイレ",
      reading: "toire",
      meanings: { ru: "туалет", uz: "hojatxona" },
      info: {
        ru: "Базовые слоги ト-イ-レ",
        uz: "Asosiy bo'g'inlar ト-イ-レ",
      },
    },
    {
      word: "グラス",
      reading: "gurasu",
      meanings: { ru: "бокал", uz: "qadah" },
      info: {
        ru: "グ — дакутэн (ク → グ)",
        uz: "グ — dakuten (ク → グ)",
      },
    },
    {
      word: "コピー",
      reading: "kopii",
      meanings: { ru: "копия", uz: "nusxa" },
      info: { ru: "ー — длинная гласная ii", uz: "ー — uzun unli ii" },
    },
    {
      word: "リボン",
      reading: "ribon",
      meanings: { ru: "лента", uz: "lenta" },
      info: {
        ru: "ン — слоговое н в конце",
        uz: "ン — so'z oxirida bo'g'in n",
      },
    },
    {
      word: "ハンバーガー",
      reading: "hanbaagaa",
      meanings: { ru: "гамбургер", uz: "gamburger" },
      info: {
        ru: "ン + ー (дважды) — сложное слово",
        uz: "ン + ー (ikki marta) — murakkab so'z",
      },
    },
    {
      word: "アレルギー",
      reading: "arerugii",
      meanings: { ru: "аллергия", uz: "allergiya" },
      info: {
        ru: "ー длинная гласная. Из нем. Allergie",
        uz: "ー uzun unli. Nemis tilidan: Allergie",
      },
    },
    {
      word: "ネット",
      reading: "netto",
      meanings: { ru: "сеть", uz: "tarmoq" },
      info: {
        ru: "ッ — удвоение согласной t",
        uz: "ッ — t undoshini ikkilantirish",
      },
    },
    {
      word: "ボール",
      reading: "booru",
      meanings: { ru: "мяч", uz: "to'p" },
      info: {
        ru: "ボ дакутэн + ー длинная гласная",
        uz: "ボ dakuten + ー uzun unli",
      },
    },
    {
      word: "シュークリーム",
      reading: "shuukuriimu",
      meanings: { ru: "заварное пирожное", uz: "krem pirojnoe" },
      info: {
        ru: "シュ комбинация + ー (дважды) — сложное",
        uz: "シュ kombinatsiya + ー (ikki marta) — murakkab",
      },
    },
    {
      word: "ポケット",
      reading: "poketto",
      meanings: { ru: "карман", uz: "cho'ntak" },
      info: {
        ru: "ポ хандакутэн + ッ удвоение t",
        uz: "ポ handakuten + ッ t ikkilantirish",
      },
    },
    {
      word: "メニュー",
      reading: "menyuu",
      meanings: { ru: "меню", uz: "menyu" },
      info: {
        ru: "ニュ — комбинация + ー длинная гласная",
        uz: "ニュ — kombinatsiya + ー uzun unli",
      },
    },
    {
      word: "エアコン",
      reading: "eakon",
      meanings: { ru: "кондиционер", uz: "konditsioner" },
      info: {
        ru: "ン — слоговое н. Сокращение",
        uz: "ン — bo'g'in n. Qisqartma",
      },
    },
    {
      word: "スーパー",
      reading: "suupaa",
      meanings: { ru: "супермаркет", uz: "supermarket" },
      info: {
        ru: "ー — две длинные гласные: uu и aa",
        uz: "ー — ikkita uzun unli: uu va aa",
      },
    },
    {
      word: "プログラム",
      reading: "puroguramu",
      meanings: { ru: "программа", uz: "dastur" },
      info: {
        ru: "プ хандакутэн + グ дакутэн — сложное",
        uz: "プ handakuten + グ dakuten — murakkab",
      },
    },
    {
      word: "サンドイッチ",
      reading: "sandoicchi",
      meanings: { ru: "сэндвич", uz: "sendvich" },
      info: {
        ru: "ン + ッ удвоение ch — сложное слово",
        uz: "ン + ッ ch ikkilantirish — murakkab so'z",
      },
    },
    {
      word: "カーテン",
      reading: "kaaten",
      meanings: { ru: "штора", uz: "parda" },
      info: {
        ru: "ー длинная гласная + ン слоговое н",
        uz: "ー uzun unli + ン bo'g'in n",
      },
    },
    {
      word: "ジョギング",
      reading: "jogingu",
      meanings: { ru: "бег трусцой", uz: "yugurish" },
      info: {
        ru: "ジョ комбинация (дакутэн) + ン + グ",
        uz: "ジョ kombinatsiya (dakuten) + ン + グ",
      },
    },
  ];

  // ============================================
  // ALGORITHMIC DISTRACTOR GENERATOR (kana words)
  // ============================================
  var _romajiSwaps = [
    ["shi", "chi"],
    ["chi", "shi"],
    ["tsu", "su"],
    ["su", "tsu"],
    ["n", "nn"],
    ["nn", "n"],
    ["fu", "hu"],
    ["hu", "fu"],
    ["ji", "di"],
    ["di", "ji"],
    ["zu", "du"],
    ["du", "zu"],
    ["sha", "cha"],
    ["cha", "sha"],
    ["sho", "cho"],
    ["cho", "sho"],
    ["shu", "chu"],
    ["chu", "shu"],
    ["rya", "ryo"],
    ["ryo", "rya"],
    ["kya", "kyo"],
    ["kyo", "kya"],
    ["bya", "byo"],
    ["byo", "bya"],
    ["ja", "jya"],
    ["jya", "ja"],
    ["ou", "oo"],
    ["oo", "ou"],
    ["aa", "a"],
    ["ii", "i"],
    ["uu", "u"],
    ["ee", "e"],
    ["a", "aa"],
    ["i", "ii"],
    ["u", "uu"],
    ["e", "ee"],
  ];

  function generateWordDistractors(correctReading) {
    var results = [];
    var seen = {};
    seen[correctReading] = true;

    // Strategy 1: Apply romaji swaps
    for (var i = 0; i < _romajiSwaps.length && results.length < 6; i++) {
      var pair = _romajiSwaps[i];
      if (correctReading.indexOf(pair[0]) !== -1) {
        var variant = correctReading.replace(pair[0], pair[1]);
        if (!seen[variant]) {
          seen[variant] = true;
          results.push(variant);
        }
      }
    }

    // Strategy 2: Double/remove a consonant (simulate っ errors)
    var consonants = [
      "k",
      "s",
      "t",
      "n",
      "h",
      "m",
      "r",
      "g",
      "z",
      "d",
      "b",
      "p",
    ];
    for (var c = 0; c < consonants.length && results.length < 6; c++) {
      var cc = consonants[c] + consonants[c];
      if (correctReading.indexOf(cc) !== -1) {
        var v2 = correctReading.replace(cc, consonants[c]);
        if (!seen[v2]) {
          seen[v2] = true;
          results.push(v2);
        }
      } else if (correctReading.indexOf(consonants[c]) !== -1) {
        var v3 = correctReading.replace(consonants[c], cc);
        if (!seen[v3]) {
          seen[v3] = true;
          results.push(v3);
        }
      }
    }

    // Strategy 3: Swap adjacent syllables/segments
    if (correctReading.length > 4 && results.length < 6) {
      var mid = Math.floor(correctReading.length / 2);
      var swapped = correctReading.slice(mid) + correctReading.slice(0, mid);
      if (!seen[swapped]) {
        seen[swapped] = true;
        results.push(swapped);
      }
    }

    // Strategy 4: Replace a vowel
    var vowels = ["a", "i", "u", "e", "o"];
    for (var vi = 0; vi < correctReading.length && results.length < 6; vi++) {
      var ch = correctReading[vi];
      var vowelIdx = vowels.indexOf(ch);
      if (vowelIdx !== -1) {
        var newVowel = vowels[(vowelIdx + 1) % 5];
        var v4 =
          correctReading.slice(0, vi) + newVowel + correctReading.slice(vi + 1);
        if (!seen[v4]) {
          seen[v4] = true;
          results.push(v4);
          break;
        }
      }
    }

    // Shuffle and pick 3
    results = shuffleArray(results);
    return results.slice(0, 3);
  }

  function getAllHiragana() {
    return hiraganaData.basic
      .concat(hiraganaData.dakuten)
      .concat(hiraganaData.combo);
  }

  function getAllKatakana() {
    return katakanaData.basic
      .concat(katakanaData.dakuten)
      .concat(katakanaData.combo);
  }

  // ============================================
  // GRAMMAR DATA (Minna no Nihongo)
  // ============================================
  const grammarData = [
    {
      id: "g1",
      lesson: 1,
      topic: "particles",
      title: {
        ru: "Частица は — тема предложения",
        uz: "は yuklamasi — gap mavzusi",
      },
      explanation: {
        ru: "は (читается «wa») — частица, обозначающая тему предложения. Ставится после существительного, о котором идёт речь.",
        uz: "は («wa» deb o'qiladi) — gap mavzusini bildiruvchi yuklama. Gap haqida bo'lgan ot dan keyin qo'yiladi.",
      },
      examples: [
        {
          jp: "私は 学生です。",
          tr: { ru: "Я — студент.", uz: "Men talabaman." },
        },
        {
          jp: "マイクさんは アメリカ人です。",
          tr: { ru: "Майк — американец.", uz: "Mayk amerikalik." },
        },
      ],
      level: "N5",
    },
    {
      id: "g2",
      lesson: 1,
      topic: "particles",
      title: {
        ru: "Связка です — утверждение",
        uz: "です bog'lovchisi — tasdiqlash",
      },
      explanation: {
        ru: "です ставится в конце предложения и означает «является», «это есть». Это вежливая форма.",
        uz: "です gap oxirida qo'yiladi va «bo'lmoq», «hisoblanmoq» ma'nosini bildiradi. Bu hurmatli shakl.",
      },
      examples: [
        {
          jp: "田中さんは 先生です。",
          tr: { ru: "Танака — учитель.", uz: "Tanaka o'qituvchi." },
        },
        {
          jp: "私は マリアです。",
          tr: { ru: "Я — Мария.", uz: "Men Mariyaman." },
        },
      ],
      level: "N5",
    },
    {
      id: "g3",
      lesson: 1,
      topic: "particles",
      title: {
        ru: "Отрицание じゃ ありません",
        uz: "Inkor じゃ ありません",
      },
      explanation: {
        ru: "じゃ ありません — отрицательная форма です. Означает «не является».",
        uz: "じゃ ありません — です ning inkor shakli. «Emas» ma'nosini bildiradi.",
      },
      examples: [
        {
          jp: "私は 学生じゃ ありません。",
          tr: { ru: "Я не студент.", uz: "Men talaba emasman." },
        },
        {
          jp: "ミラーさんは 先生じゃ ありません。",
          tr: { ru: "Миллер не учитель.", uz: "Miller o'qituvchi emas." },
        },
      ],
      level: "N5",
    },
    {
      id: "g4",
      lesson: 1,
      topic: "particles",
      title: {
        ru: "Вопросительная частица か",
        uz: "か so'roq yuklamasi",
      },
      explanation: {
        ru: "か ставится в конце предложения и превращает его в вопрос. Интонация повышается.",
        uz: "か gap oxiriga qo'yiladi va gapni so'roq gapga aylantiradi. Ohang ko'tariladi.",
      },
      examples: [
        {
          jp: "マイクさんは アメリカ人ですか。",
          tr: { ru: "Майк — американец?", uz: "Mayk amerikalikmi?" },
        },
        {
          jp: "あなたは 学生ですか。",
          tr: { ru: "Вы студент?", uz: "Siz talabamisiz?" },
        },
      ],
      level: "N5",
    },
    {
      id: "g5",
      lesson: 1,
      topic: "particles",
      title: { ru: "Частица も — «тоже»", uz: "も yuklamasi — «ham»" },
      explanation: {
        ru: "も заменяет は и означает «тоже», «также».",
        uz: "も は o'rniga qo'yiladi va «ham», «shuningdek» ma'nosini bildiradi.",
      },
      examples: [
        {
          jp: "サントスさんも 学生です。",
          tr: { ru: "Сантос тоже студент.", uz: "Santos ham talaba." },
        },
        {
          jp: "私も 日本人です。",
          tr: { ru: "Я тоже японец.", uz: "Men ham yaponman." },
        },
      ],
      level: "N5",
    },
    {
      id: "g6",
      lesson: 1,
      topic: "particles",
      title: {
        ru: "Частица の — принадлежность",
        uz: "の yuklamasi — tegishlilik",
      },
      explanation: {
        ru: "の связывает два существительных и показывает принадлежность: A の B = B принадлежит A.",
        uz: "の ikki otni bog'laydi va tegishlilikni ko'rsatadi: A の B = B A ga tegishli.",
      },
      examples: [
        {
          jp: "IMCの 社員です。",
          tr: { ru: "Сотрудник IMC.", uz: "IMC xodimi." },
        },
        {
          jp: "東京大学の 学生です。",
          tr: {
            ru: "Студент Токийского университета.",
            uz: "Tokio universiteti talabasi.",
          },
        },
      ],
      level: "N5",
    },
    {
      id: "g7",
      lesson: 1,
      topic: "expressions",
      title: {
        ru: "Самопредставление — はじめまして",
        uz: "O'zini tanishtirish — はじめまして",
      },
      explanation: {
        ru: "Стандартная формула знакомства: はじめまして。[Имя]です。どうぞ よろしく お願いします。",
        uz: "Tanishuv formulasi: はじめまして。[Ism]です。どうぞ よろしく お願いします。",
      },
      examples: [
        {
          jp: "はじめまして。マイク・ミラーです。どうぞ よろしく お願いします。",
          tr: {
            ru: "Приятно познакомиться. Я — Майк Миллер. Прошу любить и жаловать.",
            uz: "Tanishganimdan xursandman. Men Mayk Miller. Iltimos, yaxshi munosabatda bo'ling.",
          },
        },
      ],
      level: "N5",
    },
    {
      id: "g8",
      lesson: 1,
      topic: "numbers",
      title: {
        ru: "Числа и возраст: ～さい",
        uz: "Raqamlar va yosh: ～さい",
      },
      explanation: {
        ru: "さい — суффикс для обозначения возраста. 何歳ですか (なんさいですか) — «Сколько вам лет?». Для 20 лет используется はたち.",
        uz: "さい — yoshni bildiruvchi qo'shimcha. 何歳ですか (なんさいですか) — «Yoshingiz nechada?». 20 yosh uchun はたち ishlatiladi.",
      },
      examples: [
        {
          jp: "マイクさんは 25歳です。",
          tr: { ru: "Майку 25 лет.", uz: "Mayk 25 yoshda." },
        },
        {
          jp: "サントスさんは 何歳ですか。",
          tr: {
            ru: "Сколько лет Сантосу?",
            uz: "Santosning yoshi nechada?",
          },
        },
      ],
      level: "N5",
    },
    {
      id: "g9",
      lesson: 1,
      topic: "expressions",
      title: {
        ru: "Суффикс ～さん — вежливое обращение",
        uz: "～さん qo'shimchasi — hurmatli murojaat",
      },
      explanation: {
        ru: "さん добавляется к фамилии или имени собеседника. Никогда не используется по отношению к себе!",
        uz: "さん suhbatdoshning familiyasi yoki ismiga qo'shiladi. Hech qachon o'zingizga nisbatan ishlatilmaydi!",
      },
      examples: [
        {
          jp: "田中さん、おはよう ございます。",
          tr: {
            ru: "Танака-сан, доброе утро.",
            uz: "Tanaka-san, xayrli tong.",
          },
        },
        {
          jp: "ワットさんは 先生です。",
          tr: { ru: "Ватт-сан — учитель.", uz: "Vatt-san o'qituvchi." },
        },
      ],
      level: "N5",
    },
    {
      id: "g10",
      lesson: 1,
      topic: "expressions",
      title: {
        ru: "Указание страны: ～人 (じん)",
        uz: "Mamlakatni ko'rsatish: ～人 (じん)",
      },
      explanation: {
        ru: "人 (じん) добавляется к названию страны для обозначения национальности: 日本 → 日本人 (японец).",
        uz: "人 (じん) mamlakat nomiga qo'shiladi va millatni bildiradi: 日本 → 日本人 (yapon).",
      },
      examples: [
        {
          jp: "カリナさんは インドネシア人です。",
          tr: {
            ru: "Карина — индонезийка.",
            uz: "Karina indoneziyalik.",
          },
        },
        {
          jp: "ワットさんは イギリス人です。",
          tr: { ru: "Ватт — англичанин.", uz: "Vatt ingliz." },
        },
      ],
      level: "N5",
    },
  ];

  // Grammar topic labels
  var grammarTopics = {
    particles: { ru: "Частицы", uz: "Yuklamalar" },
    expressions: { ru: "Выражения", uz: "Iboralar" },
    numbers: { ru: "Числа", uz: "Raqamlar" },
    verbs: { ru: "Глаголы", uz: "Fe'llar" },
    adjectives: { ru: "Прилагательные", uz: "Sifatlar" },
    counters: { ru: "Счётные суффиксы", uz: "Hisob qo'shimchalari" },
    keigo: { ru: "Вежливая речь", uz: "Hurmatli nutq" },
  };

  // ============================================
  // LOCALIZATION
  // ============================================
  const uiTexts = {
    ru: {
      title: "Minna no Nihongo",
      selectLesson: "Выберите урок",
      allLessons: "Все уроки",
      lessonPrefix: "Урок",
      question: "Вопрос",
      score: "Счет",
      nextBtn: "Далее",
      wait: "Ждите",
      grammarLabel: "Грамматика",
      correct: "Верно!",
      incorrect: "Ошибка",
      correctAnswerIs: "Правильный ответ:",
      results: "Результаты",
      mainMenu: "Главное меню",
      mistakesTitle: "Ваши ошибки:",
      scoreLabel: "Правильных ответов",
      login: "Войти",
      register: "Регистрация",
      name: "Имя",
      email: "Email",
      password: "Пароль",
      loginBtn: "Войти",
      registerBtn: "Создать аккаунт",
      logout: "Выйти",
      errEmailRequired: "Введите email",
      errEmailInvalid: "Введите корректный email",
      errPasswordRequired: "Введите пароль (мин. 6 символов)",
      errNameRequired: "Введите ваше имя",
      errInvalidCreds: "Неверный email или пароль",
      errEmailTaken: "Этот email уже зарегистрирован",
      errEmailRateLimit:
        "Слишком много писем отправлено. Подождите немного и попробуйте снова.",
      errEmailNotConfirmed:
        "Подтвердите email по ссылке в письме, затем войдите.",
      signupCheckEmail:
        "Аккаунт создан. Проверьте email и подтвердите регистрацию.",
      errTimeout: "Сеть отвечает слишком долго. Попробуйте ещё раз.",
      errGeneric: "Произошла ошибка. Попробуйте ещё раз.",
      leaderboardTitle: "Рейтинг учеников",
      leaderboardEmpty: "Пока нет данных. Начните учить слова!",
      leaderboardOffline: "Рейтинг доступен только в онлайн-режиме",
      leaderboardMastered: "изучено",
      back: "Назад",
      wordsLabel: "слов",
      dictionary: "Словарь",
      wordsCount: "слов",
      examples: "Примеры",
      grammarNote: "Грамматика",
      hiraganaKatakana: "Хирагана и Катакана",
      hiraganaLesson: "Хирагана",
      katakanaLesson: "Катакана",
      kanaLessonSub: "Изучайте японскую азбуку",
      vocabSection: "Словарный запас",
      vocabSectionSub: "Minna no Nihongo — Урок 1",
      kanjiSection: "Тесты по кандзи",
      kanjiSectionSub: "Проверьте знание иероглифов",
      kanjiTestReading: "Кандзи → Чтение",
      kanjiTestReadingDesc: "Выберите правильное чтение иероглифа",
      kanjiTestMeaning: "Кандзи → Значение",
      kanjiTestMeaningDesc: "Выберите правильный перевод иероглифа",
      kanjiTestWrite: "Значение → Кандзи",
      kanjiTestWriteDesc: "Выберите правильный иероглиф",
      kanjiCount: "иероглифов",
      basicKana: "Основные",
      dakutenKana: "Дакутэн",
      comboKana: "Комбинированные",
      dictHiragana: "Хирагана",
      dictKatakana: "Катакана",
      dictKanji: "Кандзи",
      dictVocabulary: "Словарь по урокам",
      charCount: "символов",
      dictGrammar: "Грамматика",
      grammarByTopics: "По темам",
      grammarByLessons: "По урокам",
      grammarRuleCount: "правил",
      allKanjiLessons: "Все уроки",
      selectKanjiLesson: "Выберите урок кандзи",
      kanjiLessonPrefix: "Урок",
      kanjiInLesson: "иероглифов",
      wordQuizInfo: "Прочитайте слово и выберите правильное чтение",
    },
    uz: {
      title: "Minna no Nihongo",
      selectLesson: "Darsni tanlang",
      allLessons: "Barcha darslar",
      lessonPrefix: "Dars",
      question: "Savol",
      score: "Hisob",
      nextBtn: "Keyingi",
      wait: "Kuting",
      grammarLabel: "Grammatika",
      correct: "To'g'ri!",
      incorrect: "Xato",
      correctAnswerIs: "To'g'ri javob:",
      results: "Natijalar",
      mainMenu: "Bosh menyu",
      mistakesTitle: "Xatolar:",
      scoreLabel: "To'g'ri javoblar",
      login: "Kirish",
      register: "Ro'yxatdan o'tish",
      name: "Ism",
      email: "Email",
      password: "Parol",
      loginBtn: "Kirish",
      registerBtn: "Hisob yaratish",
      logout: "Chiqish",
      errEmailRequired: "Email kiriting",
      errEmailInvalid: "To'g'ri email kiriting",
      errPasswordRequired: "Parol kiriting (kamida 6 belgi)",
      errNameRequired: "Ismingizni kiriting",
      errInvalidCreds: "Noto'g'ri email yoki parol",
      errEmailTaken: "Bu email allaqachon ro'yxatdan o'tgan",
      errEmailRateLimit:
        "Juda ko'p xat yuborildi. Biroz kutib qayta urinib ko'ring.",
      errEmailNotConfirmed: "Emailni tasdiqlang va keyin tizimga kiring.",
      signupCheckEmail: "Hisob yaratildi. Emailni tekshirib tasdiqlang.",
      errTimeout: "Tarmoq javobi juda sekin. Qayta urinib ko'ring.",
      errGeneric: "Xatolik yuz berdi. Qaytadan urinib ko'ring.",
      leaderboardTitle: "O'quvchilar reytingi",
      leaderboardEmpty: "Hozircha ma'lumot yo'q. So'z o'rganishni boshlang!",
      leaderboardOffline: "Reyting faqat onlayn rejimda ishlaydi",
      leaderboardMastered: "o'rganildi",
      back: "Ortga",
      wordsLabel: "so'z",
      dictionary: "Lug'at",
      wordsCount: "so'z",
      examples: "Misollar",
      grammarNote: "Grammatika",
      hiraganaKatakana: "Hiragana va Katakana",
      hiraganaLesson: "Hiragana",
      katakanaLesson: "Katakana",
      kanaLessonSub: "Yapon alifbosini o'rganing",
      vocabSection: "Lug'at boyligi",
      vocabSectionSub: "Minna no Nihongo — 1-dars",
      kanjiSection: "Kanji testlari",
      kanjiSectionSub: "Ierogliflar bilimingizni tekshiring",
      kanjiTestReading: "Kanji → O'qilishi",
      kanjiTestReadingDesc: "Ieroglifning to'g'ri o'qilishini tanlang",
      kanjiTestMeaning: "Kanji → Ma'nosi",
      kanjiTestMeaningDesc: "Ieroglifning to'g'ri tarjimasini tanlang",
      kanjiTestWrite: "Ma'no → Kanji",
      kanjiTestWriteDesc: "To'g'ri ieroglifni tanlang",
      kanjiCount: "ieroglif",
      basicKana: "Asosiy",
      dakutenKana: "Dakuten",
      comboKana: "Birikma",
      dictHiragana: "Hiragana",
      dictKatakana: "Katakana",
      dictKanji: "Kanji",
      dictVocabulary: "Darslar bo'yicha lug'at",
      charCount: "belgi",
      dictGrammar: "Grammatika",
      grammarByTopics: "Mavzular bo'yicha",
      grammarByLessons: "Darslar bo'yicha",
      grammarRuleCount: "qoida",
      allKanjiLessons: "Barcha darslar",
      selectKanjiLesson: "Kanji darsini tanlang",
      kanjiLessonPrefix: "Dars",
      kanjiInLesson: "ieroglif",
      wordQuizInfo: "So'zni o'qing va to'g'ri o'qilishini tanlang",
    },
  };

  // ============================================
  // STATE
  // ============================================
  var state = {
    lang: "ru",
    quizData: [],
    currentOptions: [],
    currentIndex: 0,
    score: 0,
    mistakes: [],
    isModalOpen: false,
    timerInterval: null,
    user: null,
    displayName: "User",
    userProgress: {},
    authMode: "login",
    soundEnabled: true,
    musicEnabled: false,
    currentLessonFilter: null,
    modalCallback: null,
    quizMode: null,
    resultsMode: null,
    modalKanjiItem: null,
    modalWasCorrect: false,
  };

  // ============================================
  // DOM REFS
  // ============================================
  var els = {};

  function cacheDom() {
    els.title = document.getElementById("app-title");
    els.langBtns = document.querySelectorAll(".lang-btn");

    els.authScreen = document.getElementById("auth-screen");
    els.startScreen = document.getElementById("start-screen");
    els.quizView = document.getElementById("quiz-view");
    els.resultsView = document.getElementById("results-view");
    els.leaderboardScreen = document.getElementById("leaderboard-screen");
    els.dictionaryScreen = document.getElementById("dictionary-screen");

    els.headerUserInfo = document.getElementById("header-user-info");
    els.headerUserName = document.getElementById("header-user-name");
    els.soundToggleBtn = document.getElementById("sound-toggle-btn");
    els.musicToggleBtn = document.getElementById("music-toggle-btn");
    els.leaderboardBtn = document.getElementById("leaderboard-btn");
    els.dictionaryBtn = document.getElementById("dictionary-btn");
    els.logoutBtn = document.getElementById("logout-btn");

    els.tabLogin = document.getElementById("tab-login");
    els.tabRegister = document.getElementById("tab-register");
    els.fieldName = document.getElementById("field-name");
    els.authName = document.getElementById("auth-name");
    els.authEmail = document.getElementById("auth-email");
    els.authPassword = document.getElementById("auth-password");
    els.authError = document.getElementById("auth-error");
    els.authSubmitBtn = document.getElementById("auth-submit-btn");
    els.authLabelName = document.getElementById("auth-label-name");
    els.authLabelEmail = document.getElementById("auth-label-email");
    els.authLabelPassword = document.getElementById("auth-label-password");

    els.selectLessonTitle = document.getElementById("select-lesson-title");
    els.lessonGrid = document.getElementById("lesson-grid");

    els.quizProgressBar = document.getElementById("quiz-progress-bar");
    els.labelQ = document.getElementById("label-q");
    els.labelScore = document.getElementById("label-score");
    els.progressText = document.getElementById("progress-text");
    els.currentScoreDisplay = document.getElementById("current-score-display");
    els.wordDisplay = document.getElementById("word-display");
    els.lessonIndicator = document.getElementById("lesson-indicator");
    els.optionsContainer = document.getElementById("options-container");

    els.modal = document.getElementById("feedback-modal");
    els.feedbackIcon = document.getElementById("feedback-icon");
    els.feedbackStatus = document.getElementById("feedback-status");
    els.correctLabel = document.getElementById("correct-label");
    els.correctAnswerText = document.getElementById("correct-answer-text");
    els.modalExampleJp = document.getElementById("modal-example-jp");
    els.modalExampleLabel = document.getElementById("modal-example-label");
    els.modalExampleTrans = document.getElementById("modal-example-trans");
    els.modalGrammarLabel = document.getElementById("modal-grammar-label");
    els.modalGrammarText = document.getElementById("modal-grammar-text");
    els.modalNextBtn = document.getElementById("modal-next-btn");
    els.btnText = document.getElementById("btn-text");
    els.timerBar = document.getElementById("timer-bar");

    els.resultsTitle = document.getElementById("results-title");
    els.finalScore = document.getElementById("final-score");
    els.finalScoreLabel = document.getElementById("final-score-label");
    els.mistakesTitle = document.getElementById("mistakes-title");
    els.mistakesList = document.getElementById("mistakes-list");
    els.mistakesBlock = document.getElementById("mistakes-block");
    els.restartBtn = document.getElementById("restart-btn");
    els.quizBackBtn = document.getElementById("quiz-back-btn");

    els.leaderboardTitle = document.getElementById("leaderboard-title");
    els.leaderboardList = document.getElementById("leaderboard-list");
    els.leaderboardBackBtn = document.getElementById("leaderboard-back-btn");

    els.dictionaryTitle = document.getElementById("dictionary-title");
    els.dictionaryBreadcrumb = document.getElementById("dictionary-breadcrumb");
    els.dictionaryContent = document.getElementById("dictionary-content");
    els.dictionaryBackBtn = document.getElementById("dictionary-back-btn");

    els.sakuraContainer = document.getElementById("sakura-container");
    els.sakuraToggle = document.getElementById("sakura-toggle");
    els.themeToggleBtn = document.getElementById("theme-toggle-btn");
  }

  // ============================================
  // THEME
  // ============================================
  function initTheme() {
    var saved = null;
    try {
      saved = localStorage.getItem("mnn_theme");
    } catch (e) {}
    if (saved === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    updateThemeButtonState();
  }

  function toggleTheme() {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      try {
        localStorage.setItem("mnn_theme", "light");
      } catch (e) {}
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      try {
        localStorage.setItem("mnn_theme", "dark");
      } catch (e) {}
    }
    updateThemeButtonState();
  }

  function updateThemeButtonState() {
    if (!els.themeToggleBtn) return;
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    els.themeToggleBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
  }

  function setModalVisibility(visible) {
    if (!els.modal) return;
    els.modal.classList.toggle("visible", !!visible);
    els.modal.setAttribute("aria-hidden", visible ? "false" : "true");
  }

  // ============================================
  // SOUND (Web Audio API)
  // ============================================
  var audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {}
    }
    return audioCtx;
  }

  function playCorrectSound() {
    if (!state.soundEnabled) return;
    try {
      var ctx = getAudioCtx();
      if (!ctx) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }

  function playIncorrectSound() {
    if (!state.soundEnabled) return;
    try {
      var ctx = getAudioCtx();
      if (!ctx) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(349.23, ctx.currentTime);
      osc.frequency.setValueAtTime(311.13, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  // ============================================
  // BACKGROUND MUSIC — Authentic Japanese Ambient
  // ============================================
  // Generative music using Miyako-bushi / In scale
  // Simulates: Koto (plucked strings), Shakuhachi (bamboo flute),
  // soft pad drones, and gentle rain-like texture.

  var bgMusic = {
    masterGain: null,
    reverbGain: null,
    dryGain: null,
    convolver: null,
    isPlaying: false,
    loopTimer: null,
    droneOsc: null,
    droneGain: null,
    rainNode: null,
    rainGain: null,
    phraseCount: 0,

    // Miyako-bushi / In scale across multiple octaves
    // D Eb G A Bb — the quintessential Japanese minor scale
    scaleFreqs: [
      // Octave 3
      146.83, 155.56, 196.0, 220.0, 233.08,
      // Octave 4
      293.66, 311.13, 392.0, 440.0, 466.16,
      // Octave 5
      587.33, 622.25, 783.99, 880.0, 932.33,
    ],
    kotoRange: [5, 6, 7, 8, 9, 10, 11, 12], // mid-high octaves for koto
    shakuRange: [2, 3, 4, 5, 6, 7, 8], // mid range for flute
    bassRange: [0, 1, 2, 3, 4], // low octave for bass drone

    // Musical phrases — intervallic patterns (indices into current range)
    // These create recognizable melodic contours
    kotoPhrases: [
      [0, 2, 4, 3, 1], // ascending-descending arc
      [4, 3, 1, 0], // gentle descent
      [0, 1, 3, 4, 3], // rise and settle
      [2, 0, 1, 3, 2], // wandering
      [4, 2, 0, 1], // falling with grace note
      [1, 3, 4, 2, 0], // wave pattern
      [0, 4, 3, 1, 0], // leap then descend
      [3, 2, 0, 2, 3, 4], // valley shape
    ],
    shakuPhrases: [
      [0, 2, 3], // simple rise
      [3, 2, 0, 1], // gentle descent
      [1, 3, 2], // short arc
      [0, 1, 3, 2, 0], // full arc
      [2, 0, 1], // dip and rise
    ],

    init: function () {
      var ctx = getAudioCtx();
      if (!ctx || this.masterGain) return;

      // Master output
      this.masterGain = ctx.createGain();
      this.masterGain.gain.value = 0;
      this.masterGain.connect(ctx.destination);

      // Simple reverb via feedback delay network
      this.dryGain = ctx.createGain();
      this.dryGain.gain.value = 0.7;
      this.dryGain.connect(this.masterGain);

      this.reverbGain = ctx.createGain();
      this.reverbGain.gain.value = 0.35;
      this.reverbGain.connect(this.masterGain);

      // Create reverb impulse
      this._createReverb(ctx);
    },

    _createReverb: function (ctx) {
      // Algorithmic reverb using multiple delay lines
      var self = this;
      var delays = [0.037, 0.053, 0.079, 0.097, 0.131];
      var feedback = 0.42;

      self._reverbInput = ctx.createGain();
      self._reverbInput.gain.value = 1;

      var merger = ctx.createGain();
      merger.gain.value = 0.3;
      merger.connect(self.reverbGain);

      delays.forEach(function (t) {
        var delay = ctx.createDelay(0.2);
        delay.delayTime.value = t;
        var fb = ctx.createGain();
        fb.gain.value = feedback;
        var lpf = ctx.createBiquadFilter();
        lpf.type = "lowpass";
        lpf.frequency.value = 2800;

        self._reverbInput.connect(delay);
        delay.connect(lpf);
        lpf.connect(fb);
        fb.connect(delay);
        lpf.connect(merger);
      });
    },

    _connectToOutput: function (node) {
      node.connect(this.dryGain);
      if (this._reverbInput) node.connect(this._reverbInput);
    },

    start: function () {
      var ctx = getAudioCtx();
      if (!ctx || this.isPlaying) return;
      this.init();
      this.isPlaying = true;
      this.phraseCount = 0;
      // Fade in
      this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
      this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 1.5);
      this._startDrone();
      this._startRain();
      this.scheduleLoop();
    },

    stop: function () {
      var ctx = getAudioCtx();
      if (!ctx || !this.isPlaying) return;
      this.isPlaying = false;
      // Fade out
      this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
      this.masterGain.gain.setValueAtTime(
        this.masterGain.gain.value,
        ctx.currentTime,
      );
      this.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      if (this.loopTimer) {
        clearTimeout(this.loopTimer);
        this.loopTimer = null;
      }
      // Stop drone & rain after fade
      var self = this;
      setTimeout(function () {
        self._stopDrone();
        self._stopRain();
      }, 1800);
    },

    // ---- DRONE (constant harmonic bed) ----
    _startDrone: function () {
      var ctx = getAudioCtx();
      if (!ctx || this.droneOsc) return;

      // Low D drone with harmonics
      var baseFreq = 73.42; // D2

      this.droneGain = ctx.createGain();
      this.droneGain.gain.value = 0;
      this.droneGain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 3);

      var lpf = ctx.createBiquadFilter();
      lpf.type = "lowpass";
      lpf.frequency.value = 400;
      lpf.Q.value = 1;

      this.droneOsc = [];
      var types = ["sine", "triangle"];
      var freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2]; // root, fifth, octave
      var vols = [0.5, 0.25, 0.15];

      for (var i = 0; i < freqs.length; i++) {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = types[i % types.length];
        osc.frequency.value = freqs[i];
        g.gain.value = vols[i];
        osc.connect(g);
        g.connect(lpf);
        osc.start(ctx.currentTime);
        this.droneOsc.push({ osc: osc, gain: g });
      }
      lpf.connect(this.droneGain);
      this._connectToOutput(this.droneGain);
    },

    _stopDrone: function () {
      if (!this.droneOsc) return;
      var ctx = getAudioCtx();
      var now = ctx ? ctx.currentTime : 0;
      this.droneOsc.forEach(function (d) {
        try {
          d.osc.stop(now + 0.1);
        } catch (e) {}
      });
      this.droneOsc = null;
    },

    // ---- RAIN TEXTURE (filtered noise) ----
    _startRain: function () {
      var ctx = getAudioCtx();
      if (!ctx || this.rainNode) return;

      // White noise via buffer
      var bufferSize = ctx.sampleRate * 2;
      var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }

      this.rainNode = ctx.createBufferSource();
      this.rainNode.buffer = buffer;
      this.rainNode.loop = true;

      // Shape the noise to sound like gentle rain
      var hpf = ctx.createBiquadFilter();
      hpf.type = "highpass";
      hpf.frequency.value = 4000;

      var lpf = ctx.createBiquadFilter();
      lpf.type = "lowpass";
      lpf.frequency.value = 8000;

      this.rainGain = ctx.createGain();
      this.rainGain.gain.value = 0;
      this.rainGain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 4);

      this.rainNode.connect(hpf);
      hpf.connect(lpf);
      lpf.connect(this.rainGain);
      this._connectToOutput(this.rainGain);
      this.rainNode.start(ctx.currentTime);
    },

    _stopRain: function () {
      if (!this.rainNode) return;
      try {
        this.rainNode.stop();
      } catch (e) {}
      this.rainNode = null;
    },

    // ---- KOTO (plucked string simulation) ----
    playKoto: function (freq, startTime, duration) {
      var ctx = getAudioCtx();
      if (!ctx || !this.dryGain) return;
      try {
        var baseVol = 0.04 + Math.random() * 0.02;

        // Fundamental + harmonics (string-like)
        var harmonics = [1, 2, 3, 4.01, 5.02];
        var hVols = [1, 0.4, 0.18, 0.08, 0.03];
        var mainGain = ctx.createGain();
        mainGain.gain.value = baseVol;

        for (var h = 0; h < harmonics.length; h++) {
          var osc = ctx.createOscillator();
          var g = ctx.createGain();
          osc.type = h === 0 ? "triangle" : "sine";
          osc.frequency.value = freq * harmonics[h];

          // Koto: sharp attack, long decay
          g.gain.setValueAtTime(0, startTime);
          g.gain.linearRampToValueAtTime(hVols[h], startTime + 0.003);
          g.gain.setValueAtTime(hVols[h] * 0.7, startTime + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          // Slight pitch bend on attack (string snap)
          if (h === 0) {
            osc.frequency.setValueAtTime(freq * 1.015, startTime);
            osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.05);
          }

          osc.connect(g);
          g.connect(mainGain);
          osc.start(startTime);
          osc.stop(startTime + duration + 0.1);
        }

        this._connectToOutput(mainGain);
      } catch (e) {}
    },

    // ---- SHAKUHACHI (breathy flute simulation) ----
    playShakuhachi: function (freq, startTime, duration) {
      var ctx = getAudioCtx();
      if (!ctx || !this.dryGain) return;
      try {
        var vol = 0.03 + Math.random() * 0.015;

        // Main tone: sine with slow vibrato
        var osc = ctx.createOscillator();
        var oscGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;

        // Vibrato
        var vib = ctx.createOscillator();
        var vibGain = ctx.createGain();
        vib.frequency.value = 4 + Math.random() * 2;
        vibGain.gain.value = freq * 0.008;
        vib.connect(vibGain);
        vibGain.connect(osc.frequency);
        vib.start(startTime);
        vib.stop(startTime + duration + 0.5);

        // Breath envelope: slow attack, sustain, slow release
        oscGain.gain.setValueAtTime(0, startTime);
        oscGain.gain.linearRampToValueAtTime(vol, startTime + duration * 0.2);
        oscGain.gain.setValueAtTime(vol * 0.85, startTime + duration * 0.7);
        oscGain.gain.linearRampToValueAtTime(0, startTime + duration);

        osc.connect(oscGain);

        // Breath noise layer
        var bufferSize = Math.ceil(ctx.sampleRate * (duration + 0.5));
        var noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        var nd = noiseBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
          nd[i] = Math.random() * 2 - 1;
        }
        var noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        var noiseBpf = ctx.createBiquadFilter();
        noiseBpf.type = "bandpass";
        noiseBpf.frequency.value = freq * 2;
        noiseBpf.Q.value = 2;

        var noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, startTime);
        noiseGain.gain.linearRampToValueAtTime(
          vol * 0.15,
          startTime + duration * 0.15,
        );
        noiseGain.gain.setValueAtTime(vol * 0.12, startTime + duration * 0.7);
        noiseGain.gain.linearRampToValueAtTime(0, startTime + duration);

        noise.connect(noiseBpf);
        noiseBpf.connect(noiseGain);

        // Mix flute tone + breath
        var mixGain = ctx.createGain();
        mixGain.gain.value = 1;
        oscGain.connect(mixGain);
        noiseGain.connect(mixGain);

        this._connectToOutput(mixGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.2);
        noise.start(startTime);
        noise.stop(startTime + duration + 0.2);
      } catch (e) {}
    },

    // ---- BELL (temple bell / wind chime accent) ----
    playBell: function (freq, startTime) {
      var ctx = getAudioCtx();
      if (!ctx || !this.dryGain) return;
      try {
        var partials = [1, 2.32, 3.56, 5.12];
        var pVols = [0.04, 0.02, 0.01, 0.005];
        var dur = 4 + Math.random() * 2;
        var mainGain = ctx.createGain();
        mainGain.gain.value = 1;

        for (var p = 0; p < partials.length; p++) {
          var osc = ctx.createOscillator();
          var g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq * partials[p];
          g.gain.setValueAtTime(0, startTime);
          g.gain.linearRampToValueAtTime(pVols[p], startTime + 0.001);
          g.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);
          osc.connect(g);
          g.connect(mainGain);
          osc.start(startTime);
          osc.stop(startTime + dur + 0.1);
        }

        this._connectToOutput(mainGain);
      } catch (e) {}
    },

    // ---- SCHEDULING ----
    scheduleLoop: function () {
      if (!this.isPlaying) return;
      var ctx = getAudioCtx();
      if (!ctx) return;
      var self = this;
      var now = ctx.currentTime;
      var nextEventEnd = now;

      self.phraseCount++;

      // Decide what to play this cycle
      var roll = Math.random();

      if (roll < 0.4) {
        // KOTO PHRASE
        var phrase =
          self.kotoPhrases[Math.floor(Math.random() * self.kotoPhrases.length)];
        var noteTime = now + 0.2;
        var range = self.kotoRange;

        for (var i = 0; i < phrase.length; i++) {
          var idx = range[phrase[i] % range.length];
          var freq = self.scaleFreqs[idx];
          var dur = 1.5 + Math.random() * 2.0;
          var gap = 0.15 + Math.random() * 0.3;

          self.playKoto(freq, noteTime, dur);
          noteTime += dur * 0.35 + gap;
        }
        nextEventEnd = noteTime + 1;
      } else if (roll < 0.7) {
        // SHAKUHACHI PHRASE
        var phrase =
          self.shakuPhrases[
            Math.floor(Math.random() * self.shakuPhrases.length)
          ];
        var noteTime = now + 0.3;
        var range = self.shakuRange;

        for (var i = 0; i < phrase.length; i++) {
          var idx = range[phrase[i] % range.length];
          var freq = self.scaleFreqs[idx];
          var dur = 2.0 + Math.random() * 3.0;
          var gap = 0.3 + Math.random() * 0.6;

          self.playShakuhachi(freq, noteTime, dur);
          noteTime += dur * 0.6 + gap;
        }
        nextEventEnd = noteTime + 1.5;
      } else if (roll < 0.85) {
        // KOTO + SHAKUHACHI together (duet)
        var kPhrase =
          self.kotoPhrases[Math.floor(Math.random() * self.kotoPhrases.length)];
        var noteTime = now + 0.2;
        var kRange = self.kotoRange;
        var endKoto = noteTime;

        for (var i = 0; i < Math.min(3, kPhrase.length); i++) {
          var idx = kRange[kPhrase[i] % kRange.length];
          var freq = self.scaleFreqs[idx];
          var dur = 1.8 + Math.random() * 1.5;
          self.playKoto(freq, noteTime, dur);
          noteTime += dur * 0.4 + 0.2;
          endKoto = noteTime;
        }

        // Shakuhachi enters slightly after
        var sPhrase =
          self.shakuPhrases[
            Math.floor(Math.random() * self.shakuPhrases.length)
          ];
        var sRange = self.shakuRange;
        var sTime = now + 1.5 + Math.random();
        for (var i = 0; i < Math.min(2, sPhrase.length); i++) {
          var idx = sRange[sPhrase[i] % sRange.length];
          var freq = self.scaleFreqs[idx];
          var dur = 2.5 + Math.random() * 2;
          self.playShakuhachi(freq, sTime, dur);
          sTime += dur * 0.7;
        }
        nextEventEnd = Math.max(endKoto, sTime) + 1;
      } else {
        // BELL / SILENCE (breathing space)
        if (Math.random() > 0.3) {
          var bellFreq =
            self.scaleFreqs[self.kotoRange[Math.floor(Math.random() * 3)]];
          self.playBell(bellFreq * 2, now + 0.5);
        }
        nextEventEnd = now + 3 + Math.random() * 2;
      }

      // Add breathing space between phrases
      var pause = 2.0 + Math.random() * 3.5;
      // Every ~4th phrase, longer silence for contemplation
      if (self.phraseCount % 4 === 0) pause += 2 + Math.random() * 3;

      var nextDelay = Math.max(2, nextEventEnd - now + pause) * 1000;
      self.loopTimer = setTimeout(function () {
        self.scheduleLoop();
      }, nextDelay);
    },
  };

  function toggleBgMusic() {
    state.musicEnabled = !state.musicEnabled;
    if (state.musicEnabled) {
      bgMusic.start();
    } else {
      bgMusic.stop();
    }
    els.musicToggleBtn.innerHTML = state.musicEnabled
      ? ICONS.music
      : ICONS.musicOff;
    els.musicToggleBtn.classList.toggle("muted", !state.musicEnabled);
    els.musicToggleBtn.setAttribute(
      "aria-pressed",
      state.musicEnabled ? "true" : "false",
    );
  }

  // ============================================
  // LOCAL STORAGE PROGRESS (offline fallback)
  // ============================================
  var LS_KEY_PREFIX = "mnn_progress_" + SUPABASE_PROJECT_REF;
  var LEGACY_LS_KEY = "mnn_progress";

  function getLocalProgressStorageKey() {
    var userPart = state.user && state.user.id ? state.user.id : "guest";
    return LS_KEY_PREFIX + ":" + userPart;
  }

  function isPlainObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function loadLocalProgress() {
    state.userProgress = {};
    try {
      var storageKey = getLocalProgressStorageKey();
      var data = localStorage.getItem(storageKey);
      if (!data && storageKey.indexOf(":guest") !== -1) {
        data = localStorage.getItem(LEGACY_LS_KEY);
        if (data) {
          localStorage.setItem(storageKey, data);
        }
      }
      if (!data) return;

      var parsed = JSON.parse(data);
      if (isPlainObject(parsed)) {
        state.userProgress = parsed;
      }
    } catch (e) {
      state.userProgress = {};
    }
  }

  function saveLocalProgress() {
    if (!isPlainObject(state.userProgress)) {
      state.userProgress = {};
    }
    try {
      localStorage.setItem(
        getLocalProgressStorageKey(),
        JSON.stringify(state.userProgress),
      );
    } catch (e) {}
  }

  // ============================================
  // NAVIGATION
  // ============================================
  function showScreen(name) {
    var allScreens = [
      els.authScreen,
      els.startScreen,
      els.quizView,
      els.resultsView,
      els.leaderboardScreen,
      els.dictionaryScreen,
    ];
    allScreens.forEach(function (screen) {
      if (!screen) return;
      screen.classList.remove("visible");
      screen.setAttribute("aria-hidden", "true");
    });

    var map = {
      auth: els.authScreen,
      start: els.startScreen,
      quiz: els.quizView,
      results: els.resultsView,
      leaderboard: els.leaderboardScreen,
      dictionary: els.dictionaryScreen,
    };
    if (map[name]) {
      var el = map[name];
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
      el.classList.add("visible");
      el.setAttribute("aria-hidden", "false");
    }
  }

  // ============================================
  // HEADER VISIBILITY
  // ============================================
  function showHeaderButtons(show) {
    var method = show ? "add" : "remove";
    els.soundToggleBtn.classList[method]("visible");
    els.musicToggleBtn.classList[method]("visible");
    els.leaderboardBtn.classList[method]("visible");
    els.dictionaryBtn.classList[method]("visible");
    els.logoutBtn.classList[method]("visible");
    els.headerUserInfo.style.display = show ? "flex" : "none";
  }

  // ============================================
  // AUTH
  // ============================================
  function switchAuthMode(mode) {
    state.authMode = mode;
    els.tabLogin.classList.toggle("active", mode === "login");
    els.tabRegister.classList.toggle("active", mode === "register");
    els.fieldName.style.display = mode === "register" ? "flex" : "none";
    els.authError.textContent = "";
    updateAuthLabels();
  }

  function updateAuthLabels() {
    var txt = uiTexts[state.lang];
    els.tabLogin.textContent = txt.login;
    els.tabRegister.textContent = txt.register;
    els.authLabelName.textContent = txt.name;
    els.authLabelEmail.textContent = txt.email;
    els.authLabelPassword.textContent = txt.password;
    els.authSubmitBtn.textContent =
      state.authMode === "login" ? txt.loginBtn : txt.registerBtn;
  }

  var _authAttempts = 0;
  var _authLockUntil = 0;
  var _signupRateLimitUntil = 0;
  var _authRequestInFlight = false;
  var _authSuccessInFlight = false;
  var AUTH_MAX_ATTEMPTS = 5;
  var AUTH_LOCK_MS = 30000; // 30 seconds cooldown
  var SIGNUP_RATE_LIMIT_MS = 60000;

  function isValidEmailAddress(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleAuthSubmit() {
    if (!supabaseReady || _authRequestInFlight) return;

    var txt = uiTexts[state.lang];
    var now = Date.now();

    if (now < _authLockUntil) {
      var secsLeft = Math.ceil((_authLockUntil - now) / 1000);
      els.authError.textContent = txt.wait + " (" + secsLeft + "s)";
      return;
    }

    if (state.authMode === "register" && now < _signupRateLimitUntil) {
      var signupWait = Math.ceil((_signupRateLimitUntil - now) / 1000);
      els.authError.textContent =
        txt.errEmailRateLimit + " (" + signupWait + "s)";
      return;
    }

    var email = els.authEmail.value.trim();
    var password = els.authPassword.value;
    var name = els.authName.value.trim();

    els.authEmail.classList.remove("error");
    els.authPassword.classList.remove("error");
    els.authName.classList.remove("error");

    if (!email) {
      els.authEmail.classList.add("error");
      els.authError.textContent = txt.errEmailRequired;
      return;
    }
    if (!isValidEmailAddress(email)) {
      els.authEmail.classList.add("error");
      els.authError.textContent = txt.errEmailInvalid;
      return;
    }
    if (!password || password.length < 6) {
      els.authPassword.classList.add("error");
      els.authError.textContent = txt.errPasswordRequired;
      return;
    }
    if (state.authMode === "register" && !name) {
      els.authName.classList.add("error");
      els.authError.textContent = txt.errNameRequired;
      return;
    }

    _authRequestInFlight = true;
    els.authSubmitBtn.disabled = true;
    var btnLabel = state.authMode === "login" ? txt.loginBtn : txt.registerBtn;
    els.authSubmitBtn.innerHTML = '<span class="spinner"></span>' + btnLabel;
    els.authError.textContent = "";

    try {
      var result;
      if (state.authMode === "login") {
        result = await withTimeout(
          sb.auth.signInWithPassword({
            email: email,
            password: password,
          }),
          AUTH_REQUEST_TIMEOUT_MS,
        );
      } else {
        result = await withTimeout(
          sb.auth.signUp({
            email: email,
            password: password,
            options: {
              data: { display_name: name, full_name: name, name: name },
            },
          }),
          AUTH_REQUEST_TIMEOUT_MS,
        );
      }

      if (result.error) {
        var msg = result.error.message || "";
        var code = result.error.code || "";
        var lowerMsg = msg.toLowerCase();
        var isRateLimited =
          result.error.status === 429 ||
          lowerMsg.indexOf("rate limit") !== -1 ||
          code.toLowerCase().indexOf("rate_limit") !== -1 ||
          code === "over_email_send_rate_limit";

        if (isRateLimited) {
          if (state.authMode === "register") {
            _signupRateLimitUntil = Date.now() + SIGNUP_RATE_LIMIT_MS;
            var signupSecs = Math.ceil(SIGNUP_RATE_LIMIT_MS / 1000);
            els.authError.textContent =
              txt.errEmailRateLimit + " (" + signupSecs + "s)";
          } else {
            els.authError.textContent = txt.wait;
          }
          return;
        }

        if (
          lowerMsg.indexOf("email not confirmed") !== -1 ||
          code === "email_not_confirmed"
        ) {
          els.authError.textContent = txt.errEmailNotConfirmed;
          return;
        }

        _authAttempts++;
        if (_authAttempts >= AUTH_MAX_ATTEMPTS) {
          _authLockUntil = Date.now() + AUTH_LOCK_MS;
          _authAttempts = 0;
        }
        if (msg.indexOf("Invalid login") !== -1) {
          els.authError.textContent = txt.errInvalidCreds;
        } else if (
          msg.indexOf("already registered") !== -1 ||
          msg.indexOf("already been registered") !== -1
        ) {
          els.authError.textContent = txt.errEmailTaken;
        } else {
          els.authError.textContent = msg || txt.errGeneric;
        }
        return;
      }

      var sessionUser =
        result.data && result.data.session ? result.data.session.user : null;
      var returnedUser = result.data ? result.data.user : null;

      // При включенном email confirmation signUp может вернуть user без session.
      if (state.authMode === "register" && returnedUser && !sessionUser) {
        _authAttempts = 0;
        _authLockUntil = 0;
        switchAuthMode("login");
        els.authPassword.value = "";
        els.authError.textContent = txt.signupCheckEmail;
        return;
      }

      state.user = sessionUser || returnedUser;
      if (!state.user || (state.authMode === "login" && !sessionUser)) {
        els.authError.textContent = txt.errGeneric;
        return;
      }

      _authAttempts = 0;
      _authLockUntil = 0;
      await onAuthSuccess();
    } catch (err) {
      if (err && err.message === "request_timeout") {
        els.authError.textContent = txt.errTimeout;
      } else {
        els.authError.textContent = txt.errGeneric;
      }
    } finally {
      _authRequestInFlight = false;
      els.authSubmitBtn.disabled = false;
      updateAuthLabels();
    }
  }

  async function onAuthSuccess() {
    if (!state.user || !state.user.id) {
      resetToAuthScreen();
      return;
    }

    if (_authSuccessInFlight) return;
    _authSuccessInFlight = true;

    try {
      showHeaderButtons(true);

      var displayName = state.displayName || "User";
      if (state.user.user_metadata) {
        displayName =
          state.user.user_metadata.display_name ||
          state.user.user_metadata.full_name ||
          state.user.user_metadata.name ||
          displayName;
      }
      try {
        var res = await withTimeout(
          sb.from("profiles").select("*").eq("id", state.user.id).maybeSingle(),
          POST_LOGIN_TIMEOUT_MS,
        );
        if (res.data) {
          displayName =
            res.data.display_name ||
            res.data.full_name ||
            res.data.name ||
            displayName;
        }
      } catch (_e) {}
      state.displayName = displayName || "User";
      els.headerUserName.textContent = state.displayName;

      try {
        await withTimeout(loadSupabaseProgress(), POST_LOGIN_TIMEOUT_MS);
      } catch (e) {}

      initLessonSelection();
    } finally {
      _authSuccessInFlight = false;
    }
  }

  async function handleLogout() {
    if (supabaseReady && sb) {
      try {
        await sb.auth.signOut();
      } catch (e) {}
    }
    state.user = null;
    state.displayName = "User";
    state.userProgress = {};
    state.quizMode = null;
    state.resultsMode = null;
    state.isModalOpen = false;
    state.modalCallback = null;
    state.modalKanjiItem = null;
    state.modalWasCorrect = false;
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    setModalVisibility(false);
    showHeaderButtons(false);
    if (supabaseReady) {
      showScreen("auth");
    } else {
      loadLocalProgress();
      initLessonSelection();
    }
  }

  // ============================================
  // PROGRESS: SUPABASE
  // ============================================
  async function loadSupabaseProgress() {
    if (!supabaseReady || !state.user) return;
    try {
      var caps = await ensureBackendCapabilities();
      if (!caps.hasWordProgressTable) {
        loadLocalProgress();
        return;
      }

      var res = await sb
        .from("word_progress")
        .select("word_id, correct_count, lesson_number")
        .eq("user_id", state.user.id);

      if (res.error) throw res.error;

      state.userProgress = {};
      if (res.data) {
        res.data.forEach(function (row) {
          state.userProgress[row.word_id] = {
            correct_count: row.correct_count,
            lesson_number: row.lesson_number,
          };
        });
      }
    } catch (e) {
      loadLocalProgress();
    }
  }

  async function saveAnswer(wordData, isCorrect) {
    if (!isPlainObject(state.userProgress)) {
      state.userProgress = {};
    }

    if (!state.userProgress[wordData.id]) {
      state.userProgress[wordData.id] = {
        correct_count: 0,
        lesson_number: wordData.lesson,
      };
    }
    if (isCorrect) {
      state.userProgress[wordData.id].correct_count++;
    }

    if (supabaseReady && state.user) {
      try {
        var caps = await ensureBackendCapabilities();
        if (caps.hasUpsertProgressRpc) {
          await sb.rpc("upsert_word_progress", {
            p_user_id: state.user.id,
            p_word_id: wordData.id,
            p_lesson_number: wordData.lesson,
            p_is_correct: !!isCorrect,
          });
        } else if (caps.hasWordProgressTable) {
          await sb.from("word_progress").upsert(
            {
              user_id: state.user.id,
              word_id: wordData.id,
              lesson_number: wordData.lesson,
              correct_count: state.userProgress[wordData.id].correct_count,
            },
            { onConflict: "user_id,word_id" },
          );
        }
      } catch (_e) {}
    }

    saveLocalProgress();
  }

  // ============================================
  // PROGRESS CALCULATIONS
  // ============================================
  // Pre-index words by lesson for O(1) lookups instead of repeated .filter()
  var _wordsByLesson = {};
  wordsData.forEach(function (w) {
    if (!_wordsByLesson[w.lesson]) _wordsByLesson[w.lesson] = [];
    _wordsByLesson[w.lesson].push(w);
  });

  function getWordsByLesson(lessonNum) {
    return _wordsByLesson[lessonNum] || [];
  }

  function getLessonProgress(lessonNum) {
    if (!isPlainObject(state.userProgress)) {
      state.userProgress = {};
    }
    var lessonWords = getWordsByLesson(lessonNum);
    var total = lessonWords.length;
    var mastered = 0;
    lessonWords.forEach(function (w) {
      var p = state.userProgress[w.id];
      if (p && p.correct_count >= MASTERY_THRESHOLD) mastered++;
    });
    return {
      mastered: mastered,
      total: total,
      percent:
        total > 0
          ? Math.min(100, Math.max(0, Math.round((mastered / total) * 100)))
          : 0,
    };
  }

  function getProgressColor(percent) {
    if (percent <= 33) return "low";
    if (percent <= 66) return "mid";
    return "high";
  }

  // ============================================
  // LESSON SELECTION
  // ============================================
  function initLessonSelection() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    state.quizMode = null;
    state.resultsMode = null;
    state.modalKanjiItem = null;
    state.modalWasCorrect = false;
    showScreen("start");
    renderLessonGrid();
    updateUILabels();
  }

  var _cachedLessons = null;
  function getAvailableLessons() {
    if (_cachedLessons) return _cachedLessons;
    var lessonsSet = {};
    wordsData.forEach(function (w) {
      lessonsSet[w.lesson] = true;
    });
    _cachedLessons = Object.keys(lessonsSet)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      });
    return _cachedLessons;
  }

  function renderLessonGrid() {
    els.lessonGrid.innerHTML = "";
    var lessons = getAvailableLessons();
    var txt = uiTexts[state.lang];

    // ── SECTION 1: Hiragana & Katakana ──
    var kanaSection = document.createElement("div");
    kanaSection.className = "main-section";
    kanaSection.innerHTML =
      '<div class="main-section-header">' +
      '<div class="main-section-icon hiragana-icon">あ</div>' +
      '<div><div class="main-section-title">' +
      escapeHtml(txt.hiraganaKatakana) +
      "</div>" +
      '<div class="main-section-subtitle">' +
      escapeHtml(txt.kanaLessonSub) +
      "</div></div>" +
      "</div>";

    var kanaRow = document.createElement("div");
    kanaRow.className = "kana-cards-row";

    // Hiragana card
    var hiraCard = document.createElement("div");
    hiraCard.className = "kana-card hiragana-card";
    hiraCard.innerHTML =
      '<div class="kana-card-char">あ い う</div>' +
      '<div class="kana-card-label">' +
      escapeHtml(txt.hiraganaLesson) +
      "</div>" +
      '<div class="kana-card-count">' +
      hiraganaWordsQuiz.length +
      " " +
      txt.wordsCount +
      "</div>";
    bindAccessibleAction(hiraCard, function () {
      startKanaQuiz("hiragana");
    });
    kanaRow.appendChild(hiraCard);

    // Katakana card
    var kataCard = document.createElement("div");
    kataCard.className = "kana-card katakana-card";
    kataCard.innerHTML =
      '<div class="kana-card-char">ア イ ウ</div>' +
      '<div class="kana-card-label">' +
      escapeHtml(txt.katakanaLesson) +
      "</div>" +
      '<div class="kana-card-count">' +
      katakanaWordsQuiz.length +
      " " +
      txt.wordsCount +
      "</div>";
    bindAccessibleAction(kataCard, function () {
      startKanaQuiz("katakana");
    });
    kanaRow.appendChild(kataCard);

    kanaSection.appendChild(kanaRow);
    els.lessonGrid.appendChild(kanaSection);

    // ── SECTION 2: Minna no Nihongo Vocabulary ──
    var vocabSection = document.createElement("div");
    vocabSection.className = "main-section";
    vocabSection.innerHTML =
      '<div class="main-section-header">' +
      '<div class="main-section-icon vocab-icon">語</div>' +
      '<div><div class="main-section-title">' +
      escapeHtml(txt.vocabSection) +
      "</div>" +
      '<div class="main-section-subtitle">' +
      escapeHtml(txt.vocabSectionSub) +
      "</div></div>" +
      "</div>";

    var vocabGrid = document.createElement("div");
    vocabGrid.className = "lesson-grid";

    lessons.forEach(function (lessonNum) {
      var prog = getLessonProgress(lessonNum);
      var colorClass = getProgressColor(prog.percent);

      var btn = document.createElement("button");
      btn.className = "lesson-btn";
      btn.innerHTML =
        '<span class="lesson-btn-name">' +
        txt.lessonPrefix +
        " " +
        lessonNum +
        "</span>" +
        '<div class="lesson-progress-wrap">' +
        '<div class="lesson-progress-track">' +
        '<div class="lesson-progress-fill ' +
        colorClass +
        '" style="width:' +
        prog.percent +
        '%"></div>' +
        "</div>" +
        '<span class="lesson-progress-text">' +
        prog.mastered +
        " / " +
        prog.total +
        " " +
        txt.wordsLabel +
        "</span>" +
        "</div>";
      btn.onclick = (function (num) {
        return function () {
          startQuiz(num);
        };
      })(lessonNum);
      vocabGrid.appendChild(btn);
    });

    vocabSection.appendChild(vocabGrid);
    els.lessonGrid.appendChild(vocabSection);

    // ── SECTION 3: Kanji Tests ──
    var kanjiSection = document.createElement("div");
    kanjiSection.className = "main-section";
    kanjiSection.innerHTML =
      '<div class="main-section-header">' +
      '<div class="main-section-icon kanji-icon">漢</div>' +
      '<div><div class="main-section-title">' +
      escapeHtml(txt.kanjiSection) +
      "</div>" +
      '<div class="main-section-subtitle">' +
      escapeHtml(txt.kanjiSectionSub) +
      " (" +
      kanjiData.length +
      " " +
      txt.kanjiCount +
      ")</div></div>" +
      "</div>";

    var kanjiGrid = document.createElement("div");
    kanjiGrid.className = "kanji-test-grid";

    // Kanji → Reading
    var readingCard = document.createElement("div");
    readingCard.className = "kanji-test-card";
    readingCard.innerHTML =
      '<div class="kanji-test-char">読</div>' +
      '<div class="kanji-test-info"><div class="kanji-test-name">' +
      escapeHtml(txt.kanjiTestReading) +
      "</div>" +
      '<div class="kanji-test-desc">' +
      escapeHtml(txt.kanjiTestReadingDesc) +
      "</div></div>" +
      '<span class="kanji-test-arrow">' +
      ICONS.chevronRight +
      "</span>";
    bindAccessibleAction(readingCard, function () {
      showKanjiLessonSelection("reading");
    });
    kanjiGrid.appendChild(readingCard);

    // Kanji → Meaning
    var meaningCard = document.createElement("div");
    meaningCard.className = "kanji-test-card";
    meaningCard.innerHTML =
      '<div class="kanji-test-char">意</div>' +
      '<div class="kanji-test-info"><div class="kanji-test-name">' +
      escapeHtml(txt.kanjiTestMeaning) +
      "</div>" +
      '<div class="kanji-test-desc">' +
      escapeHtml(txt.kanjiTestMeaningDesc) +
      "</div></div>" +
      '<span class="kanji-test-arrow">' +
      ICONS.chevronRight +
      "</span>";
    bindAccessibleAction(meaningCard, function () {
      showKanjiLessonSelection("meaning");
    });
    kanjiGrid.appendChild(meaningCard);

    // Meaning → Kanji
    var writeCard = document.createElement("div");
    writeCard.className = "kanji-test-card";
    writeCard.innerHTML =
      '<div class="kanji-test-char">字</div>' +
      '<div class="kanji-test-info"><div class="kanji-test-name">' +
      escapeHtml(txt.kanjiTestWrite) +
      "</div>" +
      '<div class="kanji-test-desc">' +
      escapeHtml(txt.kanjiTestWriteDesc) +
      "</div></div>" +
      '<span class="kanji-test-arrow">' +
      ICONS.chevronRight +
      "</span>";
    bindAccessibleAction(writeCard, function () {
      showKanjiLessonSelection("write");
    });
    kanjiGrid.appendChild(writeCard);

    kanjiSection.appendChild(kanjiGrid);
    els.lessonGrid.appendChild(kanjiSection);
  }

  // ============================================
  // KANA WORD QUIZ (Hiragana / Katakana)
  // ============================================
  var kanaQuizState = {
    type: null,
    data: [],
    index: 0,
    score: 0,
    mistakes: [],
  };

  function startKanaQuiz(type) {
    var wordPool = type === "hiragana" ? hiraganaWordsQuiz : katakanaWordsQuiz;
    kanaQuizState.type = type;
    kanaQuizState.data = shuffleArray(wordPool.slice()).slice(
      0,
      Math.min(20, wordPool.length),
    );
    kanaQuizState.index = 0;
    kanaQuizState.score = 0;
    kanaQuizState.mistakes = [];

    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    state.isModalOpen = false;
    state.currentLessonFilter = null;
    state.quizMode = "kana";
    state.resultsMode = null;
    state.modalKanjiItem = null;
    state.modalWasCorrect = false;

    showScreen("quiz");
    renderKanaQuestion();
    updateUILabels();
  }

  function renderKanaQuestion() {
    var current = kanaQuizState.data[kanaQuizState.index];
    if (!current) {
      showKanaResults();
      return;
    }
    var total = kanaQuizState.data.length;
    var txt = uiTexts[state.lang];

    var pct = (kanaQuizState.index / total) * 100;
    els.quizProgressBar.style.width = pct + "%";
    els.progressText.textContent = kanaQuizState.index + 1 + " / " + total;
    els.currentScoreDisplay.textContent = kanaQuizState.score;

    var typeName =
      kanaQuizState.type === "hiragana"
        ? txt.hiraganaLesson
        : txt.katakanaLesson;
    els.lessonIndicator.textContent = typeName;

    // Show word with translation in parentheses
    els.wordDisplay.innerHTML = "";
    var wordSpan = document.createElement("div");
    wordSpan.textContent = current.word;
    wordSpan.style.cssText =
      "font-family:var(--font-jp);font-size:2.4rem;font-weight:700;line-height:1.3;";
    els.wordDisplay.appendChild(wordSpan);

    var meaningSpan = document.createElement("div");
    meaningSpan.textContent = "(" + current.meanings[state.lang] + ")";
    meaningSpan.style.cssText =
      "font-size:0.9rem;color:var(--text-tertiary);font-weight:500;margin-top:6px;";
    els.wordDisplay.appendChild(meaningSpan);

    els.wordDisplay.style.fontSize = "";
    els.wordDisplay.style.animation = "none";
    void els.wordDisplay.offsetWidth;
    els.wordDisplay.style.animation =
      "wordReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both";

    // Generate algorithmic distractors
    var distractors = generateWordDistractors(current.reading);
    // Ensure we have 3 distractors; fill from other words if needed
    if (distractors.length < 3) {
      var pool =
        kanaQuizState.type === "hiragana"
          ? hiraganaWordsQuiz
          : katakanaWordsQuiz;
      var others = pool.filter(function (w) {
        return w.reading !== current.reading;
      });
      others = shuffleArray(others);
      for (var fi = 0; fi < others.length && distractors.length < 3; fi++) {
        if (distractors.indexOf(others[fi].reading) === -1) {
          distractors.push(others[fi].reading);
        }
      }
    }

    var options = shuffleArray(
      [{ text: current.reading, isCorrect: true }].concat(
        distractors.slice(0, 3).map(function (d) {
          return { text: d, isCorrect: false };
        }),
      ),
    );

    els.optionsContainer.innerHTML = "";
    els.optionsContainer.classList.remove("locked");

    options.forEach(function (opt) {
      var btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt.text;
      btn.style.fontSize = "1.1rem";
      btn.style.letterSpacing = "0.03em";
      btn.style.padding = "22px 26px";
      btn.onclick = function () {
        handleKanaAnswer(btn, opt, current);
      };
      els.optionsContainer.appendChild(btn);
    });
  }

  function handleKanaAnswer(btn, selected, correct) {
    els.optionsContainer.classList.add("locked");
    var isCorrect = selected.isCorrect;

    if (isCorrect) {
      btn.classList.add("correct");
      kanaQuizState.score++;
      playCorrectSound();
    } else {
      btn.classList.add("incorrect");
      playIncorrectSound();
      kanaQuizState.mistakes.push({
        char: correct.word,
        correctAnswer: correct.reading,
        yourAnswer: selected.text,
        meaning: correct.meanings[state.lang],
      });
      // Highlight correct
      var btns = els.optionsContainer.querySelectorAll(".option-btn");
      btns.forEach(function (b) {
        if (b.textContent === correct.reading) b.classList.add("correct");
      });
    }

    els.currentScoreDisplay.textContent = kanaQuizState.score;

    setTimeout(function () {
      kanaQuizState.index++;
      if (kanaQuizState.index < kanaQuizState.data.length) {
        renderKanaQuestion();
      } else {
        showKanaResults();
      }
    }, 1200);
  }

  function renderKanaResultsView() {
    var total = kanaQuizState.data.length;
    var percent = total ? Math.round((kanaQuizState.score / total) * 100) : 0;
    var txt = uiTexts[state.lang];

    showScreen("results");
    els.finalScore.textContent = percent + "%";
    els.finalScoreLabel.textContent =
      kanaQuizState.score + " / " + total + " " + txt.scoreLabel;

    if (kanaQuizState.mistakes.length > 0) {
      els.mistakesBlock.style.display = "block";
      els.mistakesList.innerHTML = "";
      kanaQuizState.mistakes.forEach(function (m) {
        var item = document.createElement("div");
        item.className = "mistake-item";
        item.innerHTML =
          '<div class="mistake-word">' +
          escapeHtml(m.char) +
          "</div>" +
          '<div class="mistake-details">' +
          '<span class="mistake-correct">' +
          escapeHtml(m.correctAnswer) +
          "</span>" +
          '<span class="mistake-your"> → ' +
          escapeHtml(m.yourAnswer) +
          "</span>" +
          "</div>";
        els.mistakesList.appendChild(item);
      });
    } else {
      els.mistakesBlock.style.display = "none";
    }
    return percent;
  }

  function showKanaResults() {
    var percent = renderKanaResultsView();
    state.resultsMode = "kana";

    // Save best kana score for leaderboard composite
    saveKanaKanjiScore(kanaQuizState.type, percent);

    if (percent >= 80)
      spawnConfetti(window.innerWidth / 2, window.innerHeight / 3);
  }

  // ============================================
  // KANJI QUIZ (with lesson selection)
  // ============================================
  var kanjiQuizState = {
    mode: null,
    data: [],
    index: 0,
    score: 0,
    mistakes: [],
    lessonFilter: null,
  };

  // Kanji helpers: get available kanji lessons
  var _kanjiByLesson = {};
  kanjiData.forEach(function (k) {
    if (!_kanjiByLesson[k.lesson]) _kanjiByLesson[k.lesson] = [];
    _kanjiByLesson[k.lesson].push(k);
  });

  function getKanjiLessons() {
    return Object.keys(_kanjiByLesson)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      });
  }

  function getKanjiByLesson(lessonNum) {
    return _kanjiByLesson[lessonNum] || [];
  }

  function showKanjiLessonSelection(mode) {
    kanjiQuizState.mode = mode;
    var txt = uiTexts[state.lang];

    showScreen("start");
    els.selectLessonTitle.textContent = txt.selectKanjiLesson;
    els.lessonGrid.innerHTML = "";

    var kanjiLessons = getKanjiLessons();

    // Section header
    var section = document.createElement("div");
    section.className = "main-section";
    var modeName =
      mode === "reading"
        ? txt.kanjiTestReading
        : mode === "meaning"
          ? txt.kanjiTestMeaning
          : txt.kanjiTestWrite;
    section.innerHTML =
      '<div class="main-section-header">' +
      '<div class="main-section-icon kanji-icon">漢</div>' +
      '<div><div class="main-section-title">' +
      escapeHtml(modeName) +
      "</div>" +
      '<div class="main-section-subtitle">' +
      escapeHtml(txt.selectKanjiLesson) +
      "</div></div>" +
      "</div>";

    var grid = document.createElement("div");
    grid.className = "lesson-grid";

    kanjiLessons.forEach(function (lessonNum) {
      var kanjiInLesson = getKanjiByLesson(lessonNum);
      var btn = document.createElement("button");
      btn.className = "lesson-btn";
      btn.innerHTML =
        '<span class="lesson-btn-name">' +
        txt.kanjiLessonPrefix +
        " " +
        lessonNum +
        "</span>" +
        '<div class="lesson-progress-wrap"><span class="lesson-progress-text">' +
        kanjiInLesson.length +
        " " +
        txt.kanjiInLesson +
        "</span></div>";
      btn.onclick = (function (num) {
        return function () {
          startKanjiQuiz(mode, num);
        };
      })(lessonNum);
      grid.appendChild(btn);
    });

    // Back button
    var backBtn = document.createElement("button");
    backBtn.className = "quiz-back-btn";
    backBtn.textContent = txt.back;
    backBtn.style.marginTop = "16px";
    backBtn.onclick = function () {
      initLessonSelection();
    };

    section.appendChild(grid);
    els.lessonGrid.appendChild(section);
    els.lessonGrid.appendChild(backBtn);
  }

  function startKanjiQuiz(mode, lessonFilter) {
    kanjiQuizState.mode = mode;
    kanjiQuizState.lessonFilter = lessonFilter;

    var pool =
      lessonFilter === null ? kanjiData : getKanjiByLesson(lessonFilter);
    kanjiQuizState.data = shuffleArray(pool.slice()).slice(
      0,
      Math.min(15, pool.length),
    );
    kanjiQuizState.index = 0;
    kanjiQuizState.score = 0;
    kanjiQuizState.mistakes = [];

    if (kanjiQuizState.data.length === 0) {
      initLessonSelection();
      return;
    }

    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    state.isModalOpen = false;
    state.currentLessonFilter = null;
    state.quizMode = "kanji";
    state.resultsMode = null;
    state.modalKanjiItem = null;
    state.modalWasCorrect = false;

    showScreen("quiz");
    renderKanjiQuestion();
    updateUILabels();
  }

  function getKanjiDistractors(correct, mode) {
    var pool = kanjiData.filter(function (k) {
      return k.kanji !== correct.kanji;
    });
    pool = shuffleArray(pool);
    return pool.slice(0, 3);
  }

  function renderKanjiQuestion() {
    var current = kanjiQuizState.data[kanjiQuizState.index];
    if (!current) {
      showKanjiResults();
      return;
    }
    var total = kanjiQuizState.data.length;
    var txt = uiTexts[state.lang];
    var mode = kanjiQuizState.mode;

    var pct = (kanjiQuizState.index / total) * 100;
    els.quizProgressBar.style.width = pct + "%";
    els.progressText.textContent = kanjiQuizState.index + 1 + " / " + total;
    els.currentScoreDisplay.textContent = kanjiQuizState.score;

    var modeName =
      mode === "reading"
        ? txt.kanjiTestReading
        : mode === "meaning"
          ? txt.kanjiTestMeaning
          : txt.kanjiTestWrite;
    els.lessonIndicator.textContent = modeName;

    els.wordDisplay.innerHTML = "";
    if (mode === "write") {
      els.wordDisplay.textContent = current.meanings[state.lang];
      els.wordDisplay.style.fontSize = "1.8rem";
    } else {
      els.wordDisplay.textContent = current.kanji;
      els.wordDisplay.style.fontSize = "";
    }
    els.wordDisplay.style.animation = "none";
    void els.wordDisplay.offsetWidth;
    els.wordDisplay.style.animation =
      "wordReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both";

    var distractors = getKanjiDistractors(current, mode);
    var allOptions = shuffleArray([current].concat(distractors));

    els.optionsContainer.innerHTML = "";
    els.optionsContainer.classList.remove("locked");

    allOptions.forEach(function (opt) {
      var btn = document.createElement("button");
      btn.className = "option-btn";
      if (mode === "reading") {
        btn.textContent = opt.reading;
      } else if (mode === "meaning") {
        btn.textContent = opt.meanings[state.lang];
      } else {
        btn.textContent = opt.kanji;
        btn.style.fontFamily = "var(--font-jp)";
        btn.style.fontSize = "1.6rem";
      }
      btn.onclick = function () {
        handleKanjiAnswer(btn, opt, current);
      };
      els.optionsContainer.appendChild(btn);
    });
  }

  function handleKanjiAnswer(btn, selected, correct) {
    els.optionsContainer.classList.add("locked");
    var isCorrect = selected.kanji === correct.kanji;

    if (isCorrect) {
      btn.classList.add("correct");
      kanjiQuizState.score++;
      playCorrectSound();
      var rect = btn.getBoundingClientRect();
      spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    } else {
      btn.classList.add("incorrect");
      playIncorrectSound();
      var mode = kanjiQuizState.mode;
      var correctLabel =
        mode === "reading"
          ? correct.reading
          : mode === "meaning"
            ? correct.meanings[state.lang]
            : correct.kanji;
      var yourLabel =
        mode === "reading"
          ? selected.reading
          : mode === "meaning"
            ? selected.meanings[state.lang]
            : selected.kanji;
      kanjiQuizState.mistakes.push({
        char: mode === "write" ? correct.meanings[state.lang] : correct.kanji,
        correctAnswer: correctLabel,
        yourAnswer: yourLabel,
      });
      // Highlight correct
      var btns = els.optionsContainer.querySelectorAll(".option-btn");
      btns.forEach(function (b) {
        var matchText =
          mode === "reading"
            ? correct.reading
            : mode === "meaning"
              ? correct.meanings[state.lang]
              : correct.kanji;
        if (b.textContent === matchText) b.classList.add("correct");
      });
    }

    els.currentScoreDisplay.textContent = kanjiQuizState.score;

    // Open modal with kanji info after short delay
    setTimeout(
      function () {
        openKanjiModal(isCorrect, correct);
      },
      isCorrect ? 500 : 800,
    );
  }

  function updateKanjiModalContent(isCorrect, kanjiItem) {
    if (!kanjiItem) return;
    var txt = uiTexts[state.lang];

    if (isCorrect) {
      els.feedbackIcon.innerHTML = ICONS.check;
      els.feedbackIcon.className = "result-icon correct";
      els.feedbackStatus.innerText = txt.correct;
      els.feedbackStatus.className = "result-title correct";
    } else {
      els.feedbackIcon.innerHTML = ICONS.x;
      els.feedbackIcon.className = "result-icon incorrect";
      els.feedbackStatus.innerText = txt.incorrect;
      els.feedbackStatus.className = "result-title incorrect";
    }

    // Fill modal with kanji info
    els.correctAnswerText.innerText =
      kanjiItem.kanji + "  —  " + kanjiItem.meanings[state.lang];
    els.modalExampleJp.innerHTML =
      escapeHtml(kanjiItem.reading) + " (" + escapeHtml(kanjiItem.romaji) + ")";
    els.modalExampleTrans.innerText = kanjiItem.meanings[state.lang];
    els.modalGrammarText.innerText = "";
    // Hide empty grammar section
    els.modalGrammarText.parentElement.style.display = "none";
  }

  function openKanjiModal(isCorrect, kanjiItem) {
    state.isModalOpen = true;
    state.modalWasCorrect = !!isCorrect;
    state.modalKanjiItem = kanjiItem || null;

    updateKanjiModalContent(isCorrect, kanjiItem);

    // Set callback for the Next button to advance kanji quiz
    state.modalCallback = function () {
      state.isModalOpen = false;
      state.modalCallback = null;
      state.modalKanjiItem = null;
      state.modalWasCorrect = false;
      setModalVisibility(false);
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
      }

      kanjiQuizState.index++;
      if (kanjiQuizState.index < kanjiQuizState.data.length) {
        renderKanjiQuestion();
      } else {
        showKanjiResults();
      }
    };

    els.modal.querySelector(".modal-content").scrollTop = 0;
    setModalVisibility(true);
    startTimer();
  }

  function renderKanjiResultsView() {
    var total = kanjiQuizState.data.length;
    var percent = total ? Math.round((kanjiQuizState.score / total) * 100) : 0;
    var txt = uiTexts[state.lang];

    showScreen("results");
    els.finalScore.textContent = percent + "%";
    els.finalScoreLabel.textContent =
      kanjiQuizState.score + " / " + total + " " + txt.scoreLabel;

    if (kanjiQuizState.mistakes.length > 0) {
      els.mistakesBlock.style.display = "block";
      els.mistakesList.innerHTML = "";
      kanjiQuizState.mistakes.forEach(function (m) {
        var item = document.createElement("div");
        item.className = "mistake-item";
        item.innerHTML =
          '<div class="mistake-word">' +
          escapeHtml(m.char) +
          "</div>" +
          '<div class="mistake-details">' +
          '<span class="mistake-correct">' +
          escapeHtml(m.correctAnswer) +
          "</span>" +
          '<span class="mistake-your"> → ' +
          escapeHtml(m.yourAnswer) +
          "</span>" +
          "</div>";
        els.mistakesList.appendChild(item);
      });
    } else {
      els.mistakesBlock.style.display = "none";
    }
    return percent;
  }

  function showKanjiResults() {
    var percent = renderKanjiResultsView();
    state.resultsMode = "kanji";

    // Save best kanji score for leaderboard composite
    var kanjiKey = "kanji_" + (kanjiQuizState.mode || "reading");
    saveKanaKanjiScore(kanjiKey, percent);

    if (percent >= 80)
      spawnConfetti(window.innerWidth / 2, window.innerHeight / 3);
  }

  // ============================================
  // QUIZ (Vocabulary)
  // ============================================
  function startQuiz(lessonFilter) {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }

    state.currentIndex = 0;
    state.score = 0;
    state.mistakes = [];
    state.isModalOpen = false;
    state.currentLessonFilter = lessonFilter;
    state.quizMode = "vocab";
    state.resultsMode = null;
    state.modalKanjiItem = null;
    state.modalWasCorrect = false;

    var filteredData =
      lessonFilter === null ? wordsData : getWordsByLesson(lessonFilter);
    state.quizData = shuffleArray(filteredData.slice());
    if (state.quizData.length === 0) {
      initLessonSelection();
      return;
    }

    showScreen("quiz");
    renderQuestion(true);
    updateUILabels();
  }

  function setLanguage(lang) {
    if (!uiTexts[lang]) return;
    state.lang = lang;
    document.documentElement.lang = lang;
    els.langBtns.forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
    updateUILabels();
    updateAuthLabels();

    if (els.startScreen.classList.contains("visible")) {
      renderLessonGrid();
    } else if (els.quizView.classList.contains("visible")) {
      if (state.quizMode === "kana") {
        renderKanaQuestion();
      } else if (state.quizMode === "kanji") {
        renderKanjiQuestion();
        if (state.isModalOpen && state.modalKanjiItem) {
          updateKanjiModalContent(state.modalWasCorrect, state.modalKanjiItem);
        }
      } else {
        renderQuestion(false);
        if (state.isModalOpen && state.currentIndex < state.quizData.length) {
          updateModalContent(state.quizData[state.currentIndex]);
        }
      }
    } else if (els.resultsView.classList.contains("visible")) {
      renderCurrentResultsView();
    } else if (els.leaderboardScreen.classList.contains("visible")) {
      showLeaderboard();
    } else if (els.dictionaryScreen.classList.contains("visible")) {
      updateUILabels();
      if (dictState.view === "lessons") renderDictLessons();
      else if (dictState.view === "words") renderDictWords(dictState.lessonNum);
      else if (dictState.view === "detail")
        renderDictWordDetail(dictState.wordId);
      else if (dictState.view === "kanji-lessons") dictShowKanjiLessons();
      else if (dictState.view === "kanji-list") dictShowKanjiList();
      else if (dictState.view === "grammar-lessons") dictShowGrammarByLessons();
      else if (
        dictState.view === "grammar-lesson-rules" &&
        dictState.grammarLessonNum
      ) {
        var lessonRules = grammarData.filter(function (g) {
          return g.lesson === dictState.grammarLessonNum;
        });
        dictShowGrammarLessonRules(dictState.grammarLessonNum, lessonRules);
      } else if (dictState.view === "grammar-detail" && dictState.grammarRule)
        dictShowGrammarRule(dictState.grammarRule);
      else if (dictState.view === "kana-chart")
        dictShowKanaChart(dictState.kanaType);
      else if (dictState.view === "vocab-lessons") dictShowVocabLessons();
    }
  }

  function updateUILabels() {
    var txt = uiTexts[state.lang];
    setTitleWithMark(txt.title);
    els.selectLessonTitle.innerText = txt.selectLesson;
    els.labelQ.innerText = txt.question;
    els.labelScore.innerText = txt.score;
    els.correctLabel.innerText = txt.correctAnswerIs;
    els.resultsTitle.innerText = txt.results;
    els.finalScoreLabel.innerText = txt.scoreLabel;
    els.restartBtn.innerText = txt.mainMenu;
    els.leaderboardBackBtn.innerText = txt.back;
    els.dictionaryBackBtn.innerText = txt.back;
    els.quizBackBtn.innerText = txt.back;
    setLabelWithIcon(els.mistakesTitle, txt.mistakesTitle);
    setLabelWithIcon(els.leaderboardTitle, txt.leaderboardTitle);
    setLabelWithIcon(els.dictionaryTitle, txt.dictionary);
    setLabelWithIcon(els.modalGrammarLabel, txt.grammarLabel);
    if (els.modalExampleLabel) {
      els.modalExampleLabel.innerText = txt.examples;
    }

    if (!els.modalNextBtn.disabled) {
      els.btnText.innerText = txt.nextBtn;
    }
  }

  function setTitleWithMark(titleText) {
    var mark = els.title ? els.title.querySelector(".title-mark") : null;
    if (!mark || !els.title) {
      if (els.title) {
        els.title.textContent = titleText;
      }
      return;
    }
    els.title.innerHTML = mark.outerHTML + " " + escapeHtml(titleText);
  }

  function setLabelWithIcon(element, labelText) {
    if (!element) return;
    var icon = element.querySelector(".icon");
    if (!icon) {
      element.textContent = labelText;
      return;
    }
    element.innerHTML = icon.outerHTML + " " + escapeHtml(labelText);
  }

  function bindAccessibleAction(element, handler) {
    if (!element || typeof handler !== "function") return;
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.addEventListener("click", handler);
    element.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handler();
      }
    });
  }

  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  function getSmartDistractors(currentWord) {
    var sameLessonWords = getWordsByLesson(currentWord.lesson).filter(
      function (w) {
        return w.id !== currentWord.id;
      },
    );

    if (sameLessonWords.length >= 3) {
      return shuffleArray(sameLessonWords.slice()).slice(0, 3);
    }

    var currentLesson = currentWord.lesson;
    var neighborWords = wordsData.filter(function (w) {
      return w.id !== currentWord.id && Math.abs(w.lesson - currentLesson) <= 2;
    });

    if (neighborWords.length >= 3) {
      return shuffleArray(neighborWords.slice()).slice(0, 3);
    }

    return shuffleArray(
      wordsData.filter(function (w) {
        return w.id !== currentWord.id;
      }),
    ).slice(0, 3);
  }

  function renderQuestion(randomize) {
    if (
      state.currentIndex >= state.quizData.length ||
      state.quizData.length === 0
    )
      return;

    var currentWord = state.quizData[state.currentIndex];
    var txt = uiTexts[state.lang];

    els.progressText.innerText =
      state.currentIndex + 1 + " / " + state.quizData.length;
    els.currentScoreDisplay.innerText = state.score;
    els.currentScoreDisplay.classList.remove("bump");
    void els.currentScoreDisplay.offsetWidth;
    els.lessonIndicator.innerText = txt.lessonPrefix + " " + currentWord.lesson;
    els.wordDisplay.innerHTML = sanitizeRubyHtml(currentWord.japanese);
    els.wordDisplay.style.fontSize = "";

    // Re-trigger word reveal animation
    els.wordDisplay.style.animation = "none";
    void els.wordDisplay.offsetWidth;
    els.wordDisplay.style.animation =
      "wordReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both";

    var progressPercent = (state.currentIndex / state.quizData.length) * 100;
    els.quizProgressBar.style.width = progressPercent + "%";

    els.optionsContainer.classList.remove("locked");

    if (randomize) {
      var distractors = getSmartDistractors(currentWord);

      var options = [
        {
          id: currentWord.id,
          text: currentWord.translations,
          isCorrect: true,
        },
      ];
      distractors.forEach(function (w) {
        options.push({
          id: w.id,
          text: w.translations,
          isCorrect: false,
        });
      });
      state.currentOptions = shuffleArray(options);
    }

    els.optionsContainer.innerHTML = "";
    state.currentOptions.forEach(function (opt) {
      var btn = document.createElement("button");
      btn.className = "option-btn";
      btn.innerText = opt.text[state.lang];
      btn.onclick = function () {
        handleAnswer(opt.isCorrect, btn, currentWord);
      };
      els.optionsContainer.appendChild(btn);
    });
  }

  function handleAnswer(isCorrect, btnElement, currentWord) {
    els.optionsContainer.classList.add("locked");

    var allBtns = els.optionsContainer.querySelectorAll(".option-btn");
    allBtns.forEach(function (b) {
      b.disabled = true;
    });

    saveAnswer(currentWord, isCorrect);

    if (isCorrect) {
      state.score++;
      btnElement.classList.add("correct");
      els.currentScoreDisplay.innerText = state.score;
      els.currentScoreDisplay.classList.add("bump");
      playCorrectSound();
      var rect = btnElement.getBoundingClientRect();
      spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
      setTimeout(function () {
        openModal(true, currentWord);
      }, 500);
    } else {
      state.mistakes.push(currentWord);
      btnElement.classList.add("incorrect");
      playIncorrectSound();

      allBtns.forEach(function (b, idx) {
        if (state.currentOptions[idx].isCorrect) {
          b.classList.add("correct");
        }
      });

      setTimeout(function () {
        openModal(false, currentWord);
      }, 800);
    }
  }

  function openModal(isCorrect, wordData) {
    state.isModalOpen = true;
    state.modalKanjiItem = null;
    state.modalWasCorrect = false;
    state.modalCallback = null; // vocabulary quiz uses nextQuestion
    var txt = uiTexts[state.lang];

    if (isCorrect) {
      els.feedbackIcon.innerHTML = ICONS.check;
      els.feedbackIcon.className = "result-icon correct";
      els.feedbackStatus.innerText = txt.correct;
      els.feedbackStatus.className = "result-title correct";
    } else {
      els.feedbackIcon.innerHTML = ICONS.x;
      els.feedbackIcon.className = "result-icon incorrect";
      els.feedbackStatus.innerText = txt.incorrect;
      els.feedbackStatus.className = "result-title incorrect";
    }

    updateModalContent(wordData);
    els.modal.querySelector(".modal-content").scrollTop = 0;
    setModalVisibility(true);
    startTimer();
  }

  function updateModalContent(wordData) {
    var ex = wordData.exampleSentences
      ? wordData.exampleSentences[state.lang]
      : null;
    els.correctAnswerText.innerText = wordData.translations[state.lang] || "";
    var grammarSection = els.modalGrammarText.parentElement;
    if (ex) {
      els.modalExampleJp.innerHTML = sanitizeRubyHtml(ex.jp || "");
      els.modalExampleTrans.innerText = ex.translation || "";
      els.modalGrammarText.innerText = ex.grammarInfo || "";
      grammarSection.style.display = ex.grammarInfo ? "" : "none";
    } else {
      els.modalExampleJp.innerHTML = "";
      els.modalExampleTrans.innerText = "";
      els.modalGrammarText.innerText = "";
      grammarSection.style.display = "none";
    }
  }

  function startTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }

    var timeLeft = 3;
    var totalTime = 3;
    var txt = uiTexts[state.lang];

    els.modalNextBtn.disabled = true;
    els.modalNextBtn.classList.add("counting");
    els.btnText.innerText = txt.nextBtn + " (" + timeLeft + ")";

    els.timerBar.style.transition = "none";
    els.timerBar.style.width = "100%";
    void els.timerBar.offsetWidth;
    els.timerBar.style.transition = "width " + totalTime + "s linear";
    els.timerBar.style.width = "0%";

    state.timerInterval = setInterval(function () {
      timeLeft--;
      if (timeLeft > 0) {
        var currentTxt = uiTexts[state.lang];
        els.btnText.innerText = currentTxt.nextBtn + " (" + timeLeft + ")";
      } else {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        var currentTxt = uiTexts[state.lang];
        els.modalNextBtn.disabled = false;
        els.modalNextBtn.classList.remove("counting");
        els.btnText.innerText = currentTxt.nextBtn;
      }
    }, 1000);
  }

  function nextQuestion() {
    state.isModalOpen = false;
    state.modalKanjiItem = null;
    state.modalWasCorrect = false;
    setModalVisibility(false);
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }

    state.currentIndex++;

    if (state.currentIndex < state.quizData.length) {
      renderQuestion(true);
    } else {
      els.quizProgressBar.style.width = "100%";
      showResults();
    }
  }

  function renderVocabResultsView() {
    showScreen("results");
    var txt = uiTexts[state.lang];
    var percentage =
      state.quizData.length > 0
        ? Math.round((state.score / state.quizData.length) * 100)
        : 0;
    els.finalScore.innerText = percentage + "%";
    els.finalScoreLabel.innerText =
      state.score + " / " + state.quizData.length + " " + txt.scoreLabel;

    els.mistakesList.innerHTML = "";
    if (state.mistakes.length === 0) {
      els.mistakesBlock.style.display = "none";
    } else {
      els.mistakesBlock.style.display = "block";
      state.mistakes.forEach(function (word) {
        var item = document.createElement("div");
        item.className = "mistake-item";
        item.innerHTML =
          '<div class="mistake-word">' +
          sanitizeRubyHtml(word.japanese) +
          "</div>" +
          '<div class="mistake-answer">' +
          escapeHtml(word.translations[state.lang]) +
          "</div>";
        els.mistakesList.appendChild(item);
      });
    }
  }

  function renderCurrentResultsView() {
    if (state.resultsMode === "kana") {
      renderKanaResultsView();
      return;
    }
    if (state.resultsMode === "kanji") {
      renderKanjiResultsView();
      return;
    }
    renderVocabResultsView();
  }

  function showResults() {
    state.resultsMode = "vocab";
    renderVocabResultsView();
  }

  // ============================================
  // LEADERBOARD
  // ============================================
  function getCurrentDisplayName() {
    if (state.displayName && String(state.displayName).trim()) {
      return String(state.displayName).trim();
    }
    if (state.user && state.user.user_metadata) {
      return (
        state.user.user_metadata.display_name ||
        state.user.user_metadata.full_name ||
        state.user.user_metadata.name ||
        (state.user.email ? state.user.email.split("@")[0] : "User")
      );
    }
    return state.user && state.user.email
      ? state.user.email.split("@")[0]
      : "User";
  }

  // ============================================
  // LEADERBOARD — IMPROVED SCORING
  // ============================================
  // Composite score: vocab mastery + kana best scores + kanji best scores
  // This way kana/kanji progress counts AND adding new vocab lessons
  // won't crush existing users' rankings.

  // Local kana/kanji best scores (persisted in localStorage)
  var KANA_KANJI_LS_KEY = "mnq_kana_kanji_scores";

  function loadKanaKanjiScores() {
    try {
      var raw = localStorage.getItem(KANA_KANJI_LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_e) {}
    return {
      hiragana: 0,
      katakana: 0,
      kanji_reading: 0,
      kanji_meaning: 0,
      kanji_write: 0,
    };
  }

  function saveKanaKanjiScore(type, percent) {
    var scores = loadKanaKanjiScores();
    if (percent > (scores[type] || 0)) {
      scores[type] = percent;
      try {
        localStorage.setItem(KANA_KANJI_LS_KEY, JSON.stringify(scores));
      } catch (_e) {}
    }
  }

  function getVocabMasteryInfo() {
    var total = wordsData.length;
    if (total === 0) return { mastered: 0, total: 0, percent: 0 };
    var mastered = 0;
    wordsData.forEach(function (word) {
      var p = state.userProgress[word.id];
      if (p && Number(p.correct_count) >= MASTERY_THRESHOLD) mastered++;
    });
    return {
      mastered: mastered,
      total: total,
      percent: Math.round((mastered / total) * 100),
    };
  }

  function getLocalMasteryPercent() {
    // Composite: 60% vocab + 20% kana + 20% kanji
    var vocab = getVocabMasteryInfo();
    var kk = loadKanaKanjiScores();

    var kanaAvg = 0;
    var kanaCount = 0;
    if (kk.hiragana > 0) {
      kanaAvg += kk.hiragana;
      kanaCount++;
    }
    if (kk.katakana > 0) {
      kanaAvg += kk.katakana;
      kanaCount++;
    }
    kanaAvg = kanaCount > 0 ? kanaAvg / kanaCount : 0;

    var kanjiAvg = 0;
    var kanjiCount = 0;
    if (kk.kanji_reading > 0) {
      kanjiAvg += kk.kanji_reading;
      kanjiCount++;
    }
    if (kk.kanji_meaning > 0) {
      kanjiAvg += kk.kanji_meaning;
      kanjiCount++;
    }
    if (kk.kanji_write > 0) {
      kanjiAvg += kk.kanji_write;
      kanjiCount++;
    }
    kanjiAvg = kanjiCount > 0 ? kanjiAvg / kanjiCount : 0;

    // If user only did vocab — use vocab alone (don't penalize for not trying kana/kanji)
    var hasKana = kanaCount > 0;
    var hasKanji = kanjiCount > 0;

    if (!hasKana && !hasKanji) {
      return vocab.percent;
    } else if (!hasKana) {
      return Math.round(vocab.percent * 0.7 + kanjiAvg * 0.3);
    } else if (!hasKanji) {
      return Math.round(vocab.percent * 0.7 + kanaAvg * 0.3);
    } else {
      return Math.round(vocab.percent * 0.6 + kanaAvg * 0.2 + kanjiAvg * 0.2);
    }
  }

  function buildLocalLeaderboardRows() {
    if (!state.user) return [];
    var vocab = getVocabMasteryInfo();
    return [
      {
        user_id: state.user.id,
        display_name: getCurrentDisplayName(),
        mastery_percentage: getLocalMasteryPercent(),
        words_mastered: vocab.mastered,
        words_total: vocab.total,
      },
    ];
  }

  // Trophy SVGs for top 3
  var TROPHY_SVGS = {
    gold: '<svg class="trophy-icon" viewBox="0 0 24 24" fill="none" stroke="#6b4e0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    silver:
      '<svg class="trophy-icon" viewBox="0 0 24 24" fill="none" stroke="#4a5260" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    bronze:
      '<svg class="trophy-icon" viewBox="0 0 24 24" fill="none" stroke="#5c3a15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  };

  // Motivational labels for ranks 4+
  var MOTIV_DATA = {
    ru: [
      { emoji: "🔥", text: "На подъёме!" },
      { emoji: "💪", text: "Набирает силу" },
      { emoji: "🌱", text: "Растёт" },
      { emoji: "⚡", text: "Заряжен" },
      { emoji: "🎯", text: "Целеустремлён" },
      { emoji: "🚀", text: "Скоро взлёт" },
      { emoji: "✨", text: "Начало пути" },
      { emoji: "🌟", text: "Звезда в деле" },
    ],
    uz: [
      { emoji: "🔥", text: "Ko'tarilmoqda!" },
      { emoji: "💪", text: "Kuch to'plamoqda" },
      { emoji: "🌱", text: "O'smoqda" },
      { emoji: "⚡", text: "Zaryadlangan" },
      { emoji: "🎯", text: "Maqsadli" },
      { emoji: "🚀", text: "Tez orada uchish" },
      { emoji: "✨", text: "Yo'l boshida" },
      { emoji: "🌟", text: "Yulduz" },
    ],
  };

  function getMotivForRank(rank, lang) {
    var list = MOTIV_DATA[lang] || MOTIV_DATA.ru;
    var idx = (rank - 4) % list.length;
    return list[idx >= 0 ? idx : 0];
  }

  function renderLeaderboardRows(rows, emptyText) {
    if (!rows || rows.length === 0) {
      els.leaderboardList.innerHTML =
        '<div class="leaderboard-empty">' + escapeHtml(emptyText) + "</div>";
      return;
    }

    var txt = uiTexts[state.lang];
    els.leaderboardList.innerHTML = "";

    rows.forEach(function (row, idx) {
      var rank = idx + 1;
      var isCurrentUser = state.user && row.user_id === state.user.id;
      var percent = Math.min(
        100,
        Math.max(0, Number(row.mastery_percentage) || 0),
      );
      var colorClass = getProgressColor(percent);
      var name = row.display_name || row.full_name || row.name || "User";

      // Build rank badge
      var badgeClass, badgeContent;
      if (rank === 1) {
        badgeClass = "gold";
        badgeContent = TROPHY_SVGS.gold;
      } else if (rank === 2) {
        badgeClass = "silver";
        badgeContent = TROPHY_SVGS.silver;
      } else if (rank === 3) {
        badgeClass = "bronze";
        badgeContent = TROPHY_SVGS.bronze;
      } else {
        badgeClass = "rank-default";
        badgeContent = '<span class="rank-number">' + rank + "</span>";
      }

      // Motivational tag for ranks 4+
      var motivHtml = "";
      if (rank > 3) {
        var motiv = getMotivForRank(rank, state.lang);
        motivHtml =
          '<span class="leaderboard-motiv"><span class="motiv-emoji">' +
          motiv.emoji +
          "</span>" +
          escapeHtml(motiv.text) +
          "</span>";
      }

      // Words mastered detail
      var detailHtml = "";
      if (row.words_mastered !== undefined && row.words_total !== undefined) {
        detailHtml =
          '<div class="leaderboard-score-detail">' +
          row.words_mastered +
          " / " +
          row.words_total +
          " " +
          txt.leaderboardMastered +
          "</div>";
      }

      var topClass = rank <= 3 ? " top-" + rank : "";

      var div = document.createElement("div");
      div.className =
        "leaderboard-row" + topClass + (isCurrentUser ? " current-user" : "");
      div.innerHTML =
        '<div class="leaderboard-rank-badge ' +
        badgeClass +
        '">' +
        badgeContent +
        "</div>" +
        '<div class="leaderboard-info">' +
        '<div class="leaderboard-name-row">' +
        '<div class="leaderboard-name">' +
        escapeHtml(name) +
        "</div>" +
        motivHtml +
        "</div>" +
        detailHtml +
        '<div class="leaderboard-stats">' +
        '<div class="leaderboard-bar-track">' +
        '<div class="leaderboard-bar-fill ' +
        colorClass +
        '" style="width:' +
        percent +
        '%"></div>' +
        "</div>" +
        '<span class="leaderboard-percent">' +
        percent +
        "%</span>" +
        "</div>" +
        "</div>";
      els.leaderboardList.appendChild(div);
    });
  }

  async function showLeaderboard() {
    showScreen("leaderboard");
    updateUILabels();

    var txt = uiTexts[state.lang];

    if (!supabaseReady) {
      els.leaderboardList.innerHTML =
        '<div class="leaderboard-empty">' +
        escapeHtml(txt.leaderboardOffline) +
        "</div>";
      return;
    }

    els.leaderboardList.innerHTML =
      '<div class="leaderboard-empty" style="opacity:0.5;">...</div>';

    try {
      var caps = await ensureBackendCapabilities();
      var totalWords = wordsData.length;
      var rows = [];

      if (caps.hasLeaderboardRpc) {
        try {
          var res = await sb.rpc("get_leaderboard", {
            mastery_threshold: MASTERY_THRESHOLD,
            total_words: totalWords,
            limit_rows: 100,
          });
          if (!res.error && Array.isArray(res.data)) {
            rows = res.data;
            // Enrich rows with words_mastered / words_total if not present
            rows.forEach(function (r) {
              if (r.words_mastered === undefined) {
                r.words_mastered = Math.round(
                  ((Number(r.mastery_percentage) || 0) * totalWords) / 100,
                );
                r.words_total = totalWords;
              }
            });
          }
        } catch (_e) {}
      }

      if (!rows || rows.length === 0) {
        rows = buildLocalLeaderboardRows();
      }

      renderLeaderboardRows(rows, txt.leaderboardEmpty);
    } catch (_e) {
      renderLeaderboardRows(buildLocalLeaderboardRows(), txt.leaderboardEmpty);
    }
  }

  var _escapeDiv = document.createElement("div");
  function escapeHtml(str) {
    _escapeDiv.textContent = str || "";
    return _escapeDiv.innerHTML;
  }

  var RUBY_ALLOWED_TAGS = { RUBY: true, RT: true, RP: true, BR: true };
  function sanitizeRubyHtml(rawHtml) {
    if (!rawHtml) return "";
    var template = document.createElement("template");
    template.innerHTML = String(rawHtml);
    sanitizeRubyNode(template.content);
    return template.innerHTML;
  }

  function sanitizeRubyNode(parentNode) {
    var nodes = [];
    for (var i = 0; i < parentNode.childNodes.length; i++) {
      nodes.push(parentNode.childNodes[i]);
    }

    nodes.forEach(function (node) {
      if (node.nodeType === 3) return;
      if (node.nodeType !== 1) {
        parentNode.removeChild(node);
        return;
      }

      if (!RUBY_ALLOWED_TAGS[node.tagName]) {
        parentNode.replaceChild(
          document.createTextNode(node.textContent || ""),
          node,
        );
        return;
      }

      while (node.attributes.length > 0) {
        node.removeAttribute(node.attributes[0].name);
      }
      sanitizeRubyNode(node);
    });
  }

  // ============================================
  // SAKURA PETALS
  // ============================================
  var sakuraEnabled = true;

  function createSakuraPetals() {
    var container = els.sakuraContainer;
    if (!container || !sakuraEnabled) return;
    var isMobile = window.innerWidth <= 480;
    var count = isMobile ? 10 : 16;

    container.innerHTML = "";

    for (var i = 0; i < count; i++) {
      var petal = document.createElement("div");
      petal.className = "sakura-petal";
      petal.textContent = "🌸";

      var sizes = [12, 14, 16, 18, 20];
      var size = sizes[Math.floor(Math.random() * sizes.length)];
      var left = Math.random() * 100;
      var fallDuration = 12 + Math.random() * 14;
      var swayDuration = 4 + Math.random() * 5;
      var delay = Math.random() * 16;
      var opacity = 0.15 + Math.random() * 0.25;

      petal.style.cssText =
        "left:" +
        left +
        "%;" +
        "font-size:" +
        size +
        "px;" +
        "opacity:" +
        opacity +
        ";" +
        "animation-duration:" +
        fallDuration +
        "s," +
        swayDuration +
        "s;" +
        "animation-delay:" +
        delay +
        "s," +
        delay +
        "s;";

      container.appendChild(petal);
    }
  }

  // ---- Confetti burst on correct answer ----
  function spawnConfetti(x, y) {
    var container = document.createElement("div");
    container.className = "confetti-container";
    document.body.appendChild(container);
    var colors = [
      "#5a9e6f",
      "#7bc48d",
      "#c4736e",
      "#d4908f",
      "#c49a3c",
      "#d4c060",
      "#6ba3d4",
      "#a088c4",
    ];
    for (var i = 0; i < 24; i++) {
      var p = document.createElement("div");
      p.className = "confetti-particle";
      var angle = ((Math.PI * 2) / 24) * i + (Math.random() - 0.5) * 0.5;
      var dist = 60 + Math.random() * 100;
      var tx = Math.cos(angle) * dist;
      var ty = Math.sin(angle) * dist - 30;
      var tr = Math.random() * 720 - 360 + "deg";
      p.style.cssText =
        "left:" +
        x +
        "px;top:" +
        y +
        "px;" +
        "background:" +
        colors[Math.floor(Math.random() * colors.length)] +
        ";" +
        "--tx:" +
        tx +
        "px;--ty:" +
        ty +
        "px;--tr:" +
        tr +
        ";" +
        "width:" +
        (5 + Math.random() * 5) +
        "px;" +
        "height:" +
        (5 + Math.random() * 5) +
        "px;" +
        "border-radius:" +
        (Math.random() > 0.5 ? "50%" : "2px") +
        ";" +
        "animation-duration:" +
        (0.7 + Math.random() * 0.5) +
        "s;" +
        "animation-delay:" +
        Math.random() * 0.1 +
        "s;";
      container.appendChild(p);
    }
    setTimeout(function () {
      container.remove();
    }, 1500);
  }

  function toggleSakura() {
    sakuraEnabled = !sakuraEnabled;
    els.sakuraContainer.style.display = sakuraEnabled ? "" : "none";
    els.sakuraToggle.classList.toggle("off", !sakuraEnabled);
    els.sakuraToggle.setAttribute(
      "aria-pressed",
      sakuraEnabled ? "true" : "false",
    );
  }

  var _resizeDebounce = null;
  function handleWindowResize() {
    if (_resizeDebounce) clearTimeout(_resizeDebounce);
    _resizeDebounce = setTimeout(function () {
      if (sakuraEnabled) createSakuraPetals();
    }, 150);
  }

  function handleGlobalKeydown(e) {
    if (e.key !== "Escape" || !state.isModalOpen) return;
    if (els.modalNextBtn.disabled) return;
    e.preventDefault();
    if (state.modalCallback) {
      state.modalCallback();
    } else {
      nextQuestion();
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (bgMusic.isPlaying) {
        bgMusic.stop();
      }
      if (audioCtx && audioCtx.state === "running") {
        audioCtx.suspend();
      }
      return;
    }

    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(function () {});
    }
    if (state.musicEnabled && !bgMusic.isPlaying) {
      bgMusic.start();
    }
  }

  // ============================================
  // DICTIONARY
  // ============================================
  var dictState = { view: "lessons", lessonNum: null, wordId: null };

  function showDictionary() {
    dictState = {
      view: "lessons",
      lessonNum: null,
      wordId: null,
      cameFromVocab: false,
    };
    showScreen("dictionary");
    updateUILabels();
    renderDictLessons();
  }

  function dictGoToLesson(lessonNum) {
    dictState.cameFromVocab =
      dictState.view === "vocab-lessons" || dictState.cameFromVocab;
    dictState.view = "words";
    dictState.lessonNum = lessonNum;
    dictState.wordId = null;
    renderDictWords(lessonNum);
  }

  function dictGoToWord(wordId) {
    dictState.view = "detail";
    dictState.wordId = wordId;
    renderDictWordDetail(wordId);
  }

  function dictGoBack() {
    if (dictState.view === "detail") {
      dictGoToLesson(dictState.lessonNum);
    } else if (dictState.view === "words") {
      if (dictState.cameFromVocab) {
        dictShowVocabLessons();
      } else {
        dictState.view = "lessons";
        dictState.lessonNum = null;
        renderDictLessons();
      }
    } else if (dictState.view === "kanji-list") {
      if (dictState.kanjiLessonFilter) {
        dictShowKanjiLessons();
      } else {
        dictShowKanjiLessons();
      }
    } else if (dictState.view === "kanji-lessons") {
      dictState = { view: "lessons", lessonNum: null, wordId: null };
      renderDictLessons();
    } else if (dictState.view === "grammar-detail") {
      // Go back to the lesson rules list
      if (dictState.grammarRule) {
        var lessonNum = dictState.grammarRule.lesson;
        var lessonRules = grammarData.filter(function (g) {
          return g.lesson === lessonNum;
        });
        dictShowGrammarLessonRules(lessonNum, lessonRules);
      } else {
        dictShowGrammarByLessons();
      }
    } else if (dictState.view === "grammar-lesson-rules") {
      dictShowGrammarByLessons();
    } else if (dictState.view === "grammar-lessons") {
      dictState = { view: "lessons", lessonNum: null, wordId: null };
      renderDictLessons();
    } else if (
      dictState.view === "kana-chart" ||
      dictState.view === "vocab-lessons"
    ) {
      dictState = { view: "lessons", lessonNum: null, wordId: null };
      renderDictLessons();
    } else {
      initLessonSelection();
    }
  }

  function renderDictBreadcrumb() {
    var txt = uiTexts[state.lang];
    var bc = els.dictionaryBreadcrumb;
    bc.innerHTML = "";

    var root = document.createElement("span");
    if (dictState.view !== "lessons") {
      root.className = "dict-breadcrumb-link";
      root.textContent = txt.dictionary;
      bindAccessibleAction(root, function () {
        dictState = { view: "lessons", lessonNum: null, wordId: null };
        renderDictLessons();
      });
    } else {
      root.className = "dict-breadcrumb-current";
      root.textContent = txt.dictionary;
    }
    bc.appendChild(root);

    // If navigating from vocabulary sub-section, add vocab breadcrumb
    if (
      dictState.cameFromVocab &&
      (dictState.view === "words" || dictState.view === "detail")
    ) {
      var sepV = document.createElement("span");
      sepV.className = "dict-breadcrumb-sep";
      sepV.textContent = "›";
      bc.appendChild(sepV);

      var vocabLink = document.createElement("span");
      vocabLink.className = "dict-breadcrumb-link";
      vocabLink.textContent = txt.dictVocabulary;
      bindAccessibleAction(vocabLink, function () {
        dictShowVocabLessons();
      });
      bc.appendChild(vocabLink);
    }

    if (dictState.view === "words" || dictState.view === "detail") {
      var sep1 = document.createElement("span");
      sep1.className = "dict-breadcrumb-sep";
      sep1.textContent = "›";
      bc.appendChild(sep1);

      var lessonLink = document.createElement("span");
      lessonLink.textContent = txt.lessonPrefix + " " + dictState.lessonNum;
      if (dictState.view === "detail") {
        lessonLink.className = "dict-breadcrumb-link";
        bindAccessibleAction(lessonLink, function () {
          dictGoToLesson(dictState.lessonNum);
        });
      } else {
        lessonLink.className = "dict-breadcrumb-current";
      }
      bc.appendChild(lessonLink);
    }

    if (dictState.view === "detail") {
      var word = wordsData.find(function (w) {
        return w.id === dictState.wordId;
      });
      if (word) {
        var sep2 = document.createElement("span");
        sep2.className = "dict-breadcrumb-sep";
        sep2.textContent = "›";
        bc.appendChild(sep2);

        var wordLabel = document.createElement("span");
        wordLabel.className = "dict-breadcrumb-current";
        wordLabel.textContent = word.cleanWord;
        bc.appendChild(wordLabel);
      }
    }
  }

  function renderDictLessons() {
    var txt = uiTexts[state.lang];
    renderDictBreadcrumb();

    var container = els.dictionaryContent;
    container.innerHTML = "";

    // ── Category cards: Hiragana, Katakana, Kanji ──
    var catGrid = document.createElement("div");
    catGrid.className = "dict-category-grid";

    // Hiragana
    var hiraCat = document.createElement("div");
    hiraCat.className = "dict-category-card";
    hiraCat.innerHTML =
      '<div class="dict-category-char">あ</div>' +
      '<div class="dict-category-label">' +
      escapeHtml(txt.dictHiragana) +
      "</div>" +
      '<div class="dict-category-count">' +
      getAllHiragana().length +
      " " +
      txt.charCount +
      "</div>";
    bindAccessibleAction(hiraCat, function () {
      dictShowKanaChart("hiragana");
    });
    catGrid.appendChild(hiraCat);

    // Katakana
    var kataCat = document.createElement("div");
    kataCat.className = "dict-category-card";
    kataCat.innerHTML =
      '<div class="dict-category-char">ア</div>' +
      '<div class="dict-category-label">' +
      escapeHtml(txt.dictKatakana) +
      "</div>" +
      '<div class="dict-category-count">' +
      getAllKatakana().length +
      " " +
      txt.charCount +
      "</div>";
    bindAccessibleAction(kataCat, function () {
      dictShowKanaChart("katakana");
    });
    catGrid.appendChild(kataCat);

    // Kanji — now shows lesson selection
    var kanjiCat = document.createElement("div");
    kanjiCat.className = "dict-category-card";
    kanjiCat.innerHTML =
      '<div class="dict-category-char">漢</div>' +
      '<div class="dict-category-label">' +
      escapeHtml(txt.dictKanji) +
      "</div>" +
      '<div class="dict-category-count">' +
      kanjiData.length +
      " " +
      txt.kanjiCount +
      "</div>";
    bindAccessibleAction(kanjiCat, function () {
      dictShowKanjiLessons();
    });
    catGrid.appendChild(kanjiCat);

    // Grammar
    var grammarCat = document.createElement("div");
    grammarCat.className = "dict-category-card";
    grammarCat.innerHTML =
      '<div class="dict-category-char">文</div>' +
      '<div class="dict-category-label">' +
      escapeHtml(txt.dictGrammar) +
      "</div>" +
      '<div class="dict-category-count">' +
      grammarData.length +
      " " +
      txt.grammarRuleCount +
      "</div>";
    bindAccessibleAction(grammarCat, function () {
      dictShowGrammarByLessons();
    });
    catGrid.appendChild(grammarCat);

    // Vocabulary
    var vocabCat = document.createElement("div");
    vocabCat.className = "dict-category-card";
    vocabCat.innerHTML =
      '<div class="dict-category-char">語</div>' +
      '<div class="dict-category-label">' +
      escapeHtml(txt.dictVocabulary) +
      "</div>" +
      '<div class="dict-category-count">' +
      wordsData.length +
      " " +
      txt.wordsCount +
      "</div>";
    bindAccessibleAction(vocabCat, function () {
      dictShowVocabLessons();
    });
    catGrid.appendChild(vocabCat);

    container.appendChild(catGrid);
  }

  function dictShowKanaChart(type) {
    var txt = uiTexts[state.lang];
    var data = type === "hiragana" ? hiraganaData : katakanaData;
    dictState.view = "kana-chart";
    dictState.kanaType = type;
    renderDictBreadcrumbCustom(
      type === "hiragana" ? txt.dictHiragana : txt.dictKatakana,
    );

    var container = els.dictionaryContent;
    container.innerHTML = "";

    function renderSection(label, items) {
      var sectionLabel = document.createElement("div");
      sectionLabel.className = "dict-kana-section-label";
      sectionLabel.textContent = label;
      container.appendChild(sectionLabel);

      var chart = document.createElement("div");
      chart.className = "dict-kana-chart";
      items.forEach(function (k) {
        var cell = document.createElement("div");
        cell.className = "dict-kana-cell";
        cell.innerHTML =
          '<div class="dict-kana-cell-char">' +
          escapeHtml(k.char) +
          "</div>" +
          '<div class="dict-kana-cell-romaji">' +
          escapeHtml(k.romaji) +
          "</div>";
        chart.appendChild(cell);
      });
      container.appendChild(chart);
    }

    renderSection(txt.basicKana, data.basic);
    renderSection(txt.dakutenKana, data.dakuten);
    renderSection(txt.comboKana, data.combo);

    container.style.animation = "none";
    void container.offsetWidth;
    container.style.animation = "fadeInUp 0.35s ease-out";
  }

  function dictShowKanjiList() {
    var txt = uiTexts[state.lang];
    dictState.view = "kanji-list";
    renderDictBreadcrumbCustom(txt.dictKanji);

    var container = els.dictionaryContent;
    container.innerHTML = "";

    var kanjiToShow = dictState.kanjiLessonFilter
      ? getKanjiByLesson(dictState.kanjiLessonFilter)
      : kanjiData;

    kanjiToShow.forEach(function (k) {
      var card = document.createElement("div");
      card.className = "dict-kanji-card";
      card.innerHTML =
        '<div class="dict-kanji-char">' +
        escapeHtml(k.kanji) +
        "</div>" +
        '<div class="dict-kanji-info">' +
        '<div class="dict-kanji-reading">' +
        escapeHtml(k.reading) +
        " (" +
        escapeHtml(k.romaji) +
        ")</div>" +
        '<div class="dict-kanji-meaning">' +
        escapeHtml(k.meanings[state.lang]) +
        "</div>" +
        "</div>";
      container.appendChild(card);
    });

    container.style.animation = "none";
    void container.offsetWidth;
    container.style.animation = "fadeInUp 0.35s ease-out";
  }

  function dictShowKanjiLessons() {
    var txt = uiTexts[state.lang];
    dictState.view = "kanji-lessons";
    dictState.kanjiLessonFilter = null;
    renderDictBreadcrumbCustom(txt.dictKanji);

    var container = els.dictionaryContent;
    container.innerHTML = "";

    var grid = document.createElement("div");
    grid.className = "dict-lesson-grid";

    var kanjiLessons = getKanjiLessons();

    kanjiLessons.forEach(function (lessonNum) {
      var kanjiInLesson = getKanjiByLesson(lessonNum);

      var btn = document.createElement("button");
      btn.className = "dict-lesson-btn";
      btn.innerHTML =
        '<span class="dict-lesson-icon">' +
        ICONS.book +
        "</span>" +
        "<span>" +
        txt.kanjiLessonPrefix +
        " " +
        lessonNum +
        "</span>" +
        '<span class="dict-lesson-count">' +
        kanjiInLesson.length +
        " " +
        txt.kanjiInLesson +
        "</span>";
      btn.onclick = (function (num) {
        return function () {
          dictState.kanjiLessonFilter = num;
          dictState.view = "kanji-list";
          dictShowKanjiList();
        };
      })(lessonNum);
      grid.appendChild(btn);
    });

    container.appendChild(grid);
    container.style.animation = "none";
    void container.offsetWidth;
    container.style.animation = "fadeInUp 0.35s ease-out";
  }

  // ============================================
  // DICTIONARY: GRAMMAR SECTION
  // ============================================
  function dictShowGrammarByLessons() {
    var txt = uiTexts[state.lang];
    dictState.view = "grammar-lessons";
    renderDictBreadcrumbCustom(txt.dictGrammar);

    var container = els.dictionaryContent;
    container.innerHTML = "";

    // Group grammar by lesson
    var lessonGroups = {};
    grammarData.forEach(function (g) {
      if (!lessonGroups[g.lesson]) lessonGroups[g.lesson] = [];
      lessonGroups[g.lesson].push(g);
    });

    var lessonNums = Object.keys(lessonGroups)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      });

    var grid = document.createElement("div");
    grid.className = "dict-lesson-grid";

    lessonNums.forEach(function (lessonNum) {
      var rules = lessonGroups[lessonNum];

      var btn = document.createElement("button");
      btn.className = "dict-lesson-btn";
      btn.innerHTML =
        '<span class="dict-lesson-icon">' +
        ICONS.fileText +
        "</span>" +
        "<span>" +
        txt.lessonPrefix +
        " " +
        lessonNum +
        "</span>" +
        '<span class="dict-lesson-count">' +
        rules.length +
        " " +
        txt.grammarRuleCount +
        "</span>";
      btn.onclick = (function (num, rulesArr) {
        return function () {
          dictShowGrammarLessonRules(num, rulesArr);
        };
      })(lessonNum, rules);
      grid.appendChild(btn);
    });

    container.appendChild(grid);

    container.style.animation = "none";
    void container.offsetWidth;
    container.style.animation = "fadeInUp 0.35s ease-out";
  }

  function dictShowGrammarLessonRules(lessonNum, rules) {
    var txt = uiTexts[state.lang];
    dictState.view = "grammar-lesson-rules";
    dictState.grammarLessonNum = lessonNum;
    renderDictBreadcrumbCustom(
      txt.dictGrammar + " › " + txt.lessonPrefix + " " + lessonNum,
    );

    var container = els.dictionaryContent;
    container.innerHTML = "";

    rules.forEach(function (rule) {
      var card = document.createElement("div");
      card.className = "dict-kanji-card";
      card.style.cursor = "pointer";
      card.innerHTML =
        '<div class="dict-kanji-info" style="flex:1">' +
        '<div class="dict-kanji-reading" style="font-family:var(--font-ui)">' +
        escapeHtml(rule.title[state.lang]) +
        "</div>" +
        '<div class="dict-kanji-meaning">' +
        rule.level +
        "</div>" +
        "</div>" +
        '<span class="dict-word-arrow">' +
        ICONS.chevronRight +
        "</span>";
      bindAccessibleAction(
        card,
        (function (r) {
          return function () {
            dictShowGrammarRule(r);
          };
        })(rule),
      );
      container.appendChild(card);
    });

    container.style.animation = "none";
    void container.offsetWidth;
    container.style.animation = "fadeInUp 0.35s ease-out";
  }

  function dictShowGrammarRule(rule) {
    var txt = uiTexts[state.lang];
    dictState.view = "grammar-detail";
    dictState.grammarRule = rule;
    renderDictBreadcrumbCustom(
      txt.dictGrammar +
        " › " +
        txt.lessonPrefix +
        " " +
        rule.lesson +
        " › " +
        rule.title[state.lang],
    );

    var container = els.dictionaryContent;
    container.innerHTML = "";

    // Title
    var header = document.createElement("div");
    header.className = "dict-detail-header";
    header.innerHTML =
      '<div class="dict-detail-jp" style="font-size:1.3rem;font-family:var(--font-ui)">' +
      escapeHtml(rule.title[state.lang]) +
      "</div>" +
      '<div class="dict-detail-trans" style="margin-top:4px">' +
      txt.lessonPrefix +
      " " +
      rule.lesson +
      " · " +
      rule.level +
      "</div>";
    container.appendChild(header);

    // Explanation
    var explanationDiv = document.createElement("div");
    explanationDiv.className = "dict-grammar-note";
    explanationDiv.style.marginTop = "16px";
    explanationDiv.innerHTML =
      '<div class="dict-grammar-text" style="white-space:pre-wrap;line-height:1.7">' +
      escapeHtml(rule.explanation[state.lang]) +
      "</div>";
    container.appendChild(explanationDiv);

    // Examples
    if (rule.examples && rule.examples.length > 0) {
      var exLabel = document.createElement("div");
      exLabel.className = "dict-examples-label";
      exLabel.textContent = txt.examples;
      exLabel.style.marginTop = "20px";
      container.appendChild(exLabel);

      rule.examples.forEach(function (ex) {
        var item = document.createElement("div");
        item.className = "dict-example-item";
        item.innerHTML =
          '<div class="dict-example-jp">' +
          escapeHtml(ex.jp) +
          "</div>" +
          '<div class="dict-example-trans">' +
          escapeHtml(ex.tr[state.lang]) +
          "</div>";
        container.appendChild(item);
      });
    }

    container.style.animation = "none";
    void container.offsetWidth;
    container.style.animation = "fadeInUp 0.35s ease-out";
  }

  function dictShowVocabLessons() {
    var txt = uiTexts[state.lang];
    dictState.view = "vocab-lessons";
    renderDictBreadcrumbCustom(txt.dictVocabulary);

    var container = els.dictionaryContent;
    container.innerHTML = "";

    var grid = document.createElement("div");
    grid.className = "dict-lesson-grid";

    var lessons = getAvailableLessons();

    lessons.forEach(function (lessonNum) {
      var lessonWords = getWordsByLesson(lessonNum);

      var btn = document.createElement("button");
      btn.className = "dict-lesson-btn";
      btn.innerHTML =
        '<span class="dict-lesson-icon">' +
        ICONS.book +
        "</span>" +
        "<span>" +
        txt.lessonPrefix +
        " " +
        lessonNum +
        "</span>" +
        '<span class="dict-lesson-count">' +
        lessonWords.length +
        " " +
        txt.wordsCount +
        "</span>";
      btn.onclick = (function (num) {
        return function () {
          dictGoToLesson(num);
        };
      })(lessonNum);
      grid.appendChild(btn);
    });

    container.appendChild(grid);
  }

  function renderDictBreadcrumbCustom(sectionName) {
    var txt = uiTexts[state.lang];
    var bc = els.dictionaryBreadcrumb;
    bc.innerHTML = "";

    var root = document.createElement("span");
    root.className = "dict-breadcrumb-link";
    root.textContent = txt.dictionary;
    bindAccessibleAction(root, function () {
      dictState = { view: "lessons", lessonNum: null, wordId: null };
      renderDictLessons();
    });
    bc.appendChild(root);

    var sep = document.createElement("span");
    sep.className = "dict-breadcrumb-sep";
    sep.textContent = "›";
    bc.appendChild(sep);

    var current = document.createElement("span");
    current.className = "dict-breadcrumb-current";
    current.textContent = sectionName;
    bc.appendChild(current);
  }

  function renderDictWords(lessonNum) {
    var txt = uiTexts[state.lang];
    renderDictBreadcrumb();

    var container = els.dictionaryContent;
    container.innerHTML = "";

    var list = document.createElement("div");
    list.className = "dict-words-list";

    var lessonWords = getWordsByLesson(lessonNum);

    lessonWords.forEach(function (word) {
      var card = document.createElement("div");
      card.className = "dict-word-card";
      card.innerHTML =
        "<div>" +
        '<div class="dict-word-jp">' +
        sanitizeRubyHtml(word.japanese) +
        "</div>" +
        '<div class="dict-word-trans">' +
        escapeHtml(word.translations[state.lang]) +
        "</div>" +
        "</div>" +
        '<span class="dict-word-arrow">' +
        ICONS.chevronRight +
        "</span>";
      bindAccessibleAction(
        card,
        (function (id) {
          return function () {
            dictGoToWord(id);
          };
        })(word.id),
      );
      list.appendChild(card);
    });

    container.appendChild(list);
    container.style.animation = "none";
    void container.offsetWidth;
    container.style.animation = "fadeInUp 0.35s ease-out";
  }

  function renderDictWordDetail(wordId) {
    var txt = uiTexts[state.lang];
    renderDictBreadcrumb();

    var word = wordsData.find(function (w) {
      return w.id === wordId;
    });
    if (!word) return;

    var container = els.dictionaryContent;
    container.innerHTML = "";

    var header = document.createElement("div");
    header.className = "dict-detail-header";
    header.innerHTML =
      '<div class="dict-detail-jp">' +
      sanitizeRubyHtml(word.japanese) +
      "</div>" +
      '<div class="dict-detail-trans">' +
      escapeHtml(word.translations[state.lang]) +
      "</div>";
    container.appendChild(header);

    var examples = word.dictionaryExamples
      ? word.dictionaryExamples[state.lang]
      : null;
    if (examples && examples.length > 0) {
      var exLabel = document.createElement("div");
      exLabel.className = "dict-examples-label";
      exLabel.textContent = txt.examples;
      container.appendChild(exLabel);

      examples.forEach(function (ex) {
        var item = document.createElement("div");
        item.className = "dict-example-item";
        item.innerHTML =
          '<div class="dict-example-jp">' +
          sanitizeRubyHtml(ex.jp) +
          "</div>" +
          '<div class="dict-example-trans">' +
          escapeHtml(ex.translation) +
          "</div>";
        container.appendChild(item);
      });
    }

    var exSentence = word.exampleSentences[state.lang];
    if (exSentence && exSentence.grammarInfo) {
      var gramDiv = document.createElement("div");
      gramDiv.className = "dict-grammar-note";
      gramDiv.innerHTML =
        '<div class="dict-grammar-label">' +
        ICONS.lightbulb +
        " " +
        txt.grammarNote +
        "</div>" +
        '<div class="dict-grammar-text">' +
        escapeHtml(exSentence.grammarInfo) +
        "</div>";
      container.appendChild(gramDiv);
    }

    container.style.animation = "none";
    void container.offsetWidth;
    container.style.animation = "fadeInUp 0.35s ease-out";
  }

  // ============================================
  // INIT
  // ============================================
  function bootApp() {
    initTheme();
    cacheDom();
    updateThemeButtonState();

    // Event listeners
    els.langBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLanguage(btn.dataset.lang);
      });
    });
    els.modalNextBtn.addEventListener("click", function () {
      if (state.modalCallback) {
        state.modalCallback();
      } else {
        nextQuestion();
      }
    });
    els.restartBtn.addEventListener("click", function () {
      initLessonSelection();
    });
    els.quizBackBtn.addEventListener("click", function () {
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
      }
      state.isModalOpen = false;
      state.modalCallback = null;
      state.modalKanjiItem = null;
      state.modalWasCorrect = false;
      setModalVisibility(false);
      initLessonSelection();
    });
    els.logoutBtn.addEventListener("click", handleLogout);
    els.leaderboardBtn.addEventListener("click", showLeaderboard);
    els.leaderboardBackBtn.addEventListener("click", function () {
      initLessonSelection();
    });
    els.dictionaryBtn.addEventListener("click", showDictionary);
    els.dictionaryBackBtn.addEventListener("click", dictGoBack);
    els.sakuraToggle.addEventListener("click", toggleSakura);
    els.themeToggleBtn.addEventListener("click", toggleTheme);
    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("keydown", handleGlobalKeydown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    els.soundToggleBtn.addEventListener("click", function () {
      state.soundEnabled = !state.soundEnabled;
      els.soundToggleBtn.innerHTML = state.soundEnabled
        ? ICONS.volumeOn
        : ICONS.volumeOff;
      els.soundToggleBtn.classList.toggle("muted", !state.soundEnabled);
      els.soundToggleBtn.setAttribute(
        "aria-pressed",
        state.soundEnabled ? "true" : "false",
      );
    });

    els.musicToggleBtn.addEventListener("click", toggleBgMusic);

    els.tabLogin.addEventListener("click", function () {
      switchAuthMode("login");
    });
    els.tabRegister.addEventListener("click", function () {
      switchAuthMode("register");
    });
    els.authSubmitBtn.addEventListener("click", handleAuthSubmit);

    els.authPassword.addEventListener("keydown", function (e) {
      if (e.key === "Enter") handleAuthSubmit();
    });

    els.authEmail.addEventListener("keydown", function (e) {
      if (e.key === "Enter") handleAuthSubmit();
    });

    els.authName.addEventListener("keydown", function (e) {
      if (e.key === "Enter") handleAuthSubmit();
    });

    var hasSupabase = initSupabase();

    if (hasSupabase) {
      // Показываем безопасный экран сразу, пока восстанавливается сессия.
      showHeaderButtons(false);
      showScreen("auth");
      updateAuthLabels();

      // onAuthStateChange вызовет INITIAL_SESSION автоматически,
      // что восстановит сессию из localStorage при F5/перезагрузке
      // или покажет экран логина, если сессии нет.
      ensureBackendCapabilities();
      setupAuthListener();
    } else {
      showHeaderButtons(false);
      els.soundToggleBtn.classList.add("visible");
      els.musicToggleBtn.classList.add("visible");
      els.dictionaryBtn.classList.add("visible");
      loadLocalProgress();
      initLessonSelection();
    }

    createSakuraPetals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootApp);
  } else {
    bootApp();
  }
})();
