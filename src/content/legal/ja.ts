import type { LegalContent } from './types'

export const ja: LegalContent = {
  banner: {
    title: 'プライバシーを尊重します',
    description:
      'サイトの動作に必要な Cookie を使用し、お客様の同意がある場合に限り、統計およびマーケティングのツールを使用します。すべてを許可する、拒否する、または設定を選択することができます。',
    acceptAll: 'すべて許可',
    reject: '拒否',
    preferences: '設定',
    prefsTitle: 'Cookie の設定',
    rejectAll: 'すべて拒否',
    save: '設定を保存',
    necessaryTitle: '必須 Cookie',
    necessaryDesc: 'サイトの動作に不可欠です。常に有効です。',
    analyticsTitle: '統計',
    analyticsDesc:
      'Google Analytics 4 および PostHog：サイトの改善に役立てるため、訪問状況を集計して測定します。',
    marketingTitle: 'マーケティング',
    marketingDesc: 'Meta (Facebook) Pixel：広告キャンペーンを測定し最適化します。',
  },
  cookiePolicyLabel: 'Cookie ポリシー',
  privacyPolicyLabel: 'プライバシーポリシー',
  lastUpdated: '最終更新: 2026年6月8日',
  managePreferences: 'Cookie の設定を管理',
  backHome: 'ホームに戻る',
  privacy: {
    title: 'プライバシーポリシー',
    sections: [
      {
        heading: 'データ管理者',
        body: [
          '本ウェブサイト (deluisa.bio) は De Luisa 家により運営されており、同家がここに記載する処理に関するデータ管理者です。プライバシーに関するご請求は massimodeluisa@me.com までご連絡ください。',
        ],
      },
      {
        heading: '取得するデータ',
        body: [
          'お客様のご訪問時には、技術的なナビゲーションデータが生成されます。IP アドレス、ブラウザおよびデバイスの種類、閲覧したページ、ならびにアクセス日時です。',
          'さらに、お客様の同意があった場合に限り、以下に記載する分析およびマーケティングのツールが、訪問を測定・分析するために用いる識別子を設定します。',
        ],
      },
      {
        heading: '目的および法的根拠',
        body: [
          'ウェブサイトの運営および安全性の確保 — 法的根拠：当方の正当な利益、ならびにサービス提供のための技術的必要性（GDPR 第6条1項(b)および(f)）。',
          'Google Analytics 4 および PostHog による集計統計 — 法的根拠：お客様の同意（GDPR 第6条1項(a)）。',
          'Meta Pixel による広告測定 — 法的根拠：お客様の同意（GDPR 第6条1項(a)）。',
        ],
      },
      {
        heading: 'ツールおよび第三者',
        body: [
          'Google Analytics 4 — Google Ireland Ltd により提供されます。プライバシー：https://policies.google.com/privacy',
          'Meta (Facebook) Pixel — Meta Platforms Ireland Ltd により提供されます。プライバシー：https://www.facebook.com/privacy/policy',
          'PostHog — 欧州連合（EU リージョン）内で処理されるプロダクト分析。プライバシー：https://posthog.com/privacy',
          'ホスティングおよび配信 — サイトの公開および保護のための GitHub Pages (GitHub, Inc.) および Cloudflare (Cloudflare, Inc.)。これらのサーバーログには、安全性および運営の目的でお客様の IP アドレスが含まれる場合があります。',
        ],
      },
      {
        heading: 'データの国際移転',
        body: [
          'Google および Meta は、十分性認定または標準契約条項に基づき、米国を含む EU／EEA 域外にデータを移転する場合があります。PostHog のデータは欧州連合内でホストされます。Cloudflare はグローバルネットワークを運用し、適切な保護措置を講じています。',
        ],
      },
      {
        heading: 'データの保存期間',
        body: [
          '分析およびマーケティングのデータは、各提供者が定める期間にわたって保存されます（Cookie の有効期間については Cookie ポリシーをご参照ください）。お客様の同意の選択は6か月間保存され、その後は改めてお伺いします。',
        ],
      },
      {
        heading: 'お客様の権利',
        body: [
          'GDPR に基づき、お客様はご自身のデータへのアクセス、訂正または削除、処理の制限または異議、ならびにデータポータビリティを請求することができます。お客様はいつでも同意を撤回することができ、それ以前に行われた処理には影響しません。',
          'また、お客様には監督機関に苦情を申し立てる権利があります。イタリアにおいては、Garante per la protezione dei dati personali（個人データ保護監督機関、www.garanteprivacy.it）です。',
        ],
      },
      {
        heading: '同意の管理',
        body: [
          '下のボタンから、または Cookie バナーから、いつでも同意を変更または撤回することができます。',
        ],
      },
      {
        heading: '本ポリシーの変更',
        body: [
          '当方は本ポリシーを随時更新することがあります。下に表示される日付が最新版を示します。',
        ],
      },
    ],
  },
  cookie: {
    title: 'Cookie ポリシー',
    intro: [
      '本サイトは Cookie および類似の技術を使用しています。必須 Cookie はサイトの動作に不可欠であるため常に有効です。統計およびマーケティングの Cookie は、お客様の同意があった場合に限り読み込まれ、その選択はいつでも変更することができます。',
    ],
    tableHeaders: {
      name: 'Cookie',
      provider: '提供者',
      purpose: '目的',
      duration: '期間',
    },
    categories: [
      {
        title: '必須',
        rows: [
          {
            name: 'cc_cookie',
            provider: 'deluisa.bio',
            purpose: 'お客様の Cookie 同意の選択を保存します。',
            duration: '6か月',
          },
        ],
      },
      {
        title: '統計',
        rows: [
          {
            name: '_ga, _ga_*',
            provider: 'Google Analytics',
            purpose: '集計統計のためにユーザーおよびセッションを区別します。',
            duration: '最長2年',
          },
          {
            name: 'ph_* (PostHog)',
            provider: 'PostHog (EU)',
            purpose: 'プロダクト分析。ユーザーおよび訪問を区別します。',
            duration: '最長1年',
          },
        ],
      },
      {
        title: 'マーケティング',
        rows: [
          {
            name: '_fbp',
            provider: 'Meta',
            purpose: '広告測定のために訪問を追跡します。',
            duration: '3か月',
          },
          {
            name: 'fr',
            provider: 'Meta',
            purpose: '広告の配信および測定。',
            duration: '3か月',
          },
        ],
      },
    ],
  },
}
