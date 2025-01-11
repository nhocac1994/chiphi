document.addEventListener("DOMContentLoaded", () => {
  const imagePreview = document.getElementById("imagePreview");
  const childTable = document.getElementById("childTable");

  // Thêm style cho animation
  const style = document.createElement('style');
  style.textContent = `
    #imagePreview {
      opacity: 0;
      transform: scale(0.95);
      transition: all 0.9s ease;
      border-radius: 8px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      border: 2px solid #fff;
    }

    #imagePreview.show {
      opacity: 1;
      transform: scale(1);
    }
  `;
  document.head.appendChild(style);

  if (childTable) {
    const tableRows = childTable.querySelectorAll("tbody tr");
    tableRows.forEach((row) => {
      const imageUrl = row.dataset.hinhAnh;

      row.addEventListener("mouseover", (event) => {
        if (imageUrl) {
          // Đặt nguồn hình ảnh
          imagePreview.src = imageUrl.startsWith("http") ? imageUrl : `${window.location.origin}${imageUrl}`;
          imagePreview.alt = "Hình ảnh chi tiết";

          // Tính toán vị trí của hàng để đặt hình ảnh phía dưới
          const rect = row.getBoundingClientRect();
          const scrollTop = window.scrollY || window.pageYOffset;
          const scrollLeft = window.scrollX || window.pageXOffset;

          // Kích thước hình ảnh
          const imageWidth = 600; // maxWidth
          const imageHeight = 600; // maxHeight

          // Kích thước cửa sổ trình duyệt
          const viewportWidth = window.innerWidth;

          // Tính toán vị trí đặt hình ảnh bên dưới hàng, cách 10px
          let topPosition = rect.bottom + scrollTop + 5;
          let leftPosition = rect.left + scrollLeft;

          // Kiểm tra nếu hình ảnh vượt ra ngoài phía phải màn hình
          if (leftPosition + imageWidth > scrollLeft + viewportWidth) {
            leftPosition = scrollLeft + viewportWidth - imageWidth - 10;
          }

          // Đặt vị trí của hình ảnh
          imagePreview.style.top = `${topPosition}px`;
          imagePreview.style.left = `${leftPosition}px`;
          imagePreview.style.display = "block";
          
          // Thêm animation
          requestAnimationFrame(() => {
            imagePreview.classList.add("show");
          });
        }
      });

      row.addEventListener("mouseout", () => {
        // Ẩn hình ảnh với animation
        imagePreview.classList.remove("show");
        
        // Đợi animation kết thúc rồi mới ẩn hoàn toàn
          imagePreview.style.display = "none";
      });
    });
  }
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