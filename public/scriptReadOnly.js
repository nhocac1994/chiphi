

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
function generatePDF() {
  // Ẩn nút tạo PDF và watermark khi xuất PDF
  const pdfButton = document.querySelector('.pdf-button');
  const watermark = document.querySelector('.report-watermark');
  pdfButton.style.display = 'none';
  if (watermark) watermark.style.display = 'none';

  // Cấu hình cho PDF
  const element = document.querySelector('.report-container');
  const opt = {
      margin: [10, 10, 10, 10],
      filename: 'bao-cao-chi-phi.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true
      },
      jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
      }
  };

  // Tạo PDF
  html2pdf().set(opt).from(element).save().then(() => {
      // Hiện lại nút và watermark sau khi tạo xong
      pdfButton.style.display = 'block';
      if (watermark) watermark.style.display = 'block';
  });
}

// Thêm xử lý cho việc tải ảnh trong PDF
document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
      img.crossOrigin = "Anonymous";
  });
});