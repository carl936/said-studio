/* ==========================================================================
   SAID STUDIO, main.js
   Plain JavaScript. No frameworks, no dependencies.
   ========================================================================== */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. CURTAIN REVEAL (homepage signature moment)
     Two satin panels part like stage drapes, a nod to SAID STUDIO's
     custom draping work. Plays once per session.
  ------------------------------------------------------------------ */
  var curtain = document.querySelector(".curtain");
  if (curtain) {
    var seen = sessionStorage.getItem("said-curtain");
    if (seen || prefersReducedMotion) {
      curtain.classList.add("is-done");
      document.body.classList.add("is-revealed");
    } else {
      sessionStorage.setItem("said-curtain", "1");
      window.setTimeout(function () {
        curtain.classList.add("is-open");
        document.body.classList.add("is-revealed");
      }, 650);
      curtain.addEventListener("transitionend", function () {
        curtain.classList.add("is-done");
      });
      // Safety: never trap the user behind the curtain
      window.setTimeout(function () { curtain.classList.add("is-done"); }, 3200);
    }
  } else {
    document.body.classList.add("is-revealed");
  }

  /* ------------------------------------------------------------------
     2. HEADER, solid on scroll, hides on scroll down, returns on up
  ------------------------------------------------------------------ */
  var header = document.querySelector(".site-header");
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", y > 40);
      if (y > 320 && y > lastY) {
        header.classList.add("is-hidden");
      } else {
        header.classList.remove("is-hidden");
      }
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     3. MOBILE MENU
  ------------------------------------------------------------------ */
  var toggle = document.querySelector(".menu-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");
  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileMenu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
        document.body.style.overflow = "";
      });
    });
  }

  /* ------------------------------------------------------------------
     4. SCROLL REVEALS
  ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ------------------------------------------------------------------
     5. GALLERY FILTERING
  ------------------------------------------------------------------ */
  var filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    var items = document.querySelectorAll(".masonry-item");
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      var f = btn.dataset.filter;
      items.forEach(function (item) {
        var show = f === "all" || item.dataset.category === f;
        item.classList.toggle("is-hidden", !show);
      });
    });
  }

  /* ------------------------------------------------------------------
     5b. DRAPING "WHAT WE OFFER" CAROUSEL
  ------------------------------------------------------------------ */
  var dc = document.querySelector("[data-carousel]");
  if (dc) {
    var slides = dc.querySelectorAll(".dc-slide");
    var counter = dc.querySelector(".dc-count b");
    var ci = 0;
    function dcShow(n) {
      ci = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === ci); });
      if (counter) counter.textContent = ("0" + (ci + 1)).slice(-2);
    }
    var p = dc.querySelector(".dc-prev"), nx = dc.querySelector(".dc-next");
    if (p) p.addEventListener("click", function () { dcShow(ci - 1); });
    if (nx) nx.addEventListener("click", function () { dcShow(ci + 1); });
  }

  /* ------------------------------------------------------------------
     6. LIGHTBOX (gallery + case studies)
  ------------------------------------------------------------------ */
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCaption = lightbox.querySelector(".lightbox-caption");
    var sources = [];
    var index = 0;
    var lastFocus = null;

    function collectSources() {
      sources = Array.prototype.filter.call(
        document.querySelectorAll("[data-lightbox]"),
        function (el) { return !el.classList.contains("is-hidden"); }
      );
    }
    function openAt(i) {
      collectSources();
      index = (i + sources.length) % sources.length;
      var el = sources[index];
      var img = el.tagName === "IMG" ? el : el.querySelector("img");
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || "";
      if (lbCaption) lbCaption.textContent = el.dataset.caption || img.alt || "";
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
      lastFocus = document.activeElement;
      lightbox.querySelector(".lightbox-close").focus();
    }
    function closeLb() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-lightbox]");
      if (trigger) {
        e.preventDefault();
        collectSources();
        openAt(sources.indexOf(trigger));
      }
    });
    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLb);
    lightbox.querySelector(".lightbox-prev").addEventListener("click", function () { openAt(index - 1); });
    lightbox.querySelector(".lightbox-next").addEventListener("click", function () { openAt(index + 1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") openAt(index - 1);
      if (e.key === "ArrowRight") openAt(index + 1);
    });
  }

  /* ------------------------------------------------------------------
     7. CASE STUDIES, one template, many stories
     case-study-template.html?project=<slug> renders from this data.
     NOTE: replace "Additional credits to be confirmed" with real vendor
     names (photographer, venue, gown, florals) once confirmed.
  ------------------------------------------------------------------ */
  /* ==================================================================
     CASE STUDY DATA (2026 refresh)
     Credits are taken VERBATIM from _references/carolyn-feedback.csv.
     Where the CSV has no credit, the field is left blank + a TODO, we do
     NOT invent credits. Slugs for the three originally-live projects
     (ana-joseph, lakeside-editorial, old-world-editorial) are kept so no
     existing links break; only their display names + copy changed.
     Slug ↔ name map:
       ana-joseph            → Styled Editorial
       old-world-editorial   → Abbotsford Convent
       lakeside-editorial    → Sault Daylesford
       samantha-thomas, mont-du-soleil, kiara-sam, esther-jake,
       isabelle-matthew, sheike-luncheon, seed-taste-of-winter,
       hommey-launch          → new

     REMAINING TODOs (rest confirmed with Carolyn, Aug 2026):
       • Seed Taste of Winter, photographer intentionally left BLANK for now
         (Carolyn to confirm later). The only remaining credit gap.
       • Styled Editorial, overview copy APPROVED (from the concept deck in
         _references/ana-joseph-concept-deck/). Only open item: the venue name
         ("Alora") is withheld pending Carolyn's OK to publish it.
       • Isabelle & Matthew, no event date supplied; shown general ("2026").
     Resolved: Styled Editorial photographer = Josie Lee · Sault = Emily Rose ·
     Hommey = Zoe Eley Photography · Sheike phone shots are intentional/final ·
     all dates now month + year.
     ================================================================== */
  var PROJECTS = {
    "ana-joseph": {
      title: "Styled Editorial at Alora Macedon",
      eyebrow: "Editorial",
      date: "June 2026",
      location: "Alora Macedon, Macedon Ranges",
      type: "Editorial",
      palette: "Sea pearl, dusty rose, burgundy",
      hero: "assets/cs-alora-9.jpg",
      /* Copy from the concept deck (_references/ana-joseph-concept-deck/).
         Venue Alora Macedon confirmed public by Carolyn (updated.csv, Aug 2026). */
      overview: [
        "An exploration of softness and structure. Staged at Alora Macedon, a private Tuscan-style estate set against the sweeping views of the Macedon Ranges, this design-led editorial was conceived to introduce a new luxury wedding destination. Beneath the arched glass of the estate's conservatory, and among its columned loggias and pool, the concept explores how layered textiles and tonal restraint can reshape a space, letting contrast do the lasting work.",
        "Fabric leads throughout. A sculptural pleated backdrop in dusty rose anchors the reception, while soft ivory satin is gathered through the loggia arches to frame the cocktail hour. Rather than rows, the tables are laid as an expansive cross, drawing guests inward and giving the room a sense of movement. Liquid-satin cloths, dusty-rose runners, silver and vintage lamplight layer warmth over the glasshouse's clean lines.",
        "Colour builds in a slow gradient, from sea-pearl ivory through tender peach and dusty pink to deep burgundy. Sculptural florals carry the same shift, peach anthuriums and burgundy amaryllis massed into loose, cascading forms. The bride wears a bespoke silk gown with a structured bodice, unveiled for the shoot, while the cake becomes its own fashion-led moment, its icing ruched and gathered like couture fabric atop a voluminous burgundy-draped table that pools to the floor.",
        "Old-world architecture meets contemporary restraint, softness set against structure, abundance held in check by a disciplined palette. The result is a considered, editorial portrait of what a celebration at Alora Macedon could be."
      ],
      services: ["Event design & styling", "Custom table draping", "Tablescape design"],
      collaborators: [
        "Venue · @aloramacedon",
        "Styling & draping · @saidstudio.events",
        "Photography · @josie_lee",
        "Flowers · @soflower____",
        "Dress & veil · @coutil.studio",
        "Hire & framing · @harrythehirer",
        "Content creation · @mtl.socials",
        "Hair · @hairbyjc",
        "Makeup · @makeupwith_tash",
        "Stationery · @adelphimou",
        "Cake · @good.good.cake",
        "Candles and napkins · @hueseeka"
      ],
      images: [
        "assets/cs-alora-1.jpg",
        "assets/cs-alora-5.jpg",
        "assets/cs-alora-6.jpg",
        "assets/cs-alora-3.jpg",
        "assets/cs-alora-4.jpg",
        "assets/cs-alora-7.jpg",
        "assets/cs-alora-8.jpg",
        "assets/cs-alora-10.jpg",
        "assets/cs-alora-2.jpg"
      ],
      note: "Every celebration is designed around your story, not a template.",
      next: "old-world-editorial"
    },
    "old-world-editorial": {
      title: "Styled Editorial at Abbotsford Convent",
      eyebrow: "Editorial",
      date: "May 2025",
      location: "Mural Hall, Abbotsford Convent",
      type: "Editorial",
      palette: "Ivory satin, cherry & scarlet, smoke glass",
      hero: "assets/cs-abbotsford-2.jpg",
      overview: [
        "A Contemporary Ode to Vintage Grandeur. Set within the historic Mural Hall at Abbotsford Convent, this editorial explores the meeting point between heritage architecture and contemporary event design. Beneath ornate vaulted ceilings and against monochrome marble flooring, a series of serpentine tables creates a softer, more fluid way of gathering, inviting guests to move naturally through the space.",
        "Each table is dressed in hand-pinned ivory satin, gathered into sculptural folds that spill gently onto the floor. The drapery introduces softness without masking the character of the hall, becoming part of the architecture rather than simply sitting within it.",
        "Floral styling by Stelo Studio builds on this sense of movement. Deep cherry and scarlet blooms are balanced with ivory florals, while hand-foraged camellias weave across the tables in loose, cascading forms. Raised floral moments introduce height and rhythm, drawing the eye along the length of the installation.",
        "Vintage silver candlesticks, smoke-toned glassware and wrought iron garden chairs ground the palette, while hand-painted stationery by A Tactile Perception adds a refined finishing touch to each place setting."
      ],
      services: ["Design & styling", "Custom draping"],
      collaborators: [
        "Photography · @emilyrose.photographer",
        "Content Creation · @foreverfoxy_xo",
        "Florals · @stelo.studio",
        "Stationery · @atactileperception",
        "Furniture & Tableware · @social.eventhire",
        "Candelabras · @thesmallthingsco",
        "MUA · @beautybyvahnessa",
        "Model · @anastasia.christakakis",
        "Bridal Gown · @raffaeleciucabridal @evalendel",
        "Design & Styling · @saidstudio.events",
        "Venue · Mural Hall @abbotsfordconvent"
      ],
      images: [
        "assets/cs-abbotsford-5.jpg",
        "assets/cs-abbotsford-3.jpg",
        "assets/cs-abbotsford-4.jpg",
        "assets/cs-abbotsford-1.jpg"
      ],
      note: "A celebration that respects the history of the space while offering a contemporary interpretation of romance.",
      next: "lakeside-editorial"
    },
    "lakeside-editorial": {
      title: "Sault Daylesford",
      eyebrow: "Editorial",
      date: "February 2026",
      location: "Sault, Daylesford",
      type: "Editorial",
      palette: "Oyster satin, lavender, layered florals",
      hero: "assets/cs-sault-4.jpg",
      overview: [
        "Set at Sault Daylesford, this editorial explores a contemporary interpretation of romance through the landscape itself. Rather than competing with the surroundings, the design draws directly from them. A square tablescape wrapped in soft oyster satin becomes a continuation of the lavender fields beyond, with the entire centre of the table filled with layered florals that echo the richness of the gardens. The abundance feels intentional, creating the impression that the landscape has gathered around the celebration rather than simply framing it.",
        "The editorial also shifts the lens beyond tradition, placing equal focus on the groom and capturing moments of movement, personality and connection alongside the styling. The result is a fresh perspective on modern romance, where the landscape, the people and the design exist as one composition."
      ],
      services: ["Creative direction", "Event styling", "Table draping"],
      collaborators: [
        "Design & styling · @saidstudio.events",
        "Photography · Emily Rose"
      ],
      images: [
        "assets/cs-sault-5.jpg",
        "assets/cs-sault-6.jpg",
        "assets/cs-sault-2.jpg",
        "assets/cs-sault-7.jpg",
        "assets/cs-sault-3.jpg",
        "assets/cs-sault-1.jpg"
      ],
      /* Sault gallery is the full delivered set (6 frames). */
      note: "The landscape, the people and the design, existing as one composition.",
      next: "samantha-thomas"
    },
    "samantha-thomas": {
      title: "Samantha & Thomas at The Trust",
      eyebrow: "Wedding",
      date: "July 2026",
      location: "The Trust, Melbourne",
      type: "Wedding",
      palette: "Chocolate satin, taper candlelight",
      hero: "assets/cs-samantha-6.jpg",
      overview: [
        "For Samantha and Thomas's celebration at The Trust, fabric became the common thread across every space. A custom chocolate satin backdrop was designed to frame both the signing table and later the evening's photo moment, while draped ceremony plinths, gathered table ends and bespoke satin linens carried the same material palette throughout the day.",
        "Guest tables were intentionally free of florals. Rows of taper candles in glass sleeves created rhythm down the length of the room, allowing texture, light and repetition to become the defining elements of the reception."
      ],
      services: ["Event styling", "Custom draping", "Bespoke satin linens"],
      collaborators: [
        "Official Photographer · @maegan.brown",
        "Photobooth Photographer · @jt.photographyofficial",
        "Video · @luca.zarik",
        "Celebrant · @sarahdavolicelebrant",
        "Content · @sarahdavolistudio",
        "Venue · @thetrust_melbourne",
        "Styling · @saidstudio.events",
        "Florals · @blondeflorals",
        "Candles · @carla.collectives",
        "Stationery & Signage · @mhevents.melbourne",
        "Dress · @thebridalcuratoraustralia",
        "Suit · @thebespokecorner",
        "Makeup · @tahlia_liapis_makeup",
        "Hair · @stephbacelic.hair @sanjascher.hair",
        "Tan · @perfect.tan.by.carol",
        "Jewellery · @rhea_nikolaou_jewellery"
      ],
      images: [
        "assets/cs-samantha-1.jpg",
        "assets/cs-samantha-2.jpg",
        "assets/cs-samantha-3.jpg",
        "assets/cs-samantha-4.jpg",
        "assets/cs-samantha-5.jpg",
        "assets/cs-samantha-7.jpg",
        "assets/cs-samantha-8.jpg",
        "assets/cs-samantha-9.jpg",
        "assets/cs-samantha-10.jpg"
      ],
      note: "Texture, light and repetition, the defining elements of the reception.",
      next: "mont-du-soleil"
    },
    "mont-du-soleil": {
      title: "Mont Du Soleil",
      eyebrow: "Bridal Editorial",
      date: "July 2025",
      location: "Mont Du Soleil, regional Victoria",
      type: "Bridal Editorial",
      palette: "Burgundy, burnt orange, blush, ivory",
      hero: "assets/cs-mont-10.jpg",
      overview: [
        "Mediterranean Romance in Melbourne. Sun-drenched stone, terracotta rooftops, and the romance of Tuscany and Provence, reimagined just an hour from Melbourne. At Mont Du Soleil, Mediterranean warmth becomes the backdrop for an editorial exploring intimacy, abundance and the modern bride.",
        "Contrast shapes every scene: sculptural florals in burgundy, burnt orange and blush against softly gathered ivory draping; candlelight reflecting through amber glassware; old-world architecture meeting contemporary bridal fashion. Cymbidium orchids and garden roses weave through fruit and foliage, spilling the length of a single long table with a sense of abundance that never feels overworked. An iron pergola, softened with flowing fabric, frames the ceremony and becomes the thread connecting each setting.",
        "The bride wears Karen Willis Holmes, a modern two-piece in soft ivory, styled with lace gloves and stockings by High Heel Jungle. In place of a traditional bouquet, she carries a bespoke ivory clutch by Melbourne label Virk Bags. Surrounded by sculptural cakes, taper candles and vintage furniture, the styling borrows from the extravagance of Marie Antoinette without taking itself too seriously.",
        "A Mediterranean escape, reimagined in regional Victoria. Vintage meets modern, restraint meets abundance, and every detail contributes to a celebration that feels unmistakably European while remaining distinctly local."
      ],
      services: ["Creative direction", "Styling & draping", "Tablescape design"],
      collaborators: [
        "Florals · Judah Rose",
        "Venue · Mont Du Soleil",
        "Content Creation · @vowhaus.collective",
        "Photography · Little Chief Photography",
        "MUA · @makeupwith_tash",
        "Bridal Bag · Virk Bags",
        "Hosiery · High Heel Jungle",
        "Cakes · Rozi Bakes",
        "Model · Rhiannon Callaghan (Brooklyn MGMT)",
        "Gown · Karen Willis Holmes",
        "Styling & Draping · @saidstudio.events"
      ],
      images: [
        "assets/cs-mont-3.jpg",
        "assets/cs-mont-8.jpg",
        "assets/cs-mont-4.jpg",
        "assets/cs-mont-1.jpg",
        "assets/cs-mont-6.jpg",
        "assets/cs-mont-7.jpg",
        "assets/cs-mont-9.jpg",
        "assets/cs-mont-2.jpg",
        "assets/cs-mont-5.jpg"
      ],
      note: "Vintage meets modern, restraint meets abundance.",
      next: "kiara-sam"
    },
    "kiara-sam": {
      title: "Kiara & Sam at Sunnyside",
      eyebrow: "Wedding",
      date: "February 2026",
      location: "Sunnyside Events",
      type: "Wedding",
      palette: "Old European stone, garden florals",
      hero: "assets/cs-kiara-4.jpg",
      heroPos: "50% 28%",
      overview: [
        "Inspired by the old European character of Sunnyside Events, this celebration was designed to feel as though it had always belonged there. Guests moved from a garden ceremony to sunset cocktails in the piazza before gathering in the main hall for dinner, with each space connected through a consistent material palette and considered styling.",
        "A custom draped backdrop became the defining feature of the piazza, creating a destination for guests while complementing the surrounding stone architecture. Throughout the celebration, the styling remained quietly confident, allowing the venue, the light and the architecture to shape the experience as much as the decor itself."
      ],
      services: ["Event styling", "Custom draping", "Creative direction"],
      collaborators: [
        "Venue · @sunnysideestate.events @foodanddesire",
        "Styling & Draping · @saidstudio.events",
        "Lounge Hire · @friday.hire",
        "Florals · @rosestudios___",
        "Primary Photographer · @maeganbrownmoments",
        "Backdrop Photographer · @jt.photographyofficial",
        "Videography · @luca.zarik",
        "Signage · @completecollective_design",
        "Content Creator · @vowhaus.collective",
        "Harpist · @lianaharpist",
        "Custom Matchboxes · @signsealeddelivered_",
        "MUA · @adele.rossimakeup",
        "Dresses · @hollybutleratelier",
        "Tan · @ora.tan_tanningstudio"
      ],
      images: [
        "assets/cs-kiara-8.jpg",
        "assets/cs-kiara-10.jpg",
        "assets/cs-kiara-1.jpg",
        "assets/cs-kiara-2.jpg",
        "assets/cs-kiara-6.jpg",
        "assets/cs-kiara-3.jpg",
        "assets/cs-kiara-5.jpg",
        "assets/cs-kiara-7.jpg",
        "assets/cs-kiara-9.jpg"
      ],
      note: "Designed to feel as though it had always belonged there.",
      next: "esther-jake"
    },
    "esther-jake": {
      title: "Esther & Jake at Sistine on Chapel",
      eyebrow: "Engagement",
      date: "February 2026",
      location: "Sistine on Chapel",
      type: "Engagement",
      palette: "Ivory satin & lace, velvet, renaissance",
      hero: "assets/cs-esther-1.jpg",
      overview: [
        "With its moody interiors, velvet furnishings and renaissance influences, Sistine on Chapel set the tone for Esther and Jake's engagement celebration. Layers of ivory satin and lace drapery introduced softness and texture throughout the space, creating contrast against the venue's darker palette while allowing its character to shine.",
        "Guests were welcomed with a generous grazing table before the evening unfolded through oyster towers, caviar bumps, vodka shots and decadent tiramisu. The celebration felt generous, social and unhurried, with every detail designed to encourage guests to settle in and stay awhile."
      ],
      services: ["Styling & draping", "Creative direction"],
      collaborators: [
        "Styling & Draping · @saidstudio.events",
        "Florals · @soflower____",
        "Venue · @sistine_onchapel",
        "Photography · @creative_by_natalie",
        "Cake · @good.good.cake"
      ],
      images: [
        "assets/cs-esther-3.jpg",
        "assets/cs-esther-4.jpg",
        "assets/cs-esther-6.jpg",
        "assets/cs-esther-8.jpg",
        "assets/cs-esther-10.jpg",
        "assets/cs-esther-2.jpg",
        "assets/cs-esther-5.jpg",
        "assets/cs-esther-7.jpg",
        "assets/cs-esther-9.jpg"
      ],
      note: "Generous, social and unhurried.",
      next: "isabelle-matthew"
    },
    "isabelle-matthew": {
      title: "Isabelle & Matthew at Orlo",
      eyebrow: "Wedding",
      date: "2026",
      location: "Orlo, Collingwood",
      type: "Wedding",
      palette: "Draped backdrops, suspended florals",
      hero: "assets/cs-isabelle-7.jpg",
      heroPos: "50% 30%",
      overview: [
        "Isabelle & Matthew's wedding at Orlo began with an intimate terrace ceremony featuring a custom draped backdrop and suspended floral installations that framed the couple against the venue's beautiful courtyard.",
        "The celebration then flowed into a cocktail-style reception with an abundant grazing table and oyster station before continuing into the basement bar, transformed with bespoke lighting, sculptural florals and layered drapery for a warm, immersive after-party."
      ],
      services: ["Styling & draping"],
      collaborators: [
        "Venue · @orlo.collingwood",
        "Styling & Draping · @saidstudio.events",
        "Florals · @soflower____",
        "Celebrant · @marrymetee",
        "DJ · @marriedtothegroovedj",
        "Cakes · @miettamelbourne",
        "Photography · @brownpaperparcel",
        "Welcome Sign · @hellohoneyevents_"
      ],
      images: [
        "assets/cs-isabelle-3.jpg",
        "assets/cs-isabelle-10.jpg",
        "assets/cs-isabelle-5.jpg",
        "assets/cs-isabelle-1.jpg",
        "assets/cs-isabelle-9.jpg",
        "assets/cs-isabelle-4.jpg",
        "assets/cs-isabelle-8.jpg",
        "assets/cs-isabelle-6.jpg",
        "assets/cs-isabelle-2.jpg"
      ],
      note: "Styled and draped from ceremony to reception.",
      next: "sheike-luncheon"
    },
    "sheike-luncheon": {
      title: "Sheike High Summer Luncheon",
      eyebrow: "Brand Experience",
      date: "January 2026",
      location: "Hyde Melbourne & Gardens House",
      type: "Brand Experience",
      palette: "Soft blues, warm neutrals, amber glass",
      hero: "assets/cs-sheike-3.jpg",
      overview: [
        "To celebrate the launch of Sheike's new summer collection, SAID STUDIO designed and delivered a two-day brand experience that moved from an intimate styling suite to a long-table luncheon in the Royal Botanic Gardens.",
        "Day one transformed Hyde Melbourne's Platinum Suite into a private styling space where guests could explore the new collection at their own pace. Every element was considered around the garments, from sculptural florals by SOFLOWER to carefully styled accessories from Sheike's core collection, creating a space that felt refined, relaxed and centred on the product.",
        "For day two, the palette stepped outdoors. Inspired by the soft blues and warm neutrals of the collection, an alfresco luncheon unfolded across serpentine dining tables dressed in flowing blue linens, amber glassware and sculptural florals. Set against the backdrop of Gardens House, the styling reflected the lightness of the collection while celebrating the arrival of summer through colour, texture and long-table dining."
      ],
      services: ["Event design", "Styling", "Custom backdrop"],
      collaborators: [
        "Client · @Sheikeandco",
        "Event Design, Styling & Custom Backdrop · @saidstudio.events",
        "Florals · @soflower____",
        "Content Creation · @vowhaus.collective",
        "Photography · @igotshotbycharlie",
        "Hire · @friday.hire",
        "Venue · @gardenshouseag @atlanticgroup"
      ],
      images: [
        "assets/cs-sheike-8.jpg",
        "assets/cs-sheike-2.jpg",
        "assets/cs-sheike-9.jpg",
        "assets/cs-sheike-4.jpg",
        "assets/cs-sheike-10.jpg",
        "assets/cs-sheike-5.jpg",
        "assets/cs-sheike-6.jpg",
        "assets/cs-sheike-1.jpg",
        "assets/cs-sheike-7.jpg"
      ],
      note: "A two-day brand experience, from styling suite to long-table luncheon.",
      next: "seed-taste-of-winter"
    },
    "seed-taste-of-winter": {
      title: "Seed Taste of Winter",
      eyebrow: "Brand Experience",
      date: "February 2026",
      location: "Soft Focus House",
      type: "Brand Experience",
      palette: "Merino wool, sculptural knit",
      hero: "assets/cs-seed-10.jpg",
      overview: [
        "For Seed Heritage's \"A Taste of Winter\" collection launch, SAID STUDIO transformed the collection's signature material into the event's hero installation. Handcrafted in our Windsor studio from 100% merino wool, the bespoke knitted backdrop reflected the texture and craftsmanship of the new collection, creating a sculptural setting for guests throughout the launch.",
        "Following the event, the installation was repurposed as part of the visual merchandising for Seed Heritage's Armadale boutique, extending the life of the piece beyond a single day. Designed to move between event and retail, it became a continuation of the collection's story across multiple customer touchpoints."
      ],
      services: ["Custom knit installation", "Event styling"],
      /* TODO: Seed photographer intentionally left blank, Carolyn to confirm later. */
      collaborators: [
        "Client · Seed",
        "Venue · Soft Focus House"
      ],
      images: [
        "assets/cs-seed-8.jpg",
        "assets/cs-seed-9.jpg",
        "assets/cs-seed-11.jpg",
        "assets/cs-seed-1.jpg",
        "assets/cs-seed-2.jpg",
        "assets/cs-seed-3.jpg",
        "assets/cs-seed-4.jpg",
        "assets/cs-seed-5.jpg",
        "assets/cs-seed-6.jpg",
        "assets/cs-seed-7.jpg"
      ],
      note: "Designed to move between event and retail.",
      next: "hommey-launch"
    },
    "hommey-launch": {
      title: "Hommey New Collection Launch",
      eyebrow: "Brand Experience",
      date: "July 2026",
      location: "Inner Studio Bathhouse & Sauna, South Yarra",
      type: "Brand Experience",
      palette: "Towelling, soft floral, tactile neutrals",
      hero: "assets/cs-hommey-2.jpg",
      overview: [
        "To launch Hommey's latest towel and robe collection, SAID STUDIO collaborated with Rayner PR and Evolve Florals to transform the product into the experience. Hosted at Inner Studio Bathhouse & Sauna in South Yarra, the event drew directly from the rituals of bathing, rest and slowing down.",
        "The hero installation was a custom backdrop created entirely from towels in the new collection. Carefully folded, gathered and draped, the textiles became an oversized sculptural backdrop, proving the product itself could become the design. Soft floral garlands by Evolve Floral introduced movement through the installation, while the surrounding styling extended the same material language across the event, creating a launch that felt considered, tactile and unmistakably Hommey."
      ],
      services: ["Custom backdrop", "Draping", "Styling"],
      collaborators: [
        "Event Design · @rayner_pr",
        "Draping · @saidstudio.events",
        "Florals · @evolve.floral",
        "Content · @visionbyeli.media",
        "Venue · @innerstudioaus",
        "Photography · Zoe Eley Photography"
      ],
      images: [
        "assets/cs-hommey-6.jpg",
        "assets/cs-hommey-10.jpg",
        "assets/cs-hommey-12.jpg",
        "assets/cs-hommey-1.jpg",
        "assets/cs-hommey-5.jpg",
        "assets/cs-hommey-3.jpg",
        "assets/cs-hommey-7.jpg",
        "assets/cs-hommey-11.jpg",
        "assets/cs-hommey-13.jpg",
        "assets/cs-hommey-4.jpg",
        "assets/cs-hommey-8.jpg",
        "assets/cs-hommey-9.jpg"
      ],
      note: "Proving the product itself could become the design.",
      next: "ana-joseph"
    }
  };

  var caseRoot = document.querySelector("[data-case-study]");
  if (caseRoot) {
    var slug = new URLSearchParams(window.location.search).get("project") || "ana-joseph";
    var data = PROJECTS[slug] || PROJECTS["ana-joseph"];
    document.title = data.title + " | SAID STUDIO";

    function set(sel, value, attr) {
      var el = caseRoot.querySelector(sel);
      if (!el) return;
      if (attr) { el.setAttribute(attr, value); } else { el.textContent = value; }
    }
    set("[data-cs-hero]", encodeURI(data.hero), "src");
    set("[data-cs-hero]", data.eyebrow + " styled by SAID STUDIO", "alt");
    // Optional per-project hero focal point (keeps subjects that sit high/low in frame
    // from being cropped by the wide hero band). Defaults to the CSS 50% 46%.
    if (data.heroPos) { set("[data-cs-hero]", "object-position:" + data.heroPos, "style"); }
    set("[data-cs-eyebrow]", data.eyebrow);
    set("[data-cs-title]", data.title);
    set("[data-cs-date]", data.date);
    set("[data-cs-location]", data.location);
    set("[data-cs-type]", data.type);
    set("[data-cs-palette]", data.palette);
    set("[data-cs-note]", data.note);

    var overviewEl = caseRoot.querySelector("[data-cs-overview]");
    data.overview.forEach(function (p) {
      var el = document.createElement("p");
      el.textContent = p;
      overviewEl.appendChild(el);
    });
    var svcEl = caseRoot.querySelector("[data-cs-services]");
    data.services.forEach(function (s) {
      var li = document.createElement("li");
      li.textContent = s;
      svcEl.appendChild(li);
    });
    var colEl = caseRoot.querySelector("[data-cs-collaborators]");
    data.collaborators.forEach(function (c) {
      var li = document.createElement("li");
      // Turn @handles into Instagram links (strip @, open in new tab). Plain-text
      // credits with no @ stay as text. Escape & first so innerHTML is safe.
      li.innerHTML = c.replace(/&/g, "&amp;").replace(/@([A-Za-z0-9._]+)/g, function (m, h) {
        return '<a class="ig-link" href="https://instagram.com/' + h + '" target="_blank" rel="noopener">@' + h + '</a>';
      });
      colEl.appendChild(li);
    });
    var galleryEl = caseRoot.querySelector("[data-cs-gallery]");
    var classes = ["cg-a", "cg-b", "cg-c", "cg-d", "cg-e"];
    data.images.forEach(function (src, i) {
      var fig = document.createElement("figure");
      fig.className = classes[i % classes.length];
      var img = document.createElement("img");
      img.src = encodeURI(src);
      img.alt = data.eyebrow + " · detail " + (i + 1);
      img.loading = "lazy";
      img.setAttribute("data-lightbox", "");
      fig.appendChild(img);
      galleryEl.appendChild(fig);
    });
    var nextData = PROJECTS[data.next];
    var nextLink = caseRoot.querySelector("[data-cs-next]");
    nextLink.href = "case-study-template.html?project=" + data.next;
    nextLink.querySelector(".case-next-title").textContent = nextData.title;
  }

  /* ------------------------------------------------------------------
     8. ENQUIRY FORM
     =================================================================
     PIPEDRIVE INTEGRATION POINT
     Replace the simulated submit below with a POST to your backend
     (or a serverless function) that calls the Pipedrive API:

       POST https://api.pipedrive.com/v1/persons?api_token=YOUR_TOKEN
         { name, email, phone }  (+ partner_name as custom field/note)
       POST https://api.pipedrive.com/v1/leads?api_token=YOUR_TOKEN
         { title: "Website enquiry, " + event_type,
           person_id: <id from above>,
           note: styling_goals + preferred_date + venue + venue_address
                 + services_needed + budgets + referral_source
                 + mood_imagery_link }
       (Person + Organisation + Deal vs Lead, TBC with Carolyn's setup.
        The server-side script should also email the enquiry to Carolyn.)

     NEVER put the Pipedrive API token in this front-end file,
     route it through a server (cPanel PHP script, or a webhook such
     as Zapier/Make) so the token stays private.
     =================================================================
  ------------------------------------------------------------------ */
  var form = document.querySelector("#enquiry-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector('[name="company_website"]').value) return; // honeypot, silently drop bots

      var required = form.querySelectorAll("[required]");
      var valid = true;
      required.forEach(function (field) {
        field.style.borderBottomColor = "";
        if (!field.value.trim()) {
          field.style.borderBottomColor = "var(--accent)";
          valid = false;
        }
      });
      if (!valid) return;

      // const payload = Object.fromEntries(new FormData(form));
      // fetch("/api/enquire.php", { method: "POST", body: JSON.stringify(payload) })
      //   → server-side script forwards `payload` to Pipedrive (see note above)

      form.style.display = "none";
      var success = document.querySelector(".form-success");
      success.style.display = "block";
      success.focus();
    });
  }
})();
