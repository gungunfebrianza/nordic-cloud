/**
 * Danish copy for /da/. DRAFT: every string is wrapped in review() until a native speaker has
 * approved it (npm run check:brand counts what remains). Product names stay English, matching
 * #pricing; mono log lines and the agent.yaml sample stay English in both languages.
 */
import type { Copy } from "./copy-types";
import { DEMO } from "./demo";
import { LIMITS, SLA_PERCENT } from "./faq";
import { review } from "./review";
import { CONFIRM } from "./security";
import { DATACENTER_LOCATIONS } from "./site";

const fmt = (n: number) => n.toLocaleString("da-DK");

export const da: Copy = {
  locale: "da",
  intl: "da-DK",
  meta: {
    tagline: review("Agenter, der aldrig stempler ud."),
    description: review(
      "En EU-hostet cloud til AI-agenter, der altid kører, med base i Jakarta, Singapore og København: always-on bots, agent-VPS og multi-agent-klynger.",
    ),
    ogLocale: "da_DK",
  },
  common: {
    skipToContent: review("Spring til indhold"),
    demoTitle: review("Illustrativt tal, ikke live-data"),
    demoTag: review("demo"),
    placeholderTitle: review("Pladsholder: værdien er ikke endelig"),
    confirmTitle: review("Udkast: skal godkendes af jura eller drift før lancering"),
    languageLabel: review("Sprog"),
    languageNames: { en: "English", da: "Dansk" },
  },
  sections: {
    hero: review("Overblik"),
    products: review("Produkter"),
    how: review("Sådan virker det"),
    "use-cases": review("Anvendelser"),
    security: review("Sikkerhed"),
    pricing: review("Priser"),
    faq: review("Spørgsmål og svar"),
    cta: review("Kom i gang"),
  },
  nav: {
    label: review("Primær"),
    home: review("forside"),
    items: [
      { label: review("Produkter"), href: "#products" },
      { label: review("Anvendelser"), href: "#use-cases" },
      { label: review("Sikkerhed"), href: "#security" },
      { label: review("Priser"), href: "#pricing" },
      // TODO: point at the docs site once it exists.
      { label: review("Dokumentation"), href: "#" },
    ],
    talk: review("Tal med os"),
    deploy: review("Udrul en agent"),
    openMenu: review("Åbn menu"),
    closeMenu: review("Luk menu"),
  },
  hero: {
    chipSuffix: review("agenter online nu"),
    headline: review("Agenter, der aldrig stempler ud."),
    sub: review(
      "EU-hostet infrastruktur til AI-agenter, der altid kører – fra én bot til koordinerede multi-agent-klynger. Bygget i København.",
    ),
    primaryCta: review("Udrul din første agent"),
    secondaryCta: review("Se hvordan det virker"),
    trustLabel: review("Kendetegn"),
    trust: [review("Hostet i EU"), review("GDPR fra starten"), review("Overvåget døgnet rundt")],
    networkLabel: review(
      "Illustration af et agentnetværk: kerneknuder, agenter og opgaver forbundet med hinanden, med datapakker der bevæger sig imellem dem, og opgaver der sendes gennem agenter, til de er færdige.",
    ),
  },
  products: {
    eyebrow: review("Produkter"),
    heading: review("Tre måder at køre agenter, der aldrig stopper."),
    items: {
      bots: {
        title: review("Always-on bots"),
        line: review("Enkelte agenter, der kører døgnet rundt."),
        bullets: [
          review("Planlagt, hændelsesstyret eller udløst af webhooks"),
          review("Automatisk genstart og sundhedstjek"),
          review("Logs og traces for hver kørsel"),
        ],
        caption: review("cron · webhooks · køer"),
      },
      vps: {
        title: review("Agent VPS"),
        line: review("Dedikerede servere, klar til agent-runtimes."),
        bullets: [
          review("Isoleret VM pr. workload"),
          review("GPU som tilvalg"),
          review("Agent-runtimes forudinstalleret"),
        ],
        caption: review("cpu · gpu · isoleret"),
      },
      clusters: {
        title: review("Multi-agent clusters"),
        line: review("Orkestrerede teams af agenter, der deler det, de ved."),
        bullets: [
          review("Delt hukommelse og køer"),
          review("Én orkestrator, mange agenter"),
          review("Overblik over hele teamet"),
        ],
        caption: review("hukommelse · køer · traces"),
      },
    },
    from: review("fra"),
    perMonth: review("/md."),
    explore: review("Udforsk"),
    compare: review("Sammenlign planer"),
    compareFeature: review("Funktion"),
    compareRows: [1, 2, 3, 4, 5, 6].map((n) => ({
      label: review(`Række ${n} (pladsholder)`),
      cells: ["—", "—", "—"] as const,
    })),
  },
  how: {
    eyebrow: review("Sådan virker det"),
    heading: review("Fra prompt til produktion i fire trin."),
    steps: [
      {
        n: 1,
        title: review("Definér"),
        body: review(
          "Beskriv agenten i én fil: modellen den bruger, de værktøjer den må kalde, hvornår den kører, hvad den husker, og de rammer den skal holde sig inden for.",
        ),
      },
      {
        n: 2,
        title: review("Udrul"),
        body: review(
          "Push filen. Vi pakker agenten i en isoleret container og placerer den på EU-infrastruktur. Derfra kører den bare.",
        ),
      },
      {
        n: 3,
        title: review("Orkestrér"),
        body: review(
          "Tilføj agenter, og forbind dem. En orkestrator fordeler arbejdet; agenterne deler hukommelse og køer.",
        ),
      },
      {
        n: 4,
        title: review("Overvåg"),
        body: review(
          "Følg hver kørsel, mens den sker: streamende logs, traces, oppetid og et hjerteslag for hver agent.",
        ),
      },
    ],
    running: (n) => review(`kører · ${n} agenter`),
    uptime: review("Oppetid"),
    heartbeat: review("Hjerteslag"),
    filmSoon: review("Filmen kommer snart"),
    filmCaption: (brand) => review(`${brand}-filmen`),
    filmCaptionsAvailable: review("engelske undertekster"),
    filmPlay: (brand) => review(`Afspil ${brand}-filmen`),
    captionsLabel: review("Engelsk"),
  },
  useCases: {
    eyebrow: review("Anvendelser"),
    heading: review("Altid tændt, hvor arbejdet aldrig stopper."),
    items: {
      economy: {
        name: review("Økonomi"),
        outcome: review("Agenter, der modellerer markeder, mens de bevæger sig."),
        jobs: [
          review(`indlæs ${fmt(DEMO.economyFeeds.value)} feeds`),
          review("kør prognoser igen hver time"),
          review("markér regimeskift"),
        ],
      },
      finance: {
        name: review("Finans"),
        outcome: review("Afstemning, der kører kl. 3 om natten, ikke ved månedsskiftet."),
        jobs: [
          review(`match ${fmt(DEMO.financeInvoices.value)} fakturaer`),
          review(`markér ${fmt(DEMO.financeAnomalies.value)} afvigelser`),
          review("skriv udkast til lukkenotatet"),
        ],
      },
      security: {
        name: review("Sikkerhed"),
        outcome: review("Trusselsjagt, der aldrig holder fri."),
        jobs: [
          review("sortér alarmer"),
          review("spor unormal udgående trafik"),
          review("opret hændelsen"),
        ],
      },
      banking: {
        name: review("Bank"),
        outcome: review("Compliance-tjek på hver transaktion, i realtid."),
        jobs: [
          review("screen betalinger"),
          review("opdatér KYC"),
          review("send grænsetilfælde til et menneske"),
        ],
      },
      programming: {
        name: review("Programmering"),
        outcome: review("Kodegennemgang, tests og rettelser, døgnet rundt."),
        jobs: [
          review("gennemgå PR'er"),
          review("kør testsuiter"),
          review("udrul en rettelse bag et flag"),
        ],
      },
      blockchain: {
        name: review("Blockchain"),
        outcome: review("On-chain-overvågning, hver blok, hver kæde."),
        jobs: [
          review("overvåg kontrakter"),
          review("spor store overførsler"),
          review("slå alarm ved afvigelser"),
        ],
      },
    },
    playbook: review("Læs playbooken"),
    play: (name) => review(`Afspil filmen: ${name}`),
    pause: (name) => review(`Sæt filmen på pause: ${name}`),
  },
  security: {
    eyebrow: review("Sikkerhed"),
    heading: review("Bygget til reguleret arbejde."),
    intro: review(
      "Dine agenter rører ved penge, kode og kundedata. Derfor kører hver af dem inden for klare rammer.",
    ),
    blocks: {
      residency: {
        title: review("Data i EU"),
        body: review(
          `Beregning og data bliver i ${DATACENTER_LOCATIONS}. ${CONFIRM} Intet overføres uden for EU/EØS som standard. ${CONFIRM}`,
        ),
      },
      isolation: {
        title: review("Isolering"),
        body: review(
          `Hver kunde får sin egen VPS og sine egne containere. ${CONFIRM} Netværkspolitikker begrænser, hvad hver agent kan nå. ${CONFIRM} Hemmeligheder håndteres for dig og ligger aldrig i agentens kode. ${CONFIRM}`,
        ),
      },
      resilience: {
        title: review("Operationel robusthed"),
        body: review(
          `Bygget til kunder under DORA og NIS2. ${CONFIRM} Støtte til hændelsesrapportering, auditlogs, dataeksport og exitplaner følger med som standard. ${CONFIRM}`,
        ),
      },
      governance: {
        title: review("AI-governance"),
        body: review(
          `Hver handling, en agent foretager, bliver logget. ${CONFIRM} Godkendelsestrin og menneskelig kontrol hjælper dig med at opfylde dine pligter efter EU's AI-forordning. ${CONFIRM}`,
        ),
      },
    },
    shieldLabel: review(
      "Diagram: en ring af vagtagenter omkring en boks, der fanger indkommende alarmer, før de når den.",
    ),
    logTitle: "sentinel log",
    statusTitle: review("Alle systemer kører normalt"),
    statusLink: review("Statusside"),
    statusSummary: (days, ok, degraded) =>
      review(`Demodata. Seneste ${days} dage: ${ok} i drift, ${degraded} med forstyrrelser.`),
    daysAgo: (days) => review(`${days} dage siden`),
    today: review("I dag"),
    certifications: review("Certificeringer"),
  },
  pricing: {
    eyebrow: review("Priser"),
    heading: review("Klare priser, i euro eller kroner."),
    intro: review("Start med én agent. Gå over til et team, når arbejdet kræver det."),
    billing: review("Fakturering"),
    currency: review("Valuta"),
    vat: review("Moms"),
    monthly: review("Månedlig"),
    annual: review("Årlig"),
    vatExclOption: review("ekskl. moms"),
    vatInclOption: review("inkl. 25 % moms"),
    billedMonthly: review("faktureres månedligt"),
    billedAnnually: review("faktureres årligt"),
    vatExcl: review("ekskl. moms"),
    vatIncl: review("inkl. 25 % dansk moms"),
    perMonth: review("/md."),
    cta: review("Udrul en agent"),
    tiers: {
      bots: {
        line: review("Enkelte agenter, der kører døgnet rundt."),
        includes: [
          review("Planlagt, hændelsesstyret eller udløst af webhooks"),
          review("Automatisk genstart og sundhedstjek"),
          review("Logs og traces for hver kørsel"),
          review("Hostet i EU"),
        ],
      },
      vps: {
        line: review("Dedikerede servere, klar til agent-runtimes."),
        includes: [
          review("Isoleret VM pr. workload"),
          review("GPU som tilvalg"),
          review("Agent-runtimes forudinstalleret"),
          review("Logs og traces for hver kørsel"),
          review("Hostet i EU"),
        ],
      },
      clusters: {
        line: review("Orkestrerede teams af agenter, der deler det, de ved."),
        includes: [
          review("Én orkestrator, mange agenter"),
          review("Delt hukommelse og køer"),
          review("Overblik over hele teamet"),
          review("Automatisk genstart og sundhedstjek"),
          review("Hostet i EU"),
        ],
      },
    },
    announce: (prices) => review(`Priserne er opdateret. ${prices}`),
  },
  faq: {
    eyebrow: review("Spørgsmål og svar"),
    heading: review("Spørgsmål, besvaret."),
    items: {
      sla: {
        q: review("Hvilken oppetid lover I?"),
        a: review(
          `${SLA_PERCENT} hver måned. ${CONFIRM} Hvis vi ikke når det, får du servicekreditter på din næste faktura. ${CONFIRM}`,
        ),
      },
      data: {
        q: review("Hvor ligger mine data?"),
        a: review(
          `I ${DATACENTER_LOCATIONS}. ${CONFIRM} Som standard forlader intet EU/EØS. ${CONFIRM}`,
        ),
      },
      gpu: {
        q: review("Kan jeg få GPU'er?"),
        a: review(
          `Ja, på Agent VPS. GPU'er fås efter aftale; hvad vi kan tilbyde, afhænger af regionen. ${CONFIRM}`,
        ),
      },
      frameworks: {
        q: review("Hvilke agent-frameworks kan jeg køre?"),
        a: review(
          `Claude Agent SDK, LangGraph, CrewAI eller en hvilken som helst container. Kører den i en container, kører den her. ${CONFIRM}`,
        ),
      },
      keys: {
        q: review("Skal jeg bruge mine egne modelnøgler?"),
        a: review(
          `Begge dele virker. Med dine egne nøgler forbliver faktureringen hos modeludbyderen. Med administrerede modeller fakturerer vi dig. ${CONFIRM}`,
        ),
      },
      limits: {
        q: review("Hvor langt kan jeg skalere?"),
        a: review(
          `Hvert workspace starter med ${LIMITS}. ${CONFIRM} Vi hæver grænserne efter aftale.`,
        ),
      },
      access: {
        q: review("Hvordan håndterer I adgangskontrol?"),
        a: review(`Single sign-on, roller og auditlogs. ${CONFIRM}`),
        link: { label: review("Mere om sikkerhed"), href: "#security" },
      },
      migrate: {
        q: review("Kan jeg flytte agenter, jeg allerede kører?"),
        a: review(
          `Ja. Læg agenten i en container, beskriv den i agent.yaml, og udrul. Vi hjælper med den første flytning. ${CONFIRM}`,
        ),
      },
    },
  },
  cta: {
    heading: review("Sæt din første agent på nattevagt."),
    sub: review("Skriv din arbejdsmail. Vi svarer og sætter den første agent op sammen med dig."),
    emailLabel: review("Arbejdsmail"),
    emailPlaceholder: review("dig@firma.dk"),
    submit: review("Kom i gang"),
    sending: review("Sender…"),
    invalid: review("Skriv en gyldig e-mailadresse."),
    failed: review("Noget gik galt. Prøv igen."),
    success: review("Tak. Vi vender tilbage."),
    privacyNote: review("Vi bruger kun din e-mail til at svare dig."),
    privacyLink: review("Privatliv"),
  },
  footer: {
    company: review("Virksomhedsoplysninger"),
    cvr: "CVR",
    legal: review("Juridisk"),
    links: {
      privacy: review("Privatlivspolitik"),
      cookies: review("Cookies"),
      terms: review("Vilkår"),
      dpa: review("Databehandleraftale"),
      status: review("Driftsstatus"),
      security: review("Sikkerhed"),
    },
  },
  notFound: {
    title: review("Siden findes ikke"),
    body: review("Den side findes ikke. Dine agenter kører stadig."),
    home: review("Tilbage til forsiden"),
  },
};
