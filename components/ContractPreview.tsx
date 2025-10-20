"use client";

import { Customer, ContractData } from '@/lib/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ContractPreviewProps {
  customer: Customer;
  contractData: ContractData;
  companyInfo?: {
    name: string;
    representative: string;
    address: string;
  };
}

export default function ContractPreview({ customer, contractData, companyInfo }: ContractPreviewProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'yyyy年M月d日', { locale: ja });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount);
  };

  const isAdvertising = contractData.contractType === 'advertising';
  const contractPeriod = contractData.endDate ? 
    Math.ceil((new Date(contractData.endDate).getTime() - new Date(contractData.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 3;

  return (
    <div id="contract-content" className="bg-white p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-8">業務委託契約書</h1>
      
      <div className="mb-6 text-sm leading-relaxed">
        <p className="mb-4">
          {customer.companyName}（以下「甲」という。）と
          {companyInfo?.name || '〇〇'}（以下「乙」という。）とは、
          次の通り業務委託契約（以下「本契約」という。）を締結する。
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        {/* 第1条 委託業務 */}
        <section>
          <h2 className="font-bold mb-2">第１条（委託業務）</h2>
          <p className="mb-2">１　甲は、乙に対し、以下の業務（以下、「本業務」という。）を委託し、乙はこれを受託する。</p>
          {isAdvertising ? (
            <div className="ml-4">
              <p>（１）甲が指定するウェブサイト、ホームページ（以下「本件サイト」という）のWEB広告の管理および運用業務</p>
              <p>（２）前項のWEB広告に係るレポート等の作成業務</p>
              <p>（３）本件サイトのコンセプトに沿う他のウェブサイトまたはランディングページ等の提案業務</p>
              <p>（４）前各号に付随するバナー制作業務</p>
            </div>
          ) : (
            <div className="ml-4">
              <p>（１）甲が指定するウェブサイト、ホームページ、SNS、CRM（以下「本件サイト」という）のWEB広告の管理および集客サポート</p>
            </div>
          )}
          <p className="mt-2">２　乙による本業務の遂行に要する広告掲載費用その他に係る予算について、乙は甲に対しあらかじめ通知しなければならない。</p>
        </section>

        {/* 第2条 契約期間 */}
        <section>
          <h2 className="font-bold mb-2">第２条（契約期間）</h2>
          <p>
            甲が本業務を乙に委託する期間は、{formatDate(contractData.startDate)}から
            {contractData.endDate ? formatDate(contractData.endDate) : `${formatDate(contractData.startDate)}から${contractPeriod}カ月後`}
            までの{contractPeriod}カ月間とする。
            {isAdvertising && 'ただし、毎月月末までにいずれの当事者から何らの意思表示がなされない場合、同じ条件でさらに１カ月間更新されるものとし、その後も同様とする。'}
          </p>
        </section>

        {/* 第3条 委託料 */}
        <section>
          <h2 className="font-bold mb-2">第３条（委託料）</h2>
          <p className="mb-2">１　甲は、乙に対し、本業務の委託料として、以下に定める金額を支払うものとする。なお、すべての算定にあたり消費税を含むものとする。{!isAdvertising && 'また、支払いは3回払いの分割払いとする。'}</p>
          <div className="ml-4">
            <p>
              （１）{isAdvertising ? '広告運用代行の場合、' : 'Meta広告コンサル費用'}
            </p>
            <p className="ml-4">
              金{formatAmount(contractData.amount || 0)}円（{isAdvertising ? '税抜' : '税込'}）
              {isAdvertising && '/月額'}
            </p>
          </div>
          <p className="mt-2">
            ２　甲は前項に定める委託料のうち、金{formatAmount(contractData.amount || 0)}円（{isAdvertising ? '税抜' : '税込'}）分については
            {isAdvertising ? '毎月月末までに' : ''}乙の指定する銀行口座に振り込む方法によって支払う。なお、振込手数料は甲の負担とする。
          </p>
        </section>

        {/* 第4条 費用 */}
        <section>
          <h2 className="font-bold mb-2">第４条（費用）</h2>
          <p>１　広告掲載費用については、甲が直接各広告媒体の事業者に直接甲のクレジットカードにより支払うものとする。</p>
          <p>２　乙の故意または重過失により、広告掲載費が増加した場合を除き、広告掲載費の一切は甲が負担するものとする。</p>
          <p>３　乙は、本業務の履行に要する費用が別途発生する場合は、甲に予め承諾を得たうえで、合理的に必要な範囲で甲に請求することができるものとする。</p>
        </section>

        {/* 第5条 再委託 */}
        <section>
          <h2 className="font-bold mb-2">第５条（再委託）</h2>
          <p>乙は本業務の一部又は全部を、乙の責任と監督のもと第三者に再委託することができるものとする。</p>
        </section>

        {/* 第6条 著作権の取扱い */}
        <section>
          <h2 className="font-bold mb-2">第６条（著作権の取扱い）</h2>
          <p>１　本業務の遂行過程において成果物（以下、「本成果物」という。）が発生した場合、本成果物の著作権（著作権法第２７条および第２８条の権利を含む。以下同じ。）は、乙に帰属するものとする。ただし、乙は甲に対して、本成果物を使用するのに必要な限度で著作物の利用を許諾する。なお、かかる許諾の第３条の委託料に含まれるものとする。</p>
          <p>２　甲は、乙に対し、本業務遂行に必要な範囲で甲の著作物（写真・動画・文章等）を無償にて使用することを許諾し、また、著作者人格権の主張をしないことを確認する。</p>
        </section>

        {/* 第7条 知的財産権の帰属等 */}
        <section>
          <h2 className="font-bold mb-2">第７条（知的財産権の帰属等）</h2>
          <p>１　本業務遂行の過程で得られた発明、考案、意匠又はノウハウ（以下併せて「発明等」という。）にかかる知的財産権（当該知的財産権を受ける権利を含む。以下、これらの権利を合わせて「特許権等」という。）は、当該発明等を行った者が属する当事者に帰属し、甲及び乙が共同で行った発明等から生じた場合は、乙に帰属する。</p>
          <p>２　乙は、第１項に基づき特許権等を保有することとなる場合、甲が、本成果物を使用するのに必要な限度で、甲に対し、当該特許権等の通常実施権を許諾するものとする。なお、許諾にかかる費用は第３条の委託料に含まれるものとする。</p>
        </section>

        {/* 第8条 秘密保持 */}
        <section>
          <h2 className="font-bold mb-2">第８条（秘密保持）</h2>
          <p>１　甲及び乙は、本契約及び個別契約の内容及び存在、相手方の個人情報ならびに本業務の履行に関して相手方より開示された配布物及びその他の一切の情報（以下、「秘密情報」という）を秘密として保持するものとし、相手方の書面による事前の同意なく第三者に開示し、漏洩し、又は本契約を履行する目的以外に使用してはならない。但し、以下の各号に該当する場合はこの限りではない。</p>
          <div className="ml-4">
            <p>（１）開示を受けた時点で、既に公知となっている情報。</p>
            <p>（２）開示を受ける前から双方保有していた情報。</p>
            <p>（３）開示を受けた後に、双方の責に帰すべからざる理由により公知となった情報</p>
            <p>（４）開示を受けた後に、正当な権限を有する第三者から秘密保持義務を負うことなく入手した情報。</p>
            <p>（５）相手方が事前に書面によって第三者への開示を承諾した情報。</p>
            <p>（６）開示を受けた情報とは無関係に乙が独自に開発した情報。</p>
          </div>
          <p>２　甲及び乙は、本件業務の目的の範囲を超えて、秘密情報を加工、利用、複写、又は複製してはならず、これを取り扱ってはならない。</p>
        </section>

        {/* 第9条 個人情報 */}
        <section>
          <h2 className="font-bold mb-2">第９条（個人情報）</h2>
          <p>１　乙は、本業務の実施に際して知り得た個人情報については、厳重に管理し、正当な理由なく第三者に開示、提供、漏洩してはならない。</p>
          <p>２　乙は、本件業務の遂行にあたり、個人情報保護に関する甲の指示に従うものとする。</p>
          <p>３　甲は、本業務における個人情報の安全管理に関する状況について乙に報告を求め、検査することができる。</p>
          <p>４　乙は、本業務に関して、自ら保管する個人情報が漏洩したことにより甲に損害が生じた場合には、その一切の賠償をするものとする。</p>
        </section>

        {/* 第10条 資料等の貸与・保管・返却・廃棄 */}
        <section>
          <h2 className="font-bold mb-2">第１０条（資料等の貸与・保管・返却・廃棄）</h2>
          <p>１　甲は本業務の遂行上必要な資料等（以下「資料等」という。）を乙に貸与し、また本業遂行上必要な情報を告知するものとする。</p>
          <p>２　乙は甲より貸与された資料等を善良な管理者の注意をもって保管・管理し本契約に基づく委託業務の遂行以外の目的に使用しないものとする。</p>
          <p>３　乙は甲より貸与された資料等を本契約に基づく委託業務の遂行以外の目的に複写・複製・編集等を行わないものとする。</p>
          <p>４　乙は甲より貸与された資料等について、甲の指示により、返却又は廃棄するものとする。ただし、その際の費用は甲の負担とする。</p>
        </section>

        {/* 第11条 広告に関する責任 */}
        <section>
          <h2 className="font-bold mb-2">第１１条（広告に関する責任）</h2>
          <p>甲が掲載を依頼した広告に関する一切の責任は甲が負うものとし、第三者からの苦情等何らかの問題が生じた場合には、直ちに問題解決のために対応しなければならない。ただし、乙の責めに帰すべき理由により生じたものについては、この限りではない。</p>
        </section>

        {/* 第12条 損害賠償 */}
        <section>
          <h2 className="font-bold mb-2">第１２条（損害賠償）</h2>
          <p>甲又は乙は、相手方の責めに帰すべき事由により自己に損害が生じたときは、相手方に対し、直接かつ通常の範囲の損害の賠償を請求することができるものとする。但し乙の負担する損害額の上限は、本業務による甲からの委託料の累計額とする。</p>
        </section>

        {/* 第13条 免責事項 */}
        <section>
          <h2 className="font-bold mb-2">第１３条（免責事項）</h2>
          <p>１　乙は甲に対し、本業務の結果、甲の事業に関する集客数や売上げ等が増加することをなんら保証するものではない。</p>
          <p>２　甲は、乙による本業務の結果、WEB広告サービスの広告審査について必ず合格するものではないことをあらかじめ承諾する。</p>
        </section>

        {/* 第14条 不可抗力 */}
        <section>
          <h2 className="font-bold mb-2">第１４条（不可抗力）</h2>
          <p>地震・台風・津波その他の天災地変、戦争、暴動、内乱、テロ行為、SARS・鳥インフルエンザ・コロナウイルス等の「感染症の予防及び感染症の患者に対する医療に関する法律」上のその他重大な疾病、争議行為、放火、延焼等による原材料の調達困難、輸送機関・通信回線の事故・利用困難（サイバーテロによる被害を含む。）、電力供給の逼迫、法令の制定・改定、公権力による命令・処分、その他甲及び乙の責に帰することができない事由による納期の遅延又は納品の不可能については、甲及び乙は相手方に対し一切の責任を負わない。</p>
        </section>

        {/* 第15条 解除 */}
        <section>
          <h2 className="font-bold mb-2">第１５条（解除）</h2>
          <p>甲及び乙は、相手方が次の各号のいずれかに該当したときは、催告その他の手続きを要することなく、直ちに契約を解除する事ができる。</p>
          <div className="ml-4">
            <p>（１）破産手続開始、民事再生手続開始、会社更生手続開始、特別清算開始の申し立てを受け、又は自ら申し立てたとき。</p>
            <p>（２）その所有する財産につき、第三者より差押、仮差押、仮処分、強制執行もしくは競売申立てを受け、又は公租公課滞納処分を受けたとき。</p>
            <p>（３）監督官庁より営業の取消、停止等の処分を受けたとき。</p>
            <p>（４）解散（合併による場合を除く）、事業の全部又は重要な一部の譲渡の決議をしたとき。</p>
            <p>（５）自ら振出し、又は引受けた手形、小切手が不渡り処分になる等、支払い不能な状態になったとき。</p>
            <p>（６）相手方が本契約の各条項に違反し、相当期間を定めた催告にもかかわらず是正しないとき。</p>
            <p>（７）その他本契約を継続しがたい重大な事由が発生したとき。</p>
          </div>
        </section>

        {/* 第16条 中途解約 */}
        <section>
          <h2 className="font-bold mb-2">第１６条（中途解約）</h2>
          <p>甲及び乙は、本契約を契約期間中の中途で、解約できないものとする。</p>
        </section>

        {/* 第17条 契約終了後の処理 */}
        <section>
          <h2 className="font-bold mb-2">第１７条（契約終了後の処理）</h2>
          <p>乙は、本契約終了後、甲の指示に基づき、直ちに甲より預託された本業務に関する資料及び物品等を返却又は破棄するものとする。</p>
        </section>

        {/* 第18条 反社会的勢力の排除 */}
        <section>
          <h2 className="font-bold mb-2">第１８条（反社会的勢力の排除）</h2>
          <p>１　甲及び乙は、それぞれ相手方に対し、本契約締結時において、自ら（法人の場合は、代表者、役員又は実質的に経営を支配する者。）が暴力団、暴力団員、暴力団関係企業、総会屋、社会運動標ぼうゴロ又は特殊知能暴力集団その他反社会的勢力に該当しないことを表明し、かつ将来にわたっても該当しないことを確約する。</p>
          <p>２　甲又は乙の一方が前項の確約に反する事実が判明したとき、その相手方は、何らの催告もせずして、本契約を解除することができる。</p>
        </section>

        {/* 第19条 準拠法・裁判管轄 */}
        <section>
          <h2 className="font-bold mb-2">第１９条（準拠法・裁判管轄）</h2>
          <p>１　契約の準拠法は日本法とし、本契約は日本法に従い解釈される。</p>
          <p>２　本契約に関する一切の紛争は、東京地方裁判所を第一審の専属的合意管轄裁判所とする。</p>
        </section>

        {/* 第20条 協議 */}
        <section>
          <h2 className="font-bold mb-2">第２０条（協議）</h2>
          <p>甲及び乙は、本契約に定めのない事項が生じたとき、又は本契約の条項の解釈について疑義が生じたときは、誠意をもって協議し、円満に解決を図るものとする。</p>
        </section>

        {/* 第21条 残存条項 */}
        <section>
          <h2 className="font-bold mb-2">第２１条（残存条項）</h2>
          <p>本契約終了後も、第６条、第７条、第８条、第９条、第１１条、第１２条、第１３条及び第１９条の定めは、有効に存続するものとする。</p>
        </section>

        {contractData.specialNotes && (
          <section className="bg-yellow-50 p-4 rounded-lg mt-6">
            <h2 className="font-bold mb-2">特記事項</h2>
            <p className="whitespace-pre-wrap">{contractData.specialNotes}</p>
          </section>
        )}

        <div className="mt-12 pt-8 border-t">
          <p className="mb-8">本契約締結の証として本契約書２通を作成し、甲乙双方が各自署名又は記名押印の上、それぞれ１通を保有する。</p>
          
          <div className="mt-8 space-y-8">
            <div>
              <p className="text-right mb-8">{formatDate(contractData.startDate)}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="font-bold mb-4">【甲】</p>
                <div className="space-y-2">
                  <p>住所</p>
                  <p className="ml-4 border-b border-gray-300 pb-1">{customer.address}</p>
                  <p className="mt-4">名前</p>
                  <p className="ml-4 border-b border-gray-300 pb-1">{customer.companyName}</p>
                  <p className="ml-4">{customer.representative} <span className="ml-8">印</span></p>
                </div>
              </div>
              
              <div>
                <p className="font-bold mb-4">【乙】</p>
                <div className="space-y-2">
                  <p>住所</p>
                  <p className="ml-4 border-b border-gray-300 pb-1">{companyInfo?.address || ''}</p>
                  <p className="mt-4">名前</p>
                  <p className="ml-4 border-b border-gray-300 pb-1">{companyInfo?.name || ''}</p>
                  <p className="ml-4">{companyInfo?.representative || ''} <span className="ml-8">印</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}