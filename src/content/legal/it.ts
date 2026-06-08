import type { LegalContent } from './types'

export const it: LegalContent = {
  banner: {
    title: 'Rispettiamo la tua privacy',
    description:
      'Usiamo cookie tecnici necessari al funzionamento del sito e, solo con il tuo consenso, strumenti di statistica e marketing. Puoi accettare, rifiutare o scegliere le preferenze.',
    acceptAll: 'Accetta tutto',
    reject: 'Rifiuta',
    preferences: 'Preferenze',
    prefsTitle: 'Preferenze cookie',
    rejectAll: 'Rifiuta tutto',
    save: 'Salva preferenze',
    necessaryTitle: 'Cookie necessari',
    necessaryDesc: 'Indispensabili al funzionamento del sito. Sempre attivi.',
    analyticsTitle: 'Statistiche',
    analyticsDesc:
      'Google Analytics 4 e PostHog: misurano in forma aggregata le visite per aiutarci a migliorare il sito.',
    marketingTitle: 'Marketing',
    marketingDesc: 'Meta (Facebook) Pixel: misura e ottimizza le campagne pubblicitarie.',
  },
  cookiePolicyLabel: 'Cookie Policy',
  privacyPolicyLabel: 'Privacy Policy',
  lastUpdated: 'Ultimo aggiornamento: 8 giugno 2026',
  managePreferences: 'Gestisci le preferenze cookie',
  backHome: 'Torna alla home',
  privacy: {
    title: 'Informativa sulla privacy',
    sections: [
      {
        heading: 'Titolare del trattamento',
        body: [
          'Questo sito (deluisa.bio) è gestito dalla famiglia De Luisa, titolare del trattamento dei dati qui descritto. Per qualsiasi richiesta in materia di privacy puoi scrivere a massimodeluisa@me.com.',
        ],
      },
      {
        heading: 'Quali dati trattiamo',
        body: [
          'Durante la visita vengono generati dati tecnici di navigazione: indirizzo IP, tipo di browser e dispositivo, pagine visitate e orari di accesso.',
          'Inoltre, solo dopo il tuo consenso, gli strumenti di statistica e marketing elencati di seguito impostano identificatori usati per misurare e analizzare le visite.',
        ],
      },
      {
        heading: 'Finalità e base giuridica',
        body: [
          'Funzionamento e sicurezza del sito — base giuridica: il nostro legittimo interesse e la necessità tecnica di erogare il servizio (art. 6, par. 1, lett. b e f, GDPR).',
          'Statistiche aggregate tramite Google Analytics 4 e PostHog — base giuridica: il tuo consenso (art. 6, par. 1, lett. a, GDPR).',
          'Misurazione pubblicitaria tramite Meta Pixel — base giuridica: il tuo consenso (art. 6, par. 1, lett. a, GDPR).',
        ],
      },
      {
        heading: 'Strumenti e terze parti',
        body: [
          'Google Analytics 4 — fornito da Google Ireland Ltd. Privacy: https://policies.google.com/privacy',
          'Meta (Facebook) Pixel — fornito da Meta Platforms Ireland Ltd. Privacy: https://www.facebook.com/privacy/policy',
          'PostHog — product analytics trattati nell’Unione Europea (regione EU). Privacy: https://posthog.com/privacy',
          'Hosting e distribuzione — GitHub Pages (GitHub, Inc.) e Cloudflare (Cloudflare, Inc.) per la pubblicazione e la protezione del sito; i loro log di server possono includere l’indirizzo IP per finalità di sicurezza e funzionamento.',
        ],
      },
      {
        heading: 'Trasferimenti di dati extra-UE',
        body: [
          'Google e Meta possono trasferire dati al di fuori dell’UE/SEE, inclusi gli Stati Uniti, sulla base di decisioni di adeguatezza o di Clausole Contrattuali Standard. I dati di PostHog sono ospitati nell’Unione Europea. Cloudflare gestisce una rete globale e applica garanzie adeguate.',
        ],
      },
      {
        heading: 'Conservazione dei dati',
        body: [
          'I dati di statistica e marketing sono conservati per i periodi stabiliti da ciascun fornitore (vedi la Cookie Policy per la durata dei cookie). Le tue scelte di consenso sono conservate per 6 mesi, dopodiché te le chiediamo di nuovo.',
        ],
      },
      {
        heading: 'I tuoi diritti',
        body: [
          'Ai sensi del GDPR puoi richiedere l’accesso, la rettifica o la cancellazione dei tuoi dati, la limitazione o l’opposizione al trattamento e la portabilità dei dati. Puoi revocare il consenso in qualsiasi momento, senza pregiudicare i trattamenti svolti in precedenza.',
          'Hai inoltre il diritto di proporre reclamo all’autorità di controllo — in Italia, il Garante per la protezione dei dati personali (www.garanteprivacy.it).',
        ],
      },
      {
        heading: 'Gestione del consenso',
        body: [
          'Puoi modificare o revocare il consenso in qualsiasi momento tramite il pulsante qui sotto, oppure dal banner dei cookie.',
        ],
      },
      {
        heading: 'Modifiche a questa informativa',
        body: [
          'Potremmo aggiornare periodicamente questa informativa. La data indicata qui sotto riporta la versione più recente.',
        ],
      },
    ],
  },
  cookie: {
    title: 'Cookie Policy',
    intro: [
      'Questo sito utilizza cookie e tecnologie simili. I cookie necessari sono sempre attivi perché senza di essi il sito non può funzionare. I cookie di statistica e marketing vengono caricati solo dopo il tuo consenso e puoi modificare la tua scelta in qualsiasi momento.',
    ],
    tableHeaders: {
      name: 'Cookie',
      provider: 'Fornitore',
      purpose: 'Finalità',
      duration: 'Durata',
    },
    categories: [
      {
        title: 'Necessari',
        rows: [
          {
            name: 'cc_cookie',
            provider: 'deluisa.bio',
            purpose: 'Memorizza le tue scelte di consenso ai cookie.',
            duration: '6 mesi',
          },
        ],
      },
      {
        title: 'Statistiche',
        rows: [
          {
            name: '_ga, _ga_*',
            provider: 'Google Analytics',
            purpose: 'Distingue utenti e sessioni per le statistiche aggregate.',
            duration: 'fino a 2 anni',
          },
          {
            name: 'ph_* (PostHog)',
            provider: 'PostHog (UE)',
            purpose: 'Product analytics; distingue utenti e visite.',
            duration: 'fino a 1 anno',
          },
        ],
      },
      {
        title: 'Marketing',
        rows: [
          {
            name: '_fbp',
            provider: 'Meta',
            purpose: 'Traccia le visite per la misurazione pubblicitaria.',
            duration: '3 mesi',
          },
          {
            name: 'fr',
            provider: 'Meta',
            purpose: 'Erogazione e misurazione degli annunci.',
            duration: '3 mesi',
          },
        ],
      },
    ],
  },
}
