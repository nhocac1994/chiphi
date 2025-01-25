

document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('imagePreview');
  const closeBtn = document.getElementsByClassName('close')[0];
  let currentRotation = 0;
  let currentScale = 1;
  
  // Thêm container cho modal content
  modalImg.parentElement.innerHTML = `
      <div class="modal-container">
          ${modalImg.outerHTML}
      </div>
      <div class="modal-controls">
          <button class="control-btn zoom-in" title="Phóng to">
              <i class="bi bi-zoom-in"></i>
          </button>
          <button class="control-btn zoom-out" title="Thu nhỏ">
              <i class="bi bi-zoom-out"></i>
          </button>
          <button class="control-btn rotate" title="Xoay">
              <i class="bi bi-arrow-clockwise"></i>
          </button>
      </div>
  `;

  const container = modal.querySelector('.modal-container');
  const newModalImg = modal.querySelector('.modal-content');
  
  // Xử lý zoom
  function updateTransform() {
      newModalImg.style.transform = `rotate(${currentRotation}deg) scale(${currentScale})`;
  }

  modal.querySelector('.zoom-in').addEventListener('click', () => {
      currentScale = Math.min(currentScale + 0.5, 4);
      updateTransform();
  });

  modal.querySelector('.zoom-out').addEventListener('click', () => {
      currentScale = Math.max(currentScale - 0.5, 0.5);
      updateTransform();
  });

  // Xử lý xoay
  modal.querySelector('.rotate').addEventListener('click', () => {
      currentRotation = (currentRotation + 90) % 360;
      updateTransform();
  });

  // Double tap để zoom
  let lastTap = 0;
  newModalImg.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
          currentScale = currentScale === 1 ? 2 : 1;
          updateTransform();
          e.preventDefault();
      }
      lastTap = currentTime;
  });

  // Reset transform khi đóng modal
  function closeModal() {
      currentRotation = 0;
      currentScale = 1;
      updateTransform();
      modal.style.display = 'none';
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target === container) {
          closeModal();
      }
  });

  // Xử lý hiển thị ảnh
  document.querySelectorAll('tr[data-hinh-anh]').forEach(row => {
      row.addEventListener('click', function() {
          const imgSrc = this.getAttribute('data-hinh-anh');
          if (imgSrc && imgSrc !== 'undefined' && imgSrc !== 'null') {
              modal.style.display = 'block';
              newModalImg.src = imgSrc;
              currentRotation = 0;
              currentScale = 1;
              updateTransform();
          }
      });
  });
});


// Thêm xử lý cho việc tải ảnh trong PDF
document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
      img.crossOrigin = "Anonymous";
  });
});

function generatePDF() {
  try {
    // Lấy dữ liệu từ bảng
    const table = document.getElementById('childTable');
    const rows = Array.from(table.getElementsByTagName('tr'));
    let totalAmount = 0;

        // Lấy và format ngày tháng
        const dateRange = document.querySelector('.date-range');
        let startDate = '', endDate = '';
        
        if (dateRange) {
            const startDateSpan = dateRange.querySelector('.info-item:first-child span');
            const endDateSpan = dateRange.querySelector('.info-item:last-child span');
            
            // Format lại ngày tháng để hiển thị trên cùng một hàng
            startDate = startDateSpan ? startDateSpan.textContent.trim().replace(/\s+/g, '') : '';
            endDate = endDateSpan ? endDateSpan.textContent.trim().replace(/\s+/g, '') : '';
        }

    // Chuẩn bị dữ liệu cho bảng
    const tableBody = rows.slice(1).map(row => {
        const cells = row.getElementsByTagName('td');
        const amount = parseInt(cells[3].textContent.replace(/[^\d]/g, '')) || 0;
        totalAmount += amount;
        
        // Format ngày tháng thành một dòng và thay / bằng -
        const dateText = cells[1].textContent.replace(/\s+/g, '').replace(/\//g, '-');
        
        return [
            { text: cells[0].textContent, alignment: 'center' },
            { text: dateText, alignment: 'center' },
            { text: cells[2].textContent, alignment: 'left' },
            { text: amount.toLocaleString('vi-VN') + ' đ', alignment: 'right' },
            { text: cells[4].textContent, alignment: 'left' },
            { text: cells[5].textContent, alignment: 'left' }
        ];
    });

      // Định nghĩa document
      const docDefinition = {
          pageSize: 'A4',
          pageOrientation: 'portrait',
          pageMargins: [20, 20, 20, 20],

          content: [
              // Tiêu đề
              {
                text: 'BÁO CÁO CHI PHÍ ĐI LẠI',
                fontSize: 16,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 10]
            },
            // Thời gian
            {
              text: `Từ ngày: ${startDate} - Đến ngày: ${endDate}`,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 0, 0, 15]
          },
              // Bảng dữ liệu
              {
                  table: {
                      headerRows: 1,
                      widths: [30, '*', 80, 80, 80, 80],
                      body: [
                          // Header
                          [
                              { text: 'STT', style: 'tableHeader' },
                              { text: 'Ngày Tháng', style: 'tableHeader' },
                              { text: 'Nội Dung', style: 'tableHeader' },
                              { text: 'Giá Tiền', style: 'tableHeader' },
                              { text: 'Địa Điểm', style: 'tableHeader' },
                              { text: 'Ghi Chú', style: 'tableHeader' }
                          ],
                          // Data rows
                          ...tableBody
                      ]
                  },
                  layout: {
                      hLineWidth: function(i, node) { return 0.5; },
                      vLineWidth: function(i, node) { return 0.5; },
                      hLineColor: function(i, node) { return '#aaa'; },
                      vLineColor: function(i, node) { return '#aaa'; },
                      paddingLeft: function(i, node) { return 8; },
                      paddingRight: function(i, node) { return 8; },
                      paddingTop: function(i, node) { return 6; },
                      paddingBottom: function(i, node) { return 6; }
                  }
              },
              // Tổng tiền
              {
                  text: `Tổng chi phí: ${totalAmount.toLocaleString('vi-VN')} đ`,
                  alignment: 'right',
                  margin: [0, 15, 0, 0],
                  fontSize: 12,
                  bold: true
              }
          ],

          styles: {
              tableHeader: {
                  fontSize: 11,
                  alignment: 'center',
                  fillColor: '#f5f5f5',
                  bold: true
              }
          },

          defaultStyle: {
              fontSize: 10
          }
      };

      // Tạo và tải PDF
      pdfMake.createPdf(docDefinition).download('bao-cao-chi-phi.pdf');

  } catch (error) {
      console.error('Lỗi khi tạo PDF:', error);
      alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.');
  }
}