import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { StyleBackup } from './types';

export async function generatePDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  // html2canvasがlab色をサポートしていないため、一時的にスタイルを調整
  const originalStyles: StyleBackup[] = [];
  
  try {
    
    // すべての要素のlab色を一時的に置換
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      
      // 背景色のチェックと置換
      if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('lab')) {
        originalStyles.push({
          element: htmlEl,
          property: 'backgroundColor',
          value: htmlEl.style.backgroundColor
        });
        htmlEl.style.backgroundColor = '#ffffff';
      }
      
      // 文字色のチェックと置換
      if (computedStyle.color && computedStyle.color.includes('lab')) {
        originalStyles.push({
          element: htmlEl,
          property: 'color',
          value: htmlEl.style.color
        });
        htmlEl.style.color = '#000000';
      }
      
      // ボーダー色のチェックと置換
      if (computedStyle.borderColor && computedStyle.borderColor.includes('lab')) {
        originalStyles.push({
          element: htmlEl,
          property: 'borderColor',
          value: htmlEl.style.borderColor
        });
        htmlEl.style.borderColor = '#cccccc';
      }
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
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowWidth: 794
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
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: 794
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
    console.error('PDF generation failed:', error);
    // エラー時も元のスタイルを復元
    originalStyles.forEach(({element, property, value}) => {
      (element.style as unknown as Record<string, string>)[property] = value;
    });
    throw error;
  }
}