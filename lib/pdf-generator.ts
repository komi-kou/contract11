import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { StyleBackup } from './types';

// シンプルなPDF生成関数（フォールバック用）
export async function generateSimplePDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id '${elementId}' not found`);
  }

  // コンテンツの存在確認
  const hasContent = element.textContent && element.textContent.trim().length > 0;
  if (!hasContent) {
    throw new Error('契約書の内容が空です。PDFを生成できません。');
  }

  // カラー関数の処理
  const originalStyles: StyleBackup[] = [];
  
  const processColorProperty = (element: HTMLElement, property: string, fallbackColor: string) => {
    const computedStyle = window.getComputedStyle(element);
    const colorValue = computedStyle.getPropertyValue(property);
    
    if (colorValue && (
      colorValue.includes('lab') || 
      colorValue.includes('oklch') || 
      colorValue.includes('okich') ||
      colorValue.includes('color(') ||
      colorValue.includes('hwb') ||
      colorValue.includes('lch')
    )) {
      originalStyles.push({
        element: element,
        property: property,
        value: element.style.getPropertyValue(property)
      });
      element.style.setProperty(property, fallbackColor);
    }
  };

  try {
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      processColorProperty(htmlEl, 'background-color', '#ffffff');
      processColorProperty(htmlEl, 'color', '#000000');
      processColorProperty(htmlEl, 'border-color', '#cccccc');
    });

    const canvas = await html2canvas(element, {
      scale: 1,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      width: element.scrollWidth,
      height: element.scrollHeight,
      ignoreElements: (element) => {
        return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
      },
      foreignObjectRendering: false
    });

    const imgData = canvas.toDataURL('image/png', 0.8);
    
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 余白
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // 画像がページより大きい場合は複数ページに分割
    if (imgHeight > pdfHeight - 20) {
      const totalPages = Math.ceil(imgHeight / (pdfHeight - 20));
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        const yOffset = page * (pdfHeight - 20);
        pdf.addImage(imgData, 'PNG', 10, 10 - yOffset, imgWidth, imgHeight);
        
        // ページ番号
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`${page + 1} / ${totalPages}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
      }
    } else {
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    }

    pdf.save(filename);
    
    // 元のスタイルを復元
    originalStyles.forEach(({element, property, value}) => {
      element.style.setProperty(property, value);
    });
    
  } catch (error) {
    console.error('Simple PDF generation failed:', error);
    
    // エラー時も元のスタイルを復元
    originalStyles.forEach(({element, property, value}) => {
      element.style.setProperty(property, value);
    });
    
    throw new Error(`PDF生成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generatePDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id '${elementId}' not found`);
  }

  // コンテンツの存在確認
  const hasContent = element.textContent && element.textContent.trim().length > 0;
  if (!hasContent) {
    throw new Error('契約書の内容が空です。PDFを生成できません。');
  }

  // html2canvasが新しいカラー関数をサポートしていないため、一時的にスタイルを調整
  const originalStyles: StyleBackup[] = [];
  
  try {
    
    // より包括的なカラー関数の処理関数
    const processColorProperty = (element: HTMLElement, property: string, fallbackColor: string) => {
      const computedStyle = window.getComputedStyle(element);
      const colorValue = computedStyle.getPropertyValue(property);
      
      if (colorValue && (
        colorValue.includes('lab') || 
        colorValue.includes('oklch') || 
        colorValue.includes('okich') ||
        colorValue.includes('color(') ||
        colorValue.includes('hwb') ||
        colorValue.includes('lch') ||
        colorValue.includes('var(')
      )) {
        originalStyles.push({
          element: element,
          property: property,
          value: element.style.getPropertyValue(property)
        });
        element.style.setProperty(property, fallbackColor);
      }
    };

    // CSS変数も処理
    const processCSSVariables = () => {
      const root = document.documentElement;
      const computedStyle = window.getComputedStyle(root);
      
      // 主要なCSS変数をチェック
      const cssVars = ['--background', '--foreground', '--color-background', '--color-foreground'];
      
      cssVars.forEach(cssVar => {
        const value = computedStyle.getPropertyValue(cssVar);
        if (value && (
          value.includes('lab') || 
          value.includes('oklch') || 
          value.includes('okich') ||
          value.includes('color(') ||
          value.includes('hwb') ||
          value.includes('lch')
        )) {
          originalStyles.push({
            element: root,
            property: cssVar,
            value: root.style.getPropertyValue(cssVar)
          });
          // 安全な色に置換
          if (cssVar.includes('background')) {
            root.style.setProperty(cssVar, '#ffffff');
          } else {
            root.style.setProperty(cssVar, '#000000');
          }
        }
      });
    };

    // CSS変数を処理
    processCSSVariables();

    // すべての要素の新しいカラー関数を一時的に置換
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      
      // 主要なカラープロパティを処理
      processColorProperty(htmlEl, 'background-color', '#ffffff');
      processColorProperty(htmlEl, 'color', '#000000');
      processColorProperty(htmlEl, 'border-color', '#cccccc');
      processColorProperty(htmlEl, 'border-left-color', '#cccccc');
      processColorProperty(htmlEl, 'border-right-color', '#cccccc');
      processColorProperty(htmlEl, 'border-top-color', '#cccccc');
      processColorProperty(htmlEl, 'border-bottom-color', '#cccccc');
      processColorProperty(htmlEl, 'outline-color', '#cccccc');
      processColorProperty(htmlEl, 'text-decoration-color', '#000000');
      processColorProperty(htmlEl, 'column-rule-color', '#cccccc');
      
    });

    // 条項（セクション）ごとにページ分割するための要素を取得
    const sections = element.querySelectorAll('.contract-section');
    
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // A4サイズの設定（余白を考慮）
    const pageMarginTop = 15;
    const pageMarginBottom = 20; // ページ番号のスペース
    const pageMarginLeft = 15;
    const pageMarginRight = 15;
    
    const pdfWidth = 210;
    const pdfHeight = 297;
    const contentWidth = pdfWidth - pageMarginLeft - pageMarginRight;
    const contentHeight = pdfHeight - pageMarginTop - pageMarginBottom;

    let currentY = pageMarginTop;
    let pageNum = 1;
    let isFirstElement = true;

    // セクションがある場合は、セクションごとに処理
    if (sections.length > 0) {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        
        // セクションごとにキャプチャ
        const canvas = await html2canvas(section, {
          scale: 1.2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: section.offsetWidth,
          height: section.offsetHeight,
          scrollX: 0,
          scrollY: 0,
          ignoreElements: (element) => {
            // 特定の要素を無視（オプション）
            return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
          },
          foreignObjectRendering: false,
          removeContainer: false
        });

        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // このセクションが現在のページに収まらない場合、新しいページを作成
        if (!isFirstElement && (currentY + imgHeight > pdfHeight - pageMarginBottom)) {
          // ページ番号を追加
          pdf.setFontSize(9);
          pdf.setTextColor(150, 150, 150);
          pdf.text(
            `${pageNum}`,
            pdfWidth / 2,
            pdfHeight - 10,
            { align: 'center' }
          );
          
          pdf.addPage();
          currentY = pageMarginTop;
          pageNum++;
        }

        // セクションの画像を追加
        const imgData = canvas.toDataURL('image/png', 0.95);
        pdf.addImage(
          imgData,
          'PNG',
          pageMarginLeft,
          currentY,
          imgWidth,
          imgHeight
        );

        currentY += imgHeight + 5; // セクション間に少し余白
        isFirstElement = false;
      }
      
      // 最後のページ番号を追加
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `${pageNum}`,
        pdfWidth / 2,
        pdfHeight - 10,
        { align: 'center' }
      );
    } else {
      // セクションがない場合は、従来の方法でページ分割
      const canvas = await html2canvas(element, {
        scale: 1.2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          // 特定の要素を無視（オプション）
          return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
        },
        foreignObjectRendering: false,
        removeContainer: false
      });

      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png', 0.95);
      
      const totalPages = Math.ceil(imgHeight / contentHeight);
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        const yOffset = page * contentHeight;
        
        // クリッピングなしで画像を配置
        pdf.addImage(
          imgData,
          'PNG',
          pageMarginLeft,
          pageMarginTop - yOffset,
          imgWidth,
          imgHeight
        );
        
        // ページ番号を追加
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `${page + 1} / ${totalPages}`,
          pdfWidth / 2,
          pdfHeight - 10,
          { align: 'center' }
        );
      }
    }

    // PDFをダウンロード
    pdf.save(filename);
    
    // 元のスタイルを復元
    originalStyles.forEach(({element, property, value}) => {
      (element.style as unknown as Record<string, string>)[property] = value;
    });
  } catch (error) {
    console.error('Advanced PDF generation failed, trying simple method:', error);
    // エラー時も元のスタイルを復元
    originalStyles.forEach(({element, property, value}) => {
      (element.style as unknown as Record<string, string>)[property] = value;
    });
    
    // フォールバック: シンプルなPDF生成を試行
    try {
      console.log('Attempting simple PDF generation as fallback');
      await generateSimplePDF(elementId, filename);
      return;
    } catch (fallbackError) {
      console.error('Both PDF generation methods failed:', fallbackError);
      
      // より具体的なエラーメッセージを提供
      if (error instanceof Error) {
        if (error.message.includes('Element not found')) {
          throw new Error('PDF生成対象の要素が見つかりません。ページを再読み込みしてください。');
        } else if (error.message.includes('内容が空')) {
          throw error; // 既に適切なメッセージ
        } else if (error.message.includes('unsupported color function') || error.message.includes('okich')) {
          throw new Error('ブラウザが新しいカラー関数をサポートしていません。Chrome、Firefox、Safariの最新版をご利用ください。');
        } else if (error.message.includes('html2canvas')) {
          throw new Error('PDF生成ライブラリのエラーが発生しました。ページを再読み込みして再試行してください。');
        } else {
          throw new Error(`PDF生成に失敗しました。詳細: ${error.message}`);
        }
      } else {
        throw new Error('PDF生成中に予期しないエラーが発生しました。ブラウザを更新して再試行してください。');
      }
    }
  }
}